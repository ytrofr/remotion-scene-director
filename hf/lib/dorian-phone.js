/**
 * buildDorianPhone() — renders a phone mockup into a mount element.
 *
 * Usage inside HF scene HTML:
 *   <div id="phone-mount"></div>
 *   <template id="phone-content">
 *     <img src="public/dorian/woodmart/home-mobile.png" alt="" />
 *   </template>
 *   <script src="components/dorian-phone.js"></script>
 *   <script>
 *     const { scrollEl, wrapEl } = buildDorianPhone({
 *       mountId: 'phone-mount',
 *       contentTemplateId: 'phone-content',
 *       zoom: 1.8,
 *       showAiBubble: true,
 *       aiBubbleIcon: 'smiley',       // sparkle | smiley | none
 *       hideSearch: true,
 *       hideHomeIndicator: false,
 *     });
 *     // Now scrollEl/wrapEl are DOM refs you can animate:
 *     gsap.to(scrollEl, { y: -800, duration: 3 });
 *   </script>
 */
(function () {
  const CSS = `
    .dp-wrap { position: absolute; transform-origin: center center; }
    .dp-bezel {
      width: 414px; height: 868px;
      background: #1a1a1a; border-radius: 55px; padding: 12px;
      box-shadow: 0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3);
    }
    .dp-screen {
      width: 390px; height: 844px; border-radius: 45px;
      overflow: hidden; position: relative; background: #fff;
    }
    .dp-scroll {
      position: absolute; top: 0; left: 0;
      width: 390px; will-change: transform;
    }
    .dp-dynamic-island {
      position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
      width: 120px; height: 32px; background: #000; border-radius: 20px; z-index: 25;
    }
    .dp-header {
      position: absolute; top: 0; left: 0; right: 0;
      height: 148px; z-index: 20; background: #fff;
    }
    .dp-status-bar {
      height: 50px; display: flex; justify-content: space-between;
      align-items: center; padding: 0 28px; font-size: 17px;
      font-weight: 600; color: #000; font-family: 'Rubik', sans-serif;
    }
    .dp-nav {
      height: 98px; padding: 10px 16px 14px; display: flex;
      flex-direction: column; gap: 10px;
    }
    .dp-nav-row { display: flex; align-items: center; justify-content: space-between; }
    .dp-hamburger { width: 24px; height: 18px; display: flex; flex-direction: column; justify-content: space-between; }
    .dp-hamburger span { height: 2.5px; background: #1e293b; border-radius: 2px; }
    .dp-hamburger span:nth-child(1) { width: 24px; }
    .dp-hamburger span:nth-child(2) { width: 20px; }
    .dp-hamburger span:nth-child(3) { width: 16px; }
    .dp-logo { display: flex; align-items: center; gap: 8px; }
    .dp-logo-icon {
      width: 22px; height: 22px; border-radius: 6px;
      background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .dp-logo-icon::after {
      content: ''; width: 11px; height: 11px; border-radius: 50%;
      border: 2px solid #fff; border-right-color: transparent;
      transform: rotate(-45deg);
    }
    .dp-logo-text { font-size: 18px; font-weight: 800; color: #1e293b; letter-spacing: 1px; font-family: 'Rubik', sans-serif; }
    .dp-account {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1.5px solid #1e293b; position: relative;
    }
    .dp-account::after {
      content: ''; position: absolute; left: 50%; top: 30%; transform: translateX(-50%);
      width: 10px; height: 10px; border-radius: 50%; background: #1e293b;
    }
    .dp-search {
      height: 40px; background: #f1f5f9; border-radius: 12px;
      padding: 0 14px; display: flex; align-items: center; gap: 10px;
      color: #64748b; font-size: 14px; font-family: 'Rubik', sans-serif;
    }
    .dp-bubble {
      position: absolute; bottom: 70px; right: 15px; z-index: 20;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 20px rgba(45, 212, 191, 0.4);
    }
    .dp-bubble::before {
      content: ''; position: absolute; inset: -6px; border-radius: 50%;
      border: 2px solid #2dd4bf; opacity: 0.5;
      animation: dp-pulse 2s ease-out infinite;
    }
    @keyframes dp-pulse {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .dp-home {
      position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
      width: 140px; height: 5px; background: #000; border-radius: 3px; z-index: 15;
    }
  `;

  // Inject CSS immediately on script load
  if (
    typeof document !== "undefined" &&
    !document.getElementById("dp-styles")
  ) {
    const style = document.createElement("style");
    style.id = "dp-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const SPARKLE =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.5 7L22 11.5l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" fill="#fff"/></svg>';
  const SMILEY =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="10" r="1.2" fill="#fff"/><circle cx="15" cy="10" r="1.2" fill="#fff"/><path d="M8 14q4 3 8 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>';

  const STATUS_ICONS = `
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
      <path d="M1 8h2v3H1zM5 6h2v5H5zM9 4h2v7H9zM13 1h2v10h-2z" fill="#000"/>
    </svg>
    <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
      <rect x="1" y="1" width="20" height="9" rx="2" stroke="#000" stroke-width="1" fill="#000"/>
      <rect x="22" y="4" width="1.5" height="3" rx="0.5" fill="#000"/>
    </svg>`;

  const SEARCH_BAR = `
    <div class="dp-search">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="#64748b" stroke-width="1.5"/>
        <path d="M9.5 9.5L12.5 12.5" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Search for products
    </div>`;

  window.buildDorianPhone = function (opts) {
    const {
      mountId,
      contentTemplateId,
      zoom = 1.8,
      offsetX = 0,
      offsetY = 0,
      showAiBubble = false,
      aiBubbleIcon = "sparkle",
      hideSearch = false,
      hideHomeIndicator = false,
      initialScrollY = 0,
    } = opts;

    const mount = document.getElementById(mountId);
    if (!mount)
      throw new Error(`buildDorianPhone: mount "#${mountId}" not found`);

    // Read content from <template>
    const tpl = contentTemplateId
      ? document.getElementById(contentTemplateId)
      : null;
    const contentHTML = tpl ? tpl.innerHTML : "";

    const bubble = showAiBubble
      ? `<div class="dp-bubble">${aiBubbleIcon === "smiley" ? SMILEY : aiBubbleIcon === "none" ? "" : SPARKLE}</div>`
      : "";

    const html = `
      <div class="dp-wrap" style="left:${540 + offsetX}px;top:${960 + offsetY}px;transform:translate(-50%,-50%) scale(${zoom});">
        <div class="dp-bezel">
          <div class="dp-screen">
            <div class="dp-scroll" style="top:${-initialScrollY}px;">${contentHTML}</div>
            <div class="dp-header">
              <div class="dp-dynamic-island"></div>
              <div class="dp-status-bar"><span>10:45</span><span style="display:inline-flex;gap:6px;align-items:center;">${STATUS_ICONS}</span></div>
              <div class="dp-nav">
                <div class="dp-nav-row">
                  <div class="dp-hamburger"><span></span><span></span><span></span></div>
                  <div class="dp-logo"><div class="dp-logo-icon"></div><div class="dp-logo-text">DORIAN</div></div>
                  <div class="dp-account"></div>
                </div>
                ${hideSearch ? "" : SEARCH_BAR}
              </div>
            </div>
            ${bubble}
            ${hideHomeIndicator ? "" : '<div class="dp-home"></div>'}
          </div>
        </div>
      </div>`;

    mount.innerHTML = html;

    return {
      wrapEl: mount.querySelector(".dp-wrap"),
      bezelEl: mount.querySelector(".dp-bezel"),
      screenEl: mount.querySelector(".dp-screen"),
      scrollEl: mount.querySelector(".dp-scroll"),
      bubbleEl: mount.querySelector(".dp-bubble"),
    };
  };
})();
