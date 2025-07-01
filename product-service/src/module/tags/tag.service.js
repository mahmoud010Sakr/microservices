import { handleAsyncError } from '../../utilts/errorHandling/handelAsyncError.js';
import { AppError } from '../../utilts/errorHandling/AppError.js';
import tagModel from '../../database/model/tag.model.js';

export const createTag = handleAsyncError(async (req, res) => {
    const { name } = req.body;
    


    const existingTag = await tagModel.findOne({ name, isDeleted: false });
    if (existingTag) {
        throw new AppError(req.__('tag_already_exists'), 400);
    }

    const tag = await tagModel.create({
        name,
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        message: req.__('tag_created'),
        data: tag
    });
});

export const getAllTags = handleAsyncError(async (req, res) => {
    const tags = await tagModel.find({ isDeleted: false })
        .select('name slug createdAt')
        .sort('-createdAt');
    res.status(200).json({
        status: 'success',
        data: tags
    });
});

export const getTag = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const tag = await tagModel.findOne({ _id: id, isDeleted: false });
    if (!tag) {
        throw new AppError(req.__('tag_not_found'), 404);
    }
    res.status(200).json({
        status: 'success',
        data: tag
    });
});

export const updateTag = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const tag = await tagModel.findOne({ _id: id, isDeleted: false });
    if (!tag) {
        throw new AppError(req.__('tag_not_found'), 404);
    }
    if (name !== tag.name) {
        const existingTag = await tagModel.findOne({ name, isDeleted: false });
        if (existingTag) {
            throw new AppError(req.__('tag_already_exists'), 400);
        }
    }
    tag.name = name;
    await tag.save();
    res.status(200).json({
        status: 'success',
        message: req.__('tag_updated'),
        data: tag
    });
});

export const deleteTag = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const tag = await tagModel.findOne({ _id: id, isDeleted: false });
    if (!tag) {
        throw new AppError(req.__('tag_not_found'), 404);
    }
    tag.isDeleted = true;
    await tag.save();
    res.status(200).json({
        status: 'success',
        message: req.__('tag_deleted')
    });
});