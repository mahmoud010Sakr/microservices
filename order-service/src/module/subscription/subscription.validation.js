import joi from 'joi';

export const createSubscriptionSchema = joi.object({
    packageId: joi.string().hex().length(24).required(),
    paymentMethod: joi.string().valid('card', 'apple_pay', 'mada' , "google_pay").required()
});

export const updateSubscriptionSchema = joi.object({
    packageId: joi.string().hex().length(24),
    status: joi.string().valid('active', 'cancelled')
});

export const subscriptionIdSchema = joi.object({
    subscriptionId: joi.string().hex().length(24).required()
});