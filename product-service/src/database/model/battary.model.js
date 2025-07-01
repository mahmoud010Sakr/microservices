import mongoose from "mongoose";


//TODO: lesa m7tag review 
const battarySchema = new mongoose.Schema({

    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "brand",
        required: true
    },
    voltage: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    dimention: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    }
}, { timestamps: true });

const battaryModel = mongoose.model('battary', battarySchema)
export default battaryModel