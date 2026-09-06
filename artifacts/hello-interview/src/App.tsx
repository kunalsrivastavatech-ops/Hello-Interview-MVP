import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, FileText, Flag, Mic, RefreshCw, RotateCcw, ShieldCheck, Target, TriangleAlert, UserRound, Video } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopMedia = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const requestMedia = async () => {
    stopMedia();
    setMediaError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaStatus('error');
      setMediaError('This browser does not support camera and microphone access. You can continue with written answers.');
      return;
    }

    setMediaStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setMediaStatus('active');
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      const message = name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Camera and microphone permission was denied. Allow access in your browser settings or continue with written answers.'
        : name === 'NotFoundError'
          ? 'No camera or microphone was found. Connect a device or continue with written answers.'
          : name === 'NotReadableError'
            ? 'Your camera or microphone is already in use by another app. Close it and retry, or continue with written answers.'
            : 'Camera and microphone access could not start. You can retry or continue with written answers.';
      setMediaError(message);
      setMediaStatus('error');
    }
  };

  useEffect(() => { if (!candidate.name) setLocation('/setup'); }, [candidate.name, setLocation]);
  useEffect(() => {
    void requestMedia();
    return stopMedia;
  }, []);
  useEffect(() => { setRemaining(90); setAnswer(answers[current]?.text || ''); }, [current, answers]);
  useEffect(() => { const interval = window.setInterval(() => setRemaining((value) => value > 0 ? value - 1 : 0), 1000); return () => window.clearInterval(interval); }, [current]);
  useEffect(() => { if (remaining === 0) advance(); }, [remaining]);
  const advance = () => {
    const next = [...answers]; next[current] = { text: answer, elapsed: 90 - remaining }; setAnswers(next); localStorage.setItem('hello-interview-answers', JSON.stringify(next));
    if (current === questions.length - 1) setLocation('/report'); else setCurrent((value) => value + 1);
  };
  const item = questions[current];
  return <div className="app-shell"><Header arena /><main className="arena-page">
    <div className="arena-top"><div className="page-frame arena-top-inner"><div><div className="arena-kicker">Candidate / {candidate.name || 'Session'} / {candidate.company || 'Target company'}</div><h1 className="arena-title">Interview arena</h1></div><div className={`timer ${remaining < 20 ? 'warning' : ''}`} aria-live="polite" data-testid="status-countdown"><Clock3 size={16} /> {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</div></div></div>
    <div className="arena-content">
      <div className="media-stage">
        <div className="media-panel interviewer-panel">
          <div className="media-panel-head"><span>AI INTERVIEWER</span><span className="media-ready">PREPARING</span></div>
          <div className="interviewer-visual"><div className="interviewer-avatar"><UserRound size={52} /></div><span className="interviewer-wave">● ● ●</span></div>
          <p className="media-caption">Your interviewer feed will speak the question aloud in the next step.</p>
        </div>
        <div className="media-panel candidate-panel">
          <div className="media-panel-head"><span>CANDIDATE FEED</span><span className={`media-ready ${mediaStatus === 'active' ? 'active' : ''}`}>{mediaStatus === 'active' ? 'LIVE' : mediaStatus === 'requesting' ? 'REQUESTING' : 'LOCAL'}</span></div>
          <div className={`camera-viewport ${mediaStatus === 'active' ? 'live' : ''}`}>
            {mediaStatus === 'active' ? <video ref={videoRef} autoPlay muted playsInline aria-label="Your live camera preview" data-testid="video-candidate-preview" /> : <div className="camera-placeholder"><Video size={30} /><strong>{mediaStatus === 'requesting' ? 'Requesting device access…' : mediaStatus === 'error' ? 'Camera preview unavailable' : 'Camera preview loading'}</strong><span>{mediaError || 'Your preview will appear here.'}</span></div>}
          </div>
          <div className="device-status-row">
            <span className={`device-status ${mediaStatus === 'active' ? 'active' : ''}`}><Video size={14} /> Camera {mediaStatus === 'active' ? 'on' : 'pending'}</span>
            <span className={`device-status ${mediaStatus === 'active' ? 'active' : ''}`}><Mic size={14} /> Microphone {mediaStatus === 'active' ? 'on' : 'pending'}</span>
            {mediaStatus !== 'active' && <button className="retry-media" onClick={() => void requestMedia()} disabled={mediaStatus === 'requesting'}><RefreshCw size={13} /> RETRY ACCESS</button>}
          </div>
        </div>
      </div>
      <div className="question-progress" aria-label={`Question ${current + 1} of ${questions.length}`}>{questions.map((_, index) => <span key={index} className={`progress-block ${index < current ? 'done' : ''} ${index === current ? 'current' : ''}`} data-testid={`progress-question-${index + 1}`} />)}</div><div className="question-count">Question {String(current + 1).padStart(2, '0')} / 05 — {item.dimension}</div><h2 className="question" data-testid="text-current-question">{item.question}</h2><p className="question-note">{item.note}</p><textarea className="answer-input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer as if you are speaking to the interviewer..." aria-label="Your interview answer" data-testid="textarea-interview-answer" /><div className="answer-footer"><span className="word-count" data-testid="text-word-count">{answer.trim() ? answer.trim().split(/\s+/).length : 0} words / written locally</span><button className="neo-button" onClick={advance} data-testid="button-submit-next">{current === questions.length - 1 ? 'FINISH & VIEW REPORT' : 'SUBMIT & NEXT'} <ArrowRight size={18} /></button></div><p className="arena-note"><ShieldCheck size={14} /> Camera and microphone are used for a live local preview only. Nothing is recorded or uploaded in this step.</p></div>
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
