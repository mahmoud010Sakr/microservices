import mongoose from "mongoose"
import ticketMessageModel from "./ticket.message.model.js"
import ticketAttachmentModel from "./ticketAttachment.model.js"

const ticketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    shortTicket: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: String,
        required: true,
    },
    comlaintId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref:"ticketMessage"
    },
    ticketAttachmentId:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:"ticketAttachment"
    },
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    }
}, { timestamps: true });
// Virtual for ticket URL
ticketSchema.virtual('url').get(function() {
    return `/tickets/${this._id}`;
});

// Indexes for better query performance
ticketSchema.index({ status: 1, userId: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ lastRepliedAt: -1 });

// Document middleware to update lastRepliedAt when a new message is added
ticketSchema.pre('save', function(next) {
    if (this.isModified('comlaintId') && this.comlaintId.length > 0) {
        this.lastRepliedAt = Date.now();
    }
    next();
});

// Query middleware to populate commonly used fields
ticketSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'userId',
        select: 'name email'
    }).populate({
        path: 'assignedTo',
        select: 'name email'
    });
    next();
});

ticketSchema.pre('remove', async function(next) {
    try {
        await ticketMessageModel.deleteMany({ ticketId: this._id });
        await ticketAttachmentModel.deleteMany({ ticketId: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const ticketModel = mongoose.model("ticket", ticketSchema);
export default ticketModel