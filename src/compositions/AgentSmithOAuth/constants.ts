// AgentSmith OAuth Verification Demo — shared constants
// Reuses Sigma brand spec from SigmaInvestorDemo
//
// Each composition is a portrait (1080x1920) ~45-60s demo for one scope.
// Used by Google's OAuth Production Verification submission.

export const OAUTH_DEMO_FPS = 30;
export const OAUTH_DEMO_WIDTH = 1080;
export const OAUTH_DEMO_HEIGHT = 1920;

// Common timing — every composition uses these phases at the same offsets
// so the shared scene components animate consistently.
export const PHASES = {
  intro: { start: 0, duration: 90 },          // 0-3s — Σ logo reveal + scope title
  scopeBanner: { start: 90, duration: 30 },   // 3-4s — "this video shows: gmail.readonly"
  chat: { start: 120, duration: 990 },        // 4-37s — chat-driven demonstration
  apiCallout: { start: 1110, duration: 90 },  // 37-40s — show the literal Gmail API call made
  outcome: { start: 1200, duration: 120 },    // 40-44s — show the result (email sent, draft saved, etc.)
  outro: { start: 1320, duration: 180 },      // 44-50s — Σ + "AgentSmith — agent.sigmafier.com"
};

// Total: 1500 frames = 50s at 30fps (per video).
// OAuth flow video is longer (75s); see OAuthFlowDemo for its bespoke timeline.

export const COLORS = {
  bg: '#09090b',
  bgSecondary: '#111114',
  card: '#16161a',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  accent: '#8b5cf6',         // Sigma purple
  accentLight: '#a78bfa',
  cyan: '#06b6d4',           // Sigma cyan
  amber: '#f59e0b',
  emerald: '#10b981',
  red: '#ef4444',
  pink: '#ec4899',
  indigo: '#6366f1',
  green: '#22c55e',

  // Google brand for consent screen reproduction
  googleBlue: '#1a73e8',
  googleGray: '#5f6368',
  googleBg: '#ffffff',
  googleLight: '#f8f9fa',
};

export const FONTS = {
  heading: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// Per-scope demo content. Each one drives one full composition.
// Messages are chat turns. Tags are agent-side labels (small caps above the bubble).
// Animations: messages slide up + fade in at their `delay` (frames).

export type ChatMessage = {
  role: 'user' | 'agent';
  text: string;
  tag?: string;           // small label above bot bubble, e.g., "AGENTSMITH"
  delay: number;          // frame offset within the chat phase
};

export type ScopeDemo = {
  // Composition identity
  id: string;
  title: string;          // shown big at intro: "Reading Gmail messages"
  subtitle: string;       // shown small below title: "scope: gmail.readonly"
  scopeUrl: string;       // full https URL of the scope
  sensitivity: 'restricted' | 'sensitive' | 'basic';

  // Voice-over (recorded separately, dropped onto Audio track)
  voiceoverScript: string;

  // Chat content
  channelName: string;    // 'WhatsApp' or 'Telegram'
  channelHeader: string;  // header text in the phone mock — e.g., 'AgentSmith'
  messages: ChatMessage[];

  // Lower-third callout shown during apiCallout phase
  apiCall: string;        // e.g., "users.messages.list + users.messages.get"
  apiNotes: string;       // e.g., "Reads only the user's own inbox; no other mailboxes."

  // Outcome card shown during outcome phase
  outcomeTitle: string;   // e.g., "Read 3 emails — summary delivered"
  outcomeBody: string;    // e.g., "AgentSmith summarised the 3 most recent Microsoft emails…"
};

export const GMAIL_READONLY: ScopeDemo = {
  id: 'gmail-readonly',
  title: 'Reading Gmail messages',
  subtitle: 'scope: gmail.readonly (restricted)',
  scopeUrl: 'https://www.googleapis.com/auth/gmail.readonly',
  sensitivity: 'restricted',
  voiceoverScript:
    'AgentSmith uses gmail.readonly to answer the user’s natural-language questions about their own inbox. It calls users.messages.list with the user’s query, then users.messages.get for each top result, and summarises through the language model. The user sees the summary in the chat. Message bodies are not stored beyond the conversation turn.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: 'what are the last 3 emails from microsoft about?', delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text: '🔍 Searching your Gmail for messages from Microsoft…', delay: 60 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        '3 most recent from Microsoft:\n\n1. M365 renewal — auto-renewed Apr 21\n2. Security alert — sign-in from Tel Aviv (you, Apr 20)\n3. Azure invoice — $42.10 for March',
      delay: 240 },
  ],
  apiCall: 'GET /gmail/v1/users/me/messages?q=from:microsoft&maxResults=3\nGET /gmail/v1/users/me/messages/{id}',
  apiNotes: 'Read-only access to the authenticated user’s own mailbox. No other mailboxes are read.',
  outcomeTitle: '3 emails read — summary delivered',
  outcomeBody:
    'AgentSmith called Gmail twice (list + get for top 3). The summary was composed by Gemini and shown to the user. No message body was stored.',
};

