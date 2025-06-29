import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endingTime: {
        type: Date,
        default: function () {
            const endDate = new Date(this.startingTime || Date.now());
            endDate.setFullYear(endDate.getFullYear() + 1);
            return endDate;
        }
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    payment: {
        gateway: { type: String, default: 'tap' },
        transactionId: String,
        amount: Number,
        currency: { type: String, default: 'SAR' },
        status: String,
        paymentDate: Date
    },
    isActive: {
        type: Boolean,
        default: true
    } // test 
}, { timestamps: true });
const subscriptionModel = mongoose.model('Subscription', subscriptionSchema);
export default subscriptionModel