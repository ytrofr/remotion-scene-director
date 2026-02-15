# Dorian App Screen Standards

Every Dorian phone screen MUST include ALL of these elements:
1. Status bar (10:45, signal bars, battery) — zIndex: 5
2. Dynamic island (black pill, top center) — zIndex: 6
3. Nav header (hamburger + DORIAN logo + account icon + search bar) — zIndex: 5
4. AI chat bubble (bottom-right, teal circle with pulse) — zIndex: 20
5. Phone bezel (1a1a1a background, borderRadius 55/45)

The full nav bar is NOT the simple "DorianHeader" — it includes:
- Left: Hamburger menu (3 lines, decreasing width)
- Center: Teal logo icon + "DORIAN" text
- Right: Account/user icon (circle + person SVG)
- Below: Search bar with magnifying glass + "Search for products"

Colors: primary=#2DD4BF, primaryDark=#14B8A6, text=#1E293B
Phone: 390x844 viewport, 414x868 with bezel
Zoom states: normal=1.8, chat-zoom=2.76 (offsetY: -560)

Shared components: src/components/DorianPhone/
- StatusBar, DynamicIsland, DorianNavHeader, AIBubble
- ChatHeader, AnimatedText, FingerTap, DorianLogo
