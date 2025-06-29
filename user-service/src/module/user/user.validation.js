import Joi from 'joi';
import detectInjection from '../../utilts/detectInhection.js';

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in name" }),
    email: Joi.string().email().optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in email" }),
    phone: Joi.string().min(10).max(15).optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in phone" }),
    address: Joi.string().min(10).max(100).optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in address" }),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    age: Joi.number().integer().min(18).max(100).optional(),
    location: Joi.string().max(255).optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in location" }),
    image: Joi.string().uri().optional()
}).min(1);

export const deleteUserSchema = Joi.object({
    userId: Joi.string().hex().length(24).required()
});



export const updatePercentageSchema = {
    params: Joi.object({
        userId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'any.required': 'User ID is required'
            }),
    }),
    body: Joi.object({
        platformPercentage: Joi.number()
            .min(0)
            .max(100)
            .precision(2) // Allows 2 decimal places
            .required()
            .custom(detectInjection)
            .messages({
                'number.base': 'Percentage must be a number',
                'number.min': 'Percentage cannot be negative',
                'number.max': 'Percentage cannot exceed 100%',
                'any.required': 'Percentage is required'
            }),
        shippingPercentage: Joi.number()
            .min(0)
            .max(100)
            .precision(2) // Allows 2 decimal places
            .required()
            .custom(detectInjection)
            .messages({
                'number.base': 'Percentage must be a number',
                'number.min': 'Percentage cannot be negative',
                'number.max': 'Percentage cannot exceed 100%',
                'any.required': 'Percentage is required'
            }),
        xPercentage: Joi.number()
            .min(0) 
            .max(100) 
            .precision(2) // Allows 2 decimal places
            .required()
            .custom(detectInjection)
            .messages({
                'number.base': 'Percentage must be a number',
                'number.min': 'Percentage cannot be negative',
                'number.max': 'Percentage cannot exceed 100%',
                'any.required': 'Percentage is required'
            }),
        yPercentage: Joi.number()
            .min(0) 
            .max(100) 
            .precision(2) // Allows 2 decimal places
            .required()
            .custom(detectInjection)
            .messages({
                'number.base': 'Percentage must be a number',
                'number.min': 'Percentage cannot be negative',
                'number.max': 'Percentage cannot exceed 100%',
                'any.required': 'Percentage is required'
            })

    })
};

export const maintenanceCenterSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in name" }),
    email: Joi.string().email().required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in email" }),
    phone: Joi.string().min(10).max(15).required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in phone" }),
    address: Joi.string().min(10).max(100).required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in address" }),
    location: Joi.string().max(255).required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in location" }),
    imageCover: Joi.string().uri().optional(),
    images: Joi.array().items(Joi.string().uri()).max(10).optional(),
    description: Joi.string().max(1000).optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in description" }),
    services: Joi.array().items(Joi.string()).max(10).optional(),
    iFrame: Joi.string().optional(),
    link: Joi.string().optional(),
    userAccountId: Joi.string().hex().length(24).required()
}).min(1);