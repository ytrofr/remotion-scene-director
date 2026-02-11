import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Img,
} from "remotion";

interface LimorAppDemoProps {
  title: string;
  tagline: string;
}

// Scene 1: Logo Intro (0-5s = frames 0-150)
const LogoIntro: React.FC<{ title: string; tagline: string }> = ({
  title,
  tagline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = spring({ frame, fps, config: { damping: 200 } });
  const taglineOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Heebo, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <div
        style={{ transform: `scale(${scale})`, opacity, textAlign: "center" }}
      >
        <h1 style={{ fontSize: 120, color: "#00d9ff", margin: 0 }}>{title}</h1>
        <p
          style={{
            fontSize: 36,
            color: "#ffffff",
            opacity: taglineOpacity,
            marginTop: 20,
          }}
        >
          {tagline}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Labor Dashboard (5-12s = frames 150-360)
const LaborDashboardScene: React.FC = () => {
  const frame = useCurrentFrame();

  const slideIn = interpolate(frame, [0, 30], [-100, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        padding: 40,
        fontFamily: "Heebo, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <div style={{ transform: `translateY(${slideIn}px)`, opacity }}>
        <h2 style={{ color: "#00d9ff", fontSize: 48, marginBottom: 30 }}>
          לוח בקרת עלויות עבודה
        </h2>

        {/* Simulated dashboard content */}
        <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              padding: 30,
              borderRadius: 15,
              border: "1px solid #00d9ff33",
            }}
          >
            <p style={{ color: "#888", fontSize: 18 }}>הכנסות היום</p>
            <p style={{ color: "#00ff88", fontSize: 48, fontWeight: "bold" }}>
              ₪12,500
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              padding: 30,
              borderRadius: 15,
              border: "1px solid #00d9ff33",
            }}
          >
            <p style={{ color: "#888", fontSize: 18 }}>עלות עבודה</p>
            <p style={{ color: "#ff6b6b", fontSize: 48, fontWeight: "bold" }}>
              ₪3,750
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              padding: 30,
              borderRadius: 15,
              border: "1px solid #00d9ff33",
            }}
          >
            <p style={{ color: "#888", fontSize: 18 }}>יחס עלות עבודה</p>
            <p style={{ color: "#ffd93d", fontSize: 48, fontWeight: "bold" }}>
              30%
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: AI Chat Demo (12-20s = frames 360-600)
const AIChatScene: React.FC = () => {
  const frame = useCurrentFrame();

  const userMessageOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const aiMessageOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        padding: 40,
        fontFamily: "Heebo, Arial, sans-serif",
        direction: "rtl",
      }}
    >
      <h2
        style={{
          color: "#00d9ff",
          fontSize: 48,
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        LIMOR AI Chat
      </h2>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* User Message */}
        <div
          style={{
            opacity: userMessageOpacity,
            background: "#16213e",
            padding: 20,
            borderRadius: 15,
            marginBottom: 20,
            marginLeft: 100,
          }}
        >
          <p style={{ color: "#888", fontSize: 14, marginBottom: 5 }}>אתה</p>
          <p style={{ color: "#fff", fontSize: 24 }}>כמה עובדים עבדו היום?</p>
        </div>

        {/* AI Response */}
        <div
          style={{
            opacity: aiMessageOpacity,
            background: "linear-gradient(135deg, #00d9ff22 0%, #00d9ff11 100%)",
            padding: 20,
            borderRadius: 15,
            marginRight: 100,
            border: "1px solid #00d9ff44",
          }}
        >
          <p style={{ color: "#00d9ff", fontSize: 14, marginBottom: 5 }}>
            LIMOR AI
          </p>
          <p style={{ color: "#fff", fontSize: 24 }}>
            היום עבדו 12 עובדים בסניף ויצמן.
            <br />
            סה"כ שעות: 87.5 | עלות: ₪3,750
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Outro (20-30s = frames 600-900)
const OutroScene: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Heebo, Arial, sans-serif",
        direction: "rtl",
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 80, color: "#00d9ff", marginBottom: 30 }}>
          {title}
        </h1>
        <p style={{ fontSize: 32, color: "#ffffff" }}>
          ניהול חכם. נתונים אמיתיים. תוצאות.
        </p>
        <p style={{ fontSize: 24, color: "#888", marginTop: 40 }}>limor.app</p>
      </div>
    </AbsoluteFill>
  );
};

// Main Composition
export const LimorAppDemo: React.FC<LimorAppDemoProps> = ({
  title,
  tagline,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* Scene 1: Logo Intro (0-5s) */}
      <Sequence from={0} durationInFrames={150}>
        <LogoIntro title={title} tagline={tagline} />
      </Sequence>

      {/* Scene 2: Labor Dashboard (5-12s) */}
      <Sequence from={150} durationInFrames={210}>
        <LaborDashboardScene />
      </Sequence>

      {/* Scene 3: AI Chat (12-20s) */}
      <Sequence from={360} durationInFrames={240}>
        <AIChatScene />
      </Sequence>

      {/* Scene 4: Outro (20-30s) */}
      <Sequence from={600} durationInFrames={300}>
        <OutroScene title={title} />
      </Sequence>
    </AbsoluteFill>
  );
};
