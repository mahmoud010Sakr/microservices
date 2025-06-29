import mongoose from "mongoose"
const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    address: [{
        city: String,
        street: String,
        postalCode: String,
        country: String
    }],
    image: String,
    role: {
        type: String,
        enum: ["User", "Admin", "SuperAdmin" ,"Support" ,"Agent", "MC"],
        default: "User"
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    age: Number,
    location: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number
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
        default: null
    },
    wishList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    }],
    platformPercentage: {
        type: Number,
        default: 0
    },
    shippingPercentage: {
        type: Number,
        default: 0
    },
    xPercentage: {
        type: Number,
        default: 0
    },
    yPercentage: {
        type: Number,
        default: 0
    },
    confirmRule: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })



const userModel = mongoose.model("user", userSchema)

export default userModel