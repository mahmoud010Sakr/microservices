import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import AgentProduct from "../../database/model/agentProducts.js";
import { reviewModel } from "../../database/model/reviews.model.js";
import productModel from "../../database/model/product.model.js";
import tagModel from "../../database/model/tag.model.js";
import TireModel from "../../database/model/tires.model.js";
import OilModel from "../../database/model/oil.model.js";
import BatteryModel from "../../database/model/battary.model.js";
import userModel from "../../database/model/user.model.js";
import brandModel from "../../database/model/brand.model.js";

export const createAgentProduct = handleAsyncError(async (req, res) => {
    const { productId, vendorPrice, priceAfterDiscount, stock, status, tags, brandId } = req.body;
    console.log(req.body, "from agent product");;

    const targetAgentId = req.user.role === 'Admin' ? (req.body.agentId || req.user.id) : req.user.id;
    const product = await productModel.findById(productId);

    if (!product) {
        throw new AppError(req.__("product_not_found"), 404);
    }
    const existingProduct = await AgentProduct.findOne({ agentId: targetAgentId, productId });
    console.log(existingProduct, "testtttt");

    if (existingProduct) {
        throw new AppError(req.__("agent_product_exists"), 400);
    }
    const price = Number(vendorPrice) + Number(vendorPrice) * Number(req.user.platformPercentage) / 100 + Number(vendorPrice) * Number(req.user.shippingPercentage) / 100 + Number(vendorPrice) * Number(req.user.xPercentage) / 100 + Number(vendorPrice) * Number(req.user.yPercentage) / 100;
    const agentProduct = await AgentProduct.create({
        agentId: targetAgentId,
        productId,
        brandId,
        price,
        vendorPrice,
        priceAfterDiscount: priceAfterDiscount || price,
        stock,
        status: status || "active",
        tags
    })
    res.status(201).json({
        status: "success",
        message: req.__("agent_product_created"),
        data: agentProduct
    });
});

export const updateAgentProduct = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const { vendorPrice, priceAfterDiscount, stock, status, tags } = req.body;
    const query = req.user.role === 'Admin' ? { _id: id } : { _id: id, agentId: req.user.id };
    const agentProduct = await AgentProduct.findOne(query);
    if (!agentProduct) {
        throw new AppError(req.__("agent_product_not_found"), 404);
    }
    const price = Number(vendorPrice) + Number(vendorPrice) * Number(req.user.platformPercentage) / 100 + Number(vendorPrice) * Number(req.user.shippingPercentage) / 100 + Number(vendorPrice) * Number(req.user.xPercentage) / 100 + Number(vendorPrice) * Number(req.user.yPercentage) / 100;
    Object.assign(agentProduct, {
        price: price || agentProduct.price,
        vendorPrice: vendorPrice || agentProduct.vendorPrice,
        priceAfterDiscount: priceAfterDiscount || agentProduct.priceAfterDiscount,
        stock: stock !== undefined ? stock : agentProduct.stock,
        status: status || agentProduct.status,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : agentProduct.tags
    });
    await agentProduct.save();
    res.status(200).json({
        status: "success",
        message: req.__("agent_product_updated"),
        data: agentProduct
    });
});

export const getAgentProduct = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const agentProduct = await AgentProduct.findOne({ _id: id, agentId: req.user.id })
        .populate("productId")
        .populate("tags");
    if (!agentProduct) {
        throw new AppError(req.__("agent_product_not_found"), 404);
    }
    res.status(200).json({
        status: "success",
        data: agentProduct
    });
});

export const getAgentProducts = handleAsyncError(async (req, res) => {
    const { status, productType } = req.query;
    let query = { agentId: req.user.id };
    if (status) query.status = status;
    let agentProducts = AgentProduct.find(query)
        .populate({
            path: "productId",
            match: productType ? { productType } : {},
            select: 'name slug description imageCover images category subCategory brand productType isDeleted',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
                // { path: 'brand', select: 'name image' },
            ]
        })
        .populate("tags")
        .populate("brandId", "name image");
    agentProducts = (await agentProducts).filter(ap => ap.productId);
    res.status(200).json({
        status: "success",
        results: agentProducts.length,
        data: agentProducts
    });
});


