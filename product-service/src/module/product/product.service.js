import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";



import tagModel from "../../database/model/tag.model.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import productModel from "../../database/model/product.model.js";
import tireModel from "../../database/model/tires.model.js";
import { v2 as cloudinary } from "cloudinary";
import brandModel from "../../database/model/brand.model.js";
import userModel from "../../database/model/user.model.js";
import batteryModel from "../../database/model/battary.model.js";
import oilModel from "../../database/model/oil.model.js";
import AgentProduct from "../../database/model/agentProducts.js";
import categoriesModel from "../../database/model/category.model.js";
import subCategoryModel from "../../database/model/subcategory.mode.js";
import packageModel from "../../database/model/package.model.js";
import subscriptionModel from "../../database/model/subscription.model.js";
const localizeProduct = (product, lang) => ({
  ...product.toJSON(),
  name: product.name,
  slug: product.slug,
  description: product.description,
});

export const addBrandToProduct = handleAsyncError(async (req, res) => {
  const { productId } = req.params;
  const { brandId } = req.body;
  const product = await productModel.findById(productId);
  if (!product) {
    throw new AppError(req.__("product_not_found"), 404);
  }
  const brand = await brandModel.findById(brandId);
  if (!brand) {
    throw new AppError(req.__("brand_not_found"), 404);
  }
  if (!product.brand.includes(brandId)) {
    product.brand.push(brandId);
    await product.save();
  }
  res.status(200).json({
    status: "success",
    message: req.__("brand_added_to_product"),
    data: product
  });
});


export const createProduct = handleAsyncError(async (req, res) => {
  const {
    name,
    description,
    category,
    subCategory,
    productType,
    productionCountry,
    tire_width,
    aspect_ratio,
    wheel_diameter,
    speed_rating,
    load_index,
    extra_load,
    tire_type,
    tire_brand,
    yearOfProduction,
    warranty,
    tireDrawType,
    voltage,
    capacity,
    dimention,
    weight,
    liters,
    viscosity
  } = req.body;
  const lang = req.getLocale();
  if (!req.files || !req.files.images || !req.files.imageCover) {
    throw new AppError(req.__("Images required"), 400);
  }
  const imageCover = req.files.imageCover[0].cloudinaryResult.secure_url;
  const images = req.files.images.map((file) => file.cloudinaryResult.secure_url);
  let ENproductName, ARproductName;
  const brandDataPromise = productType === "tire" ? brandModel.findById(tire_brand)
    : brandModel.findById(brand);
  const brandData = await brandDataPromise;
  if (!brandData) throw new AppError(req.__("Brand not found"), 404);
  if (productType === "tire") {
    ENproductName = `tire ${brandData.name.en} ${tire_width}/${aspect_ratio} R${wheel_diameter} ${load_index || ""}${speed_rating || ""} ${extra_load ? "XL" : ""}`.trim();
    ARproductName = ` إطار ${brandData.name.ar} ${tire_width}/${aspect_ratio} R${wheel_diameter} ${load_index || ""}${speed_rating || ""} ${extra_load ? "XL" : ""}`.trim();
  } else if (productType === "battery") {
    ENproductName = ` Battery ${brandData.name.en} ${voltage || ""} volt ${capacity || ""}Ah ${dimention || ""} ${weight || ""}Kg`.trim();
    ARproductName = `بطارية ${brandData.name.ar} ${voltage || ""} ${capacity || ""}Ah ${dimention || ""} ${weight || ""}Kg`.trim();
  } else if (productType === "oil") {
    ENproductName = `Oil ${brandData.name.en} ${liters || ""} liter - ${viscosity || ""}`.trim();
    ARproductName = `زيت ${brandData.name.ar} ${liters || ""} ليتر - ${viscosity || ""}`.trim();
  } else {
    if (name) {
      ENproductName = name.en;
      ARproductName = name.ar;
    } else {
      throw new AppError(req.__("Product name required"), 400);
    }
  }

  const userData = await userModel.findById(req.user.id);
  if (!userData) throw new AppError(req.__("User not found"), 404);
  if (userData.isDeleted) throw new AppError(req.__("User is deleted"), 400);

  let exsistProduct = await productModel.findOne({ name: { en: ENproductName, ar: ARproductName } });
  if (exsistProduct) throw new AppError(req.__("Product already exists"), 400);
  // Ensure description is an object with en and ar fields
  let descriptionObj;
  try {
    descriptionObj = typeof description === 'string' ? JSON.parse(description) : description;
  } catch (e) {
    throw new AppError(req.__("Invalid description format"), 400);
  }
  if (!descriptionObj || !descriptionObj.en || !descriptionObj.ar) {
    throw new AppError(req.__("Description in both English and Arabic is required"), 400);
  }

  const product = await productModel.create({
    name: {
      en: ENproductName,
      ar: ARproductName
    },
    description: descriptionObj,
    imageCover,
    images,
    category,
    subCategory,
    brand: brandData._id,
    productType,
  });

  const additionalData = {};


  if (productType === "tire") {
    additionalData.addedTire = await tireModel.create({
      tire_width,
      aspect_ratio,
      wheel_diameter,
      speed_rating,
      productionCountry,
      load_index,
      extra_load,
      tire_type,
      tire_brand,
      yearOfProduction,
      warranty,
      weight,
      tireDrawType,
      productId: product._id,
    });
  } else if (productType === "battery") {
    additionalData.addedBattery = await batteryModel.create({
      voltage,
      capacity,
      dimention,
      weight,
      brandId: brandData._id,
      productId: product._id,
    });
  } else if (productType === "oil") {
    additionalData.addedOil = await oilModel.create({
      liters,
      viscosity,
      brandId: brandData._id,
      productId: product._id,
    });
  }

  res.json({
    message: req.__("Product created successfully"),
    product: localizeProduct(product, lang),
    ...additionalData,
  });
});

