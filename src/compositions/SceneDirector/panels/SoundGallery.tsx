/**
 * SoundGallery — Audition the music tracks from public/audio/music/.
 *
 * Built so the user can listen to all candidate soundtracks WITHOUT rendering
 * variant videos. Each card uses a native <audio controls> for play/scrub.
 *
 * Tracks come from three CC-BY 4.0 producers:
 *   - Kevin MacLeod (incompetech.com) — jazz/orchestral/cinematic catalog
 *   - Lee Rosevere (Music for Podcasts series) — soft synth/piano, the
 *     canonical sound used in Anthropic / Linear / Notion product demos
 *   - Chris Zabriskie — calm warm minimalist piano + warm pluck
 *
 * All instrumental, no audio watermarks. Attribution: ship videos with
 * the producer credit visible somewhere (description, end card) for the
 * track you actually use.
 *
 * Pattern follows GalleryView (full-page overlay, header + grid). No new SD
 * state needed — purely DOM/HTML5 audio.
 */
import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons';

type Category =
  | 'demo'
  | 'inspiring'
  | 'corporate'
  | 'tech'
  | 'cinematic'
  | 'jazz'
  | 'funk'
  | 'acoustic'
  | 'world'
  | 'playful'
  | 'action';

interface Track {
  /** mp3 filename in public/audio/music/ */
  file: string;
  title: string;
  /** short genre/style label */
  genre: string;
  /** approximate duration string */
  duration: string;
  /** broad category for filter UI */
  category: Category;
  /** Bensound track has lyrical vocals (not pure instrumental) */
  vocals?: boolean;
  /** sub-version this track maps to (informational) */
  variantId?: string;
  /** marked as the user's current pick */
  current?: boolean;
}

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'demo', label: 'Modern Demo' },
  { id: 'inspiring', label: 'Inspiring' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'tech', label: 'Tech / Electronic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'funk', label: 'Funk' },
  { id: 'acoustic', label: 'Acoustic' },
  { id: 'world', label: 'World' },
  { id: 'playful', label: 'Playful' },
  { id: 'action', label: 'Action' },
];

