import { reviewModel } from "../../database/model/reviews.model.js";
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import productModel from "../../database/model/product.model.js";
import userModel from "../../database/model/user.model.js";
import tireModel from '../../database/model/tires.model.js'
import mongoose from "mongoose";
import translations from "../../utilts/translations.js";

const addToWishList = handleAsyncError(async (req, res, next) => {
  const { productId } = req.body;
  let { id } = req.user;
  const user = await userModel.findById(id);
  if (!user) {
    return next(new AppError("User Not Found", 404));
  }
  let product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("Product Not Found", 404));
  }
  if (user.wishList.includes(productId)) {
    return next(new AppError("Product already exists in wishlist", 400));
  }
  user.wishList.push(productId);
  await user.save();
  console.log(user);

  res.status(200).json({ message: "success", wishList: user.wishList, product });
});

const deleteFromWishList = handleAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError("Invalid product ID", 400));
  }
  const user = await userModel.findById(req.user._id);
  console.log(user);

  if (!user) {
    return next(new AppError("User Not Found", 404));
  }
  if (!user.wishList.includes(productId)) {
    return next(new AppError("Product not found in wishlist", 404));
  }
  user.wishList.pull(productId);
  await user.save();
  const updatedUser = await userModel
    .findById(req.user._id)
    .populate({
      path: "wishList",
      model: "product",
      match: { isDeleted: false },
    })
    .select("wishList")
    .lean();
  res.status(200).json({
    message: {
      en: translations["Product removed from wishlist"]?.en || "Product removed from wishlist",
      ar: translations["Product removed from wishlist"]?.ar || "تم إزالة المنتج من قائمة الرغبات"
    }, wishList: updatedUser.wishList
  });
});

const getAllWishList = handleAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id)
    .populate({
      path: 'wishList',
      model: 'product',
      populate: [
        // { path: 'category', model: 'categories' },
        // { path: 'subCategory', model: 'subCategory' },
      ]
    })
    .select("wishList")
    .lean();

  if (!user) {
    return next(new AppError("User Not Found", 404));
  }

  const wishListWithDetails = await Promise.all(
    user.wishList.map(async (product) => {

      let details = {};
      if (product.productType === 'tire') {
        const tire = await tireModel.findOne({ productId: product._id }).lean();
        console.log(tire, "55555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555");

        if (tire) {
          details = tire;
        }
      }
      return { ...product, details };
    })
  );

  res.status(200).json({ message: "success", wishList: wishListWithDetails });
});

export { addToWishList, deleteFromWishList, getAllWishList };
