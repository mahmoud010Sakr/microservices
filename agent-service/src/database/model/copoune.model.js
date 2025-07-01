import { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    expires: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


const couponModel = model('coupon', couponSchema);
export default couponModel