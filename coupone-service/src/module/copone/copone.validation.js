import joi from "joi";
import detectInjection from "../../utilts/detectInhection.js";
detectInjection()
export const createCoponeSchema = joi.object({
    code: joi.string().min(2).max(50).custom(detectInjection).required(),
    discount: joi.number().min(1).max(100).custom(detectInjection).required(),
    expires: joi.date().custom(detectInjection).required(),
})
