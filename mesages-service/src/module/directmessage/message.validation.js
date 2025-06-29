import Joi from 'joi';
import detectInjection from '../../utilts/detectInhection.js';

// Custom Joi extension to use detectInjection
const JoiInjection = Joi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.injection': '{{#label}} contains potential injection content!'
  },
  rules: {
    injectionSafe: {
      validate(value, helpers) {
        return detectInjection(value, helpers);
      }
    }
  }
}));

// Define the schema for message creation
export const messageValidationSchema = Joi.object({
  userName: JoiInjection.string().min(2).max(50).required().injectionSafe(),
  email: JoiInjection.string().email().required().injectionSafe(),
  phone: JoiInjection.string().min(7).max(20).optional().allow('').injectionSafe(),
  message: JoiInjection.string().min(1).max(500).required().injectionSafe(),
});

// Middleware for validation
export function validateMessage(req, res, next) {
  const { error } = messageValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Validation error', details: error.details });
  }
  next();
}
