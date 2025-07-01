import categoriesModel from '../../database/model/category.model.js';
import { AppError } from '../../utilts/errorHandling/AppError.js';
import { handleAsyncError } from '../../utilts/errorHandling/handelAsyncError.js'
import { v2 as cloudinary } from 'cloudinary';

export const createCategory = handleAsyncError(async (req, res) => {

    let { name } = req.body
    let exsistCatefory = categoriesModel.findOne({ name });
    if (exsistCatefory.lenght == 0) {
        throw new AppError("Category already exists", 400);
    }
    let image = ''
    if (req.file) {
        image = req.file.cloudinaryResult.url
        let addedCategory = await categoriesModel.create({ name, image });
        res.json({ message: "Category added successfully", addedCategory })
    }
    if (!req.file) {
        throw new AppError("Image is required", 400);
    }
})
export const getCategoryById = handleAsyncError(async (req, res) => {
    let { categoryId } = req.params
    let exsistCatefory = await categoriesModel.findById(categoryId);
    if (!exsistCatefory) {
        throw new AppError("Category not found", 400);
    }
    if (exsistCatefory.isDeleted == true) {
        throw new AppError("Category is already deleted", 400);
    }
    res.json({ message: "Category found successfully", exsistCatefory })
})

export const getAllCategories = handleAsyncError(async (req, res) => {
    let categories = await categoriesModel.find({ isDeleted: false });
    console.log(categories);

    if (!categories) {
        res.json({ message: "No categories found or something went wrong" })
    }
    res.json({ message: "Categories found successfully", categories })
})

export const deleteCategory = handleAsyncError(async (req, res) => {
    let { categoryId } = req.params
    let exsistCatefory = await categoriesModel.findById(categoryId).populate('deletedBy', { name: 1, email: 1, phone: 1 });
    if (!exsistCatefory) {
        throw new AppError("Category not found", 400);
    }
    if (exsistCatefory.isDeleted == true) {
        throw new AppError("Category is already deleted", 400);
    }
    exsistCatefory.isDeleted = true;
    exsistCatefory.deletedAt = new Date();
    exsistCatefory.deletedBy = req.user._id;
    let deletedCategory = await exsistCatefory.save();
    res.json({ message: "Category deleted successfully", deletedCategory })
})



export const getAllDeletedCategories = handleAsyncError(async (req, res) => {
    let categories = await categoriesModel.find({ isDeleted: true }).populate('deletedBy', { name: 1, email: 1, phone: 1 });
    console.log(categories);

    if (!categories) {
        res.json({ message: "No categories found or something went wrong" })
    }
    res.json({ message: "Categories found successfully", categories })
})
export const getAllAdminCategories = handleAsyncError(async (req, res) => {
    let categories = await categoriesModel.find().populate('deletedBy', { name: 1, email: 1, phone: 1 });
    if (!categories) {
        res.json({ message: "No categories found or something went wrong" })
    }
    res.json({ message: "Categories found successfully", categories })
})

export const restoreCategory = handleAsyncError(async (req, res) => {
    let { categoryId } = req.params
    let exsistCatefory = await categoriesModel.findById(categoryId);
    if (!exsistCatefory) {
        throw new AppError("Category not found", 400);
    }
    if (exsistCatefory.isDeleted == false) {
        throw new AppError("Category is not deleted", 400);
    }
    exsistCatefory.isDeleted = false;
    exsistCatefory.deletedAt = null;
    exsistCatefory.deletedBy = null;
    let deletedCategory = await exsistCatefory.save();
    res.json({ message: "Category restored successfully", deletedCategory })
})

export const updateCategory = handleAsyncError(async (req, res) => {
    let { categoryId } = req.params;
    let { name, slug } = req.body;
    let existingCategory = await categoriesModel.findById(categoryId);
    if (!existingCategory) {
        throw new AppError("Category not found", 400);
    }
    if (req.file) {
        if (existingCategory.image) {
            let publicId = existingCategory.image.split('/').pop().split('.')[0];
            console.log(publicId);
            await cloudinary.uploader.destroy(publicId);
        }
        existingCategory.image = req.file.cloudinaryResult.url;
    }
    existingCategory.name = name;
    existingCategory.slug = slug;
    let updatedCategory = await existingCategory.save();
    res.json({ message: "Category updated successfully", updatedCategory });
});