export const getProductDetails = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    console.log(id, "idesssssssssssssssssssssssssss");

    const products = await AgentProduct.find({ agentId: id, status: 'active' })
        .populate({
            path: 'productId',
            select: 'name slug description imageCover images category subCategory brand productType',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
            ]
        })
        .populate('agentId', 'name email phone')
        .populate('tags', 'name');
    console.log(products);

    if (!products || products.length === 0) {
        throw new AppError(req.__('no_products_found'), 404);
    }
    const productsWithDetails = await Promise.all(
        products.map(async (product) => {
            const productData = product.toObject();
            if (productData.productId) {
                switch (productData.productId.productType) {
                    case 'tire':
                        const tireDetails = await TireModel.findOne({ productId: productData.productId._id })
                            .populate('tire_brand', 'name');
                        if (tireDetails) {
                            productData.productDetails = tireDetails;
                        }
                        break;
                    case 'oil':
                        const oilDetails = await OilModel.findOne({ productId: productData.productId._id })
                            .populate('brandId', 'name image');
                        if (oilDetails) {
                            productData.productDetails = oilDetails;
                        }
                        break;
                    case 'battery':
                        const batteryDetails = await BatteryModel.findOne({ productId: productData.productId._id })
                            .populate('brandId', 'name image');
                        if (batteryDetails) {
                            productData.productDetails = batteryDetails;
                        }
                        break;
                }
            }
            return productData;
        })
    );
    res.status(200).json({
        status: 'success',
        data: productsWithDetails
    });
});
export const addTags = handleAsyncError(async (req, res) => {
    const { agentProductId } = req.params;
    const { tagId } = req.body;

    const query = req.user.role === 'Admin'
        ? { _id: agentProductId }
        : { _id: agentProductId, agentId: req.user.id };

    const agentProduct = await AgentProduct.findOne(query);
    if (!agentProduct) {
        throw new AppError(req.__('agent_product_not_found'), 404);
    }

    if (!Array.isArray(tagId) || tagId.length === 0) {
        throw new AppError(req.__('tag_id_array_required'), 400);
    }

    // Check if all tag IDs exist
    const tags = await tagModel.find({ _id: { $in: tagId } });
    if (tags.length !== tagId.length) {
        throw new AppError(req.__('some_tags_not_found'), 404);
    }

    // Add tag IDs to product, avoiding duplicates
    const existingTags = agentProduct.tags.map(id => id.toString());
    const newTags = tagId.filter(id => !existingTags.includes(id.toString()));
    agentProduct.tags.push(...newTags);

    await agentProduct.save();

    res.status(200).json({
        status: 'success',
        message: req.__('tags_added_successfully'),
        data: agentProduct
    });
});


export const deleteAgentProduct = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const agentProduct = await AgentProduct.findOne(
        { productId: id, agentId: req.user.id },
    );
    console.log(id, "from id ");
    console.log(req.user.id, "from user id ");
    console.log(agentProduct);
    if (agentProduct.status === "inactive") {
        throw new AppError(req.__("product_already_deleted"), 400);
    }
    if (!agentProduct) {
        throw new AppError(req.__("agent_product_not_found"), 404);
    }
    agentProduct.status = "inactive";
    await agentProduct.save();
    console.log(agentProduct);
    res.status(200).json({
        status: "success",
        message: req.__("product_deleted_successfully"),
        data: agentProduct
    });
});


export const getProductById = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const product = await AgentProduct.findById(id)
        .populate({
            path: 'productId',
            select: 'name slug description imageCover images category subCategory brand productType',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
            ]
        })
        .populate('brandId')
        .populate('tags', 'name')
        .populate('agentId', 'name email phone');
        
    console.log(product);

    if (!product) {
        throw new AppError(req.__('product_not_found'), 404);
    }

    const productData = product.toObject();

    if (productData.productId) {
        switch (productData.productId.productType) {
            case 'tire':
                const tireDetails = await TireModel.findOne({ productId: productData.productId._id })
                    .populate('tire_brand', 'name');
                if (tireDetails) {
                    productData.productDetails = tireDetails;
                }
                break;
            case 'oil':
                const oilDetails = await OilModel.findOne({ productId: productData.productId._id })
                    .populate('brandId', 'name');
                if (oilDetails) {
                    productData.productDetails = oilDetails;
                }
                break;
            case 'battery':
                const batteryDetails = await BatteryModel.findOne({ productId: productData.productId._id })
                    .populate('brandId', 'name');
                if (batteryDetails) {
                    productData.productDetails = batteryDetails;
                }
                break;
        }
    }

    res.status(200).json({
        status: 'success',
        data: productData
    });
});

