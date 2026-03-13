import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import {
  COLORS,
  PHONE,
  HAND_PHYSICS,
  handSizeForZoom,
  SPRING_CONFIG,
} from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { getSavedPath } from '../../SceneDirector/codedPaths';

// ── Timeline (frames at 30fps, 450 total) ──
// Phase 1: 0-50    Dashboard static, hand appears and moves to AI bubble
// Phase 2: 50-65   Hand taps AI bubble, zoom begins
// Phase 3: 65-100  Chat panel slides up (zoomed in)
// Phase 4: 100-170 User types "Show me best sellers in my store"
// Phase 5: 170-185 Hand taps send
// Phase 6: 185-215 AI thinking dots
// Phase 7: 215-280 AI responds + dashboard crossfades to best sellers
// Phase 8: 280-330 Chat panel dismisses + zoom out
// Phase 9: 330-450 Best sellers view visible, hand scrolls

// ── Sub-components ──

const StatCard: React.FC<{
  label: string;
  value: string;
  change: string;
  positive: boolean;
  delay: number;
  frame: number;
  fps: number;
}> = ({ label, value, change, positive, delay, frame, fps }) => {
  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 16,
        padding: '14px 16px',
        flex: 1,
        minWidth: 150,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${COLORS.border}`,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 20}px)`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: COLORS.textLight,
          fontFamily,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: COLORS.text,
          fontFamily,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: positive ? COLORS.success : COLORS.warning,
          fontFamily,
          marginTop: 2,
        }}
      >
        {positive ? '+' : ''}
        {change}
      </div>
    </div>
  );
};

const MiniChart: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const bars = [0.4, 0.65, 0.5, 0.8, 0.55, 0.9, 0.7];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.text,
          fontFamily,
          marginBottom: 12,
        }}
      >
        Weekly Sales
      </div>
      <div
        style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}
      >
        {bars.map((h, i) => {
          const grow = spring({
            frame: frame - 15 - i * 3,
            fps,
            config: { damping: 12, mass: 0.8, stiffness: 100 },
          });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: h * 80 * grow,
                  background: i === 5 ? COLORS.primary : `${COLORS.primary}40`,
                  borderRadius: 4,
                  minHeight: 2,
                }}
              />
              <div style={{ fontSize: 8, color: COLORS.textLight, fontFamily }}>
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderRow: React.FC<{
  name: string;
  items: number;
  total: string;
  status: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ name, items, total, status, delay, frame, fps }) => {
  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 1, stiffness: 100 },
  });
  const statusColor =
    status === 'Completed'
      ? COLORS.success
      : status === 'Pending'
        ? COLORS.warning
        : COLORS.primary;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: `1px solid ${COLORS.border}`,
        opacity: appear,
        transform: `translateX(${(1 - appear) * 30}px)`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.text,
            fontFamily,
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 10, color: COLORS.textLight, fontFamily }}>
          {items} items
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.text,
          fontFamily,
          marginRight: 12,
        }}
      >
        {total}
      </div>
      <div
        style={{
          fontSize: 9,
          color: statusColor,
          background: `${statusColor}15`,
          padding: '3px 8px',
          borderRadius: 8,
          fontFamily,
          fontWeight: 600,
        }}
      >
        {status}
      </div>
    </div>
  );
};

