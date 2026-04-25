import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {COLORS, PHASES, ScopeDemo} from './constants';
import {IntroScene} from './scenes/IntroScene';
import {ChatScene} from './scenes/ChatScene';
import {ApiCallScene} from './scenes/ApiCallScene';
import {OutcomeScene} from './scenes/OutcomeScene';
import {OutroScene} from './scenes/OutroScene';

/**
 * Full per-scope demonstration video. Runtime ~50s at 30fps = 1500 frames.
 *
 * Sequence:
 *   0-3s   intro (Σ logo + scope title)
 *   3-37s  chat scene (phone showing the scope being used)
 *   37-40s API callout
 *   40-44s outcome card
 *   44-50s outro
 */
export const ScopeDemoComposition: React.FC<{demo: ScopeDemo}> = ({demo}) => {
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      {/* English voice-over (Google TTS Studio voice) starts after intro logo reveal */}
      <Sequence from={75}>
        <Audio
          src={staticFile(`agentsmith-voiceover/${demo.id}.mp3`)}
          volume={0.85}
        />
      </Sequence>

      <Sequence from={PHASES.intro.start} durationInFrames={PHASES.intro.duration}>
        <IntroScene scopeTitle={demo.title} scopeSubtitle={demo.subtitle} />
      </Sequence>

      <Sequence
        from={PHASES.chat.start}
        durationInFrames={PHASES.chat.duration + PHASES.scopeBanner.duration}
      >
        <ChatScene
          channelHeader={demo.channelHeader}
          messages={demo.messages}
          caption={demo.title}
        />
      </Sequence>

      <Sequence
        from={PHASES.apiCallout.start}
        durationInFrames={PHASES.apiCallout.duration}
      >
        <ApiCallScene apiCall={demo.apiCall} apiNotes={demo.apiNotes} />
      </Sequence>

      <Sequence
        from={PHASES.outcome.start}
        durationInFrames={PHASES.outcome.duration}
      >
        <OutcomeScene
          outcomeTitle={demo.outcomeTitle}
          outcomeBody={demo.outcomeBody}
        />
      </Sequence>

      <Sequence
        from={PHASES.outro.start}
        durationInFrames={PHASES.outro.duration}
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
