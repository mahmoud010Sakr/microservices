import mongoose, { Schema } from "mongoose"


const nameSchema = new Schema({
    en: { type: String, required: true },
    ar: { type: String, required: true }
}, { _id: false });

const maintainanceSchema = new Schema({
    name: {
        type: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    iFrame: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    services: {
        serviceName: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        descretion: {
            type: String,
        }
    },
    location: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    reviews: {
        type: [{
            comment: String,
            rate: Number,
            user: {
                type: Schema.Types.ObjectId,
                ref: "user"
            }
        }]
    },
    coverImage: {
        type: String,
    },
    profImage: {
        type: String,
    },
    userAccountId: {
        type: Schema.Types.ObjectId,
        ref: "user",
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
        ref: 'user',
        default: null,
    },
}, { timestamps: true })
const maintainanceModel = mongoose.model('maintainance', maintainanceSchema)
export default maintainanceModel