export const SUPPORTED_LANGUAGES = [
  { id: 'telugu', name: 'Telugu', native: 'తెలుగు', flag: '🟡' },
  { id: 'hindi', name: 'Hindi', native: 'हिन्दी', flag: '🟠' },
  { id: 'tamil', name: 'Tamil', native: 'தமிழ்', flag: '🔴' },
  { id: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🟣' },
  { id: 'malayalam', name: 'Malayalam', native: 'മലയാളം', flag: '🔵' },
  { id: 'bengali', name: 'Bengali', native: 'বাংলা', flag: '🟢' },
  { id: 'marathi', name: 'Marathi', native: 'मराठी', flag: '🔶' },
  { id: 'gujarati', name: 'Gujarati', native: 'ગુજરાતી', flag: '🟤' },
  { id: 'none', name: 'English Only', native: 'English Only', flag: '⚪' },
];

export const getLanguageName = (languageId: string): string => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.id === languageId);
  return language ? language.name : 'English';
};

export const getTranslation = (word: any, languageId: string): string => {
  if (languageId === 'none' || !word.translations) {
    return '';
  }
  return word.translations[languageId] || word.word_telugu || '';
};