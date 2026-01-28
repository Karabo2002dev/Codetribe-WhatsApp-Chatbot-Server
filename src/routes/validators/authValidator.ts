import { body } from 'express-validator';

export const registerValidator = [
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/).withMessage('Password must contain a lowercase letter')
    .matches(/^(?=.*[A-Z])/).withMessage('Password must contain an uppercase letter')
    .matches(/^(?=.*\d)/).withMessage('Password must contain a number')
    .matches(/^(?=.*[@$!%*?&])/)
      .withMessage('Password must contain a special character (@$!%*?&)')
    .not().matches(/\s/).withMessage('Password must not contain spaces'),

  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),

  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in international format (e.g. +27831234567)'),

  body('role')
    .optional()
    .isString().withMessage('Role must be a string'),
];

export const loginValidator = [
  body('token')
    .notEmpty().withMessage('Token is required'),
];
