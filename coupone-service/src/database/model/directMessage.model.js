import mongoose from "mongoose";


const directMessageSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    message: {
        type: String,
    },
}, { timestamps: true });

const directMessageModel = mongoose.model("DirectMessage", directMessageSchema);

export default directMessageModel;