export const displayAllProducts = handleAsyncError(async (req, res) => {
    console.log("ana hana ");
    const products = await AgentProduct.find({ status: 'active' })

        .populate({
            path: 'productId',
            select: 'name slug description imageCover images category subCategory brand productType',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },

            ]
        })
        .populate('tags', 'name')
        .populate('brandId')
        .populate('agentId', 'name email phone');

    const productsWithDetails = [];
    for (const product of products) {
        // console.log(product.productId.productType);

        const productData = product.toObject();

        if (productData.productId) {
            switch (productData.productId.productType) {
                case 'tire':
                    const tireDetails = await TireModel.findOne({ productId: productData.productId._id })
                        .populate('tire_brand', 'name');
                    if (tireDetails) {
                        productData.productDetails = tireDetails;
                    }
                    break;
                case 'oil':
                    const oilDetails = await OilModel.findOne({ productId: productData.productId._id })
                        .populate('brandId', 'name');
                    if (oilDetails) {
                        productData.productDetails = oilDetails;
                    }
                    break;
                case 'battery':
                    const batteryDetails = await BatteryModel.findOne({ productId: productData.productId._id })
                        .populate('brandId', 'name');
                    if (batteryDetails) {
                        productData.productDetails = batteryDetails;
                    }
                    break;
            }
        }
        productsWithDetails.push(productData);
    }

    res.status(200).json({
        status: 'success',
        data: productsWithDetails
    });
});



export const getAgentByIdForAdmin = handleAsyncError(async (req, res) => {
    try {
        const agentId = req.params.id;
        if (!agentId) return res.status(400).json({ message: "Agent ID is required" });
        const agent = await AgentProduct.find({ agentId: agentId }).populate('productId');
        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        res.status(200).json(agent);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
})

export const getAllAgents = handleAsyncError(async (req, res) => {

    let AgentsData = await userModel.find({ role: "Agent", isDeleted: false })
    if (AgentsData) {
        return res.json({ message: "agents data ", AgentsData })
    }
    return res.json({ message: "agents not found " })
})

export const hardDeleteAgentProduct = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const deletedAgentProduct = await AgentProduct.findOneAndDelete({ productId: id });
    if (!deletedAgentProduct) {
        throw new AppError(req.__("Product_not_found"), 404);
    }
    res.status(200).json({
        status: "success",
        message: req.__("Product_deleted_successfully"),
        deletedAgentProduct: deletedAgentProduct
    });
})



export const getAgentProductBySlug = handleAsyncError(async (req, res) => {
    const { slug } = req.params;
    const { id } = req.params
    let foundedProduct = await productModel.findOne({ [`slug.en`]: slug, isDeleted: false })
    if (!foundedProduct) {
        throw new AppError(req.__("product_not_found"), 404);
    }
    const agentProduct = await AgentProduct.findOne({ agentId: id, productId: foundedProduct._id })
        .populate("productId")
        .populate("tags");
    if (!agentProduct) {
        throw new AppError(req.__("agent_product_not_found"), 404);
    }
    res.status(200).json({
        status: "success",
        data: agentProduct
    });
})


export const addBrandToAgentProduct = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const { brandId } = req.body;
    let brand;
    const product = await AgentProduct.findOne({ productId: id });
    console.log(product);
    if (!product) {
        throw new AppError(req.__("product_not_found"), 404);
    }
    brand = await brandModel.findById(brandId);
    if (!brand) {
        throw new AppError(req.__("brand_not_found"), 404);
    }
    if (!product.brandId.includes(brandId)) {
        product.brandId.push(brandId);
        await product.save();
        return res.status(200).json({
            status: "success",
            message: req.__("agent_brand_added_to_product"),
            data: product
        });
    } else {
        return res.status(200).json({
            status: "faild",
            message: req.__("brand_already_exsits"),
        });
    }

});

export const removeBrandFromAgentProduct = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const { brandId } = req.body;
    let brand;
    const product = await AgentProduct.findOne({ productId: id });
    if (!product) {
        throw new AppError(req.__("product_not_found"), 404);
    }
    brand = await brandModel.findById(brandId);
    if (!brand) {
        throw new AppError(req.__("brand_not_found"), 404);
    }
    if (product.brandId.includes(brandId)) {
        console.log(brandId);
        const productIds = product.brandId.filter((brand) => brand != req.body.brandId);
        console.log(productIds);
        product.brandId = productIds;
        await product.save();
        return res.status(200).json({
            status: "success",
            message: req.__("agent_brand_removed_from_product"),
            data: product
        });
    } else {
        return res.status(200).json({
            status: "faild",
            message: req.__("brand not found to be removed"),
        });
    }
});