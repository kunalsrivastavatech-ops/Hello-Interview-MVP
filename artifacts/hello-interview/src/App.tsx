import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, FileText, Flag, Mic, RefreshCw, RotateCcw, ShieldCheck, Target, TriangleAlert, UserRound, Video, Volume2 } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Candidate = { name: string; roll: string; company: string; track: string };
type Answer = { text: string; elapsed: number };
type MediaStatus = 'idle' | 'requesting' | 'active' | 'error';
type InterviewerState = 'ready' | 'speaking' | 'listening' | 'evaluating' | 'next';
type SpeechRecognitionResultEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
};
type SpeechRecognitionErrorEvent = Event & { error?: string };
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const questions = [
  { question: 'Walk us through a technical project you are proud to have shipped.', note: 'Keep your answer structured: context, decisions, and measurable outcome.', dimension: 'Technical depth' },
  { question: 'When a production bug appears, how do you isolate the root cause?', note: 'We are looking for a calm, repeatable debugging method.', dimension: 'Problem solving' },
  { question: 'Explain a complex computer science concept to a non-technical stakeholder.', note: 'Clarity beats jargon. Use a simple analogy, then verify understanding.', dimension: 'Communication' },
  { question: 'Tell us about a time a team disagreed with your approach.', note: 'Show how you listen, decide, and keep the work moving.', dimension: 'Collaboration' },
  { question: 'Why are you ready for this role at your target company?', note: 'Connect your preparation to the company and the role in specific terms.', dimension: 'Role readiness' },
];

const initialCandidate: Candidate = { name: '', roll: '', company: 'TCS', track: 'Core engineering' };

