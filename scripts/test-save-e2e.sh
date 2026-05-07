#!/usr/bin/env bash
# E2E test — exercise the API endpoints against a running scene-director dev server.
# Spins up a temporary server on a free port, runs assertions, tears down.
#
# Run: npm run test:save-e2e

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=3099
BASE="http://localhost:${PORT}"
JSON_FILE="src/compositions/SceneDirector/codedPaths.data.json"
HIST_FILE="src/compositions/SceneDirector/codedPaths.history.jsonl"
JSON_BACKUP="/tmp/codedPaths.data.json.e2e-backup-$$"
HIST_BACKUP="/tmp/codedPaths.history.jsonl.e2e-backup-$$"

# ── Setup: backup existing files so the test does not corrupt user state ──
echo "→ Backing up codedPaths.data.json + history file"
cp "$JSON_FILE" "$JSON_BACKUP"
[ -f "$HIST_FILE" ] && cp "$HIST_FILE" "$HIST_BACKUP" || touch "$HIST_BACKUP"

cleanup() {
  echo ""
  echo "→ Cleanup: restoring files + killing server"
  cp "$JSON_BACKUP" "$JSON_FILE"
  if [ -s "$HIST_BACKUP" ]; then
    cp "$HIST_BACKUP" "$HIST_FILE"
  else
    rm -f "$HIST_FILE"
  fi
  rm -f "$JSON_BACKUP" "$HIST_BACKUP"
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ── Start server in background ──
echo "→ Starting test server on :$PORT"
LOG="/tmp/save-e2e-server-$$.log"
npx vite --config vite.config.ts --port "$PORT" >"$LOG" 2>&1 &
SERVER_PID=$!

# Wait for server up (max 20s)
READY=0
for i in $(seq 1 40); do
  if curl -s -o /dev/null -w "%{http_code}" "$BASE/api/get-saved-entry?compositionId=__test__&sceneName=__none__" 2>/dev/null | grep -q "200"; then
    READY=1
    break
  fi
  sleep 0.5
done
if [ "$READY" = "0" ]; then
  echo "✗ Server failed to start. Tail of $LOG:"
  tail -20 "$LOG"
  exit 1
fi
echo "  ✓ Server ready"

PASS=0
FAIL=0
assert() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS + 1))
    echo "  ✓ $label"
  else
    FAIL=$((FAIL + 1))
    echo "  ✗ $label"
    echo "      expected: $expected"
    echo "      actual:   $actual"
  fi
}

TEST_COMP="__e2e_test__"
TEST_SCENE="test-scene"

echo ""
echo "— /api/get-saved-entry returns 404-equivalent for unknown ──"
RESP=$(curl -s "$BASE/api/get-saved-entry?compositionId=$TEST_COMP&sceneName=$TEST_SCENE")
assert "unknown returns null entry" "null" "$(echo "$RESP" | jq -r '.entry')"

echo ""
echo "— /api/save-path POST writes entry ──"
PAYLOAD='{
  "compositionId": "'$TEST_COMP'",
  "sceneName": "'$TEST_SCENE'",
  "path": [
    {"x":100,"y":100,"frame":0,"gesture":"pointer","scale":1},
    {"x":200,"y":200,"frame":30,"gesture":"click","scale":1,"duration":5}
  ],
  "gesture": "click",
  "animation": "cursor-real-black",
  "dark": false,
  "locked": false
}'
RESP=$(curl -s -X POST "$BASE/api/save-path" -H "Content-Type: application/json" -d "$PAYLOAD")
assert "save returns success" "true" "$(echo "$RESP" | jq -r '.success')"

# Verify it's on disk now
RESP=$(curl -s "$BASE/api/get-saved-entry?compositionId=$TEST_COMP&sceneName=$TEST_SCENE")
assert "entry exists after save" "2" "$(echo "$RESP" | jq -r '.entry.path | length')"
assert "first wp gesture is pointer" "pointer" "$(echo "$RESP" | jq -r '.entry.path[0].gesture')"

echo ""
echo "— /api/save-path with locked:true sets _locked flag ──"
PAYLOAD2='{
  "compositionId": "'$TEST_COMP'",
  "sceneName": "'$TEST_SCENE'",
  "path": [{"x":100,"y":100,"frame":0,"gesture":"pointer","scale":1},{"x":200,"y":200,"frame":30,"gesture":"click","scale":1,"duration":5}],
  "gesture": "click",
  "animation": "cursor-real-black",
  "dark": false,
  "locked": true
}'
curl -s -X POST "$BASE/api/save-path" -H "Content-Type: application/json" -d "$PAYLOAD2" >/dev/null
RESP=$(curl -s "$BASE/api/get-saved-entry?compositionId=$TEST_COMP&sceneName=$TEST_SCENE")
assert "_locked flag persisted" "true" "$(echo "$RESP" | jq -r '.entry._locked')"

echo ""
echo "— /api/save-history records each save ──"
RESP=$(curl -s "$BASE/api/save-history?compositionId=$TEST_COMP&sceneName=$TEST_SCENE&limit=10")
COUNT=$(echo "$RESP" | jq -r '.entries | length')
# At least 2 entries (the 2 saves above)
if [ "$COUNT" -ge 2 ]; then
  echo "  ✓ history has $COUNT entries (≥2 expected)"
  PASS=$((PASS + 1))
else
  echo "  ✗ history count: expected ≥2, got $COUNT"
  FAIL=$((FAIL + 1))
fi
assert "newest history record has lock=true" "true" "$(echo "$RESP" | jq -r '.entries[0].newEntry._locked')"
assert "newest record has prevEntry from previous save" "false" "$(echo "$RESP" | jq -r '.entries[0].prevEntry._locked // false')"

echo ""
echo "— /api/save-path with empty path deletes entry ──"
PAYLOAD3='{
  "compositionId": "'$TEST_COMP'",
  "sceneName": "'$TEST_SCENE'",
  "path": [],
  "gesture": "click",
  "animation": "cursor-real-black"
}'
curl -s -X POST "$BASE/api/save-path" -H "Content-Type: application/json" -d "$PAYLOAD3" >/dev/null
RESP=$(curl -s "$BASE/api/get-saved-entry?compositionId=$TEST_COMP&sceneName=$TEST_SCENE")
assert "entry deleted after empty save" "null" "$(echo "$RESP" | jq -r '.entry')"

echo ""
echo "— /api/get-saved-comp returns whole composition map ──"
# Re-save first
curl -s -X POST "$BASE/api/save-path" -H "Content-Type: application/json" -d "$PAYLOAD" >/dev/null
RESP=$(curl -s "$BASE/api/get-saved-comp?compositionId=$TEST_COMP")
assert "comp entries include test-scene" "true" "$(echo "$RESP" | jq -r '.entries["'$TEST_SCENE'"] != null')"

echo ""
echo "──────────────────"
echo "$PASS passed, $FAIL failed"
exit "$FAIL"
