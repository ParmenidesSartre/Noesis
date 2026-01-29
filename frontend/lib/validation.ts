/**
 * Shared validation rules
 * These should match the backend validation exactly
 */

// Password validation - must match backend requirements
// Backend: class-validator with @Matches decorator
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresNumber: true,
  requiresSpecialChar: true,
} as const;

export const PASSWORD_ERROR_MESSAGE =
  'Password must be at least 8 characters with uppercase, lowercase, number, and special character';

// Email validation - enhanced beyond HTML5 basic validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const EMAIL_ERROR_MESSAGE = 'Please enter a valid email address';

// Organization slug validation - must match backend
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_ERROR_MESSAGE =
  'Slug must contain only lowercase letters, numbers, and hyphens';

// Name validation
export const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

export const NAME_ERROR_MESSAGE =
  'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';

// Phone validation - international format
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export const PHONE_ERROR_MESSAGE =
  'Please enter a valid phone number (international format accepted)';

// Validation functions
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters` };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return { isValid: false, error: PASSWORD_ERROR_MESSAGE };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: EMAIL_ERROR_MESSAGE };
  }

  return { isValid: true };
};

export const validateName = (name: string, fieldName: string = 'Name'): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (!NAME_REGEX.test(name)) {
    return { isValid: false, error: NAME_ERROR_MESSAGE };
  }

  return { isValid: true };
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }

  if (!PHONE_REGEX.test(phone)) {
    return { isValid: false, error: PHONE_ERROR_MESSAGE };
  }

  return { isValid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};
