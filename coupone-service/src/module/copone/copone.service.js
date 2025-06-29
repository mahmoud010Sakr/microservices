import { AppError } from "../../utilts/errorHandling/AppError.js";
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import coponeModel from "../../database/model/copoune.model.js";


export const createCopone = handleAsyncError(async (req, res) => {
    let { code, expires, discount } = req.body
    let exsistCopone = await coponeModel.findOne({ code });
    if (exsistCopone) {
        throw new AppError("Copone already exists", 400);
    }
    let addedCopone = await coponeModel.create({ code, expires, discount });
    res.json({ message: "Copone added successfully", addedCopone })
})

export const getAllCopones = handleAsyncError(async (req, res) => {
    let data = await coponeModel.find();
    if (data) {
        return res.status(200).json({ message: "success", data })
    }
    throw new AppError("No copones found", 400)
})

export const deleteCopone = handleAsyncError(async (req, res) => {
    let { coponeId } = req.params
    let exsistCopone = await coponeModel.findById(coponeId);
    if (exsistCopone.isDeleted == true) {
        throw new AppError("Copone already deleted", 400);
    }
    let deletedCopone = await coponeModel.findByIdAndUpdate({ _id: coponeId }, { isDeleted: true }, { new: true });
    res.json({ message: "Copone deleted successfully", deletedCopone })
})


export const restoreCopone = handleAsyncError(async (req, res) => {
    let { coponeId } = req.params
    let exsistCopone = await coponeModel.findById(coponeId);
    if (exsistCopone.isDeleted == false) {
        throw new AppError("Copone already restored", 400);
    }
    let deletedCopone = await coponeModel.findByIdAndUpdate({ _id: coponeId }, { isDeleted: false }, { new: true });
    res.json({ message: "Copone restored successfully", deletedCopone })
})