import { Schema, model } from 'mongoose';

const packageSchema = new Schema({
    name: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
    },
    description: String,
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    level: {
        type: String,
        enum: ['Diamond', 'Gold', 'Silver', 'Bronze'],
        required: true
    },
    agentId: [{
        agent: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    }]
}, { timestamps: true });

const packageModel = model('Package', packageSchema);
export default packageModel