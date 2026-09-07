import { BrainCircuit, Volume2 } from 'lucide-react';
import type { InterviewerConfig } from '@/interviewers';

export type InterviewerState = 'ready' | 'speaking' | 'listening' | 'evaluating' | 'next';
export type InterviewerSpeechSignal = {
  type: 'idle' | 'start' | 'boundary' | 'end';
  sequence: number;
};

type AIInterviewerProps = {
  state: InterviewerState;
  interviewer: InterviewerConfig;
  question: string;
  onReplay: () => void;
  replayDisabled?: boolean;
  speechSignal?: InterviewerSpeechSignal;
  voiceLabel?: string;
  voiceError?: string;
};

const stateMeta: Record<InterviewerState, { label: string; caption: string }> = {
  ready: { label: 'AI READY', caption: 'Your interviewer is ready to begin.' },
  speaking: { label: 'AI SPEAKING', caption: 'Listen closely. The interviewer is asking the question aloud.' },
  listening: { label: 'LISTENING TO CANDIDATE', caption: 'The room is yours. Take your time and answer clearly.' },
  evaluating: { label: 'EVALUATING', caption: 'Reviewing the answer before moving forward.' },
  next: { label: 'NEXT QUESTION', caption: 'Preparing the next question.' },
};

const flowStates: InterviewerState[] = ['ready', 'speaking', 'listening', 'evaluating', 'next'];

/**
 * The portrait is deliberately a replaceable fallback. A real talking-avatar
 * provider can consume the same state and speech signals without changing the
 * interview engine or the surrounding Hello Interview UI.
 */
export function AIInterviewer({ state, interviewer, question, onReplay, replayDisabled = false, speechSignal = { type: 'idle', sequence: 0 }, voiceLabel, voiceError }: AIInterviewerProps) {
  const meta = stateMeta[state];
  const isSpeaking = state === 'speaking';
  const waveformPattern = [7, 13, 20, 15, 9];

  return (
    <section className="media-panel interviewer-panel" aria-label="AI interviewer">
      <div className="media-panel-head">
        <span>AI INTERVIEWER</span>
        <span className={`media-ready interviewer-state-pill ${state}`} aria-live="polite">{meta.label}</span>
      </div>

      <div className={`interviewer-visual interviewer-state-${state} ${isSpeaking ? 'speaking' : ''}`} data-avatar-mode="portrait-fallback" role="img" aria-label={`Professional AI interviewer, ${meta.label.toLowerCase()}`}>
        <div className="interviewer-grid" />
        <div className="interviewer-orbit orbit-one" />
        <div className="interviewer-orbit orbit-two" />
        <div className="interviewer-portrait-frame">
          <img className="interviewer-portrait" src={interviewer.avatar} alt={`${interviewer.displayName}, professional AI interviewer`} />
        </div>
        <div className={`interviewer-signal ${speechSignal.type}`} aria-hidden="true" key={speechSignal.sequence}>
          {waveformPattern.map((height, index) => <span key={index} style={{ height: `${isSpeaking && speechSignal.type === 'boundary' ? waveformPattern[(speechSignal.sequence + index) % waveformPattern.length] : height}px` }} />)}
        </div>
        <div className="interviewer-presence"><BrainCircuit size={14} /> {interviewer.displayName} / CORPORATE INTERVIEWER</div>
      </div>

      <div className="interviewer-state-row">
        <span className={`state-dot ${state}`} />
        <strong>{meta.label}</strong>
        <button className="replay-question" onClick={onReplay} disabled={replayDisabled} aria-label="Replay the current interview question">
          <Volume2 size={14} /> REPLAY
        </button>
      </div>
      <p className="media-caption" aria-live="polite">{meta.caption} <span className="interviewer-personality">Style: {interviewer.personality}.</span></p>
      <p className={`interviewer-voice-status ${voiceError ? 'error' : ''}`} role={voiceError ? 'alert' : 'status'}>{voiceError || `${voiceLabel || interviewer.voice.label} · ${interviewer.gender} voice configured`}</p>

      <div className="interviewer-prompt">
        <span>CURRENT QUESTION</span>
        <p>{question}</p>
      </div>

      <div className="interviewer-flow" aria-label="Interview state flow">
        {flowStates.map((flowState) => (
          <span key={flowState} className={state === flowState ? 'current' : ''}>{stateMeta[flowState].label}</span>
        ))}
      </div>
    </section>
  );
}