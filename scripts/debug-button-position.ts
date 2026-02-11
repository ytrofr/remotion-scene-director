import { bundle } from "@remotion/bundler";
import { renderStill } from "@remotion/renderer";
import path from "path";

/**
 * Renders a single frame from Scene 4 (Send) to debug button position
 */
async function debugButtonPosition() {
  console.log("📸 Rendering debug frame from Scene 4...\n");

  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/index.ts"),
    webpackOverride: (config) => config,
  });

  // Scene 4 starts around frame 135-140, render frame 145 (mid-scene)
  await renderStill({
    composition: {
      id: "MobileChatDemoV2",
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: 355,
      defaultProps: {},
      defaultCodec: "h264",
    },
    serveUrl: bundleLocation,
    output: "public/debug-button-position.png",
    frame: 150, // Scene 4 frame
  });

  console.log("\n✅ Debug frame saved to: public/debug-button-position.png");
  console.log("   Look for the red dot - it shows where the click is positioned.");
}

debugButtonPosition().catch(console.error);
