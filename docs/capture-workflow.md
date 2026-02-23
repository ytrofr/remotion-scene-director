# Screenshot Capture Workflow

On-demand reference for capturing screenshots from external web apps using Playwright.
See also: `CLAUDE.md` for project overview, `docs/compositions.md` for composition details.

---

## Screenshot Capture Workflow

### Prerequisites

- Target web app running on port 8080
- Auth disabled or pre-configured for capture

### Capture Process

1. **Run capture**:

   ```bash
   npx tsx scripts/capture-mobile-chat-dark.ts
   ```

### Capture Script Features

- Dark mode CSS injection (CRITICAL - must match existing screenshots)
- Letter-by-letter typing (21 stages)
- Rapid capture after send (5 screenshots: 0ms, 50ms, 150ms, 300ms, 500ms)
- 2x scale (Retina) output

### Capturing User Message Only State

The AI responds too fast to capture "user message without AI response" naturally.
Use `scripts/capture-user-message.ts` which:

1. **Sets auth token** via localStorage before navigation
2. **Injects dark mode CSS** (same as capture-mobile-chat-dark.ts)
3. **Intercepts API** with `page.route()` to delay AI response by 15 seconds
4. **Captures** immediately after user message appears
5. **Hides thinking indicator** via JS for clean "user message only" state

```bash
npx tsx scripts/capture-user-message.ts
```

**Output**:

- `mobile-chat-user-message.png` - User message only (no AI)
- `mobile-chat-thinking.png` - User message + native thinking bubble

### Dark Mode CSS Injection (CRITICAL)

**DO NOT** just set `data-theme="dark"` - you MUST inject the full CSS to match existing screenshots.

Key CSS rules:

```css
/* Background */
html,
body {
  background-color: #0a0a15 !important;
}

/* Header gradient */
header,
nav {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

/* Chat area */
.chat-container,
.chat-messages {
  background-color: #0f0f1a !important;
}

/* IMPORTANT: Do NOT override user message bubble background! */
/* Only force white text, keep native teal/green bubble color */
.message.user * {
  color: #ffffff !important;
}
/* DO NOT: background: linear-gradient(...) - this changes bubble color! */
```

### API Route Interception Pattern

```javascript
// Delay AI response to capture intermediate states
await page.route('**/api/true-ai/**', async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 sec delay
  await route.fulfill({
    status: 200,
    contentType: 'text/event-stream',
    body: 'data: {"type":"done"}\n\n',
  });
});
```

### Hiding Native Thinking Indicator

```javascript
// After capturing with thinking, hide it for clean user message
await page.evaluate(() => {
  document
    .querySelectorAll('.thinking-message, .thinking-dots, .message:not(.user)')
    .forEach((el) => (el.style.display = 'none'));
});
```

---

## External App Integration (Playwright MCP)

For capturing screenshots from external web apps, use Playwright MCP tools (`browser_navigate`, `browser_click`, `browser_evaluate`, etc.) to automate interactions without modifying the target app.

### Route Interception Pattern

```javascript
// Intercept API for controlled demo responses
await page.route('/api/endpoint*', async (route) => {
  await route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: 'data: {"type":"chunk","data":{"text":"Response text"}}\n\n',
  });
});
```

### Demo Automation Example

```javascript
// Using Playwright MCP tools
await browser_navigate({ url: 'http://localhost:8080/your-page' });
await browser_evaluate({
  function: `() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }`,
});
await browser_snapshot({});
await browser_type({ ref: '#inputField', text: 'Query text', delay: 100 });
await browser_click({ ref: '#sendButton', element: 'Send button' });
await browser_wait_for({ selector: '.response', timeout: 30000 });
await browser_take_screenshot({ path: 'demo-response.png' });
```
