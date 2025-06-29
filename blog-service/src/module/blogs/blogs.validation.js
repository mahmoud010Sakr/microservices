import joi from "joi";


export const blogSchema = joi.object({
    title: joi.string().required(),
    content: joi.string().required(),
    image: joi.string().required()
})

export const updateBlogSchema = joi.object({
    title: joi.string().optional(),
    content: joi.string().optional(),
    image: joi.string().optional()
})

export const deleteBlogSchema = joi.object({
    blogId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
})

export const restoreBlogSchema = joi.object({
    blogId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
})


