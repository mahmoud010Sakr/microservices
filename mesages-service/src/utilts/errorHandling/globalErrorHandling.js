// Import translations
import translations from '../translations.js';

export const globalErrorHandling = (err, req, res, next) => {
  const translationEntry = translations[err.message] || { en: err.message, ar: err.message };
  const payload = { error: { en: translationEntry.en, ar: translationEntry.ar } };
  if (process.env.MOD === 'DEV') payload.stack = err.stack;
  return res.status(err.statusCode || 500).json(payload);
}