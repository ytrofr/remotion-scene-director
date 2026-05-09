#!/usr/bin/env bash
# Test the EXACT scenario the user reported:
# 1. Save scene 3 changes to disk
# 2. (Simulate) "Reload" — fetch fresh disk state via /api/get-saved-entry
# 3. Assert: fresh disk fetch contains user's saved waypoints
#
# Before the fix, the in-memory CODED_PATHS_REGISTRY was frozen at module load
# and Reload re-seeded from that stale snapshot, undoing post-load saves.
# After the fix, Reload fetches /api/get-saved-entry → gets the disk version.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=3098
BASE="http://localhost:${PORT}"
JSON_FILE="src/compositions/SceneDirector/codedPaths.data.json"
HIST_FILE="src/compositions/SceneDirector/codedPaths.history.jsonl"
JSON_BACKUP="/tmp/codedPaths.data.json.reload-test-$$"
HIST_BACKUP="/tmp/codedPaths.history.jsonl.reload-test-$$"

cp "$JSON_FILE" "$JSON_BACKUP"
[ -f "$HIST_FILE" ] && cp "$HIST_FILE" "$HIST_BACKUP" || touch "$HIST_BACKUP"

cleanup() {
  cp "$JSON_BACKUP" "$JSON_FILE"
  if [ -s "$HIST_BACKUP" ]; then cp "$HIST_BACKUP" "$HIST_FILE"; else rm -f "$HIST_FILE"; fi
  rm -f "$JSON_BACKUP" "$HIST_BACKUP"
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "→ Starting test server on :$PORT"
LOG="/tmp/reload-test-server-$$.log"
npx vite --config vite.config.ts --port "$PORT" >"$LOG" 2>&1 &
SERVER_PID=$!
for i in $(seq 1 40); do
  if curl -s -o /dev/null -w "%{http_code}" "$BASE/api/get-saved-entry?compositionId=__test__&sceneName=__none__" 2>/dev/null | grep -q "200"; then break; fi
  sleep 0.5
done

PASS=0; FAIL=0
assert() { if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ✓ $1"; else FAIL=$((FAIL+1)); echo "  ✗ $1 (expected '$2', got '$3')"; fi; }

TEST_COMP="DorianFullV1-10"
TEST_SCENE="3-TapBubble"

echo ""
echo "— Scenario: user adds custom waypoints to scene 3, saves ──"
PAYLOAD='{
  "compositionId": "'$TEST_COMP'",
  "sceneName": "'$TEST_SCENE'",
  "path": [
    {"x":111,"y":222,"frame":0,"gesture":"pointer","scale":1},
    {"x":333,"y":444,"frame":15,"gesture":"pointer","scale":1},
    {"x":555,"y":666,"frame":30,"gesture":"click","scale":1,"duration":10},
    {"x":777,"y":888,"frame":45,"gesture":"pointer","scale":1}
  ],
  "gesture": "click",
  "animation": "cursor-real-black",
  "dark": false,
  "locked": false
}'
curl -s -X POST "$BASE/api/save-path" -H "Content-Type: application/json" -d "$PAYLOAD" >/dev/null

echo ""
echo "— Simulate Reload-this-scene: fetch fresh disk state ──"
RESP=$(curl -s "$BASE/api/get-saved-entry?compositionId=$TEST_COMP&sceneName=$TEST_SCENE")
COUNT=$(echo "$RESP" | jq -r '.entry.path | length')
assert "fresh fetch sees user's 4 waypoints" "4" "$COUNT"
assert "first wp x is user value (111)" "111" "$(echo "$RESP" | jq -r '.entry.path[0].x')"
assert "click wp duration is user value (10)" "10" "$(echo "$RESP" | jq -r '.entry.path[2].duration')"

echo ""
echo "— Save additional changes (simulates second save in same session) ──"
PAYLOAD2='{
  "compositionId": "'$TEST_COMP'",
  "sceneName": "'$TEST_SCENE'",
  "path": [
    {"x":111,"y":222,"frame":0,"gesture":"pointer","scale":1},
    {"x":333,"y":444,"frame":15,"gesture":"pointer","scale":1},
    {"x":555,"y":666,"frame":30,"gesture":"click","scale":1,"duration":10},
    {"x":777,"y":888,"frame":45,"gesture":"pointer","scale":1},
    {"x":999,"y":1000,"frame":60,"gesture":"pointer","scale":1}
  ],
  "gesture": "click",
  "animation": "cursor-real-black",
  "dark": false,
  "locked": true
}'
curl -s -X POST "$BASE/api/save-path" -H "Content-Type: application/json" -d "$PAYLOAD2" >/dev/null

echo ""
echo "— Simulate Reload after second save: fresh fetch must see latest ──"
RESP=$(curl -s "$BASE/api/get-saved-entry?compositionId=$TEST_COMP&sceneName=$TEST_SCENE")
assert "fresh fetch now sees 5 waypoints" "5" "$(echo "$RESP" | jq -r '.entry.path | length')"
assert "lock flag preserved through Reload-fetch" "true" "$(echo "$RESP" | jq -r '.entry._locked')"
assert "new wp at frame 60 visible" "999" "$(echo "$RESP" | jq -r '.entry.path[4].x')"

echo ""
echo "— Reload-all simulation: get-saved-comp returns all scenes ──"
RESP=$(curl -s "$BASE/api/get-saved-comp?compositionId=$TEST_COMP")
assert "comp endpoint returns scene 3 with 5 wps" "5" "$(echo "$RESP" | jq -r '.entries["'$TEST_SCENE'"].path | length')"

echo ""
echo "──────────────────"
echo "$PASS passed, $FAIL failed"
exit "$FAIL"
