const translations = {
  "Invalid token": { en: "Invalid token", ar: "رمز غير صالح" },
  "Apple public key not found": { en: "Apple public key not found", ar: "مفتاح أبل العام غير موجود" },
  "Apple token verification failed": { en: "Apple token verification failed", ar: "فشل التحقق من رمز أبل" },
  "Identity token is required": { en: "Identity token is required", ar: "مطلوب رمز التعريف" },
  "Unable to retrieve email": { en: "Unable to retrieve email", ar: "لا يمكن استرداد البريد الإلكتروني" },
  "Passwords do not match": { en: "Passwords do not match", ar: "كلمتا المرور غير متطابقتين" },
  "You must agree to the terms and conditions": { en: "You must agree to the terms and conditions", ar: "يجب الموافقة على الشروط والأحكام" },
  "User already exists": { en: "User already exists", ar: "المستخدم موجود بالفعل" },
  "User not found": { en: "User not found", ar: "المستخدم غير موجود" },
  "Email verified successfully": { en: "Email verified successfully", ar: "تم التحقق من البريد الإلكتروني بنجاح" },
  "Email not verified": { en: "Email not verified", ar: "البريد الإلكتروني غير موثق" },
  "Invalid credentials": { en: "Invalid credentials", ar: "بيانات الاعتماد غير صالحة" },
  "Invalid token": { en: "Invalid token", ar: "رمز غير صالح" },
  "Invalid OTP": { en: "Invalid OTP", ar: "رمز غير صالح" },
  "Password reset successfully": { en: "Password reset successfully", ar: "تم تغيير كلمة المرور بنجاح" },
  "Logout successful": { en: "Logout successful", ar: "تم تسجيل الخروج بنجاح" },
  "Email sent successfully": { en: "Email sent successfully", ar: "تم إرسال البريد الإلكتروني بنجاح" },
  "Error merging carts": { en: "Error merging carts", ar: "خطأ في دمج العربات" },
  "Product added to cart": { en: "Product added to cart", ar: "تم إضافة المنتج إلى العربة" },
  "Product removed from cart": { en: "Product removed from cart", ar: "تم إزالة المنتج من العربة" },
  "Product quantity updated": { en: "Product quantity updated", ar: "تم تحديث كمية المنتج" },
  "Cart deleted successfully": { en: "Cart deleted successfully", ar: "تم حذف العربة بنجاح" },
  "Coupon applied successfully": { en: "Coupon applied successfully", ar: "تم تطبيق الكوبون بنجاح" },
  "Coupon is expired or invalid": { en: "Coupon is expired or invalid", ar: "الكوبون غير صالح أو منتهٔ" },
  "Coupon applied successfully": { en: "Cart not found", ar: "العربة غير موجودة" },
  "Product not found in cart": { en: "Product not found in cart", ar: "المنتج غير موجود في العربة" },
  "Item not found in cart": { en: "Item not found in cart", ar: "العنصر غير موجود في العربة" },
  "Insufficient stock": { en: "Insufficient stock", ar: "الإمكانيات غير كافية" },
  "Success": { en: "Success", ar: "نجاح" },
  "Product does not exist": { en: "Product does not exist", ar: "المنتج غير موجود" },
  "Invalid product id": { en: "Invalid product id", ar: "رقم المنتج غير صالح" },
  "You must to signup": { en: "You must to signup", ar: "يجب عليك التسجيل" },
  "Invalid session id": { en: "Invalid session id", ar: "رقم الجلسة غير صالح" },
  "Internal server error": { en: "Internal server error", ar: "خطأ في الخادم" },
  "Images required": { en: "Images required", ar: "الصور مطلوبة" },
  "Brand not found": { en: "Brand not found", ar: "العلامة التجارية غير موجودة" },
  "Product name required": { en: "Product name required", ar: "اسم المنتج مطلوب" },
  "User is deleted": { en: "User is deleted", ar: "المستخدم تم حذفه" },
  "Product created successfully": { en: "Product created successfully", ar: "تم إنشاء المنتج بنجاح" },
  "Product updated successfully": { en: "Product updated successfully", ar: "تم تحديث المنتج بنجاح" },
  "Product deleted successfully": { en: "Product deleted successfully", ar: "تم حذف المنتج بنجاح" },
  "Product not found": { en: "Product not found", ar: "المنتج غير موجود" },
  "Product not found in cart": { en: "Product not found in cart", ar: "المنتج غير موجود في العربة" },
  "Products retrieved successfully": { en: "Products retrieved successfully", ar: "تم استرجاع المنتجات بنجاح" },
  "Product is deleted": { en: "Product is deleted", ar: "المنتج تم حذفه" },
  "Product is not deleted": { en: "Product is not deleted", ar: "المنتج غير محذوف " },
  "Product restored": { en: "Product restored", ar: "تم استرجاع المنتج" },
  "Tag removed": { en: "Tag removed", ar: "تم إزالة العلامة" },
  "Tag added": { en: "Tag added", ar: "تم إضافة العلامة" },
  "no_tag_provided": { en: "no_tag_provided", ar: "لا يوجد علامة" },
  "Product removed from wishlist": { en: "Product removed from wishlist", ar: "تم إزالة المنتج من قائمة المفضلة" },
  "Ticket not found": { en: "Ticket not found", ar: "الشكاوى غير موجودة" },
  "Ticket status is already updated": { en: "Ticket status is already updated", ar: "تم تحديث حالة الشكوى" },
};




/**
 * Helper to get translation by key and language.
 * @param {string} key - The translation key
 * @param {string} lang - 'ar' or 'en'
 * @returns {string}
 */
export function translate(key, lang = 'en') {
  if (translations[key]) {
    return translations[key][lang] || translations[key].en;
  }
  return key; // fallback to the key if not found
}

export default translations;
