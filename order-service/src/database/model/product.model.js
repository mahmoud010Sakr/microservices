import mongoose, { Schema, Types } from "mongoose";
import slugify from "slugify";
import { model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: {
      en: { type: String, lowercase: true },
      ar: { type: String, lowercase: true },
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    // price: { type: Number, required: true }, // phaze one 
    imageCover: { type: String, required: true },
    images: { type: [String], required: true },
    category: { type: Types.ObjectId, ref: "categories", required: true },
    subCategory: { type: Types.ObjectId, ref: "subCategory", required: true },
    productType: { type: String, enum: ["tire", "battery", "oil", "service", "accessories"] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.add({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Types.ObjectId, ref: "user", default: null },
});

productSchema.pre("save", function () {
  this.slug.en = slugify(this.name.en, { lower: true });
  this.slug.ar = slugify(this.name.ar, { lower: true });
});

productSchema.virtual("reviews", {
  ref: "reviews",
  localField: "_id",
  foreignField: "product",
});

productSchema.virtual("agentOfferings", {
  ref: "agentProduct",
  localField: "_id",
  foreignField: "productId",
  options: { match: { status: "active" } }
});

productSchema.pre(/^find/, function () {
  this.populate("reviews");
});

productSchema.methods.getAgentOfferings = function() {
  return this.model("agentProduct").find({
    productId: this._id,
    status: "active",
    stock: { $gt: 0 }
  }).populate("agentId", "name email phone");
};

productSchema.methods.getLowestPrice = function() {
  return this.model("agentProduct")
    .findOne({
      productId: this._id,
      status: "active",
      stock: { $gt: 0 }
    })
    .sort({ priceAfterDiscount: 1 })
    .then(offering => offering ? offering.priceAfterDiscount : null);
};
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    if (update.name.en) {
      update.slug = update.slug || {};
      update.slug.en = slugify(update.name.en, { lower: true });
    }
    if (update.name.ar) {
      update.slug = update.slug || {};
      update.slug.ar = slugify(update.name.ar, { lower: true });
    }
  }
  next();
});

const productModel = model("product", productSchema);

export default productModel;