export const getAllProducts = handleAsyncError(async (req, res) => {
  let page = req.query.page * 1 || 1;
  if (page <= 0) page = 1;
  let limit = req.query.limit * 1 || 10;
  if (limit <= 0) limit = 10;
  const skip = (page - 1) * limit;
  const products = await productModel
    .find({ isDeleted: false })
    .populate("category", "name")
    .populate("subCategory", "name")
    .skip(skip)
    .limit(limit)
    .select(" images imageCover name slug price vendorPrice priceAfterDiscount stock sold isDeleted discountEndTime productType");

  if (!products.length) return res.json({ message: req.__("Product not found") });
  const localizedProducts = products.map((product) =>
    localizeProduct(product, req.getLocale())
  );
  res.json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,

  });
});

export const getProductById = handleAsyncError(async (req, res) => {
  const { productId } = req.params;
  const lang = req.getLocale();
  const product = await productModel
    .findById(productId)
    .select("-__v -_id -isDeleted -deletedBy")
    .populate("category", "name")
    .populate("subCategory", "name")

  if (!product) throw new AppError(req.__("Product not found"), 404);
  if (product.isDeleted) throw new AppError(req.__("Product deleted"), 400);

  if (product.productType === "tire") {
    const addedTire = await tireModel.findOne({ productId: product._id });
    return res.json({
      message: req.__("Product retrieved successfully"),
      product: localizeProduct(product, lang),
      addedTire,
    });
  }
  res.json({
    message: req.__("Product retrieved successfully"),
    product: localizeProduct(product, lang),
  });
});

export const getAllAdminProducts = handleAsyncError(async (req, res) => {
  const lang = req.getLocale();
  const products = await productModel
    .find()
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("brand", "name image")
    .populate("deletedBy", "name email");

  if (!products.length) return res.json({ message: req.__("no_products") });
  const result = await Promise.all(
    products.map(async (product) => {
      const localizedProduct = localizeProduct(product, lang);
      if (product.productType === "tire") {
        const addedTire = await tireModel.findOne({ productId: product._id });
        return {
          product: localizedProduct,
          addedTire: addedTire ? addedTire.toJSON() : null,
        };
      }
      return { product: localizedProduct, addedTire: null };
    })
  );

  res.json({ message: req.__("Products retrieved successfully"), data: result });
});

export const getAllDeletedProducts = handleAsyncError(async (req, res) => {
  const lang = req.getLocale();
  const products = await productModel
    .find({ isDeleted: true })
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("brand", "name image")
    .populate("deletedBy", "name email");

  if (!products.length)
    return res.json({ message: req.__("Product not found") });

  const localizedProducts = products.map((product) =>
    localizeProduct(product, lang)
  );
  res.json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
  });
});

