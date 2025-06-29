import { Schema, Types, model } from "mongoose";
const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    product: {
        type: Types.ObjectId,
        ref: "product",
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    rate: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
reviewSchema.pre(/^find/, function () {
    this.populate('user', 'name')
})
export const reviewModel = model('reviews', reviewSchema);