const BestSellerCard: React.FC<{
  rank: number;
  name: string;
  sales: string;
  revenue: string;
  image: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ rank, name, sales, revenue, image, delay, frame, fps }) => {
  const appear = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG.bouncy,
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        background: COLORS.white,
        borderRadius: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        border: `1px solid ${COLORS.border}`,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 20}px)`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: rank <= 3 ? COLORS.primary : COLORS.cardBg,
          color: rank <= 3 ? 'white' : COLORS.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          fontFamily,
          flexShrink: 0,
        }}
      >
        {rank}
      </div>
      <Img
        src={staticFile(image)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.text,
            fontFamily,
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 9, color: COLORS.textLight, fontFamily }}>
          {sales} sold
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.primary,
          fontFamily,
          flexShrink: 0,
        }}
      >
        {revenue}
      </div>
    </div>
  );
};

// ── Main scene ──

export const StoreDashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Zoom in when AI bubble is tapped (frame 50) ──
  const zoomProgress = spring({
    frame: frame - 50,
    fps,
    config: SPRING_CONFIG.zoom,
  });
  const zoomScale = interpolate(zoomProgress, [0, 1], [1.8, 2.75]);
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -374]);

  // ── Zoom back out when best sellers appear (frame 330) ──
  const zoomOutProgress = spring({
    frame: frame - 330,
    fps,
    config: SPRING_CONFIG.zoom,
  });
  const finalZoomScale = interpolate(zoomOutProgress, [0, 1], [zoomScale, 1.8]);
  const finalZoomOffsetY = interpolate(
    zoomOutProgress,
    [0, 1],
    [zoomOffsetY, 0],
  );

  // Hand size tracks current zoom
  const handSize = handSizeForZoom(finalZoomScale);

  // ── Chat panel ──
  const chatOpen = frame >= 65;
  const chatSlide = spring({
    frame: frame - 65,
    fps,
    config: SPRING_CONFIG.slide,
  });
  const chatDismiss = spring({
    frame: frame - 280,
    fps,
    config: SPRING_CONFIG.slide,
  });
  const chatVisible = chatOpen && frame < 330;
  const chatHeight = 320;
  const chatY = chatVisible
    ? (1 - chatSlide + chatDismiss) * chatHeight
    : chatHeight;

  // ── User typing (phase 4: 100-170) ──
  const userMessage = 'Show me best sellers in my store';
  const typedChars = Math.floor(
    interpolate(frame, [105, 165], [0, userMessage.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedText = userMessage.slice(0, typedChars);
  const messageSent = frame >= 185;

  // ── AI thinking (phase 6: 185-215) ──
  const thinking = frame >= 190 && frame < 215;
  const thinkingDots = thinking
    ? Array.from(
        { length: 3 },
        (_, i) => Math.sin((frame - 190) * 0.25 - i * 1.2) * 3,
      )
    : [];

  // ── AI response (phase 7: 215-280) ──
  const aiResponseText = 'Here are your top-selling products this month:';
  const aiAppear = spring({
    frame: frame - 215,
    fps,
    config: SPRING_CONFIG.gentle,
  });
  const aiChars = Math.floor(
    interpolate(frame, [217, 260], [0, aiResponseText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  // ── Dashboard crossfade to best sellers ──
  const dashboardOpacity = interpolate(frame, [220, 260], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bestSellersOpacity = interpolate(frame, [250, 290], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Hand paths ──
  const savedPath = getSavedPath('DorianStores', '1-StoreDashboard');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    { x: 750, y: 1500, frame: 10, gesture: 'pointer' as const },
    { x: 680, y: 1550, frame: 40, gesture: 'pointer' as const },
    { x: 680, y: 1550, frame: 55, gesture: 'click' as const, duration: 10 },
    { x: 500, y: 1480, frame: 95, gesture: 'pointer' as const },
    { x: 500, y: 1480, frame: 100, gesture: 'click' as const, duration: 5 },
    { x: 680, y: 1480, frame: 168, gesture: 'pointer' as const },
    { x: 680, y: 1480, frame: 173, gesture: 'click' as const, duration: 10 },
    { x: 750, y: 1600, frame: 200, gesture: 'pointer' as const },
  ];

  // Phase 9: second hand for browsing best sellers
  const handPath2: HandPathPoint[] = [
    { x: 540, y: 1200, frame: 350, gesture: 'pointer' as const },
    { x: 540, y: 1000, frame: 390, gesture: 'pointer' as const },
    { x: 540, y: 850, frame: 430, gesture: 'pointer' as const },
  ];

  const bestSellers = [
    {
      rank: 1,
      name: 'Wireless Earbuds Pro',
      sales: '142',
      revenue: '$4,260',
      image: 'dorian/stores/product-linen-top.jpg',
    },
    {
      rank: 2,
      name: 'Organic Face Cream',
      sales: '98',
      revenue: '$2,940',
      image: 'dorian/stores/product-maxi-dress.jpg',
    },
    {
      rank: 3,
      name: 'Canvas Tote Bag',
      sales: '87',
      revenue: '$2,175',
      image: 'dorian/stores/product-tote-bag.jpg',
    },
    {
      rank: 4,
      name: 'Summer Linen Shorts',
      sales: '76',
      revenue: '$1,520',
      image: 'dorian/stores/product-ocean-shorts.jpg',
    },
    {
      rank: 5,
      name: 'Bamboo Water Bottle',
      sales: '65',
      revenue: '$1,300',
      image: 'dorian/stores/product-linen-top.jpg',
    },
  ];

  // Best sellers scroll (phase 9)
  const bestSellerScroll = interpolate(frame, [350, 430], [0, 80], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty'];
  const activities = [
    {
      icon: '\u2605',
      text: 'New review from John',
      time: '2m ago',
      color: COLORS.accent,
    },
    {
      icon: '\u2197',
      text: 'Order #1284 shipped',
      time: '15m ago',
      color: COLORS.primary,
    },
    {
      icon: '\u2713',
      text: 'Product restocked',
      time: '1h ago',
      color: COLORS.success,
    },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Title overlay */}
      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Your Store at a Glance
        </div>
      </AnimatedText>

      {/* Phone frame with zoom wrapper */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(0px, ${finalZoomOffsetY}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${finalZoomScale})`,
          }}
        >
          <div
            style={{
              width: PHONE.frameWidth,
              height: PHONE.frameHeight,
              background: '#1a1a1a',
              borderRadius: 55,
              padding: 12,
              boxShadow:
                '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: PHONE.width,
                height: PHONE.height,
                borderRadius: 45,
                overflow: 'hidden',
                position: 'relative',
                background: COLORS.cardBg,
              }}
            >
              {/* ── Dashboard content (static, fades out during morph) ── */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '148px 16px 16px',
                  opacity: dashboardOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.text,
                    fontFamily,
                    marginBottom: 4,
                  }}
                >
                  Store Dashboard
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: COLORS.textLight,
                    fontFamily,
                    marginBottom: 16,
                  }}
                >
                  Welcome back, Sarah
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <StatCard
                    label="Revenue"
                    value="$12,450"
                    change="12.5%"
                    positive={true}
                    delay={5}
                    frame={frame}
                    fps={fps}
                  />
                  <StatCard
                    label="Orders"
                    value="284"
                    change="8.3%"
                    positive={true}
                    delay={10}
                    frame={frame}
                    fps={fps}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <StatCard
                    label="Customers"
                    value="1,247"
                    change="5.2%"
                    positive={true}
                    delay={15}
                    frame={frame}
                    fps={fps}
                  />
                  <StatCard
                    label="Avg. Order"
                    value="$43.80"
                    change="-2.1%"
                    positive={false}
                    delay={20}
                    frame={frame}
                    fps={fps}
                  />
                </div>

                <MiniChart frame={frame} fps={fps} />

                {/* Recent Orders */}
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.text,
                      fontFamily,
                      marginBottom: 8,
                    }}
                  >
                    Recent Orders
                  </div>
                  <div
                    style={{
                      background: COLORS.white,
                      borderRadius: 16,
                      padding: '4px 16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <OrderRow
                      name="Emma Wilson"
                      items={3}
                      total="$127.50"
                      status="Completed"
                      delay={25}
                      frame={frame}
                      fps={fps}
                    />
                    <OrderRow
                      name="James Chen"
                      items={1}
                      total="$45.00"
                      status="Pending"
                      delay={30}
                      frame={frame}
                      fps={fps}
                    />
                    <OrderRow
                      name="Sofia Garcia"
                      items={5}
                      total="$213.80"
                      status="Shipping"
                      delay={35}
                      frame={frame}
                      fps={fps}
                    />
                  </div>
                </div>

                {/* Top Categories */}
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.text,
                      fontFamily,
                      marginBottom: 8,
                    }}
                  >
                    Top Categories
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {categories.map((cat, i) => {
                      const pillAppear = spring({
                        frame: frame - 30 - i * 4,
                        fps,
                        config: { damping: 14, mass: 0.8, stiffness: 120 },
                      });
                      return (
                        <div
                          key={cat}
                          style={{
                            background: i === 0 ? COLORS.primary : COLORS.white,
                            color: i === 0 ? 'white' : COLORS.text,
                            fontSize: 10,
                            fontWeight: 600,
                            fontFamily,
                            padding: '6px 12px',
                            borderRadius: 14,
                            border:
                              i === 0 ? 'none' : `1px solid ${COLORS.border}`,
                            opacity: pillAppear,
                            transform: `translateY(${(1 - pillAppear) * 12}px)`,
                          }}
                        >
                          {cat}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Store Activity */}
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.text,
                      fontFamily,
                      marginBottom: 8,
                    }}
                  >
                    Store Activity
                  </div>
                  <div
                    style={{
                      background: COLORS.white,
                      borderRadius: 16,
                      padding: '8px 16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    {activities.map((act, i) => {
                      const actAppear = spring({
                        frame: frame - 38 - i * 5,
                        fps,
                        config: { damping: 14, mass: 1, stiffness: 100 },
                      });
                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 0',
                            borderBottom:
                              i < activities.length - 1
                                ? `1px solid ${COLORS.border}`
                                : 'none',
                            opacity: actAppear,
                            transform: `translateX(${(1 - actAppear) * 20}px)`,
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: `${act.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              color: act.color,
                              flexShrink: 0,
                            }}
                          >
                            {act.icon}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              fontSize: 11,
                              fontWeight: 500,
                              color: COLORS.text,
                              fontFamily,
                            }}
                          >
                            {act.text}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: COLORS.textLight,
                              fontFamily,
                            }}
                          >
                            {act.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Best Sellers view (fades in during morph) ── */}
              {frame >= 220 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -bestSellerScroll,
                    left: 0,
                    right: 0,
                    padding: '148px 16px 16px',
                    opacity: bestSellersOpacity,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={COLORS.accent}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: COLORS.text,
                        fontFamily,
                      }}
                    >
                      Best Sellers
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.textLight,
                      fontFamily,
                      marginBottom: 14,
                    }}
                  >
                    Top products in your store this month
                  </div>

                  {/* Summary cards */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        flex: 1,
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                        borderRadius: 14,
                        padding: '12px 14px',
                        color: 'white',
                      }}
                    >
                      <div style={{ fontSize: 9, fontFamily, opacity: 0.8 }}>
                        Total Sales
                      </div>
                      <div
                        style={{ fontSize: 20, fontWeight: 700, fontFamily }}
                      >
                        468
                      </div>
                      <div style={{ fontSize: 9, fontFamily, opacity: 0.8 }}>
                        +18% vs last month
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: `linear-gradient(135deg, ${COLORS.accent}, #E86B00)`,
                        borderRadius: 14,
                        padding: '12px 14px',
                        color: 'white',
                      }}
                    >
                      <div style={{ fontSize: 9, fontFamily, opacity: 0.8 }}>
                        Revenue
                      </div>
                      <div
                        style={{ fontSize: 20, fontWeight: 700, fontFamily }}
                      >
                        $12.2K
                      </div>
                      <div style={{ fontSize: 9, fontFamily, opacity: 0.8 }}>
                        +22% vs last month
                      </div>
                    </div>
                  </div>

                  {/* Best seller list */}
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {bestSellers.map((p, i) => (
                      <BestSellerCard
                        key={i}
                        rank={p.rank}
                        name={p.name}
                        sales={p.sales}
                        revenue={p.revenue}
                        image={p.image}
                        delay={255 + i * 8}
                        frame={frame}
                        fps={fps}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sticky header ── */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 148,
                  zIndex: 20,
                  background: COLORS.white,
                }}
              >
                <StatusBar />
                <DynamicIsland />
                <DorianNavHeader showSearch={false} />
              </div>

              {/* ── AI Bubble (visible until zoom tap) ── */}
              {frame < 65 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 70,
                    right: 15,
                    zIndex: 20,
                  }}
                >
                  <AIBubble scale={1} pulse={true} />
                </div>
              )}

              {/* ── Chat panel overlay ── */}
              {chatOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: chatHeight,
                    background: 'white',
                    borderRadius: '24px 24px 0 0',
                    boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
                    padding: '15px 16px',
                    fontFamily,
                    zIndex: 25,
                    transform: `translateY(${chatY}px)`,
                  }}
                >
                  {/* Chat header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <AIBubble scale={0.6} />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: COLORS.text,
                        }}
                      >
                        Dorian
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.primary }}>
                        Your AI Assistant
                      </div>
                    </div>
                  </div>

                  {/* AI greeting */}
                  <div
                    style={{
                      background: '#f0f0f0',
                      padding: '8px 12px',
                      borderRadius: '14px 14px 14px 4px',
                      maxWidth: '85%',
                      fontSize: 12,
                      color: COLORS.text,
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    Hi! How can I help you today?
                  </div>

                  {/* User message bubble (after send) */}
                  {messageSent && (
                    <div
                      style={{
                        background: COLORS.primary,
                        padding: '8px 12px',
                        borderRadius: '14px 14px 4px 14px',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        fontSize: 12,
                        color: 'white',
                        lineHeight: 1.3,
                        marginBottom: 8,
                      }}
                    >
                      {userMessage}
                    </div>
                  )}

                  {/* AI thinking dots */}
                  {thinking && (
                    <div
                      style={{
                        background: '#f0f0f0',
                        padding: '8px 12px',
                        borderRadius: '14px 14px 14px 4px',
                        width: 60,
                        display: 'flex',
                        gap: 4,
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}
                    >
                      {thinkingDots.map((offset, i) => (
                        <div
                          key={i}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: COLORS.textLight,
                            transform: `translateY(${offset}px)`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* AI response */}
                  {frame >= 215 && (
                    <div
                      style={{
                        background: '#f0f0f0',
                        padding: '8px 12px',
                        borderRadius: '14px 14px 14px 4px',
                        maxWidth: '90%',
                        fontSize: 12,
                        color: COLORS.text,
                        lineHeight: 1.3,
                        opacity: aiAppear,
                        transform: `translateY(${(1 - aiAppear) * 15}px)`,
                      }}
                    >
                      {aiResponseText.slice(0, aiChars)}
                      {aiChars < aiResponseText.length && (
                        <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>
                          |
                        </span>
                      )}
                    </div>
                  )}

                  {/* Input field */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      right: 12,
                      background: messageSent ? '#f5f5f5' : '#fff',
                      borderRadius: 18,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border:
                        !messageSent && frame >= 100
                          ? `2px solid ${COLORS.primary}`
                          : '2px solid transparent',
                    }}
                  >
                    <span
                      style={{
                        color:
                          !messageSent && typedChars > 0 ? COLORS.text : '#999',
                        fontSize: 11,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {!messageSent
                        ? typedChars > 0
                          ? typedText
                          : 'Type a message...'
                        : 'Type a message...'}
                      {!messageSent && frame >= 100 && (
                        <span
                          style={{
                            opacity: frame % 15 < 8 ? 1 : 0,
                            color: COLORS.text,
                          }}
                        >
                          |
                        </span>
                      )}
                    </span>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background:
                          !messageSent && typedChars > 20
                            ? COLORS.primary
                            : '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: 'white', fontSize: 14 }}>
                        {'\u2192'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Home indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 140,
                  height: 5,
                  background: '#000',
                  borderRadius: 3,
                  zIndex: 15,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hand cursor - phase 1-5 */}
      {frame >= 10 && frame < 210 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation={savedPath?.animation ?? 'cursor-real-black'}
          size={handSize}
          dark={savedPath?.dark ?? true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}

      {/* Hand cursor - phase 9 (browse best sellers) */}
      {frame >= 350 && (
        <FloatingHand
          path={handPath2}
          startFrame={0}
          animation="cursor-real-black"
          size={handSizeForZoom(1.8)}
          dark={true}
          physics={HAND_PHYSICS.scroll}
        />
      )}
    </AbsoluteFill>
  );
};