export const updateProduct = handleAsyncError(async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    description,
    category,
    productionCountry,
    subCategory,
    brand,
    productType,
    discountEndTime,
    tireData,
    batteryData,
    oilData,
  } = req.body;
  const lang = req.getLocale();

  const [product, brandData] = await Promise.all([
    productModel.findById(productId),
    brand ? brandModel.findById(brand) : Promise.resolve(null)
  ]);



  if (!product) throw new AppError(req.__("product_not_found"), 404);
  if (product.isDeleted) throw new AppError(req.__("product_deleted"), 400);
  if (brand && !brandData) throw new AppError(req.__("brand_not_found"), 404);
  if (brand && brandData?.isDeleted) throw new AppError(req.__("brand_deleted"), 400);

  // const updateFields = {};



  if (description !== undefined) {
    let descriptionObj;
    try {
      descriptionObj = typeof description === 'string' ? JSON.parse(description) : description;
    } catch (e) {
      throw new AppError(req.__("Invalid description format"), 400);
    }
    if (!descriptionObj || !descriptionObj.en || !descriptionObj.ar) {
      throw new AppError(req.__("Description in both English and Arabic is required"), 400);
    }
    updateFields.description = descriptionObj;
  }

  if (category) updateFields.category = category;
  if (subCategory) updateFields.subCategory = subCategory;
  if (productionCountry) updateFields.productionCountry = productionCountry;
  if (brand) updateFields.brand = brand;
  if (productType) updateFields.productType = productType;
  if (discountEndTime) updateFields.discountEndTime = discountEndTime
  const updateFields = {
    ...(description && { description }),
    ...(category && { category }),
    ...(subCategory && { subCategory }),
    ...(brand && { brand }),
    ...(productType && { productType }),
    name: generateProductName(product, brandData, name, { tireData, batteryData, oilData })
  };
  if (req.files) {
    await handleFileUpdates(req.files, product, updateFields);
  }

  const updatedProduct = await productModel.findByIdAndUpdate(
    productId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  const updatedRelated = await updateRelatedModel(
    product.productType,
    product._id,
    { tireData, oilData, batteryData }
  );
  res.json({
    message: req.__("Product updated"),
    data: {
      product: localizeProduct(updatedProduct, lang),
      ...(updatedRelated && { [product.productType]: updatedRelated })
    },
  });
});


const generateProductName = (product, brandData, name, productData) => {
  if (!['tire', 'oil', 'battery'].includes(product.productType) || !productData) {
    return { en: name?.en || product.name.en, ar: name?.ar || product.name.ar };
  }

  if (!brandData) throw new AppError(req.__("brand_required"), 400);

  const { tireData, batteryData, oilData } = productData;

  switch (product.productType) {
    case 'tire':
      if (!tireData) return { en: name?.en || product.name.en, ar: name?.ar || product.name.ar };
      return {
        en: `tire ${brandData.name.en} ${tireData.tire_width}/${tireData.aspect_ratio} R${tireData.wheel_diameter} ${tireData.load_index || ""}${tireData.speed_rating || ""} ${tireData.extra_load ? "XL" : ""}`.trim(),
        ar: `إطار ${brandData.name.ar} ${tireData.tire_width}/${tireData.aspect_ratio} R${tireData.wheel_diameter} ${tireData.load_index || ""}${tireData.speed_rating || ""} ${tireData.extra_load ? "XL" : ""}`.trim()
      };
    case 'battery':
      if (!batteryData) return { en: name?.en || product.name.en, ar: name?.ar || product.name.ar };
      return {
        en: `Battery ${brandData.name.en} ${batteryData.voltage} volt ${batteryData.capacity}Ah ${batteryData.dimention} ${batteryData.weight}Kg`.trim(),
        ar: `بطارية ${brandData.name.ar} ${batteryData.voltage} volt ${batteryData.capacity}Ah ${batteryData.dimention} ${batteryData.weight}Kg`.trim()
      };
    case 'oil':
      if (!oilData) return { en: name?.en || product.name.en, ar: name?.ar || product.name.ar };
      return {
        en: `Oil ${brandData.name.en} ${oilData.liters || ""} liter - ${oilData.viscosity || ""}`.trim(),
        ar: `زيت ${brandData.name.ar} ${oilData.liters || ""} ليتر - ${oilData.viscosity || ""}`.trim()
      };
    default:
      return { en: name?.en || product.name.en, ar: name?.ar || product.name.ar };
  }
};


