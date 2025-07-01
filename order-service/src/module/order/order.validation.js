import joi from "joi";
import detectInjection from "../../utilts/detectInhection.js";
detectInjection();

export const createOrderSchema = joi.object({
    products: joi.array().items(joi.object({
        productId: joi.string().hex().length(24).required()
            .messages({ "string.pattern.base": "Invalid productId format" }),
        quantity: joi.number().min(1).required()
    })).min(1).required(),
    
    shippingAddress: joi.string().min(10).max(100).required().custom(detectInjection)
        .messages({ "string.injection": "Invalid characters detected in shippingAddress" }),

    paymentMethod: joi.string().valid('cash', 'card').required(),
    paymentStatus: joi.string().valid('paid', 'unpaid').required(),

    totalPrice: joi.number().min(1).required(),
    
    serviceType: joi.string().valid("delivery&instulation", "instulation-in-store", "delivery").required(),

    deliveryStatus: joi.string().valid('pending', 'delivered').required(),

    deliveryDate: joi.date().required(),
    paymentDate: joi.date().required(),

    deliveryCharge: joi.number().min(1).required(),
    discount: joi.number().min(1).required(),
    tax: joi.number().min(1).required(),
    totalAmount: joi.number().min(1).required(),
});
