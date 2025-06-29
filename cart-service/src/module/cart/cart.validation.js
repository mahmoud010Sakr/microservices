import Joi from 'joi';
import detectInjection from '../../utilts/detectInhection.js';
detectInjection()

const objectIdSchema = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .custom(detectInjection)
    .message('Invalid ObjectId');

const addProductToCartSchema = Joi.object({
    productId: objectIdSchema.required().messages({
        'string.pattern.base': 'Product ID must be a valid ObjectId',
        'any.required': 'Product ID is required',
        'string.injection': 'Invalid characters detected in Product ID'
    }),
    quantity: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1'
    })
});

const removeProductFromCartSchema = Joi.object({
    id: objectIdSchema.required().messages({
        'string.pattern.base': 'Cart item ID must be a valid ObjectId',
        'any.required': 'Cart item ID is required',
        'string.injection': 'Invalid characters detected in Cart item ID'
    })
});
const updateParamsSchema = Joi.object({
    id: objectIdSchema.required()
});
const updateBodySchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});

const updateProductQuantitySchema = Joi.object({
    id: objectIdSchema.required().messages({
        'string.pattern.base': 'Product ID must be a valid ObjectId',
        'any.required': 'Product ID is required',
        'string.injection': 'Invalid characters detected in Product ID'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
    })
});

const applyCouponSchema = Joi.object({
    code: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .custom(detectInjection)
        .required()
        .messages({
            'string.base': 'Coupon code must be a string',
            'string.min': 'Coupon code must be at least 3 characters long',
            'string.max': 'Coupon code cannot exceed 50 characters',
            'any.required': 'Coupon code is required',
            'string.injection': 'Invalid characters detected in Coupon code'
        })
});

export {
    addProductToCartSchema,
    removeProductFromCartSchema,
    updateProductQuantitySchema,
    applyCouponSchema
};