const handleFileUpdates = async (files, product, updateFields) => {
  const fileOperations = [];

  if (files.imageCover) {
    if (product.imageCover) {
      const publicId = product.imageCover.split("/").pop().split(".")[0];
      fileOperations.push(cloudinary.uploader.destroy(publicId));
    }
    updateFields.imageCover = files.imageCover[0].cloudinaryResult.url;
  }

  if (files.images) {
    if (product.images.length) {
      const publicIds = product.images.map(img => img.split("/").pop().split(".")[0]);
      fileOperations.push(...publicIds.map(id => cloudinary.uploader.destroy(id)));
    }
    updateFields.images = files.images.map(file => file.cloudinaryResult.url);
  }

  await Promise.all(fileOperations);
};

const updateRelatedModel = async (productType, productId, { tireData, oilData, batteryData }) => {
  const modelMap = {
    tire: { model: tireModel, data: tireData },
    oil: { model: oilModel, data: oilData },
    battery: { model: batteryModel, data: batteryData }
  };

  if (!modelMap[productType] || !modelMap[productType].data) return null;

  return modelMap[productType].model.findOneAndUpdate(
    { productId },
    { $set: modelMap[productType].data },
    { new: true, runValidators: true, upsert: true }
  );
};
export const deleteProduct = handleAsyncError(async (req, res) => {
  const { productId } = req.params;
  const lang = req.getLocale();

  const product = await productModel.findById(productId);
  if (!product) throw new AppError(req.__("Product not found"), 404);
  if (product.isDeleted)
    throw new AppError(req.__("Product already deleted"), 400);
  product.isDeleted = true;
  product.deletedAt = new Date();
  product.deletedBy = req.user._id;
  let result = [];
  if (product.productType === "tire") {
    const deletedTire = await tireModel.findOne({ productId: product._id });
    if (deletedTire) {
      deletedTire.isDeleted = true;
      deletedTire.deletedAt = new Date();
      deletedTire.deletedBy = req.user._id;
      result.push(await deletedTire.save());
    }
  }
  result.push(await product.save());

  res.json({ message: req.__("Product deleted"), result });
});

export const restoreProduct = handleAsyncError(async (req, res) => {
  const { productId } = req.params;
  const lang = req.getLocale();
  const product = await productModel.findById(productId);
  if (!product) throw new AppError(req.__("Product not found"), 404);
  if (!product.isDeleted)

    throw new AppError(req.__("product_not_deleted"), 400);
  product.isDeleted = false;
  product.deletedAt = null;
  product.deletedBy = null;

  let result = [];
  if (product.productType === "tire") {
    const restoredTire = await tireModel.findOne({ productId: product._id });
    if (restoredTire) {
      restoredTire.isDeleted = false;
      restoredTire.deletedAt = null;
      restoredTire.deletedBy = null;
      result.push(await restoredTire.save());
    }
  }
  result.push(await product.save());

  res.json({ message: req.__("Product restored"), result });
});




export const getAllProductsByBrandId = handleAsyncError(async (req, res) => {
  const { brandId } = req.params;
  const lang = req.getLocale();

  const products = await AgentProduct
    .find({ brandId: brandId })
    .populate("productId").populate({
      path: "productId",
      populate: {
        path: "category",
        model: "categories"
      },
    }).populate({
      path: "productId",
      populate: {
        path: "subCategory",
        model: "subCategory"
      },
//TODO:
    })

  if (!products.length)
    return res.status(404).json({ message: req.__("Products not found") });

  const localizedProducts = products.map((product) =>
    localizeProduct(product, lang)
  );
  res.status(200).json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
  });
});

export const getAllProductsByCategoryId = handleAsyncError(async (req, res) => {
  const { categoryId } = req.params;
  const lang = req.getLocale();

  const products = await productModel
    .find({ category: categoryId, isDeleted: false })
    .populate("category", "name")
    .populate("subCategory", "name");

  if (!products.length)
    return res.status(404).json({ message: req.__("Products not found") });

  const localizedProducts = products.map((product) =>
    localizeProduct(product, lang)
  );
  res.status(200).json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
  });
});

