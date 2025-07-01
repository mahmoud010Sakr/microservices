import Joi from 'joi';


import detectInjection from '../../utilts/detectInhection.js';

export const addBrandToProductSchema = {
  params: Joi.object({
    productId: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    brandId: Joi.string().hex().length(24).required()
  })
};

export const getProductsByIdsSchema = Joi.object({
    productIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()).min(1).required().messages({
        'array.min': 'At least one product ID is required',
        'string.pattern.base': 'Invalid product ID format',
        'array.base': 'Product IDs must be an array'
    })
});

export const fileSchema = Joi.object({
  imageCover: Joi.array().items(Joi.object().required()).min(1).max(1).required(),
  images: Joi.array().items(Joi.object().required()).min(1).max(10).required()
}).required();

export const getProductByIdSchema = Joi.object({
  productId: Joi.string().hex().length(24).required()
});
export const createProductSchema = Joi.object({
  name: Joi.when('productType', {
    is: Joi.valid('tire', 'battery', 'oil', 'service', 'accessories'),
    then: Joi.object({
      en: Joi.string()
        .min(2)
        .trim()
        .custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in name.en" }),
      ar: Joi.string()
        .min(2)
        .trim()
        .custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in name.ar" }),
    }).optional(),
    otherwise: Joi.forbidden()
  }),
  productionCountry: Joi.string().required(),
  description: Joi.object({
    ar: Joi.string()
      .min(10)
      .max(200)
      .required()
      .trim()
      .custom(detectInjection)
      .messages({ "string.injection": "Invalid characters detected in Arabic description" }),
    en: Joi.string()
      .min(10)
      .max(200)
      .required()
      .trim()
      .custom(detectInjection)
      .messages({ "string.injection": "Invalid characters detected in English description" })
  }).required(),
  category: Joi.string().hex().length(24).required(),
  subCategory: Joi.string().hex().length(24).required(),
  brand: Joi.string().hex().length(24).required(),
  productType: Joi.string().valid("tire", "battery", "oil", "service", "accessories").required(),
  tire_width: Joi.number().when("productType", { is: "tire", then: Joi.required() }),
  aspect_ratio: Joi.number().when("productType", { is: "tire", then: Joi.required() }),
  wheel_diameter: Joi.number().when("productType", { is: "tire", then: Joi.required() }),
  speed_rating: Joi.string().when("productType", { is: "tire", then: Joi.required() }),
  load_index: Joi.number().when("productType", { is: "tire", then: Joi.required() }),
  extra_load: Joi.boolean().when("productType", { is: "tire", then: Joi.optional() }),
  tire_type: Joi.string().when("productType", { is: "tire", then: Joi.required() }),
  tire_brand: Joi.string().hex().length(24).when("productType", { is: "tire", then: Joi.required() }),
  warranty: Joi.number().when("productType", { is: "tire", then: Joi.required() }), 
  yearOfProduction: Joi.number().when("productType", { is: "tire", then: Joi.required() }),
  tireDrawType: Joi.string().when("productType", { is: "tire", then: Joi.required() }),
  liters: Joi.number().when("productType", { is: "oil", then: Joi.required() }),
  viscosity: Joi.string().when("productType", { is: "oil", then: Joi.required() }),
  voltage: Joi.number().when("productType", { is: "battery", then: Joi.required() }),
  capacity: Joi.number().when("productType", { is: "battery", then: Joi.required() }),
  dimention: Joi.string().when("productType", { is: "battery", then: Joi.required() }),
  weight: Joi.number().when("productType", { is: "battery", then: Joi.required() }),
});


export const updateProductSchema = Joi.object({

  productId: Joi.string().hex().length(24).required(),

  name: Joi.string()
    .min(2)
    .trim()
    .optional()
    .custom(detectInjection)
    .messages({ "string.injection": "Invalid characters detected in name" }),

  productionCountry: Joi.string().required(),



  description: Joi.string()
    .min(10)
    .max(100)
    .trim()
    .optional()
    .custom(detectInjection)
    .messages({ "string.injection": "Invalid characters detected in description" }),

  imageCover: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).min(1).optional(),
  category: Joi.string().hex().length(24).optional(),
  subCategory: Joi.string().hex().length(24).optional(),
  brand: Joi.string().hex().length(24).optional(),


  productType: Joi.string().valid("tire", "battery").optional(),
}).unknown(true);

export const deleteProductSchema = Joi.object({
  productId: Joi.string().hex().length(24).required()
});

export const restoreProductSchema = Joi.object({
  productId: Joi.string().hex().length(24).required()
});

export const addTagSchema = Joi.object({
  tagId: Joi.string().hex().length(24).required()
});