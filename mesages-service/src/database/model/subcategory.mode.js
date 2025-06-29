import mongoose from "mongoose"
import slugify from "slugify"
const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: [2, 'to short product name']
    },
    slug: {
        type: String,
        lowercase: true
    },
    image: {
        type: String,
        required: true
    }
    ,
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    deletedAt: {
        type: Date
    }
})
subcategorySchema.pre('save', function () {
    this.slug = slugify(this.name)
})
const subCategoryModel = mongoose.model('subCategory', subcategorySchema)
export default subCategoryModel