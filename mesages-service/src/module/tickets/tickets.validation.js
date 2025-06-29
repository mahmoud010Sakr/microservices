import joi from "joi"
import detectInjection from "../../utilts/detectInhection.js"


export const ticketSchema = joi.object({
    name: joi.string().trim().min(2).max(50).custom(detectInjection).required(),
    email: joi.string().trim().lowercase().email().custom(detectInjection).required(),
    phone: joi.string().trim().pattern(/^\+?[0-9]\d{9,14}$/).custom(detectInjection).required(),
    city: joi.string().trim().custom(detectInjection).required(),
    assignedTo: joi.string().trim().custom(detectInjection).required(),
    attachment: joi.string().optional(),
    complaint: joi.string().trim().custom(detectInjection).required(),
    reply: joi.string().trim().custom(detectInjection).optional(),
    image: joi.string().optional(),
    title: joi.string().trim().custom(detectInjection).required(),
})

export const updateTicketStatus = joi.object({
    status: joi.string().trim().custom(detectInjection).required(),
})