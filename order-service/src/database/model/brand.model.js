import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({

    name: {
        type: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        }
    },

    productId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'product',
    },
    logo: {

        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null,
    },
}, { timestamps: true });
const brandModel = mongoose.model('brand', brandSchema);
export default brandModel