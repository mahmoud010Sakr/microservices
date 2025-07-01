import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    sessionId: {
        type: String,
        required: false
    },
    cartItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: Number,
        totalProductDiscount: Number
    }],
    totalPrice: Number,
    totalPriceAfterDiscount: Number,
    discount: Number
}, { timestamps: true });

const cartModel = model('cart', cartSchema);
export default cartModel