// Tracks by Kevin MacLeod (incompetech.com), licensed CC-BY 4.0.
// All instrumental, no audio watermarks. Attribution required: credit
// "Kevin MacLeod (incompetech.com)" anywhere visible (video description,
// end card, etc.) when shipping. https://creativecommons.org/licenses/by/4.0/
const TRACKS: Track[] = [
  // ── Modern Demo (Anthropic / Linear / Notion style) ──────────────────────
  // Lee Rosevere — "Music for Podcasts" series, CC-BY 4.0
  {
    file: 'lr-curiousity.mp3',
    title: 'Curiousity',
    genre: 'soft synth pad + curious melody',
    duration: '1:53',
    category: 'demo',
  },
  {
    file: 'lr-tech-toys.mp3',
    title: 'Tech Toys',
    genre: 'twinkly electronic',
    duration: '2:33',
    category: 'demo',
  },
  {
    file: 'lr-looking-back.mp3',
    title: 'Looking Back',
    genre: 'reflective uplifting',
    duration: '2:23',
    category: 'demo',
  },
  {
    file: 'lr-content.mp3',
    title: 'Content',
    genre: 'happy synth',
    duration: '2:24',
    category: 'demo',
  },
  {
    file: 'lr-going-home.mp3',
    title: 'Going Home',
    genre: 'warm uplifting build',
    duration: '3:24',
    category: 'demo',
  },
  {
    file: 'lr-secret-growing-up.mp3',
    title: 'The Secret to Growing Up',
    genre: 'gentle piano',
    duration: '2:48',
    category: 'demo',
  },
  {
    file: 'lr-pane-in-the-glass.mp3',
    title: 'Pane in the Glass',
    genre: 'soft hopeful',
    duration: '2:54',
    category: 'demo',
  },
  {
    file: 'lr-making-a-change.mp3',
    title: 'Making A Change',
    genre: 'uplifting build',
    duration: '3:37',
    category: 'demo',
  },
  {
    file: 'lr-i-believe-in-you.mp3',
    title: 'I Believe in You',
    genre: 'long uplifting piano',
    duration: '5:09',
    category: 'demo',
  },
  // Chris Zabriskie — calm warm minimalist, CC-BY 4.0
  {
    file: 'cz-cylinder-five.mp3',
    title: 'Cylinder Five',
    genre: 'calm minimalist piano',
    duration: '2:54',
    category: 'demo',
  },
  {
    file: 'cz-cylinder-four.mp3',
    title: 'Cylinder Four',
    genre: 'calm piano',
    duration: '2:57',
    category: 'demo',
  },
  {
    file: 'cz-cylinder-three.mp3',
    title: 'Cylinder Three',
    genre: 'calm piano',
    duration: '2:46',
    category: 'demo',
  },
  {
    file: 'cz-wonder-cycle.mp3',
    title: 'Wonder Cycle',
    genre: 'warm pluck minimalist',
    duration: '5:46',
    category: 'demo',
  },
  {
    file: 'cz-divider.mp3',
    title: 'Divider',
    genre: 'calm warm electronic',
    duration: '3:22',
    category: 'demo',
  },
  {
    file: 'cz-prelude-4.mp3',
    title: 'Prelude No. 4',
    genre: 'Olafur-style piano',
    duration: '1:29',
    category: 'demo',
  },
  // ── Inspiring (product-demo: uplifting / creative / calm) ────────────────
  {
    file: 'kml-wallpaper.mp3',
    title: 'Wallpaper',
    genre: 'bright uplifting',
    duration: '3:40',
    category: 'inspiring',
  },
  {
    file: 'kml-awesome-call.mp3',
    title: 'Awesome Call',
    genre: 'inspirational pop',
    duration: '2:32',
    category: 'inspiring',
  },
  {
    file: 'kml-fearless-first.mp3',
    title: 'Fearless First',
    genre: 'inspirational uplifting',
    duration: '3:16',
    category: 'inspiring',
  },
  {
    file: 'kml-eternal-hope.mp3',
    title: 'Eternal Hope',
    genre: 'piano inspirational',
    duration: '4:44',
    category: 'inspiring',
  },
  {
    file: 'kml-carpe-diem.mp3',
    title: 'Carpe Diem',
    genre: 'epic uplifting',
    duration: '4:55',
    category: 'inspiring',
  },
  {
    file: 'kml-truth-in-the-stones.mp3',
    title: 'Truth in the Stones',
    genre: 'epic inspirational',
    duration: '6:13',
    category: 'inspiring',
  },
  {
    file: 'kml-this-house.mp3',
    title: 'This House',
    genre: 'calm acoustic',
    duration: '4:29',
    category: 'inspiring',
  },
  {
    file: 'kml-brittle-rille.mp3',
    title: 'Brittle Rille',
    genre: 'whimsical creative',
    duration: '3:49',
    category: 'inspiring',
  },
  {
    file: 'kml-daily-beetle.mp3',
    title: 'Daily Beetle',
    genre: 'atmospheric creative',
    duration: '5:17',
    category: 'inspiring',
  },
  {
    file: 'kml-inner-light.mp3',
    title: 'Inner Light',
    genre: 'ambient calm',
    duration: '9:36',
    category: 'inspiring',
  },
  // ── Jazz ─────────────────────────────────────────────────────────────────
  {
    file: 'kml-backbay-lounge.mp3',
    title: 'Backbay Lounge',
    genre: 'jazz lounge',
    duration: '4:26',
    category: 'jazz',
    variantId: 'V1.140',
  },
  {
    file: 'kml-hep-cats.mp3',
    title: 'Hep Cats',
    genre: 'swing jazz',
    duration: '4:10',
    category: 'jazz',
  },
  {
    file: 'kml-investigations.mp3',
    title: 'Investigations',
    genre: 'jazz noir',
    duration: '1:33',
    category: 'jazz',
  },
  {
    file: 'kml-modern-jazz-samba.mp3',
    title: 'Modern Jazz Samba',
    genre: 'bossa nova',
    duration: '4:08',
    category: 'jazz',
  },
  {
    file: 'kml-easy-lemon.mp3',
    title: 'Easy Lemon',
    genre: 'light jazz',
    duration: '2:06',
    category: 'jazz',
  },
  {
    file: 'kml-marty-gots-a-plan.mp3',
    title: 'Marty Gots a Plan',
    genre: 'playful jazz',
    duration: '2:48',
    category: 'jazz',
  },
  // ── Cinematic ───────────────────────────────────────────────────────────
  {
    file: 'kml-cipher2.mp3',
    title: 'Cipher 2',
    genre: 'tech mystery',
    duration: '3:51',
    category: 'cinematic',
  },
  {
    file: 'kml-floating-cities.mp3',
    title: 'Floating Cities',
    genre: 'ambient cinematic',
    duration: '3:04',
    category: 'cinematic',
  },
  {
    file: 'kml-devastation-and-revenge.mp3',
    title: 'Devastation and Revenge',
    genre: 'epic battle',
    duration: '3:05',
    category: 'cinematic',
  },
  {
    file: 'kml-sovereign.mp3',
    title: 'Sovereign',
    genre: 'epic orchestral',
    duration: '6:11',
    category: 'cinematic',
  },
  {
    file: 'kml-lightless-dawn.mp3',
    title: 'Lightless Dawn',
    genre: 'dark atmospheric',
    duration: '6:19',
    category: 'cinematic',
  },
  {
    file: 'kml-constance.mp3',
    title: 'Constance',
    genre: 'atmospheric chill',
    duration: '2:20',
    category: 'cinematic',
  },
  {
    file: 'kml-dreamy-flashback.mp3',
    title: 'Dreamy Flashback',
    genre: 'dreamy',
    duration: '2:06',
    category: 'cinematic',
  },
  {
    file: 'kml-industrial-music-box.mp3',
    title: 'Industrial Music Box',
    genre: 'minimal industrial',
    duration: '1:42',
    category: 'cinematic',
  },
  {
    file: 'kml-frost-waltz.mp3',
    title: 'Frost Waltz',
    genre: 'waltz',
    duration: '2:15',
    category: 'cinematic',
  },
  {
    file: 'kml-despair-and-triumph.mp3',
    title: 'Despair and Triumph',
    genre: 'emotional cinematic',
    duration: '4:46',
    category: 'cinematic',
  },
  // ── Corporate ───────────────────────────────────────────────────────────
  {
    file: 'kml-inspired.mp3',
    title: 'Inspired',
    genre: 'corporate motivational',
    duration: '4:46',
    category: 'corporate',
  },
  {
    file: 'kml-wholesome.mp3',
    title: 'Wholesome',
    genre: 'corporate clean',
    duration: '6:03',
    category: 'corporate',
  },
  {
    file: 'kml-local-forecast.mp3',
    title: 'Local Forecast',
    genre: 'light documentary',
    duration: '2:45',
    category: 'corporate',
  },
  {
    file: 'kml-vivacity.mp3',
    title: 'Vivacity',
    genre: 'energetic corporate',
    duration: '3:51',
    category: 'corporate',
  },
  {
    file: 'kml-local-forecast-elevator.mp3',
    title: 'Local Forecast — Elevator',
    genre: 'light office',
    duration: '3:09',
    category: 'corporate',
  },
  // ── Tech / Electronic ───────────────────────────────────────────────────
  {
    file: 'kml-edm-detection-mode.mp3',
    title: 'EDM Detection Mode',
    genre: 'EDM electronic',
    duration: '6:05',
    category: 'tech',
  },
  {
    file: 'kml-electrodoodle.mp3',
    title: 'Electrodoodle',
    genre: 'quirky electronic',
    duration: '2:46',
    category: 'tech',
  },
  {
    file: 'kml-backed-vibes-clean.mp3',
    title: 'Backed Vibes Clean',
    genre: 'clean electronic',
    duration: '3:48',
    category: 'tech',
  },
  // ── Funk ────────────────────────────────────────────────────────────────
  {
    file: 'kml-funkorama.mp3',
    title: 'Funkorama',
    genre: 'funk',
    duration: '3:21',
    category: 'funk',
    variantId: 'V1.14',
    current: true,
  },
  {
    file: 'kml-funky-chunk.mp3',
    title: 'Funky Chunk',
    genre: 'funk groove',
    duration: '3:59',
    category: 'funk',
  },
  {
    file: 'kml-werq.mp3',
    title: 'Werq',
    genre: 'synth funk',
    duration: '2:42',
    category: 'funk',
  },
  {
    file: 'kml-disco-lounge.mp3',
    title: 'Disco Lounge',
    genre: 'disco funk',
    duration: '4:13',
    category: 'funk',
  },
  {
    file: 'kml-disco-con-tutti.mp3',
    title: 'Disco con Tutti',
    genre: 'disco funk',
    duration: '3:56',
    category: 'funk',
  },
  {
    file: 'kml-dance-monster.mp3',
    title: 'Dance Monster',
    genre: 'dance funk',
    duration: '3:20',
    category: 'funk',
  },
  {
    file: 'kml-killing-time.mp3',
    title: 'Killing Time',
    genre: 'jazz funk',
    duration: '3:24',
    category: 'funk',
  },
  {
    file: 'kml-burnt-spirit.mp3',
    title: 'Burnt Spirit',
    genre: 'soul funk',
    duration: '1:55',
    category: 'funk',
  },
  {
    file: 'kml-bossa-antigua.mp3',
    title: 'Bossa Antigua',
    genre: 'bossa funk',
    duration: '4:43',
    category: 'funk',
  },
  {
    file: 'kml-i-knew-a-guy.mp3',
    title: 'I Knew a Guy',
    genre: 'sax funk',
    duration: '2:47',
    category: 'funk',
  },
  {
    file: 'kml-lobby-time.mp3',
    title: 'Lobby Time',
    genre: 'lounge funk',
    duration: '3:13',
    category: 'funk',
  },
  // ── Acoustic ────────────────────────────────────────────────────────────
  {
    file: 'kml-carefree.mp3',
    title: 'Carefree',
    genre: 'acoustic light',
    duration: '3:25',
    category: 'acoustic',
  },
  {
    file: 'kml-cattails.mp3',
    title: 'Cattails',
    genre: 'country folk',
    duration: '2:39',
    category: 'acoustic',
  },
  {
    file: 'kml-the-builder.mp3',
    title: 'The Builder',
    genre: 'acoustic country',
    duration: '1:57',
    category: 'acoustic',
  },
  // ── World ───────────────────────────────────────────────────────────────
  {
    file: 'kml-pamgaea.mp3',
    title: 'Pamgaea',
    genre: 'world ambient',
    duration: '2:48',
    category: 'world',
  },
  {
    file: 'kml-mystery-bazaar.mp3',
    title: 'Mystery Bazaar',
    genre: 'middle-eastern',
    duration: '2:38',
    category: 'world',
  },
  {
    file: 'kml-off-to-osaka.mp3',
    title: 'Off to Osaka',
    genre: 'asian',
    duration: '1:49',
    category: 'world',
  },
  // ── Playful ─────────────────────────────────────────────────────────────
  {
    file: 'kml-sneaky-snitch.mp3',
    title: 'Sneaky Snitch',
    genre: 'cartoon jazz',
    duration: '2:16',
    category: 'playful',
  },
  {
    file: 'kml-hyperfun.mp3',
    title: 'Hyperfun',
    genre: 'upbeat playful',
    duration: '3:53',
    category: 'playful',
  },
  {
    file: 'kml-salty-ditty.mp3',
    title: 'Salty Ditty',
    genre: 'whistled folksy',
    duration: '2:08',
    category: 'playful',
  },
  {
    file: 'kml-monkeys-spinning-monkeys.mp3',
    title: 'Monkeys Spinning Monkeys',
    genre: 'playful bouncy',
    duration: '2:05',
    category: 'playful',
  },
  {
    file: 'kml-onion-capers.mp3',
    title: 'Onion Capers',
    genre: 'playful pop',
    duration: '2:15',
    category: 'playful',
  },
  {
    file: 'kml-hidden-agenda.mp3',
    title: 'Hidden Agenda',
    genre: 'playful ragtime',
    duration: '2:15',
    category: 'playful',
  },
  // ── Action ──────────────────────────────────────────────────────────────
  {
    file: 'kml-spy-glass.mp3',
    title: 'Spy Glass',
    genre: 'spy adventure',
    duration: '3:46',
    category: 'action',
  },
  {
    file: 'kml-run-amok.mp3',
    title: 'Run Amok',
    genre: 'chase action',
    duration: '1:47',
    category: 'action',
  },
];

