import productModel from "../../database/model/product.model.js"
import { reviewModel } from "../../database/model/reviews.model.js"
import maintainanceModel from "../../database/model/maintainanceCenter.model.js"
import { AppError } from "../../utilts/errorHandling/AppError.js"
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js"

export const addReview = handleAsyncError(async (req, res) => {
    let { produtId } = req.params
    let { rate, comment } = req.body
    let { id } = req.user
    console.log(produtId);
    let foundedProduct = await productModel.findById(produtId)
    console.log(foundedProduct);
    if (!foundedProduct) {
        throw new AppError('product not found ', 404)
    }
    let addedReview = await reviewModel.insertMany({ comment, product: produtId, user: id, rate })
    if (addedReview) {
        res.status(200).json({ message: "Review added successfully", addedReview })
    }
})


//TODO: m4 mawgoda fl docs 
export const addReviewOnMc = handleAsyncError(async (req, res) => {
    let { MCId } = req.params
    let { data } = req.body
    let { id } = req.user
    let addedReview = await maintainanceModel.findById(MCId)
    if (!addedReview) {
        throw new AppError('MC not found ', 404)
    }
    data.user = id
    addedReview.reviews.push(data)
    res.status(200).json({ message: "Review added successfully", addedReview })
}
)
//TODO: m4 mawgoda fl docs 

export const getAllReviewsMCForAdmin = handleAsyncError(async (req, res) => {
    let { MCId } = req.params
    let data = await maintainanceModel.findById(MCId)
    if (data) {
        return res.status(200).json({ message: "success", reviews: data.reviews })
    }
    throw new AppError("No reviews found", 400)

})
//TODO: m4 mawgoda fl docs 



export const getAllReviews = handleAsyncError(async (req, res) => {
    let { productId } = req.params
    let data = await reviewModel.find({ product: productId, isDeleted: false });
    if (data) {
        return res.status(200).json({ message: "success", data })
    }
    throw new AppError("No reviews found", 400)
})
export const getAllReviewsForAdmin = handleAsyncError(async (req, res) => {
    let { productId } = req.params
    let data = await reviewModel.find({ product: productId });
    if (data) {
        return res.status(200).json({ message: "success", data })
    }
    throw new AppError("No reviews found", 400)
})

export const updateReview = handleAsyncError(async (req, res) => {
    let { id } = req.user
    let { reviewId } = req.params
    let { comment, rate } = req.body
    let foundedReview = await reviewModel.findById(reviewId)
    if (!foundedReview) {
        throw new AppError("Review not found", 400)
    }
    if (foundedReview.user.id !== id) {
        throw new AppError("You can't update this review", 400)
    }
    let updatedReview = await reviewModel.updateOne({ _id: reviewId }, { comment, rate })
    res.status(200).json({ message: "Review updated successfully" })
})


export const deleteReview = handleAsyncError(async (req, res) => {
    let { id } = req.user
    let { reviewId } = req.params
    let foundedReview = await reviewModel.findById(reviewId)
    if (!foundedReview) {
        throw new AppError("Review not found", 400)
    }
    if (foundedReview.user.id != id) {
        throw new AppError("You can't delete this review", 400)
    }
    let deletedReview = await reviewModel.updateOne({ _id: reviewId }, { isDeleted: true })
    res.status(200).json({ message: "Review deleted successfully" })
})


export const adminDeleteReview = handleAsyncError(async (req, res) => {
    let { reviewId } = req.params
    let foundedReview = await reviewModel.findById(reviewId)
    if (!foundedReview) {
        throw new AppError("Review not found", 400)
    }
    let deletedReview = await reviewModel.updateOne({ _id: reviewId }, { isDeleted: true })
    res.status(200).json({ message: "Review deleted successfully" })
})