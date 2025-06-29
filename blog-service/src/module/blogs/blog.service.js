import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import blogModel from "../../database/model/blogs.model.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import translations from "../../utilts/translations.js";

export const createBlog = handleAsyncError(async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        throw new AppError(req.__("All fields are required"), 400);
    }
    let exsistBlog = await blogModel.findOne({ title })
    if (exsistBlog) {
        throw new AppError(req.__("Blog already exists"), 400);
    }
    let image;
    if (req.file) {
        image = req.file.cloudinaryResult.secure_url
    } else {
        throw new AppError(req.__("Image is required"), 400);
    }
    const blog = new blogModel({ title, content, image });
    await blog.save();
    return res.status(201).json({ message: 'success', blog });
})

export const getAllBlogs = handleAsyncError(async (req, res, next) => {
    const blogs = await blogModel.find({ isDeleted: false })
    if (!blogs.length) return next(new AppError(req.__("Blog not found"), 404));
    return res.status(200).json({ message: 'success', blogs });
})


export const getBlogById = handleAsyncError(async (req, res) => {
    const { blogId } = req.params
    const blog = await blogModel.findById(blogId)
    console.log(blog);
    if (!blog) {
         throw new AppError(req.__("Blog not found") , 404)
    }
    if (blog.isDeleted) {
        return next(new AppError(req.__("Blog is deleted"), 404));
    }
    if (!blog) return next(new AppError(req.__("Blog not found"), 404));
    return res.status(200).json({ message: 'success', blog });
})

export const getAllAdminBlogs = handleAsyncError(async (req, res, next) => {
    const blogs = await blogModel.find().populate('deletedBy')
    if (!blogs.length) return next(new AppError(req.__("Blog not found"), 404));
    return res.status(200).json({ message: 'success', blogs });
})

export const getAllDeletedBlogs = handleAsyncError(async (req, res, next) => {
    const blogs = await blogModel.find({ isDeleted: true }).populate('deletedBy')
    if (!blogs.length) return res.json({ message: 'No deleted blogs found' });
    return res.status(200).json({ message: 'success', blogs });
})

export const restoreBlog = handleAsyncError(async (req, res, next) => {
    const { blogId } = req.params
    const blog = await blogModel.findById(blogId)
    if (!blog) return next(new AppError(req.__("Blog not found"), 404));
    if (!blog.isDeleted) {
        return next(new AppError(req.__("Blog is not deleted"), 404));
    }
    blog.isDeleted = false;
    blog.deletedAt = null;
    blog.deletedBy = null;
    await blog.save();
    return res.status(200).json({ message: 'success', blog });
})

export const updateBlog = handleAsyncError(async (req, res, next) => {
    const { blogId } = req.params
    const { title, content } = req.body
    const blog = await blogModel.findById(blogId)
    if (!blog) return next(new AppError(req.__("Blog not found"), 404));
    if (req.file) {
        blog.image = req.file.cloudinaryResult.url
    }
    if (title) {
        blog.title = title;
    }
    if (content) {
        blog.content = content;
    }
    await blog.save();
    return res.status(200).json({ message: 'success', blog });
})

export const deleteBlog = handleAsyncError(async (req, res, next) => {
    const { blogId } = req.params
    const blog = await blogModel.findById(blogId)

    if (!blog) return next(new AppError(req.__("Blog not found"), 404));
    if (blog.isDeleted) {
        return next(new AppError(req.__("Blog is deleted"), 404));
    }
    blog.isDeleted = true;
    blog.deletedAt = new Date();
    blog.deletedBy = req.user._id;
    await blog.save();
    return res.status(200).json({ message: 'success', blog });
})

export const hardDeleteBlog = handleAsyncError(async (req, res, next) => { // blog 
    let { blogId } = req.params
    const deleteBlog = await blogModel.findByIdAndDelete(blogId)
    if (!deleteBlog) {
        return res.json({message: "Blog not found"})
    }
    else {
        return res.json({message: "Blog deleted successfully"})
    }
})