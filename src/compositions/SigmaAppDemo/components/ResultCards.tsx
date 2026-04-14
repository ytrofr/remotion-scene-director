/**
 * ResultCards — Rich result displays for agent demo compositions.
 * Card types: CreativeImage, WebsitePreview, SEO, Campaign, ContextSaved.
 * CreativeStudioReveal uses REAL AI-generated images (not gradients).
 */
import React from 'react';
import { Img, staticFile } from 'remotion';

// ─── Creative Image Card (in-chat — real AI thumbnails) ────
export const CreativeImageCard: React.FC<{
  images?: string[];
}> = ({
  images = [
    'sigma-demo/creative/creative_01.jpg',
    'sigma-demo/creative/creative_02.jpg',
    'sigma-demo/creative/creative_03.jpg',
  ],
}) => {
  const platforms = ['Instagram', 'LinkedIn', 'Twitter/X'];
  return (
    <div style={{ width: '92%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 2,
        }}
      >
        3 Variations Generated
      </div>
      {images.map((img, i) => (
        <div
          key={img}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '8px 14px',
          }}
        >
          {/* Real AI image thumbnail */}
          <div
            style={{
              width: 64,
              height: 48,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Img
              src={staticFile(img)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
              SIGMA — Variation {i + 1}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              AI-generated creative
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#8b5cf6',
              fontWeight: 600,
              background: '#f5f3ff',
              padding: '3px 10px',
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            {platforms[i] ?? 'Social'}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Creative Studio Reveal (full-screen — REAL AI images) ─
export const CreativeStudioReveal: React.FC<{
  images?: string[];
}> = ({
  images = [
    'sigma-demo/creative/creative_01.jpg',
    'sigma-demo/creative/creative_02.jpg',
    'sigma-demo/creative/creative_03.jpg',
  ],
}) => {
  const platforms = [
    { name: 'Instagram Post', size: '1024 x 1024' },
    { name: 'LinkedIn Banner', size: '1024 x 1024' },
    { name: 'Twitter/X Header', size: '1024 x 1024' },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        gap: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#ec4899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          N
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>Creative Studio</div>
          <div style={{ fontSize: 16, color: '#9ca3af' }}>
            Nano Banana Agent — 3 variations generated
          </div>
        </div>
      </div>

      {/* Grid of REAL creative images */}
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        {images.map((img, i) => (
          <div
            key={img}
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#1a1a2e',
              border: '1px solid #27272a',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* REAL AI-generated image */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Img
                src={staticFile(img)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Footer */}
            <div
              style={{
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                {platforms[i]?.name ?? 'Creative'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {platforms[i]?.size ?? '1024 x 1024'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Website Preview Card (Websites agent) ─────────────────
export const WebsitePreviewCard: React.FC<{
  title?: string;
  url?: string;
  description?: string;
  previewImage?: string;
}> = ({
  title = 'SIGMA — Agentify Your Business',
  url = 'sigma-app.vercel.app',
  description = 'AI platform for SMBs — 11 agents, one conversation',
  previewImage = 'sigma-demo/generated_page_hero.png',
}) => (
  <div
    style={{
      width: '90%',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}
  >
    {/* Preview thumbnail — uses the REAL generated page */}
    <div style={{ height: 100, overflow: 'hidden' }}>
      <Img
        src={staticFile(previewImage)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
      />
    </div>
    {/* Link info */}
    <div style={{ padding: '12px 16px' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#2563eb', marginTop: 3 }}>{url}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{description}</div>
    </div>
  </div>
);

// ─── SEO Result Card (Reach agent) ─────────────────────────
export const SEOResultCard: React.FC<{
  score?: number;
  metaCount?: number;
  schemaTypes?: number;
  ogTags?: number;
}> = ({ score = 92, metaCount = 8, schemaTypes = 3, ogTags = 6 }) => (
  <div
    style={{
      width: '90%',
      background: '#f8fafc',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      padding: '16px 20px',
      fontSize: 14,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: score >= 90 ? '#dcfce7' : score >= 70 ? '#fef9c3' : '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 18,
          color: score >= 90 ? '#16a34a' : score >= 70 ? '#ca8a04' : '#dc2626',
        }}
      >
        {score}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>SEO Audit Complete</div>
        <div style={{ color: '#6b7280', fontSize: 13 }}>
          Grade {score >= 90 ? 'A' : score >= 75 ? 'B' : 'C'} — All tags generated
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      <MetricPill label="Meta Tags" value={metaCount} color="#3b82f6" />
      <MetricPill label="Schema" value={schemaTypes} color="#8b5cf6" />
      <MetricPill label="OG Tags" value={ogTags} color="#06b6d4" />
    </div>
  </div>
);

const MetricPill: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    style={{
      flex: 1,
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '8px 10px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontWeight: 700, fontSize: 18, color }}>{value}</div>
    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
  </div>
);

// ─── Campaign Result Card (Google Ads) ─────────────────────
export const CampaignResultCard: React.FC<{
  budget?: string;
  keywords?: number;
  adGroups?: number;
  ads?: number;
}> = ({ budget = '$50/day', keywords = 12, adGroups = 3, ads = 4 }) => (
  <div
    style={{
      width: '90%',
      background: '#fffbeb',
      borderRadius: 12,
      border: '1px solid #fde68a',
      padding: '16px 20px',
      fontSize: 14,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          color: '#fff',
        }}
      >
        G
      </div>
      <div style={{ fontWeight: 700, color: '#92400e' }}>Google Search Ads — Ready</div>
    </div>
    <div style={{ display: 'flex', gap: 12 }}>
      <CampaignStat label="Budget" value={budget} />
      <CampaignStat label="Keywords" value={String(keywords)} />
      <CampaignStat label="Ad Groups" value={String(adGroups)} />
      <CampaignStat label="RSAs" value={String(ads)} />
    </div>
    <div
      style={{
        marginTop: 12,
        padding: '10px 14px',
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #fde68a',
      }}
    >
      <div style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
        SIGMA — AI Tools for Small Business
      </div>
      <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>sigma-app.vercel.app</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
        Automate your business with 11 AI agents. Websites, ads, SEO — one platform.
      </div>
    </div>
  </div>
);

const CampaignStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ flex: 1, textAlign: 'center' }}>
    <div style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>{value}</div>
    <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>{label}</div>
  </div>
);

// ─── Context Saved Card (Orchestrator) ─────────────────────
export const ContextSavedCard: React.FC<{
  fields?: number;
  totalFields?: number;
}> = ({ fields = 12, totalFields = 12 }) => {
  const fieldNames = [
    'Business Name', 'Industry', 'Tagline', 'Target Audience',
    'Services', 'Location', 'Phone', 'Email',
    'Website', 'Social Links', 'Brand Colors', 'Language',
  ];
  return (
    <div
      style={{
        width: '90%',
        background: '#f0fdf4',
        borderRadius: 12,
        border: '1px solid #bbf7d0',
        padding: '16px 20px',
        fontSize: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: '#16a34a', fontSize: 18 }}>{'✓'}</span>
        <span style={{ fontWeight: 700, color: '#166534' }}>
          Business Context Saved — {fields}/{totalFields} fields
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        {fieldNames.slice(0, fields).map((name) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#16a34a', fontSize: 12 }}>{'✓'}</span>
            <span style={{ color: '#374151', fontSize: 12 }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