export const GMAIL_SEND: ScopeDemo = {
  id: 'gmail-send',
  title: 'Sending email — with YES/NO approval',
  subtitle: 'scope: gmail.send (sensitive)',
  scopeUrl: 'https://www.googleapis.com/auth/gmail.send',
  sensitivity: 'sensitive',
  voiceoverScript:
    'AgentSmith never sends email without explicit approval. The user asks for an email; AgentSmith composes it, shows the full draft, and waits for YES. Only on YES does AgentSmith call users.messages.send.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: "email tomer that the meeting moves to 3pm", delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        "📤 Ready to send to tomer@example.com:\n\nSubject: Meeting moved to 3pm\n\nHi Tomer,\nQuick note — let’s push our meeting to 3pm today.\n\nReply YES to send, NO to cancel.",
      delay: 80 },
    { role: 'user', text: 'YES', delay: 240 },
    { role: 'agent', tag: 'AGENTSMITH', text: '✅ Sent.', delay: 290 },
  ],
  apiCall: 'POST /gmail/v1/users/me/messages/send',
  apiNotes: 'Only fires after explicit user YES. The user sees the exact subject + body before approving.',
  outcomeTitle: 'Email sent after explicit approval',
  outcomeBody:
    'YES/NO gate is mandatory. The send call carries the user’s own approved content from their own mailbox.',
};

export const GMAIL_COMPOSE: ScopeDemo = {
  id: 'gmail-compose',
  title: 'Creating a Gmail draft',
  subtitle: 'scope: gmail.compose (restricted)',
  scopeUrl: 'https://www.googleapis.com/auth/gmail.compose',
  sensitivity: 'restricted',
  voiceoverScript:
    'When the user asks AgentSmith to draft rather than send, the assistant calls users.drafts.create. The draft lives in the user’s own Drafts folder, ready for review and send from Gmail itself.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: 'draft an email to yael saying I’ll be late tomorrow, polite', delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        '📝 Draft saved to your Gmail Drafts:\n\nSubject: Tomorrow’s meeting\n\nHi Yael, just a heads-up I’ll be running about 30 minutes late tomorrow. Apologies for the inconvenience — see you soon.',
      delay: 70 },
    { role: 'user', text: 'change subject to "Running late tomorrow"', delay: 320 },
    { role: 'agent', tag: 'AGENTSMITH', text: '📝 Draft updated. Subject: Running late tomorrow.', delay: 380 },
  ],
  apiCall: 'POST /gmail/v1/users/me/drafts\nPUT /gmail/v1/users/me/drafts/{id}',
  apiNotes: 'Draft sits in the user’s own Drafts. Nothing is sent. User can revise or discard at any time.',
  outcomeTitle: 'Draft created and updated in user’s Drafts',
  outcomeBody:
    'AgentSmith never sends a draft on the user’s behalf at this stage. The user reviews and sends from Gmail.',
};

export const GMAIL_MODIFY: ScopeDemo = {
  id: 'gmail-modify',
  title: 'Inbox management — only on user request',
  subtitle: 'scope: gmail.modify (restricted)',
  scopeUrl: 'https://www.googleapis.com/auth/gmail.modify',
  sensitivity: 'restricted',
  voiceoverScript:
    'AgentSmith only modifies messages the user explicitly identifies. Marking as read, archiving, labelling, trashing — each operation targets one specific message named in the conversation.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: 'mark the latest microsoft email as read', delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        '✅ Marked 1 message as read:\n"M365 renewal — auto-renewed Apr 21"',
      delay: 90 },
    { role: 'user', text: 'now trash the substack newsletter from this morning', delay: 280 },
    { role: 'agent', tag: 'AGENTSMITH', text: '🗑️ Moved 1 message to trash:\n"Substack — AI digest"', delay: 360 },
  ],
  apiCall: 'POST /gmail/v1/users/me/messages/{id}/modify\nPOST /gmail/v1/users/me/messages/{id}/trash',
  apiNotes: 'Only the message the user identified is touched. AgentSmith does not bulk-modify.',
  outcomeTitle: 'Two specific messages modified',
  outcomeBody:
    'Each modify targets exactly one message named in the conversation. No bulk actions, no auto-archiving.',
};

