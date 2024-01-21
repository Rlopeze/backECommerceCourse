import Product from "../models/product.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";


// Create new product => /api/v1/products
export const getProducts = catchAsyncErrors(async (req, res) => {

    const resPerPage = 4;
    const apiFilters = new APIFilters(Product, req.query).search().filters();

    let products = await apiFilters.query;
    let filteredProductsCount = products.length;

    apiFilters.pagination(resPerPage);

    products = await apiFilters.query.clone();
    res.status(200).json({
      filteredProductsCount,
      products
    });
});

// Create new product => /api/v1/admin/products/new
export const createNewProduct = catchAsyncErrors(async (req, res) => {

  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get single product details => /api/v1/products/:id
export const getProductDetail = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json(product);
});

// Update product => /api/v1/admin/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(ErrorHandler("Product not found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete product => /api/v1/admin/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(ErrorHandler("Product not found", 404));
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product is deleted.",
    });
});