interface Props {
  onClose: () => void;
}

const FAVORITES_KEY = 'sound-gallery-favorites';

function getFavorites(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export const SoundGallery: React.FC<Props> = ({ onClose }) => {
  const [favorites, setFavorites] = useState<Set<string>>(getFavorites);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    Category | 'all' | 'favorites'
  >('all');
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Pause every track other than the one that just started playing
  const handlePlay = (file: string) => {
    setActiveFile(file);
    for (const [f, audio] of Object.entries(audioRefs.current)) {
      if (f !== file && audio && !audio.paused) {
        audio.pause();
      }
    }
  };

  const toggleFavorite = (file: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopyFavorites = () => {
    const favTracks = TRACKS.filter((t) => favorites.has(t.file));
    const lines = favTracks.map((t) => `- ${t.title} (${t.genre}) → ${t.file}`);
    const text =
      favTracks.length === 0
        ? '(no favorites yet — star tracks to add them)'
        : `Favorites (${favTracks.length}):\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1500);
    });
  };

  const visible =
    activeCategory === 'all'
      ? TRACKS
      : activeCategory === 'favorites'
        ? TRACKS.filter((t) => favorites.has(t.file))
        : TRACKS.filter((t) => t.category === activeCategory);

  const countFor = (cat: Category | 'all' | 'favorites'): number => {
    if (cat === 'all') return TRACKS.length;
    if (cat === 'favorites') return favorites.size;
    return TRACKS.filter((t) => t.category === cat).length;
  };

  return (
    <div className="sound-gallery">
      <header className="sound-gallery__header">
        <div className="sound-gallery__title-block">
          <h1>Sound Gallery</h1>
          <p>
            Audition {TRACKS.length} candidate tracks by Kevin MacLeod
            (incompetech.com), CC-BY 4.0 — fully instrumental, no audio
            watermarks. Click play to preview; only one plays at a time. Star
            favorites then click <em>Copy favorites</em> to share the list.
          </p>
        </div>

        <div className="sound-gallery__controls">
          <button
            type="button"
            className="sound-gallery__close"
            onClick={handleCopyFavorites}
            title="Copy favorited tracks to clipboard"
          >
            {copyStatus === 'copied'
              ? '✓ Copied'
              : `Copy favorites (${favorites.size})`}
          </button>
          <button
            type="button"
            className="sound-gallery__close"
            onClick={onClose}
            aria-label="Close sound gallery"
          >
            <CloseIcon size={16} />
            <span>Close</span>
          </button>
        </div>
      </header>

      <nav className="sound-gallery__categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`sound-gallery__pill ${activeCategory === cat.id ? 'sound-gallery__pill--on' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}{' '}
            <span className="sound-gallery__pill-count">
              {countFor(cat.id)}
            </span>
          </button>
        ))}
        <button
          type="button"
          className={`sound-gallery__pill ${activeCategory === 'favorites' ? 'sound-gallery__pill--on' : ''}`}
          onClick={() => setActiveCategory('favorites')}
        >
          ★ Favorites{' '}
          <span className="sound-gallery__pill-count">
            {countFor('favorites')}
          </span>
        </button>
      </nav>

      <div className="sound-gallery__grid">
        {visible.map((track) => {
          const isFav = favorites.has(track.file);
          const isActive = activeFile === track.file;
          return (
            <div
              key={track.file}
              className={`sound-card ${track.current ? 'sound-card--current' : ''} ${isActive ? 'sound-card--active' : ''}`}
            >
              <div className="sound-card__head">
                <div className="sound-card__title-row">
                  <h3>{track.title}</h3>
                  {track.current && (
                    <span className="sound-card__chip sound-card__chip--current">
                      current pick · {track.variantId}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={`sound-card__fav ${isFav ? 'sound-card__fav--on' : ''}`}
                  onClick={() => toggleFavorite(track.file)}
                  aria-label={isFav ? 'Remove favorite' : 'Mark as favorite'}
                  title={isFav ? 'Favorited' : 'Mark favorite'}
                >
                  {isFav ? '★' : '☆'}
                </button>
              </div>

              <div className="sound-card__meta">
                <span className="sound-card__chip">{track.genre}</span>
                {track.vocals && (
                  <span className="sound-card__chip sound-card__chip--vocals">
                    vocals
                  </span>
                )}
                <span className="sound-card__chip sound-card__chip--muted">
                  {track.duration}
                </span>
              </div>

              <audio
                ref={(el) => {
                  audioRefs.current[track.file] = el;
                }}
                controls
                preload="none"
                onPlay={() => handlePlay(track.file)}
                src={`/audio/music/${track.file}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
