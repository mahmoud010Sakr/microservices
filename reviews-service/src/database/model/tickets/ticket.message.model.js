import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
    complaint: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        minlength: [1, 'Message cannot be empty'],
        maxlength: [5000, 'Message cannot be longer than 5000 characters']
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Sender ID is required']
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ticket',
        required: [true, 'Ticket reference is required'],
        index: true
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    isInternalNote: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ticketAttachment'
    }],
    metadata: {
        ipAddress: String,
        userAgent: String
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ticketMessageSchema.index({ ticket: 1, createdAt: 1 });
ticketMessageSchema.index({ sender: 1 });

// Virtual for message URL
ticketMessageSchema.virtual('url').get(function() {
    return `/tickets/${this.ticket}/messages/${this._id}`;
});

// Query middleware to populate sender details
ticketMessageSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'senderId',
        select: 'name email role'
    }).populate({
        path: 'attachments',
        select: 'url fileName fileType size'
    });
    next();
});

// Static method to mark messages as read
const ticketMessageModel = mongoose.model('ticketMessage', ticketMessageSchema);

export default ticketMessageModel;