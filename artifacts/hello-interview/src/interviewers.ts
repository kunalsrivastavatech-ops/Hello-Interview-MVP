import portraitOne from '@assets/generated_images/ai-interviewer-portrait.png';
import portraitTwo from '@assets/generated_images/ai-interviewer-portrait-02.png';
import portraitThree from '@assets/generated_images/ai-interviewer-portrait-03.png';
import portraitFour from '@assets/generated_images/ai-interviewer-portrait-04.png';

export type InterviewerVoiceProfile = {
  id: string;
  label: string;
  preferredNames: string[];
  preferredLanguages: string[];
  rate: number;
  pitch: number;
};

export type InterviewerConfig = {
  id: string;
  displayName: string;
  gender: 'female';
  avatar: string;
  voice: InterviewerVoiceProfile;
  personality: string;
  focus: string;
  companyKey: string;
};

const femaleCorporateVoice: InterviewerVoiceProfile = {
  id: 'female-english-corporate',
  label: 'Female English voice',
  preferredNames: [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Zira - English (United States)',
    'Google UK English Female',
    'Samantha',
    'Karen',
    'Ava',
    'Victoria',
    'Google US English',
  ],
  preferredLanguages: ['en-IN', 'en-US', 'en-GB', 'en-AU'],
  rate: 0.9,
  pitch: 1.04,
};

const createInterviewer = (
  id: string,
  displayName: string,
  avatar: string,
  personality: string,
  focus: string,
  companyKey: string,
): InterviewerConfig => ({
  id,
  displayName,
  gender: 'female',
  avatar,
  voice: {
    ...femaleCorporateVoice,
    id: `${id}-female-english`,
    rate: personality.toLowerCase().includes('fast') ? 0.96 : personality.toLowerCase().includes('friendly') ? 0.88 : 0.9,
    pitch: personality.toLowerCase().includes('warm') ? 1.08 : personality.toLowerCase().includes('serious') ? 1.01 : 1.04,
  },
  personality,
  focus,
  companyKey,
});

const portraits = [portraitOne, portraitTwo, portraitThree, portraitFour];

export const interviewerPool: Record<string, InterviewerConfig[]> = {
  google: [
    createInterviewer('google-01', 'AI Interviewer 01', portraits[0], 'Calm, formal, technical', 'Algorithms, engineering thinking, and project depth', 'google'),
    createInterviewer('google-02', 'AI Interviewer 02', portraits[1], 'Precise, curious, analytical', 'Problem solving, data structures, and measurable decisions', 'google'),
    createInterviewer('google-03', 'AI Interviewer 03', portraits[2], 'Friendly, rigorous, conversational', 'Projects, systems thinking, and technical communication', 'google'),
  ],
  microsoft: [
    createInterviewer('microsoft-01', 'AI Interviewer 01', portraits[1], 'Calm, structured, collaborative', 'CS fundamentals, projects, and behavioral judgment', 'microsoft'),
    createInterviewer('microsoft-02', 'AI Interviewer 02', portraits[2], 'Warm, precise, thoughtful', 'Problem solving, teamwork, and engineering tradeoffs', 'microsoft'),
    createInterviewer('microsoft-03', 'AI Interviewer 03', portraits[3], 'Direct, fair, technically focused', 'Algorithms, debugging, and communication under pressure', 'microsoft'),
  ],
  amazon: [
    createInterviewer('amazon-01', 'AI Interviewer 01', portraits[2], 'Direct, evidence-led, fast-paced', 'Ownership, problem solving, and measurable outcomes', 'amazon'),
    createInterviewer('amazon-02', 'AI Interviewer 02', portraits[3], 'Serious, concise, analytical', 'Systems thinking, decisions, and project depth', 'amazon'),
    createInterviewer('amazon-03', 'AI Interviewer 03', portraits[0], 'Focused, professional, probing', 'Technical fundamentals, ownership, and behavioral examples', 'amazon'),
  ],
  accenture: [
    createInterviewer('accenture-01', 'AI Interviewer 01', portraits[3], 'Friendly, polished, situational', 'Communication, technical fundamentals, and client scenarios', 'accenture'),
    createInterviewer('accenture-02', 'AI Interviewer 02', portraits[0], 'Conversational, calm, practical', 'Behavioral judgment, collaboration, and role readiness', 'accenture'),
    createInterviewer('accenture-03', 'AI Interviewer 03', portraits[1], 'Professional, clear, encouraging', 'Situational reasoning, communication, and delivery', 'accenture'),
  ],
  tcs: [
    createInterviewer('tcs-01', 'AI Interviewer 01', portraits[0], 'Calm, formal, foundational', 'Programming fundamentals, CS basics, and projects', 'tcs'),
    createInterviewer('tcs-02', 'AI Interviewer 02', portraits[1], 'Patient, precise, supportive', 'Debugging, communication, and core engineering readiness', 'tcs'),
    createInterviewer('tcs-03', 'AI Interviewer 03', portraits[2], 'Structured, focused, fair', 'Projects, programming concepts, and role readiness', 'tcs'),
  ],
  infosys: [
    createInterviewer('infosys-01', 'AI Interviewer 01', portraits[1], 'Formal, calm, methodical', 'Programming fundamentals, projects, and communication', 'infosys'),
    createInterviewer('infosys-02', 'AI Interviewer 02', portraits[2], 'Friendly, precise, practical', 'Problem solving, CS basics, and situational reasoning', 'infosys'),
    createInterviewer('infosys-03', 'AI Interviewer 03', portraits[3], 'Focused, supportive, direct', 'Technical foundations, collaboration, and role readiness', 'infosys'),
  ],
  default: [
    createInterviewer('general-01', 'AI Interviewer 01', portraits[0], 'Calm, formal, technical', 'Technical depth, problem solving, and communication', 'default'),
    createInterviewer('general-02', 'AI Interviewer 02', portraits[2], 'Friendly, professional, conversational', 'Projects, collaboration, and role readiness', 'default'),
    createInterviewer('general-03', 'AI Interviewer 03', portraits[3], 'Serious, precise, corporate', 'Core fundamentals, decision making, and delivery', 'default'),
  ],
};