function getStoredCandidate(): Candidate {
  try { return JSON.parse(localStorage.getItem('hello-interview-candidate') || 'null') || initialCandidate; } catch { return initialCandidate; }
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

function appendTranscript(existing: string, addition: string) {
  const cleanAddition = addition.trim();
  if (!cleanAddition) return existing;
  return existing.trim() ? `${existing.trim()} ${cleanAddition}` : cleanAddition;
}

function Header({ arena = false }: { arena?: boolean }) {
  const [, setLocation] = useLocation();
  return (
    <header className="forest-header">
      <div className="nav-wrap">
        <button className="brand" onClick={() => setLocation('/')} data-testid="button-brand-home">HELLO <span>INTERVIEW</span></button>
        {arena ? <div className="nav-links"><span className="mono-label" style={{ color: '#7af1e4' }}>SIMULATION ACTIVE / LOCAL SESSION</span></div> : (
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#specifications" data-testid="link-specifications">SPECIFICATIONS</a>
            <a href="#about" data-testid="link-about">ABOUT</a>
            <a href="#contact" data-testid="link-contact">CONTACT</a>
            <button className="nav-login" onClick={() => setLocation('/setup')} data-testid="button-header-start">ENTER PORTAL <ArrowRight size={14} /></button>
          </nav>
        )}
      </div>
    </header>
  );
}

function Landing() {
  const [, setLocation] = useLocation();
  return <div className="app-shell">
    <Header />
    <main>
      <section className="hero page-frame">
        <div className="eyebrow">B.Tech CSE / placement rehearsal system 01</div>
        <h1 className="hero-title">Conquer your<br /><em>placement fear.</em></h1>
        <p className="hero-subtitle">Train inside a high-fidelity corporate interview simulation. Five focused questions. One honest read on your readiness.</p>
        <button className="neo-button" onClick={() => setLocation('/setup')} data-testid="button-start-simulation">START FREE SIMULATION <ArrowRight size={18} /></button>
        <div className="hero-graphics">
          <div className="neo-card robot-card">
            <div className="sticker hello">HELLO / READY?</div>
            <div className="robot-art" aria-label="Abstract interview assistant graphic" data-testid="graphic-interview-assistant">
              <div className="robot-head"><div className="robot-antenna" /><div className="robot-mouth" /></div><div className="robot-body" />
            </div>
            <div className="sticker signal">SIGNAL CHECK</div>
          </div>
          <div className="neo-card mockup-panel">
            <div className="sticker hello">LIVE PRACTICE</div>
            <div className="mockup-screen">
              <div className="mockup-top"><span className="live-dot">● INTERVIEW ARENA</span><span>10:45 AM</span></div>
              <div className="video-layout"><div className="video-box interviewer"><div className="person-shape" /></div><div className="video-box candidate"><div className="person-shape" /></div></div>
            </div>
            <h2 className="mockup-title">A SERIOUS ROOM FOR A SERIOUS REHEARSAL.</h2>
          </div>
        </div>
      </section>
      <section className="section" id="specifications"><div className="page-frame">
        <div className="eyebrow">What this session measures</div><h2 className="section-heading">Built for the<br />campus room.</h2>
        <div className="spec-grid">
          <div className="spec-box"><span className="spec-mark"><Target size={30} /></span><h3>Structured answers</h3><p>Practice giving clear, evidence-led responses when the clock is running.</p></div>
          <div className="spec-box"><span className="spec-mark"><Clock3 size={30} /></span><h3>Timed pressure</h3><p>Each question has a focused countdown so your thinking becomes more decisive.</p></div>
          <div className="spec-box"><span className="spec-mark"><FileText size={30} /></span><h3>Useful debrief</h3><p>Leave with dimension scores, question notes, and the next skills to rehearse.</p></div>
        </div>
      </div></section>
      <section className="section dark" id="about"><div className="page-frame"><div className="eyebrow" style={{ color: '#7af1e4' }}>The point of the room</div><p className="split-copy">Hello Interview is a local-first rehearsal for B.Tech CSE and core college students. It does not replace a recruiter. It gives you a sharper second attempt.</p></div></section>
      <section className="section" id="contact"><div className="page-frame"><div className="eyebrow">Session protocol</div><h2 className="section-heading">Show up<br />prepared.</h2><p className="subpage-intro">This Phase 1 simulator keeps your candidate details and answers on this device. No account, camera, microphone, AI scoring, or external monitoring is required.</p><div style={{ marginTop: 28 }}><button className="neo-button yellow" onClick={() => setLocation('/setup')} data-testid="button-contact-start">CONFIGURE YOUR SESSION <ArrowRight size={18} /></button></div></div></section>
    </main>
    <footer className="footer"><div className="page-frame" style={{ display: 'flex', justifyContent: 'space-between', gap: 15, flexWrap: 'wrap' }}><span className="brand">HELLO <span>INTERVIEW</span></span><span className="mono-label" style={{ color: '#9eb0a4' }}>PHASE 1 / LOCAL SIMULATOR</span></div></footer>
  </div>;
}

function Setup() {
  const [, setLocation] = useLocation();
  const [candidate, setCandidate] = useState<Candidate>(getStoredCandidate);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof Candidate, value: string) => setCandidate((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!candidate.name.trim() || !candidate.roll.trim() || !candidate.company.trim()) { setError('Complete your name, roll number, and target company to continue.'); return; }
    if (!confirmed) { setError('Acknowledge the local session protocol before entering the arena.'); return; }
    localStorage.setItem('hello-interview-candidate', JSON.stringify(candidate));
    localStorage.removeItem('hello-interview-answers');
    setLocation('/arena');
  };
  return <div className="app-shell"><Header /><main className="subpage page-frame">
    <div className="subpage-header"><div className="eyebrow">Candidate portal / checkpoint 01</div><h1 className="subpage-title">Placement-ready<br />checkpoint.</h1><p className="subpage-intro">Configure your rehearsal before entering the interview arena. Take a breath. Then answer like the room is real.</p></div>
    <div className="setup-layout">
      <form className="setup-card" onSubmit={submit} data-testid="form-candidate-setup">
        <div className="form-grid">
          <div className="field"><label htmlFor="candidate-name">Candidate name</label><input id="candidate-name" value={candidate.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Aanya Sharma" data-testid="input-candidate-name" /></div>
          <div className="field"><label htmlFor="candidate-roll">University roll number</label><input id="candidate-roll" value={candidate.roll} onChange={(e) => update('roll', e.target.value)} placeholder="e.g. 2315000101" data-testid="input-roll-number" /></div>
          <div className="field full"><label htmlFor="candidate-company">Target company</label><input id="candidate-company" value={candidate.company} onChange={(e) => update('company', e.target.value)} placeholder="e.g. Infosys, TCS, Deloitte" data-testid="input-target-company" /></div>
          <div className="field full"><label htmlFor="candidate-track">Assessment track</label><select id="candidate-track" value={candidate.track} onChange={(e) => update('track', e.target.value)} data-testid="select-assessment-track"><option>Core engineering</option><option>Software development</option><option>Behavioral screening</option><option>Employability round</option></select></div>
        </div>
        <div className="setup-warning"><div className="warning-mark"><TriangleAlert size={16} /></div><p><strong>Session note:</strong> This is a focused local rehearsal. Timing and tab changes may be visible to you as session signals, but they are not proof of misconduct and are not sent anywhere.</p></div>
        <label className="checkline"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} data-testid="checkbox-session-protocol" /><span>I understand this is a timed practice session and I am ready to answer without external assistance.</span></label>
        {error && <p className="error-copy" role="alert" data-testid="text-setup-error">{error}</p>}
        <button className="neo-button" type="submit" style={{ width: '100%' }} data-testid="button-enter-arena">ENTER PLACEMENT ARENA <ArrowRight size={18} /></button>
      </form>
      <aside className="checkpoint"><div className="mono-label" style={{ color: '#9eb0a4' }}>Protocol / 01 — 05</div><h3>Everything you need. Nothing distracting.</h3><p>Five local questions designed around the moments that decide a campus interview: technical depth, thinking under pressure, communication, collaboration, and role readiness.</p><ul className="checkpoint-list"><li><CheckCircle2 size={16} className="check-icon" /> 90 seconds per question</li><li><CheckCircle2 size={16} className="check-icon" /> Written response rehearsal</li><li><CheckCircle2 size={16} className="check-icon" /> Immediate private debrief</li></ul></aside>
    </div>
  </main></div>;
}

