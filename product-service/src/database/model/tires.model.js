import mongoose from "mongoose";

const tireSchema = new mongoose.Schema({
    warranty: {
        type: Number,
        required: true
    },
    yearOfProduction: {
        type: Number,
        required: true,
        min: 2000,
        max: new Date().getFullYear()
    },
    productionCountry: {
        type: String,
        required: true
    },
    tireDrawType: {
        type: String,
        required: true,
        enum: ['Symmetric', 'Asymmetric', 'Directional']
    },
    tire_width: {
        type: Number,
        required: true
    },
    aspect_ratio: {
        type: Number,
        required: true
    },
    wheel_diameter: {
        type: Number,
        required: true
    },
    speed_rating: {
        type: String,
        required: true
    },
    load_index: {
        type: Number,
        required: true
    },
    extra_load: {
        type: Boolean,
        default: false
    },
    tire_type: {
        type: String,
        required: true
    },
    tire_brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "brand",
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
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    }
}, { timestamps: true });

const tireModel = mongoose.model('tires', tireSchema);
export default tireModel;
