import { BrainCircuit, Volume2 } from 'lucide-react';
import portraitUrl from '@assets/generated_images/ai-interviewer-portrait.png';

export type InterviewerState = 'ready' | 'speaking' | 'listening' | 'evaluating' | 'next';

type AIInterviewerProps = {
  state: InterviewerState;
  question: string;
  onReplay: () => void;
  replayDisabled?: boolean;
};

const stateMeta: Record<InterviewerState, { label: string; caption: string }> = {
  ready: { label: 'AI READY', caption: 'Your interviewer is ready to begin.' },
  speaking: { label: 'AI SPEAKING', caption: 'Listen closely. The interviewer is asking the question aloud.' },
  listening: { label: 'LISTENING TO CANDIDATE', caption: 'The room is yours. Take your time and answer clearly.' },
  evaluating: { label: 'EVALUATING', caption: 'Reviewing the answer before moving forward.' },
  next: { label: 'NEXT QUESTION', caption: 'Preparing the next question.' },
};

const flowStates: InterviewerState[] = ['ready', 'speaking', 'listening', 'evaluating', 'next'];

export function AIInterviewer({ state, question, onReplay, replayDisabled = false }: AIInterviewerProps) {
  const meta = stateMeta[state];
  const isSpeaking = state === 'speaking';

  return (
    <section className="media-panel interviewer-panel" aria-label="AI interviewer">
      <div className="media-panel-head">
        <span>AI INTERVIEWER</span>
        <span className={`media-ready interviewer-state-pill ${state}`} aria-live="polite">{meta.label}</span>
      </div>

      <div className={`interviewer-visual interviewer-state-${state} ${isSpeaking ? 'speaking' : ''}`} role="img" aria-label={`Professional AI interviewer, ${meta.label.toLowerCase()}`}>
        <div className="interviewer-grid" />
        <div className="interviewer-orbit orbit-one" />
        <div className="interviewer-orbit orbit-two" />
        <div className="interviewer-portrait-frame">
          <img className="interviewer-portrait" src={portraitUrl} alt="Professional AI interviewer" />
          <div className="interviewer-mouth" aria-hidden="true" />
        </div>
        <div className="interviewer-signal" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
        <div className="interviewer-presence"><BrainCircuit size={14} /> SYNTHETIC INTERVIEW PRESENCE</div>
      </div>

      <div className="interviewer-state-row">
        <span className={`state-dot ${state}`} />
        <strong>{meta.label}</strong>
        <button className="replay-question" onClick={onReplay} disabled={replayDisabled} aria-label="Replay the current interview question">
          <Volume2 size={14} /> REPLAY
        </button>
      </div>
      <p className="media-caption" aria-live="polite">{meta.caption}</p>

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