function Arena() {
  const [, setLocation] = useLocation();
  const candidate = useMemo(getStoredCandidate, []);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => { try { return JSON.parse(localStorage.getItem('hello-interview-answers') || '[]'); } catch { return []; } });
  const [answer, setAnswer] = useState(() => answers[0]?.text || '');
  const [remaining, setRemaining] = useState(90);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');
  const [mediaError, setMediaError] = useState('');
  const [interviewerState, setInterviewerState] = useState<InterviewerState>('ready');
  const [speechSupported] = useState(() => Boolean(getSpeechRecognition()));
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRequestRef = useRef(0);
  const speechRequestRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechFinalRef = useRef('');

  const stopMedia = () => {
    mediaRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const requestMedia = async () => {
    stopMedia();
    const requestId = mediaRequestRef.current + 1;
    mediaRequestRef.current = requestId;
    setMediaError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaStatus('error');
      setMediaError('This browser does not support camera and microphone access. You can continue with written answers.');
      return;
    }

    console.info('[Hello Interview] Camera requested');
    setMediaStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (requestId !== mediaRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      console.info('[Hello Interview] Camera permission granted');
      console.info('[Hello Interview] Video tracks available:', stream.getVideoTracks().length, 'Audio tracks available:', stream.getAudioTracks().length);
      streamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          console.warn('[Hello Interview] Media track ended:', track.kind);
          setMediaError(`The ${track.kind} track ended unexpectedly. Check your device and retry access.`);
          setMediaStatus('error');
        }, { once: true });
      });
      setMediaStatus('active');
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      const actualMessage = error instanceof Error ? error.message : String(error);
      const message = name === 'NotAllowedError' || name === 'SecurityError'
        ? `Camera and microphone permission was denied (${name}: ${actualMessage || 'no additional browser message'}). Allow access in your browser settings or continue with written answers.`
        : name === 'NotFoundError'
          ? `No camera or microphone was found (${name}: ${actualMessage || 'no additional browser message'}). Connect a device or continue with written answers.`
          : name === 'NotReadableError'
            ? `Your camera or microphone is already in use (${name}: ${actualMessage || 'no additional browser message'}). Close it and retry, or continue with written answers.`
            : `Camera and microphone access could not start (${name || 'UnknownError'}: ${actualMessage || 'no additional browser message'}). You can retry or continue with written answers.`;
      console.error('[Hello Interview] Camera stream failed:', error);
      setMediaError(message);
      setMediaStatus('error');
    }
  };

  const speakQuestion = (question: string) => {
    speechRequestRef.current += 1;
    const speechRequestId = speechRequestRef.current;

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setInterviewerState('listening');
      return;
    }

    window.speechSynthesis.cancel();
    setInterviewerState('speaking');
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    utterance.onend = () => {
      if (speechRequestId === speechRequestRef.current) setInterviewerState('listening');
    };
    utterance.onerror = () => {
      if (speechRequestId !== speechRequestRef.current) return;
      setInterviewerState('listening');
    };
    window.speechSynthesis.speak(utterance);
  };

  const stopRecognition = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) recognition.abort();
    setIsListening(false);
    setInterimTranscript('');
  };

  const startRecognition = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    speechFinalRef.current = answer;
    setSpeechError('');
    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalChunk = appendTranscript(finalChunk, result[0].transcript);
        else interimChunk = appendTranscript(interimChunk, result[0].transcript);
      }
      if (finalChunk) {
        speechFinalRef.current = appendTranscript(speechFinalRef.current, finalChunk);
        setAnswer(speechFinalRef.current);
      }
      setInterimTranscript(interimChunk);
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setSpeechError(event.error === 'not-allowed'
          ? 'Microphone access was denied. Allow microphone access or type your answer below.'
          : 'Voice input stopped. You can retry or continue typing your answer.');
      }
      setIsListening(false);
      setInterimTranscript('');
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechError('Voice input could not start. You can retry or type your answer below.');
    }
  };

  useEffect(() => { if (!candidate.name) setLocation('/setup'); }, [candidate.name, setLocation]);
  useEffect(() => {
    void requestMedia();
    return stopMedia;
  }, []);
  useEffect(() => {
    const videoElement = videoRef.current;
    const stream = streamRef.current;
    if (mediaStatus !== 'active' || !videoElement || !stream) return;
    if (videoElement.srcObject === stream) return;

    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = true;
    videoElement.srcObject = stream;
    console.info('[Hello Interview] Stream assigned');

    void videoElement.play()
      .then(() => {
        console.info('[Hello Interview] Video playing');
      })
      .catch((error: unknown) => {
        const actualMessage = error instanceof Error ? error.message : String(error);
        console.error('[Hello Interview] Video playback failed:', error);
        setMediaError(`Video playback failed (${actualMessage || 'no additional browser message'}). Retry camera access.`);
        setMediaStatus('error');
      });
  }, [mediaStatus]);
  useEffect(() => {
    const timer = window.setTimeout(() => speakQuestion(questions[current].question), 450);
    return () => {
      window.clearTimeout(timer);
      speechRequestRef.current += 1;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [current]);
  useEffect(() => {
    stopRecognition();
    speechFinalRef.current = answers[current]?.text || '';
    setRemaining(90);
    setAnswer(speechFinalRef.current);
  }, [current, answers]);
  useEffect(() => () => stopRecognition(), []);
  useEffect(() => { const interval = window.setInterval(() => setRemaining((value) => value > 0 ? value - 1 : 0), 1000); return () => window.clearInterval(interval); }, [current]);
  useEffect(() => { if (remaining === 0) advance(); }, [remaining]);
  const advance = () => {
    if (interviewerState === 'evaluating' || interviewerState === 'next') return;
    const answerToSave = isListening ? speechFinalRef.current : answer;
    stopRecognition();
    setInterviewerState('evaluating');
    speechRequestRef.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const next = [...answers];
    next[current] = { text: answerToSave, elapsed: 90 - remaining };
    setAnswers(next);
    localStorage.setItem('hello-interview-answers', JSON.stringify(next));
    window.setTimeout(() => {
      if (current === questions.length - 1) {
        setLocation('/report');
        return;
      }
      setInterviewerState('next');
      window.setTimeout(() => setCurrent((value) => value + 1), 350);
    }, 550);
  };
  const item = questions[current];
  const answerValue = interimTranscript ? appendTranscript(answer, interimTranscript) : answer;
  const updateAnswer = (value: string) => {
    setAnswer(value);
    speechFinalRef.current = value;
    setInterimTranscript('');
  };
  const interviewerLabel: Record<InterviewerState, string> = {
    ready: 'AI READY',
    speaking: 'AI SPEAKING',
    listening: 'LISTENING TO CANDIDATE',
    evaluating: 'EVALUATING',
    next: 'NEXT QUESTION',
  };
  const interviewerCaption: Record<InterviewerState, string> = {
    ready: 'Your interviewer is ready to begin.',
    speaking: 'Listen closely. The interviewer is asking the question aloud.',
    listening: 'The room is yours. Take your time and answer clearly.',
    evaluating: 'Reviewing the answer before moving forward.',
    next: 'Preparing the next question.',
  };
  return <div className="app-shell"><Header arena /><main className="arena-page">
    <div className="arena-top"><div className="page-frame arena-top-inner"><div><div className="arena-kicker">Candidate / {candidate.name || 'Session'} / {candidate.company || 'Target company'}</div><h1 className="arena-title">Interview arena</h1></div><div className={`timer ${remaining < 20 ? 'warning' : ''}`} aria-live="polite" data-testid="status-countdown"><Clock3 size={16} /> {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</div></div></div>
    <div className="arena-content">
      <div className="media-stage">
        <div className="media-panel interviewer-panel">
          <div className="media-panel-head"><span>AI INTERVIEWER</span><span className={`media-ready interviewer-state-pill ${interviewerState === 'speaking' ? 'speaking' : interviewerState === 'listening' ? 'listening' : interviewerState === 'evaluating' ? 'evaluating' : ''}`} aria-live="polite">{interviewerLabel[interviewerState]}</span></div>
          <div className={`interviewer-visual ${interviewerState === 'speaking' ? 'speaking' : ''} ${interviewerState === 'listening' ? 'listening' : ''}`}>
            <div className="interviewer-avatar"><UserRound size={52} /></div>
            <div className="interviewer-orbit orbit-one" /><div className="interviewer-orbit orbit-two" />
            <span className="interviewer-wave" aria-hidden="true">● ● ●</span>
          </div>
          <div className="interviewer-state-row"><span className={`state-dot ${interviewerState}`} /> <strong>{interviewerLabel[interviewerState]}</strong><button className="replay-question" onClick={() => speakQuestion(item.question)} disabled={interviewerState === 'evaluating' || interviewerState === 'next'}><Volume2 size={14} /> REPLAY</button></div>
          <p className="media-caption" aria-live="polite">{interviewerCaption[interviewerState]}</p>
          <div className="interviewer-flow" aria-label="Interview state flow">{(['ready', 'speaking', 'listening', 'evaluating', 'next'] as InterviewerState[]).map((state) => <span key={state} className={interviewerState === state ? 'current' : ''}>{interviewerLabel[state]}</span>)}</div>
        </div>
        <div className="media-panel candidate-panel">
          <div className="media-panel-head"><span>CANDIDATE FEED</span><span className={`media-ready ${mediaStatus === 'active' ? 'active' : ''}`}>{mediaStatus === 'active' ? 'LIVE' : mediaStatus === 'requesting' ? 'REQUESTING' : 'LOCAL'}</span></div>
          <div className={`camera-viewport ${mediaStatus === 'active' ? 'live' : ''}`}>
            <video ref={videoRef} autoPlay muted playsInline aria-label="Your live camera preview" data-testid="video-candidate-preview" />
            {mediaStatus !== 'active' && <div className="camera-status-overlay"><Video size={30} /><strong>{mediaStatus === 'requesting' ? 'Requesting device access…' : mediaStatus === 'error' ? 'Camera preview unavailable' : 'Camera preview loading'}</strong><span>{mediaError || 'Your preview will appear here.'}</span></div>}
          </div>
          <div className="device-status-row">
            <span className={`device-status ${mediaStatus === 'active' ? 'active' : ''}`}><Video size={14} /> Camera {mediaStatus === 'active' ? 'on' : 'pending'}</span>
            <span className={`device-status ${mediaStatus === 'active' ? 'active' : ''}`}><Mic size={14} /> Microphone {mediaStatus === 'active' ? 'on' : 'pending'}</span>
            {mediaStatus !== 'active' && <button className="retry-media" onClick={() => void requestMedia()} disabled={mediaStatus === 'requesting'}><RefreshCw size={13} /> RETRY ACCESS</button>}
          </div>
        </div>
      </div>
      <div className="question-progress" aria-label={`Question ${current + 1} of ${questions.length}`}>{questions.map((_, index) => <span key={index} className={`progress-block ${index < current ? 'done' : ''} ${index === current ? 'current' : ''}`} data-testid={`progress-question-${index + 1}`} />)}</div><div className="question-count">Question {String(current + 1).padStart(2, '0')} / 05 — {item.dimension}</div><h2 className="question" data-testid="text-current-question">{item.question}</h2><p className="question-note">{item.note}</p>
      <div className={`speech-control ${isListening ? 'listening' : ''}`}>
        {speechSupported ? <><div className="speech-copy"><Mic size={17} /><div><strong>{isListening ? 'LIVE TRANSCRIPT' : 'ANSWER BY VOICE'}</strong><span>{isListening ? 'Speak naturally. Your answer will appear below.' : 'Use your active microphone, or type instead.'}</span></div></div><button className="speech-button" onClick={isListening ? stopRecognition : startRecognition} aria-pressed={isListening} data-testid="button-start-answer"><Mic size={16} /> {isListening ? 'STOP ANSWER' : 'START ANSWER'}</button></> : <div className="speech-fallback"><TriangleAlert size={18} /><div><strong>Voice answers are not supported in this browser.</strong><span>Type your answer below to continue the interview.</span></div></div>}
      </div>
      {speechError && <p className="speech-error" role="alert">{speechError}</p>}
      <textarea className={`answer-input ${isListening ? 'listening' : ''}`} value={answerValue} onChange={(e) => updateAnswer(e.target.value)} placeholder="Type your answer as if you are speaking to the interviewer..." aria-label="Your interview answer" data-testid="textarea-interview-answer" />
      <div className="answer-footer"><span className="word-count" data-testid="text-word-count">{answerValue.trim() ? answerValue.trim().split(/\s+/).length : 0} words / {isListening ? 'live transcript' : 'written locally'}</span><button className="neo-button" onClick={advance} disabled={interviewerState === 'evaluating' || interviewerState === 'next'} data-testid="button-submit-next">{interviewerState === 'evaluating' ? 'EVALUATING…' : current === questions.length - 1 ? 'FINISH & VIEW REPORT' : 'SUBMIT & NEXT'} <ArrowRight size={18} /></button></div><p className="arena-note"><ShieldCheck size={14} /> Camera and microphone are used for a live local preview only. Nothing is recorded or uploaded in this step.</p></div>
  </main></div>;
}

function scoreAnswer(answer: Answer | undefined, index: number) {
  const words = answer?.text.trim().split(/\s+/).filter(Boolean).length || 0;
  const base = Math.min(96, 43 + words * 1.5 + (answer?.text.includes('because') ? 7 : 0) + (answer?.text.includes('I ') ? 4 : 0));
  return Math.round(Math.max(32, base - index * 2));
}

function Report() {
  const [, setLocation] = useLocation();
  const candidate = useMemo(getStoredCandidate, []);
  const answers: Answer[] = useMemo(() => { try { return JSON.parse(localStorage.getItem('hello-interview-answers') || '[]'); } catch { return []; } }, []);
  const scores = questions.map((_, index) => scoreAnswer(answers[index], index));
  const overall = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  const dimensions = [{ label: 'Technical depth', score: Math.round((scores[0] + scores[1]) / 2) }, { label: 'Communication', score: scores[2] }, { label: 'Collaboration', score: scores[3] }, { label: 'Role readiness', score: scores[4] }];
  const restart = () => { localStorage.removeItem('hello-interview-answers'); setLocation('/setup'); };
  return <div className="app-shell"><Header /><main><section className="report-hero"><div className="page-frame report-hero-grid"><div><div className="eyebrow" style={{ color: '#7af1e4' }}>Private debrief / session complete</div><h1 className="report-title">{candidate.name || 'Candidate'}, your room is getting clearer.</h1><p className="report-copy">This is a practice signal, not a hiring verdict. Use the patterns below to decide what you rehearse next for {candidate.company || 'your target company'}.</p></div><div className="score-box" data-testid="card-overall-score"><div className="score-label">Overall rehearsal score</div><div className="score-value">{overall}<span style={{ fontSize: 29 }}>/100</span></div></div></div></section><section className="report-body page-frame"><div className="report-grid"><div className="report-card"><h2>Dimension readout</h2>{dimensions.map((dimension) => <div className="dimension" key={dimension.label} data-testid={`dimension-${dimension.label.toLowerCase().replaceAll(' ', '-')}`}><div className="dimension-head"><span>{dimension.label}</span><span className="dimension-score">{dimension.score}/100</span></div><div className="bar"><div className="bar-fill" style={{ width: `${dimension.score}%` }} /></div></div>)}<div className="report-card" style={{ marginTop: 28, boxShadow: 'none', background: '#f5f0e4' }}><h2>Question-by-question feedback</h2><div className="feedback-list">{questions.map((question, index) => <div className="feedback-item" key={question.question}><p className="feedback-q">0{index + 1} / {question.dimension}</p><p className="feedback-a">{answers[index]?.text ? (answers[index].text.length > 145 ? `${answers[index].text.slice(0, 145)}...` : answers[index].text) : 'No written response captured. Use this prompt again with a clear opening, example, and result.'}</p><span className="feedback-tag">{scores[index] >= 70 ? 'Solid base' : 'Rehearse again'}</span></div>)}</div></div></div><div className="report-side"><div className="insight strength"><h3><Check size={20} /> Strengths</h3><ul><li>You showed up and completed the full timed room.</li><li>Your strongest signal is structured written thinking.</li></ul></div><div className="insight improve"><h3><Flag size={20} /> Improve next</h3><ul><li>Add specific metrics and outcomes to project stories.</li><li>Use a repeatable framework before diving into detail.</li></ul></div><div className="insight next"><h3><RotateCcw size={20} /> Next practice areas</h3><ul><li>STAR story: disagreement and resolution</li><li>Debugging aloud under a 90-second limit</li><li>Company-specific “why us” research</li></ul></div></div></div><div className="report-actions"><button className="neo-button" onClick={restart} data-testid="button-practice-again">PRACTICE AGAIN <RotateCcw size={17} /></button><button className="neo-button outline" onClick={() => setLocation('/')} data-testid="button-return-home"><ArrowLeft size={17} /> RETURN HOME</button></div></section></main></div>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/setup" component={Setup} />
        <Route path="/arena" component={Arena} />
        <Route path="/report" component={Report} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
