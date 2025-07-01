import mongoose from "mongoose";

const oilSchema = new mongoose.Schema({

    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "brand",
        required: true
    },
    liters: {
        type: Number,
        required: true
    },
    viscosity: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    }
}, { timestamps: true });

const oilModel = mongoose.model('oil', oilSchema);
export default oilModel