export const CALENDAR_DEMO: ScopeDemo = {
  id: 'calendar',
  title: 'Calendar — read + write with approval',
  subtitle: 'scope: calendar (sensitive)',
  scopeUrl: 'https://www.googleapis.com/auth/calendar',
  sensitivity: 'sensitive',
  voiceoverScript:
    'AgentSmith reads the user’s calendars and creates events when asked. Every create-update-delete passes through the same YES/NO approval gate as email send.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: "what's on my calendar tomorrow?", delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text: '📅 Tomorrow:\n• 09:30 — Standup (30m)\n• 13:00 — Lunch with David\n• 16:00 — Investor call', delay: 80 },
    { role: 'user', text: 'book lunch with yael at 1pm friday', delay: 280 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        "I'll create:\n📅 Lunch with Yael — Fri 1:00-2:00pm\n\nReply YES to confirm.", delay: 360 },
    { role: 'user', text: 'YES', delay: 540 },
    { role: 'agent', tag: 'AGENTSMITH', text: '✅ Event created — added to your primary calendar.', delay: 590 },
  ],
  apiCall: 'GET /calendar/v3/calendars/primary/events\nPOST /calendar/v3/calendars/primary/events',
  apiNotes: 'Events.list reads the user’s own calendar. Events.insert only after explicit YES.',
  outcomeTitle: 'Schedule queried + new event created',
  outcomeBody:
    'Same YES/NO discipline as email. The user always sees the proposed event before it lands.',
};

export const CONTACTS_DEMO: ScopeDemo = {
  id: 'contacts',
  title: 'Looking up contacts to drive recipients',
  subtitle: 'scopes: contacts.readonly + contacts.other.readonly',
  scopeUrl: 'https://www.googleapis.com/auth/contacts.readonly',
  sensitivity: 'sensitive',
  voiceoverScript:
    'When the user names a contact by first name only, AgentSmith looks them up in Google Contacts to find the right address. It also falls back to "Other contacts" — people the user has emailed before but not formally saved.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: "email yael that I'll be late", delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text: '🔍 Found Yael in your contacts: yael.cohen@example.com', delay: 100 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        "📤 Ready to send to yael.cohen@example.com:\n\nSubject: Running late\n\nReply YES to send.",
      delay: 220 },
    { role: 'user', text: 'YES', delay: 440 },
    { role: 'agent', tag: 'AGENTSMITH', text: '✅ Sent.', delay: 490 },
  ],
  apiCall: 'GET /v1/people/me/connections (Contacts API)\nGET /v1/otherContacts (Other Contacts API)',
  apiNotes: 'Read-only contact look-up — only used to resolve names to email addresses for outbound actions the user requested.',
  outcomeTitle: 'Contact resolved + email approved + sent',
  outcomeBody:
    'AgentSmith never modifies contacts. Look-up is read-only and only fires when the user names someone in conversation.',
};

export const SHEETS_DEMO: ScopeDemo = {
  id: 'sheets',
  title: 'Reading and appending to user-named sheets',
  subtitle: 'scope: spreadsheets (sensitive)',
  scopeUrl: 'https://www.googleapis.com/auth/spreadsheets',
  sensitivity: 'sensitive',
  voiceoverScript:
    'When the user names a sheet, AgentSmith can read cells or append rows. It only operates on sheets explicitly named in the conversation.',
  channelName: 'Telegram',
  channelHeader: 'AgentSmith',
  messages: [
    { role: 'user', text: "log this expense to my receipts sheet: 250 NIS coffee meeting with David", delay: 10 },
    { role: 'agent', tag: 'AGENTSMITH', text:
        "📊 Appending to 'Receipts 2026':\n• Date: 2026-04-25\n• Amount: 250 NIS\n• Category: Coffee meeting\n• Note: with David",
      delay: 100 },
    { role: 'agent', tag: 'AGENTSMITH', text: '✅ Row appended (now 47 rows).', delay: 320 },
  ],
  apiCall: 'POST /v4/spreadsheets/{id}/values/Sheet1!A:D:append',
  apiNotes: 'Append-only operation on a sheet the user named. AgentSmith never writes to sheets the user has not referenced.',
  outcomeTitle: 'Row appended to user-named sheet',
  outcomeBody:
    'No sheet outside the conversation is touched. The user controls which sheet AgentSmith writes to by naming it.',
};

export const ALL_SCOPE_DEMOS: ScopeDemo[] = [
  GMAIL_READONLY,
  GMAIL_SEND,
  GMAIL_COMPOSE,
  GMAIL_MODIFY,
  CALENDAR_DEMO,
  CONTACTS_DEMO,
  SHEETS_DEMO,
];