export const getAllProductsBySubCategoryId = handleAsyncError(
  async (req, res) => {
    const { subCategoryId } = req.params;
    const lang = req.getLocale();
    let data = await productModel
      .find({ subCategory: subCategoryId, isDeleted: false })
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name image");

    if (!data.length)
      return res.status(404).json({ message: req.__("Products not found") });
    const localizedProducts = data.map((product) =>
      localizeProduct(product, lang)
    );
    res.status(200).json({
      message: req.__("Products retrieved successfully"),
      products: localizedProducts,
    });
  }
);
export const getAllProductsByTagId = handleAsyncError(async (req, res) => {
  const { tagName } = req.query;
  const lang = req.getLocale();
  let exsistTage = await tagModel.findById(tagName);
  if (!exsistTage) return res.status(404).json({ message: req.__("Tag no_tag_provided") });
  const products = await productModel
    .find({ id: exsistTage.id, isDeleted: false })
    .populate("category", "name")
    .populate("subCategory", "name");
  if (!products.length)
    return res.status(404).json({ message: req.__("Products not found") });

  const localizedProducts = products.map((product) =>
    localizeProduct(product, lang)
  );
  res.status(200).json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
  })
});

export const getAllTires = handleAsyncError(async (req, res) => {
  const {
    minPrice,
    maxPrice,
    tire_width,
    aspect_ratio,
    wheel_diameter,
    speed_rating,
    brandId,
    load_index,
    tire_type,
    tire_brand,
    tireDrawType,
    yearOfProduction,
    warranty,
    sort,
    page = 1,
    limit = 10
  } = req.query;

  let filter = { isDeleted: false };

  let productFilter = {};
  if (minPrice || maxPrice) {
    productFilter.price = {};
    if (minPrice) productFilter.price.$gte = Number(minPrice);
    if (maxPrice) productFilter.price.$lte = Number(maxPrice);
  }

  if (tire_width) filter.tire_width = Number(tire_width);
  if (aspect_ratio) filter.aspect_ratio = Number(aspect_ratio);
  if (wheel_diameter) filter.wheel_diameter = Number(wheel_diameter);
  if (speed_rating) filter.speed_rating = speed_rating;
  if (brandId) filter.tire_brand = brandId;
  if (load_index) filter.load_index = Number(load_index);
  if (tire_type) filter.tire_type = tire_type;
  if (tire_brand) filter.tire_brand = tire_brand;
  if (tireDrawType) filter.tireDrawType = tireDrawType;
  if (yearOfProduction) filter.yearOfProduction = Number(yearOfProduction);
  if (warranty) filter['warranty.duration'] = { $gte: Number(warranty) };

  let productData = await productModel.find({ isDeleted: false, productType: 'tire' })
    .populate('category', 'name')
    .populate('subCategory', 'name')

  let sortObj = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortObj[field] = order === 'desc' ? -1 : 1;
  } else {
    sortObj = { createdAt: -1 };
  }

  let productIds = [];

  if (Object.keys(productFilter).length > 0) {
    const products = await productModel.find(productFilter).select('_id');
    productIds = products.map(p => p._id);
    filter.productId = { $in: productIds };
  }

  const tires = await tireModel.find(filter)
    .populate({
      path: 'productId',
      select: 'name price priceAfterDiscount stock images description slug'
    })
    .populate('tire_brand', 'name logo image ')
    .sort(sortObj)
    .limit(Number(limit));

  console.log(filter);
  const transformedData = tires.filter(tire => tire.productId)
    .map(tire => ({
      ...tire.productId.toObject(),
      tireDetails: {
        warranty: tire.warranty,
        yearOfProduction: tire.yearOfProduction,
        tireDrawType: tire.tireDrawType,
        tire_width: tire.tire_width,
        aspect_ratio: tire.aspect_ratio,
        wheel_diameter: tire.wheel_diameter,
        speed_rating: tire.speed_rating,
        load_index: tire.load_index,
        extra_load: tire.extra_load,
        tire_type: tire.tire_type,
        tire_brand: tire.tire_brand,
        soundWave: tire.soundWave,
        snowflake: tire.snowflake,
        productionCountry: tire.productionCountry

      }
    }));
  console.log(transformedData);

  const total = await tireModel.countDocuments(filter);
  console.log(total, "total ");


  res.status(200).json({
    status: "success",
    results: transformedData.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    products: transformedData

  });
});

