import joi from 'joi';

export const createTagSchema = joi.object({
    name: joi.string().required().trim().messages({
        'string.empty': 'Tag name is required',
        'any.required': 'Tag name is required'
    })
});

export const updateTagSchema = joi.object({
    name: joi.string().required().trim().messages({
        'string.empty': 'Tag name is required',
        'any.required': 'Tag name is required'
    })
});

export const getTagSchema = joi.object({
    id: joi.string().hex().length(24).required().messages({
        'string.empty': 'Tag ID is required',
        'string.length': 'Invalid tag ID format',
        'any.required': 'Tag ID is required'
    })
});