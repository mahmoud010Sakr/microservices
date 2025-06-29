import mongoose from "mongoose";
const ticketAttachmentSchema = new mongoose.Schema({
    attachment: {
        type: String,
        required: true,
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ticket",
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        
        required: true,
    }
}, { timestamps: true });
const ticketAttachmentModel = mongoose.model("ticketAttachment", ticketAttachmentSchema);
export default ticketAttachmentModel