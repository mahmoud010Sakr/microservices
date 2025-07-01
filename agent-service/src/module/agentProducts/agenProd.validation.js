import joi from "joi";

export const createAgentProductSchema = joi.object({
    agentId: joi.string().hex().length(24).when('$user.role', {
        is: 'Admin',
        then: joi.optional(),
        otherwise: joi.forbidden()
    }).messages({
        'string.length': 'Invalid agent ID format',
        'any.forbidden': 'Only admins can specify agent ID'
    }),
    productId: joi.string().hex().length(24).required().messages({
        "string.empty": "Product ID is required",
        "string.length": "Invalid product ID format"
    }),
    brandId: joi.string().hex().length(24).required().messages({
        "string.empty": "Brand ID is required",
        "string.length": "Invalid brand ID format"
    }),
    vendorPrice: joi.number().min(0).messages({
        "number.base": "Vendor price must be a number",
        "number.min": "Vendor price cannot be negative"
    }),
    priceAfterDiscount: joi.number().min(0).messages({
        "number.base": "Discounted price must be a number",
        "number.min": "Discounted price cannot be negative"
    }),
    stock: joi.number().min(0).required().messages({
        "number.base": "Stock must be a number",
        "number.min": "Stock cannot be negative"
    }),
    status: joi.string().valid("active", "inactive", "out_of_stock").messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be either active, inactive, or out_of_stock"
    }),
    tags: joi.array().items(joi.string().hex().length(24)).messages({
        "array.base": "Tags must be an array",
        "string.length": "Invalid tag ID format"
    })
});

export const addTagsSchema = joi.object({
    tags: joi.array().items(joi.string().hex().length(24)).required().messages({
        'array.base': 'Tags must be an array',
        'string.length': 'Invalid tag ID format',
        'any.required': 'Tags are required'
    })
});

export const updateAgentProductSchema = joi.object({
    vendorPrice: joi.number().min(0).messages({
        "number.base": "Vendor price must be a number",
        "number.min": "Vendor price cannot be negative"
    }),
    priceAfterDiscount: joi.number().min(0).messages({
        "number.base": "Discounted price must be a number",
        "number.min": "Discounted price cannot be negative"
    }),
    stock: joi.number().min(0).messages({
        "number.base": "Stock must be a number",
        "number.min": "Stock cannot be negative"
    }),
    status: joi.string().valid("active", "inactive", "out_of_stock").messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be either active, inactive, or out_of_stock"
    }),
    tags: joi.array().items(joi.string().hex().length(24)).messages({
        "array.base": "Tags must be an array",
        "string.length": "Invalid tag ID format"
    })
});

export const getAgentProductSchema = joi.object({
    id: joi.string().hex().length(24).required().messages({
        "string.empty": "Agent product ID is required",
        "string.length": "Invalid agent product ID format"
    })
});
