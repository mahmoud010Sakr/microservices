import mongoose, { Schema, Types } from "mongoose";

const agentProductsSchema = new Schema({
    agentId: {
        type: Types.ObjectId,
        ref: "user",
        required: [true, "Agent ID is required"],
        index: true
    },
    productId: {
        type: Types.ObjectId,
        ref: "product",
        required: [true, "Product ID is required"],
        index: true
    },
    brandId: {
        type: [Types.ObjectId],
        ref: "brand",
        required: [true, "Brand ID is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    vendorPrice: {
        type: Number,
        default: 0,
        min: [0, "Vendor price cannot be negative"]
    },
    priceAfterDiscount: {
        type: Number,
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, "Stock cannot be negative"]
    },
    sold: {
        type: Number,
        default: 0,
        min: [0, "Sold count cannot be negative"]
    },
    status: {
        type: String,
        enum: ["active", "inactive", "out_of_stock"],
        default: "active"
    },
    tags: [{
        type: Types.ObjectId,
        ref: "tag"
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

agentProductsSchema.index({ agentId: 1, productId: 1 }, { unique: true });
agentProductsSchema.index({ status: 1 });

agentProductsSchema.pre('save', function (next) {
    if (this.stock <= 0) {
        this.status = 'out_of_stock';
    }
    next();
});

agentProductsSchema.virtual('profitMargin').get(function () {
    if (!this.vendorPrice || this.vendorPrice === 0) return 0;
    return ((this.price - this.vendorPrice) / this.vendorPrice) * 100;
});

agentProductsSchema.methods.isAvailable = function () {
    return this.status === 'active' && this.stock > 0;
};

agentProductsSchema.statics.findAvailableByAgent = function (agentId) {
    return this.find({
        agentId,
        status: 'active',
        stock: { $gt: 0 }
    }).populate('productId');
};

const AgentProduct = mongoose.model("agentProduct", agentProductsSchema);

export default AgentProduct;

