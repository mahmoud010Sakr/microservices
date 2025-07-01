import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cart",
    },
    productId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "agentProduct",
    },
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    totalPrice: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "visa"],
        default: "cash"
    },
    orderdAt: {
        type: Date,
        default: Date.now
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date,
    },
    serviceType: {
        type: String,
        required: true,
        enum: ["delivery&instulation", "instulation-in-store", "delivery"],
    }, 
    //TODO: review order status 
    orderStatus: {
        type: String,
        required: true,
        enum: ['orderd', "processing ", "shipped", "delivered"],
        default: "orderd"
    },
    paymentIntentId:{
        type: String
        
    },
    isRefunded: {
        type: Boolean,
        default: false
    },
    refundDetails: {
    type: String
    }
})

let orderModel = mongoose.model("Order", orderSchema)
export default orderModel