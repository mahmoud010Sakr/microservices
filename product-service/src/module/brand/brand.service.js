import brandModel from '../../database/model/brand.model.js';
import { AppError } from '../../utilts/errorHandling/AppError.js';
import { handleAsyncError } from '../../utilts/errorHandling/handelAsyncError.js';
import { v2 as cloudinary } from 'cloudinary';

export const createBrand = handleAsyncError(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.en || !name.ar) {
        throw new AppError('Brand name must include both English (en) and Arabic (ar) versions', 400);
    }
    const trimmedName = {
        en: name.en.trim(),
        ar: name.ar.trim()
    };
    const existingBrand = await brandModel.findOne({
        $or: [
            { 'name.en': trimmedName.en },
            { 'name.ar': trimmedName.ar }
        ]
    });
    if (existingBrand) {
        throw new AppError('Brand with this name already exists', 400);
    }
    if (!req.file) {
        throw new AppError('Brand logo image is required', 400);
    }
    const logoUrl = req.file.cloudinaryResult?.secure_url || req.file.cloudinaryResult?.url;
    if (!logoUrl) {
        throw new AppError('Failed to process brand logo', 500);
    }
    const addedBrand = await brandModel.create({
        name: trimmedName,
        logo: logoUrl
    });
    res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: addedBrand
    });
});

export const getAllBrands = handleAsyncError(async (req, res) => {
    const brands = await brandModel.find({ isDeleted: { $ne: true } });
    if (!brands || brands.length === 0) {
        return res.json({ message: 'No active brands found' });
    }
    res.json({ message: 'Brands found successfully', brands });
});

export const getBrandById = handleAsyncError(async (req, res) => {
    const { brandId } = req.params;
    const brand = await brandModel.findById(brandId);
    if (!brand) {
        throw new AppError('Brand not found', 404);
    }
    if (brand.isDeleted) {
        throw new AppError('Brand is deleted', 400);
    }
    res.json({ message: 'Brand found successfully', brand });
});

export const getAllAdminBrands = handleAsyncError(async (req, res) => {
    const brands = await brandModel.find().populate('deletedBy', { name: 1, email: 1, phone: 1 });
    if (!brands || brands.length === 0) {
        return res.json({ message: 'No brands found' });
    }
    res.json({ message: 'All brands retrieved successfully', brands });
});

export const getAllDeletedBrands = handleAsyncError(async (req, res) => {
    const brands = await brandModel.find({ isDeleted: true }).populate('deletedBy', { name: 1, email: 1, phone: 1 });
    if (!brands || brands.length === 0) {
        return res.json({ message: 'No deleted brands found' });
    }
    res.json({ message: 'Deleted brands retrieved successfully', brands });
});

export const updateBrand = handleAsyncError(async (req, res) => {
    const { brandId } = req.params;
    const { name } = req.body;
    const existingBrand = await brandModel.findById(brandId);
    if (!existingBrand) {
        throw new AppError('Brand not found', 404);
    }
    if (existingBrand.isDeleted) {
        throw new AppError('Brand is deleted', 400);
    }
    if (req.file) {
        if (existingBrand.logo) {
            const publicId = existingBrand.logo.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        existingBrand.logo = req.file.cloudinaryResult.url;
    }
    if (name) existingBrand.name = name;
    const updatedBrand = await existingBrand.save();
    return res.json({ message: 'Brand updated successfully', updatedBrand });
});

export const deleteBrand = handleAsyncError(async (req, res) => {
    const { brandId } = req.params;
    const existingBrand = await brandModel.findById(brandId);
    if (!existingBrand) {
        throw new AppError('Brand not found', 404);
    }
    if (existingBrand.isDeleted) {
        throw new AppError('Brand is already deleted', 400);
    }
    existingBrand.isDeleted = true;
    existingBrand.deletedAt = new Date();
    existingBrand.deletedBy = req.user._id;
    const deletedBrand = await existingBrand.save();
    res.json({ message: 'Brand deleted successfully', deletedBrand });
});


export const restoreBrand = handleAsyncError(async (req, res) => {
    const { brandId } = req.params;
    const existingBrand = await brandModel.findById(brandId);
    if (!existingBrand) {
        throw new AppError('Brand not found', 404);
    }
    if (!existingBrand.isDeleted) {
        throw new AppError('Brand is not deleted', 400);
    }
    existingBrand.isDeleted = false;
    existingBrand.deletedAt = null;
    existingBrand.deletedBy = null;
    const restoredBrand = await existingBrand.save();
    res.json({ message: 'Brand restored successfully', restoredBrand });
});


export const hardDeleteBrand = handleAsyncError(async (req, res) => {
    let { brandId } = req.params
    let deletedBrand = await brandModel.findByIdAndDelete(brandId);
    if (!deletedBrand) {
        throw new AppError('Brand not found', 404);
    }
    res.json({ message: 'Brand deleted successfully', deletedBrand });

})