export const getProductsByIds = handleAsyncError(async (req, res) => {
  const { productIds } = req.body;

  const products = await productModel.find({
    _id: { $in: productIds },
    isDeleted: false
  })
    .populate([
      {
        path: 'category',
        select: 'name'
      },
      {
        path: 'subCategory',
        select: 'name'
      }

    ]);

  const tireData = await tireModel.find({ productId: { $in: productIds } });

  const productsWithTireData = products.map(product => {
    const tiresForProduct = tireData.filter(tire => tire.productId.toString() === product._id.toString());
    return {
      ...product.toObject(),
      tireData: tiresForProduct
    };
  });
  console.log(productsWithTireData, "productsWithTireData");


  // Check if all requested products were found
  const foundIds = products.map(p => p._id.toString());
  const missingIds = productIds.filter(id => !foundIds.includes(id));

  if (missingIds.length > 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Some products were not found',
      missingIds
    });
  }
  return res.status(200).json({
    status: 'success',
    results: products.length,
    data: productsWithTireData
  });
});

export const getAllProductsBySlug = handleAsyncError(async (req, res) => {
  const { slug } = req.params;
  const lang = req.getLocale();
  // Search by the correct language key in the slug object
  let data = await productModel.find({ [`slug.en`]: slug, isDeleted: false })
    .select(" -images -imageCover  ")
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("brand", "name image")
    ;
  if (!data.length) {
    return res.status(404).json({ message: req.__("Products not found") });
  }
  let productDetails = await tireModel.find({ productId: data[0]._id, isDeleted: false }).select('warranty yearOfProduction tireDrawType tire_width aspect_ratio wheel_diameter speed_rating load_index extra_load tire_type tire_brand soundWave snowflake productionCountry');
  const localizedProducts = data.map((product) => {
    return {
      ...product.toObject(),
      productDetails: productDetails
    }
  });

  res.status(200).json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
  });
});


export const getAllProductByType = handleAsyncError(async (req, res) => {
  const { type } = req.query;
  const lang = req.getLocale();
  let responce;
  let data = await AgentProduct.find({ status: "active" })
    .populate("productId")
    .populate("agentId");
  // console.log(data);
  responce = data.productId
  console.log(data[0].productId.productType);

  if (!data.length)
    return res.status(404).json({ message: req.__("Products not found") });
  const productData = data.filter((product) => {
    return product.productId.productType == type
  });
  console.log(productData, "productData");

  const localizedProducts = productData.map((product) => {
    return {
      ...product.toObject(),
    }
  });
  res.status(200).json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
  });
})


