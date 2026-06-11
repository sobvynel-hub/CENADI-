export const required = (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) return 'Ce champ est requis';
  return null;
};

export const email = (value) => {
  if (!value) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Email invalide';
  return null;
};

export const minLength = (min) => (value) => {
  if (!value) return null;
  if (value.length < min) return `Minimum ${min} caractères`;
  return null;
};

export const maxLength = (max) => (value) => {
  if (!value) return null;
  if (value.length > max) return `Maximum ${max} caractères`;
  return null;
};

export const numeric = (value) => {
  if (!value) return null;
  if (isNaN(Number(value))) return 'Doit être un nombre';
  return null;
};

export const positiveNumber = (value) => {
  const numErr = numeric(value);
  if (numErr) return numErr;
  if (Number(value) <= 0) return 'Doit être positif';
  return null;
};

export const validate = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};