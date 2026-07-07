export function getApiError(err, fallback = 'Request failed') {
  return err?.response?.data?.error || err?.message || fallback;
}

export function normalizeTopic(topic) {
  if (!topic?.trim()) return '';
  const key = topic.trim().toLowerCase();
  const aliases = {
    'passive-voice': 'passive',
    'passive voice': 'passive',
    'relative clauses': 'relative-clauses',
    'gerunds infinitives': 'gerunds-infinitives',
  };
  return aliases[key] || key.replace(/\s+/g, '-');
}

export const GRAMMAR_TOPICS = [
  'tenses', 'conditionals', 'articles', 'modals', 'passive',
  'relative-clauses', 'gerunds-infinitives', 'prepositions', 'conjunctions', 'comparisons',
];

export function clearTopicInput(setTopic) {
  if (typeof setTopic === 'function') setTopic('');
}

export function openGeneratedLesson(lesson, { setSelectedLesson, setAnswers, setResults, setView }) {
  if (!lesson?._id) return false;
  setSelectedLesson(lesson);
  setAnswers({});
  setResults(null);
  setView('lesson');
  return true;
}

export function openGeneratedExercise(exercise, { setSelected, setAnswers, setResults, setShowTranscript, setView }) {
  if (!exercise?._id) return false;
  setSelected(exercise);
  setAnswers({});
  setResults(null);
  setShowTranscript(false);
  setView('practice');
  return true;
}
