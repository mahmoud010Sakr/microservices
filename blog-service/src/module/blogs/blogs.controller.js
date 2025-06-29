import express from "express";
import { auth } from "../../utilts/midlleware/auth.js";
import { validation } from "../../utilts/validation.js";
import { blogSchema, deleteBlogSchema, restoreBlogSchema, updateBlogSchema } from "./blogs.validation.js";
import { checkRole } from "../../utilts/midlleware/role.js";
import { createBlog, deleteBlog, getAllAdminBlogs, getAllBlogs, getAllDeletedBlogs, getBlogById, hardDeleteBlog, restoreBlog, updateBlog } from "./blog.service.js";
import { upload } from "../../utilts/multer.js";
import { uploadToCloudinary } from "../../utilts/multer.js";
const router = express.Router();


router.post('/add-blog', auth, checkRole("Admin"), upload.single('image'), uploadToCloudinary(true, "single"), validation({ body: blogSchema }), createBlog)
router.get('/get-all-blogs', getAllBlogs)
router.get('/get-blog-by-id/:blogId', getBlogById)
router.get('/get-all-admin-blogs', auth, checkRole("Admin"), getAllAdminBlogs)
router.get('/get-all-deleted-blogs', auth, checkRole("Admin"), getAllDeletedBlogs)
router.patch('/restore-blog/:blogId', auth, checkRole("Admin"), validation({ params: restoreBlogSchema }), restoreBlog)
router.patch('/update-blog/:blogId', auth, checkRole("Admin"), upload.single('image'), validation(updateBlogSchema), uploadToCloudinary(false), updateBlog)
router.delete('/delete-blog/:blogId', auth, checkRole("Admin"), validation(deleteBlogSchema), deleteBlog)
router.delete('/hard-delete-blog/:blogId', auth, checkRole("Admin"), hardDeleteBlog)



export default router;