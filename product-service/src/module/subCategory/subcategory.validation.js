import Joi from "joi";
import detectInjection from "../../utilts/detectInhection.js";

export const createSubCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in name" }),
    image: Joi.string().uri().required(),
    categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const getSubCategorySchema = Joi.object({
    subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const deleteSubCategorySchema = Joi.object({
    subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const restoreSubCategorySchema = Joi.object({
    subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const updateSubCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in name" }),
    slug: Joi.string().trim().optional().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in slug" }),
    image: Joi.string().uri().optional()
});
