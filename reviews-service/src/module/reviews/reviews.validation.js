import joi from "joi";

import detectInjection from "../../utilts/detectInhection.js";
detectInjection()

export const reviewSchema = {

    addedReview: joi.object({
        comment: joi.string().min(2).max(100).required().custom(detectInjection)
            .messages({ "string.injection": "Invalid characters detected in comment" }),
        rate: joi.number().min(1).max(5).required(),
    }).unknown(true),
    updateReview: joi.object({
        comment: joi.string().min(2).max(100).optional().custom(detectInjection)
            .messages({ "string.injection": "Invalid characters detected in comment" }),
        rate: joi.number().min(1).max(5).optional(),
    }).unknown(true),

}