"""Generate English voice-over MP3s for the 8 AgentSmith OAuth verification videos.

Uses Google Cloud Text-to-Speech REST API via Application Default Credentials.
Saves each MP3 to public/agentsmith-voiceover/.

Run after `gcloud auth login`.
Requires: requests, google-auth (`pip install google-auth requests`).
"""

import json
import sys
from pathlib import Path

try:
    import requests
    from google.auth import default as google_auth_default
    from google.auth.transport.requests import Request as GAuthRequest
except ImportError as e:
    print(f"Missing dep: {e}. Install: pip3 install google-auth google-auth-oauthlib requests")
    sys.exit(1)

OUTPUT_DIR = Path.home() / "limor-video-poc" / "public" / "agentsmith-voiceover"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# English voice with slow, professional cadence — matches Google submission tone
VOICE = {
    "languageCode": "en-US",
    "name": "en-US-Studio-O",  # Professional female narrator
    # Fallback if Studio voices unavailable: "en-US-Neural2-J"
}
AUDIO_CONFIG = {
    "audioEncoding": "MP3",
    "sampleRateHertz": 24000,
    "speakingRate": 0.95,  # Slightly slower for clarity
}

VOICEOVERS = {
    "oauth-flow": (
        "AgentSmith is a personal AI assistant accessed via Telegram, WhatsApp, or web chat. "
        "When the user asks AgentSmith to connect Google, the assistant returns a signed, "
        "single-use OAuth URL bound to that user. Tapping the link opens the standard "
        "Google consent screen, which lists the app name, AgentSmith, and the exact scopes "
        "the user is granting. After the user clicks Continue, Google issues a refresh token. "
        "AgentSmith stores it encrypted at rest in Neon PostgreSQL and confirms back in the chat. "
        "The user can revoke at any time at myaccount.google.com/permissions."
    ),
    "gmail-readonly": (
        "AgentSmith uses gmail.readonly to answer the user's natural-language questions about their own inbox. "
        "It calls users.messages.list with the user's query, then users.messages.get for each top result, "
        "and summarises the content through the language model. "
        "The user sees the summary in the chat. Message bodies are not stored beyond the conversation turn. "
        "AgentSmith never reads any other user's mailbox."
    ),
    "gmail-send": (
        "AgentSmith never sends email without explicit approval. "
        "When the user asks for an email, AgentSmith composes the draft, "
        "presents the full subject and body in the chat, and waits for a YES reply. "
        "Only on YES does AgentSmith call users.messages.send. "
        "On NO, nothing happens. The user always sees what they are sending before they send it."
    ),
    "gmail-compose": (
        "When the user asks AgentSmith to draft rather than send, "
        "the assistant calls users.drafts.create. "
        "The draft lives in the user's own Gmail Drafts folder, "
        "where the user can review and either send it from Gmail itself or ask AgentSmith to revise. "
        "AgentSmith never sends a draft without an additional explicit YES from the user."
    ),
    "gmail-modify": (
        "AgentSmith only modifies messages the user explicitly identifies in the conversation. "
        "Marking as read, archiving, applying a label, or moving to trash — "
        "each operation targets one specific message named by the user. "
        "AgentSmith never performs bulk modifications and never auto-archives."
    ),
    "calendar": (
        "AgentSmith reads the user's calendars via events.list when asked about the schedule. "
        "When the user asks to create, update, or delete an event, "
        "AgentSmith composes the event details, shows them in the chat, and waits for a YES reply. "
        "Only on YES does the calendar API write fire. "
        "Same approval discipline as email send."
    ),
    "contacts": (
        "When the user names a contact by first name only, "
        "AgentSmith looks them up in Google Contacts to resolve the right address. "
        "It also falls back to the Other Contacts list for people the user has emailed before "
        "but not formally saved as a contact. "
        "Contact look-up is read-only and only used to drive outbound actions the user has requested."
    ),
    "sheets": (
        "AgentSmith reads and appends rows in Google Sheets the user has named in the conversation. "
        "It calls spreadsheets values.get, append, and update — only on sheets explicitly referenced. "
        "AgentSmith never writes to sheets the user has not named."
    ),
}


def get_auth_token():
    creds, project = google_auth_default(
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    if not creds.valid:
        creds.refresh(GAuthRequest())
    return creds.token, project


def synthesize(text, output_path, token, quota_project=None):
    body = {
        "input": {"text": text},
        "voice": VOICE,
        "audioConfig": AUDIO_CONFIG,
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if quota_project:
        headers["x-goog-user-project"] = quota_project

    resp = requests.post(
        "https://texttospeech.googleapis.com/v1/text:synthesize",
        headers=headers,
        json=body,
        timeout=60,
    )
    if resp.status_code != 200:
        print(f"  ✗ HTTP {resp.status_code}: {resp.text[:300]}")
        return False

    import base64

    audio_b64 = resp.json().get("audioContent")
    audio_bytes = base64.b64decode(audio_b64)
    output_path.write_bytes(audio_bytes)
    return True


def main():
    print(f"Output dir: {OUTPUT_DIR}")
    token, project = get_auth_token()
    # Force ogas-479916 — gcloud's default project may be limor-ai for which
    # this account lacks serviceUsageConsumer permission.
    quota_project = "ogas-479916"
    print(f"Auth OK. Quota project: {quota_project} (gcloud default was: {project})")

    success = 0
    failed = []
    for slug, text in VOICEOVERS.items():
        out = OUTPUT_DIR / f"{slug}.mp3"
        print(f"  → {slug}.mp3 ({len(text)} chars)...", end=" ", flush=True)
        if synthesize(text, out, token, quota_project):
            print(f"OK ({out.stat().st_size:,} bytes)")
            success += 1
        else:
            failed.append(slug)
            print("FAIL")

    print(f"\nDone: {success}/{len(VOICEOVERS)} voiceovers generated.")
    if failed:
        print(f"Failed: {failed}")
        sys.exit(1)


if __name__ == "__main__":
    main()
