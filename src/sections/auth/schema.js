import { z } from 'zod';
import i18n from 'src/locales/i18n';

function t(key) {
  return i18n.t(key);
}

export function getLoginSchema() {
  return z.object({
    username: z
      .string()
      .min(3, t('auth.usernameMin'))
      .max(30, t('auth.usernameMax'))
      .regex(/^[a-zA-Z0-9_]+$/, t('auth.usernameRegex')),
    password: z
      .string()
      .min(1, t('auth.passwordRequired')),
  });
}

export function getRegisterSchema() {
  return z
    .object({
      username: z
        .string()
        .min(3, t('auth.usernameMin'))
        .max(30, t('auth.usernameMax'))
        .regex(/^[a-zA-Z0-9_]+$/, t('auth.usernameRegex')),
      name: z
        .string()
        .max(50, t('auth.displayNameHelp'))
        .optional()
        .or(z.literal('')),
      password: z
        .string()
        .min(6, t('auth.passwordMin'))
        .max(72, t('auth.passwordMax')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export function getFieldError(errors, field) {
  return errors?.[field]?._errors?.[0];
}
