import mongoose, { Schema } from "mongoose"
import slugify from "slugify"

const TagSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tag name is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
})
TagSchema.pre('save', function () {
    if (this.name) {
        this.slug = slugify(this.name.toLowerCase())
    }
})
const tagModel = mongoose.model("tag", TagSchema)
export default tagModel