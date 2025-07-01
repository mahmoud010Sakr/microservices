import joi from "joi";
import detectInjection from "../../utilts/detectInhection.js";

export const createCategorySchema = joi.object({
    name: joi.string().trim().min(2).max(50).custom(detectInjection).required()
        .messages({ "string.injection": "Invalid characters detected in name" }),
    image: joi.string().uri().optional()
});

export const updateCategorySchema = {
    params: joi.object({
        categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
            .messages({ "string.pattern.base": "Invalid categoryId format" })
    }),
    body: joi.object({
        name: joi.string().trim().min(2).max(50).custom(detectInjection).optional()
            .messages({ "string.injection": "Invalid characters detected in name" }),
        slug: joi.string().trim().custom(detectInjection).optional()
            .messages({ "string.injection": "Invalid characters detected in slug" }),
        image: joi.string().uri().optional()
    })
};

export const getCategorySchema = joi.object({
    categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const deleteCategorySchema = joi.object({
    categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const restoreCategorySchema = joi.object({
    categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const getCategoryByIdSchema = joi.object({
    categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});
