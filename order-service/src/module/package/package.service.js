import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import packageModel from '../../database/model/package.model.js'


export const createPackage = handleAsyncError(async (req, res) => {
    let {name , price, description, level}  = req.body
    let exsistPackage = await packageModel.findOne({ name });
    if (exsistPackage) {
        throw new AppError("Package already exists", 400);
    }
    let addedPackage = await packageModel.create({ name, price, description, level });
    res.json({ message: "Package added successfully", addedPackage })
})

export const getAllActivatedPackages = handleAsyncError(async (req, res) => {
    let packages = await packageModel.find({ isActive: true });
    if (!packages) {
        throw new AppError("No packages found", 400);
    }
    res.json({ message: "Packages found successfully", packages })
})
export const getAllPackages = handleAsyncError(async (req, res) => {
    let packages = await packageModel.find({ });
    if (!packages) {
        throw new AppError("No packages found", 400);
    }
    res.json({ message: "Packages found successfully", packages })
})



export const diactivatePackage = handleAsyncError(async (req, res) => {
    let { packageId } = req.params
    let exsistPackage = await packageModel.findById(packageId);
    if (!exsistPackage) {
        throw new AppError("Package not found", 400);
    }else if (exsistPackage.isActive == false) {
        throw new AppError("Package already deleted", 400);
    }
    let deletedPackage = await packageModel.findByIdAndUpdate({ _id: packageId }, { isActive: false }, { new: true });
    res.json({ message: "Package deleted successfully", deletedPackage })
})

export const hardDeletePackage = handleAsyncError(async (req, res) => {
    let { packageId } = req.params
    let exsistPackage = await packageModel.findById(packageId);

    let deletedPackage = await packageModel.findByIdAndDelete({ _id: packageId });
    if (!deletedPackage) {
        throw new AppError("Package not found", 400);
    }
    res.json({ message: "Package deleted successfully", deletedPackage })
})