export const filterData = handleAsyncError(async (req, res) => {
  const { type, width, height, diameter } = req.query;
  const lang = req.getLocale();
  const tiresQuery = { isDeleted: false };
  if (width) tiresQuery.tire_width = Number(width);
  if (height) tiresQuery.aspect_ratio = Number(height);
  if (diameter) tiresQuery.wheel_diameter = Number(diameter);
  const matchingTires = await tireModel.find(tiresQuery).select('productId');
  const matchingProductIds = matchingTires.map(tire => tire.productId);
  const productQuery = {
    isDeleted: false,
    productType: 'tire',
    _id: { $in: matchingProductIds }
  };
  if (type) productQuery.productType = type;
  let data = await productModel.find(productQuery)
    .populate("category", "name")
    .populate("subCategory", "name")
  if (!data.length)
    return res.status(404).json({ message: req.__("Products not found") });
  const allRelatedTires = await tireModel.find({
    productId: { $in: data.map(p => p._id) },
    isDeleted: false
  });

  const uniqueDimensions = {
    width: [...new Set(allRelatedTires.map(t => t.tire_width))].sort((a, b) => a - b),
    height: [...new Set(allRelatedTires.map(t => t.aspect_ratio))].sort((a, b) => a - b),
    diameter: [...new Set(allRelatedTires.map(t => t.wheel_diameter))].sort((a, b) => a - b),
    weight: [...new Set(allRelatedTires.map(t => t.weight))].sort((a, b) => a - b),
  };
  const uniqueFilters = {
    warranty: [...new Set(allRelatedTires.map(t => t.warranty))].sort((a, b) => a - b),
    yearOfProduction: [...new Set(allRelatedTires.map(t => t.yearOfProduction))].sort((a, b) => a - b),
    tireDrawType: [...new Set(allRelatedTires.map(t => t.tireDrawType))],
    aspect_ratio: [...new Set(allRelatedTires.map(t => t.aspect_ratio))].sort((a, b) => a - b),
    speed_rating: [...new Set(allRelatedTires.map(t => t.speed_rating))],
    load_index: [...new Set(allRelatedTires.map(t => t.load_index))].sort((a, b) => a - b),
    extra_load: [...new Set(allRelatedTires.map(t => t.extra_load))],
    tire_type: [...new Set(allRelatedTires.map(t => t.tire_type))],
    brandId: [...new Set(allRelatedTires.map(t => t.tire_brand))]
  };

  const localizedProducts = data.map((product) =>
    localizeProduct(product, lang)
  );

  res.status(200).json({
    message: req.__("Products retrieved successfully"),
    products: localizedProducts,
    availableDimensions: uniqueDimensions,
    availableFilters: uniqueFilters
  });
})

export const displayHeightPackagesProducts = handleAsyncError(async (req, res) => {
  const activeSubscriptions = await subscriptionModel
    .find({ status: 'active' })
    .populate('user package')
  const levelOrder = ['Diamond', 'Gold', 'Silver', 'Bronze'];
  const grouped = {};
  levelOrder.forEach(level => (grouped[level] = []));
  for (const subscription of activeSubscriptions) {
    const pkg = subscription.package;
    if (pkg && pkg.isActive && levelOrder.includes(pkg.level)) {
      console.log(subscription);

      const agentProducts = await AgentProduct.find({
        agentId: subscription.user._id
      })
        .select('productId')
        .populate({
          path: 'productId',
        })
        .lean();
      const cleanPackage = {
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        level: pkg.level,
      };
      const cleanUser = {
        name: subscription.user.name,
        email: subscription.user.email,
        role: subscription.user.role,
      };
      const cleanSubscription = {
        status: subscription.status,
        payment: {
          amount: subscription.payment?.amount,
          currency: subscription.payment?.currency,
          status: subscription.payment?.status,
        },
        startDate: subscription.startDate,
        endingTime: subscription.endingTime,
      };
      grouped[pkg.level].push({
        package: cleanPackage,
        user: cleanUser,
        subscription: cleanSubscription,
        agentProducts
      });
    }
  }
  const sortedResult = {};
  levelOrder.forEach(level => {
    if (grouped[level].length > 0) {
      sortedResult[level] = grouped[level];
    }
  });
  res.json({
    success: true,
    data: sortedResult,
  });
});

export const deleteMoreThanOneProduct = handleAsyncError(async (req, res) => {
  const { ids } = req.body;

  const existingProducts = await productModel.find({
    _id: { $in: ids },
    isDeleted: true
  });

  if (existingProducts.length > 0) {
    const deletedProductIds = existingProducts.map(p => p._id);
    return res.status(400).json({
      message: "Some products are already deleted",
      deletedProductIds
    });
  }

  await productModel.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        isDeleted: true,
        deletedBy: req.user._id,
        deletedAt: new Date()
      }
    }
  );

  return res.json({
    message: "Products deleted successfully",
    deletedCount: ids.length
  });
});
export const restoreMoreThanOneProduct = handleAsyncError(async (req, res) => {

  const { ids } = req.body;

  const existingProducts = await productModel.find({
    _id: { $in: ids },
    isDeleted: false
  });

  if (existingProducts.length > 0) {
    const restoredProductIds = existingProducts.map(p => p._id);
    return res.status(400).json({
      message: "Some products are already restored",
      restoredProductIds
    });
  }

  await productModel.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        isDeleted: false,
        deletedBy: null,
        deletedAt: null
      }
    }
  );

  return res.json({
    message: "Products restored successfully",
    deletedCount: ids.length
  });
});