function normalizeCompany(company: string) {
  const value = company.trim().toLowerCase();
  if (value.includes('google')) return 'google';
  if (value.includes('microsoft')) return 'microsoft';
  if (value.includes('amazon')) return 'amazon';
  if (value.includes('accenture')) return 'accenture';
  if (value.includes('tcs')) return 'tcs';
  if (value.includes('infosys')) return 'infosys';
  return 'default';
}

export function getCompanyKey(company: string) {
  return normalizeCompany(company);
}

export function chooseInterviewer(company: string) {
  const companyKey = normalizeCompany(company);
  const pool = interviewerPool[companyKey] || interviewerPool.default;
  const currentSession = localStorage.getItem('hello-interview-session-interviewer');
  if (currentSession) {
    try {
      const saved = JSON.parse(currentSession) as { companyKey?: string; interviewerId?: string };
      if (saved.companyKey === companyKey) {
        const savedInterviewer = pool.find((candidate) => candidate.id === saved.interviewerId);
        if (savedInterviewer) return savedInterviewer;
      }
    } catch {
      localStorage.removeItem('hello-interview-session-interviewer');
    }
  }

  const lastId = localStorage.getItem('hello-interview-last-interviewer-id');
  const available = pool.filter((candidate) => candidate.id !== lastId);
  const selected = available[Math.floor(Math.random() * available.length)] || pool[0];
  localStorage.setItem('hello-interview-last-interviewer-id', selected.id);
  localStorage.setItem('hello-interview-session-interviewer', JSON.stringify({ companyKey, interviewerId: selected.id }));
  return selected;
}

export function selectFemaleVoice(voices: SpeechSynthesisVoice[], profile: InterviewerVoiceProfile) {
  const femaleMarkers = ['female', 'samantha', 'karen', 'ava', 'victoria', 'zira', 'jenny', 'aria', 'hazel', 'susan', 'allison', 'libby', 'sonia', 'moira'];
  const maleMarkers = ['male', 'david', 'mark', 'daniel', 'alex', 'george', 'james', 'guy', 'richard', 'fred'];
  const ranked = voices
    .filter((voice) => profile.preferredLanguages.some((language) => voice.lang.toLowerCase().startsWith(language.toLowerCase().slice(0, 2))))
    .filter((voice) => !maleMarkers.some((marker) => voice.name.toLowerCase().includes(marker)))
    .map((voice) => {
      const name = voice.name.toLowerCase();
      const preferredIndex = profile.preferredNames.findIndex((preferred) => name.includes(preferred.toLowerCase()));
      const femaleIndex = femaleMarkers.findIndex((marker) => name.includes(marker));
      const score = (preferredIndex >= 0 ? 100 - preferredIndex : 0) + (femaleIndex >= 0 ? 40 - femaleIndex : 0) + (voice.lang.toLowerCase().startsWith('en-in') ? 20 : 0);
      return { voice, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.voice || null;
}

export type InterviewQuestion = { question: string; note: string; dimension: string };

export function getQuestionsForCandidate(company: string, track: string): InterviewQuestion[] {
  const companyKey = normalizeCompany(company);
  const focus = companyKey === 'google'
    ? 'Keep the answer grounded in algorithms, engineering thinking, or project depth.'
    : companyKey === 'microsoft'
      ? 'Connect your answer to CS fundamentals, collaboration, or product thinking.'
      : companyKey === 'accenture'
        ? 'Use a clear client-aware example and show how you communicate decisions.'
        : companyKey === 'tcs'
          ? 'Keep the explanation practical and connect it to programming fundamentals.'
          : companyKey === 'infosys'
            ? 'Show structured problem solving and clear communication.'
            : 'Connect your answer to the role, your preparation, and a specific example.';
  return [
    { question: `Walk us through a technical project you are proud to have shipped for a ${track.toLowerCase()} role.`, note: focus, dimension: 'Technical depth' },
    { question: 'When a production bug appears, how do you isolate the root cause?', note: 'We are looking for a calm, repeatable debugging method.', dimension: 'Problem solving' },
    { question: 'Explain a complex computer science concept to a non-technical stakeholder.', note: 'Clarity beats jargon. Use a simple analogy, then verify understanding.', dimension: 'Communication' },
    { question: 'Tell us about a time a team disagreed with your approach.', note: 'Show how you listen, decide, and keep the work moving.', dimension: 'Collaboration' },
    { question: `Why are you ready for this role at ${company || 'your target company'}?`, note: focus, dimension: 'Role readiness' },
  ];
}