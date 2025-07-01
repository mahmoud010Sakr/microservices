import categoriesModel from "../../database/model/category.model.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import subCategoryModel from '../../database/model/subcategory.mode.js'
import { v2 as cloudinary } from 'cloudinary';


export const createSubCategory = handleAsyncError(async (req, res) => {
    let { name, categoryId } = req.body
    let exsistSubCategory = subCategoryModel.findOne({ name });
    if (exsistSubCategory.lenght == 0) {
        throw new AppError("Category already exists", 400);
    }
    let exsistCategory = await categoriesModel.findById(categoryId);
    if (!exsistCategory) {
        throw new AppError("Category not found", 400);
    }
    let image = ''
    if (!req.file) {
        throw new AppError("Image is required", 400);
    }
    image = req.file.cloudinaryResult.url
    let addedSubCategory = await subCategoryModel.create({ name, image, categoryId });
    res.json({ message: "subCategory added successfully", addedSubCategory })
})

export const getAllSubCategories = handleAsyncError(async (req, res) => {
    let subCategories = await subCategoryModel.find({ isDeleted: false }).populate('categoryId', { name: 1, image: 1 });
    if (!subCategories) {
        res.json({ message: "No categories found or something went wrong" })
    }
    res.json({ message: "Categories found successfully", subCategories })
})
//
export const getAdminSubCategories = handleAsyncError(async (req, res) => {
    let subCategories = await subCategoryModel.find().populate('categoryId', { name: 1, image: 1 });
    if (!subCategories) {
        res.json({ message: "No categories found or something went wrong" })
    }
    res.json({ message: "Categories found successfully", subCategories })
})


export const deleteSubCategory = handleAsyncError(async (req, res) => {
    let { subCategoryId } = req.params
    let exsistCatefory = await subCategoryModel.findById(subCategoryId);
    if (!exsistCatefory) {
        throw new AppError("Sub Category not found", 400);
    }
    if (exsistCatefory.isDeleted == true) {
        throw new AppError("Sub Category is already deleted", 400);
    }
    exsistCatefory.isDeleted = true;
    exsistCatefory.deletedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    exsistCatefory.deletedBy = req.user._id;
    let deletedCategory = await exsistCatefory.save();
    res.json({ message: "SubCategory deleted successfully", deletedCategory })
})




export const getSubCategoryById = handleAsyncError(async (req, res) => {
    let { subCategoryId } = req.params
    let exsistCatefory = await subCategoryModel.findById(subCategoryId).populate('categoryId', { name: 1, image: 1 });
    if (!exsistCatefory) {
        throw new AppError("Sub Category not found", 400);
    }
    if (exsistCatefory.isDeleted == true) {
        throw new AppError("Sub Category is already deleted", 400);
    }
    res.json({ message: "Sub Category found successfully", exsistCatefory })
})

export const getAllDeletedSubCategories = handleAsyncError(async (req, res) => {
    let subCategories = await subCategoryModel.find({ isDeleted: true }).populate('deletedBy', { name: 1, email: 1, phone: 1 });
    if (!subCategories) {
        res.json({ message: "No categories found or something went wrong" })
    }
    res.json({ message: "Categories found successfully", subCategories })
})

export const restoreSubCategory = handleAsyncError(async (req, res) => {
    let { subCategoryId } = req.params
    let exsistCatefory = await subCategoryModel.findById(subCategoryId);
    if (!exsistCatefory) {
        throw new AppError(" Sub Category not found", 400);
    }
    if (exsistCatefory.isDeleted == false) {
        throw new AppError(" Sub Category is not deleted", 400);
    }
    exsistCatefory.isDeleted = false;
    exsistCatefory.deletedAt = null;
    exsistCatefory.deletedBy = null;
    let deletedCategory = await exsistCatefory.save();
    res.json({ message: "Sub Category restored successfully", deletedCategory })
})

export const updateSubCategory = handleAsyncError(async (req, res) => {
    let { subCategoryId } = req.params;
    let { name, slug } = req.body;
    let existingCategory = await subCategoryModel.findById(subCategoryId);
    if (!existingCategory) {
        throw new AppError("Category not found", 400);
    }

    if (req.file) {
        if (existingCategory.image) {
            let publicId = existingCategory.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        existingCategory.image = req.file.cloudinaryResult.url;
    }
    existingCategory.name = name;
    existingCategory.slug = slug;
    let updatedCategory = await existingCategory.save();
    res.json({ message: "Category updated successfully", updatedCategory })
})