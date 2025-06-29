import mongoose, { model } from "mongoose"
import slugify from "slugify"

let categorySchema = new mongoose.Schema({
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

categorySchema.pre('save', function () {
    this.slug = slugify(this.name)
})

const categoriesModel = model('categories', categorySchema)
export default categoriesModel