import Joi from 'joi';
import detectInjection from '../../utilts/detectInhection.js';
detectInjection()
export const createBrandSchema = Joi.object({
    name: Joi.object({
        en: Joi.string()
            .min(2)
            .trim()
            .custom(detectInjection)
            .required()
            .messages({
                "string.base": "English name must be a string",
                "string.min": "English name must be at least 2 characters",
                "string.injection": "Invalid characters detected in name.en",
                "any.required": "English name is required"
            }),

        ar: Joi.string()
            .min(2)
            .trim()
            .custom(detectInjection)
            .required()
            .messages({
                "string.base": "Arabic name must be a string",
                "string.min": "Arabic name must be at least 2 characters",
                "string.injection": "Invalid characters detected in name.ar",
                "any.required": "Arabic name is required"
            }),
    }).required(),
    image: Joi.string()
        .uri()
        .required(),
}).options({ abortEarly: false });


export const getBrandByIdSchema = Joi.object({
    brandId: Joi.string().hex().length(24).custom(detectInjection).required()
});

export const updateBrandSchema = Joi.object({
    name: Joi.object({
        en: Joi.string()
            .min(2)
            .trim()
            .custom(detectInjection)
            .required()
            .messages({
                "string.base": "English name must be a string",
                "string.min": "English name must be at least 2 characters",
                "string.injection": "Invalid characters detected in name.en",
                "any.required": "English name is required"
            }),

        ar: Joi.string()
            .min(2)
            .trim()
            .custom(detectInjection)
            .required()
            .messages({
                "string.base": "Arabic name must be a string",
                "string.min": "Arabic name must be at least 2 characters",
                "string.injection": "Invalid characters detected in name.ar",
                "any.required": "Arabic name is required"
            }),
    }).optional(),}).unknown(true);

export const deleteBrandSchema = Joi.object({
    brandId: Joi.string().hex().length(24).custom(detectInjection).required()
});

export const restoreBrandSchema = Joi.object({
    brandId: Joi.string().hex().length(24).custom(detectInjection).required()
});
