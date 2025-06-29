import joi from "joi";
import detectInjection from '../../utilts/detectInhection.js'

detectInjection()

const enhancedCommonSchema = {
    name: joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s-']+$/)
        .custom(detectInjection)
        .required()
        .messages({
            "any.required": "Name is required",
            "string.pattern.base": "Name can only contain letters, spaces, hyphens, or apostrophes",
            "string.injection": "Invalid characters detected in name"
        }),
    email: joi.string()
        .trim()
        .lowercase()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net"] }
        })
        .custom(detectInjection)
        .required()
        .messages({
            "any.required": "Email is required",
            "string.email": "Invalid email format",
            "string.injection": "Invalid characters detected in email"
        }),
};

export const signUpSchema = joi.object({
    name: joi.string().trim().min(2).max(50).custom(detectInjection).required(),
    email: joi.string().trim().lowercase().email().custom(detectInjection).required(),
    password: joi.string().trim().min(8).max(100).custom(detectInjection).required(),
    confirmPassword: joi.string().trim().valid(joi.ref("password")).required(),
    phone: joi.string().trim().pattern(/^\+?[0-9]\d{9,14}$/).custom(detectInjection).required(),
    role: joi.string().trim().valid("Admin", "Agent", "Maintenance_Center", "User").default("User"),
    confirmRule: joi.boolean().required(),
})
    .unknown(false)
export const loginSchema = joi.object({
    identifier: joi.alternatives().try(
        joi.string()
            .trim()
            .email({ tlds: { allow: ["com", "net"] } })
            .custom(detectInjection)
            .messages({
                "string.email": "Invalid email format",
                "string.injection": "Invalid characters detected in email"
            }),
        joi.string()
            .trim()
            .pattern(/^\d{10,15}$/)
            .custom(detectInjection)
            .messages({
                "string.pattern.base": "Phone must be 10-15 digits",
                "string.injection": "Invalid characters detected in phone"
            })
    ).required()
        .messages({ "any.required": "Identifier (email or phone) is required" }),
    password: joi.string()
        .trim()
        .required()
        .custom(detectInjection)
        .messages({
            "any.required": "Password is required",
            "string.injection": "Invalid characters detected in password"
        }),
})
    .unknown(false)
    .messages({ "object.unknown": "Unknown fields are not allowed" });