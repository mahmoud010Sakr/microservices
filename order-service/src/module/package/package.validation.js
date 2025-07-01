import joi from "joi";
import detectInjection from '../../utilts/detectInhection.js';

// Base validation for package name
export const nameValidation = joi.object({
    en: joi.string().trim().min(2).max(50).required()
        .custom(detectInjection, 'Injection detection'),
    ar: joi.string().trim().min(2).max(50).required()
        .custom(detectInjection, 'Injection detection')
});

// Create Package Schema
export const createPackageSchema = joi.object({
    name: nameValidation.required(),
    price: joi.number().min(0).required(),
    description: joi.string().min(10).max(500).trim().required()
        .custom(detectInjection, 'Injection detection'),
    level: joi.string().required(),
    isActive: joi.boolean().default(true)
});

// Update Package Schema
export const updatePackageSchema = joi.object({
    name: nameValidation,
    price: joi.number().min(0),
    description: joi.string().min(10).max(500).trim()
        .custom(detectInjection, 'Injection detection'),
    level: joi.string(),
    isActive: joi.boolean()
});

// Package ID Param Schema
export const packageIdSchema = joi.object({
    packageId: joi.string().hex().length(24).required()
        .custom(detectInjection, 'Injection detection')
});

// Query Parameters Schema
export const packageQuerySchema = joi.object({
    isActive: joi.boolean()
});