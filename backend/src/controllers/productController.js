import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Create Product (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, categoryId, stock, image } = req.body;

    if (!title || !description || !price || !categoryId || !image) {
      return res.status(400).json({ message: 'Please provide all required fields (title, description, price, categoryId, image)' });
    }

    const cat = await Category.findById(categoryId);
    if (!cat) return res.status(400).json({ message: 'Invalid categoryId — category not found' });

    const product = await Product.create({
      title,
      description,
      price,
      categoryId: cat._id,
      category: cat.slug,
      stock: stock || 0,
      image,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: await product.populate('categoryId', 'name slug parentId'),
    });
  } catch (error) {
    next(error);
  }
};

// Get All Products (Public)
export const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let filter = {};

    if (category) {
      // Find the category by slug
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        // If it's a parent category, also include products from its sub-categories
        const children = await Category.find({ parentId: cat._id });
        const catIds = [cat._id, ...children.map((c) => c._id)];
        filter.categoryId = { $in: catIds };
      } else {
        filter.category = category; // fallback for legacy string-only records
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug parentId')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Product by ID (Public)
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('categoryId', 'name slug parentId').populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Add Review (Logged-in users only)
export const addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Prevent duplicate reviews from same user
    const already = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user.id
    );
    if (already) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    product.reviews.push({ user: req.user.id, text: text || '', rating });

    // Recalculate average rating
    const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = parseFloat((total / product.reviews.length).toFixed(1));

    await product.save();
    await product.populate('reviews.user', 'name');

    res.status(201).json({ message: 'Review added successfully', product });
  } catch (error) {
    next(error);
  }
};

// Update Product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryId, stock, image } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (price) updateFields.price = price;
    if (stock !== undefined) updateFields.stock = stock;
    if (image) updateFields.image = image;
    if (categoryId) {
      const cat = await Category.findById(categoryId);
      if (!cat) return res.status(400).json({ message: 'Invalid categoryId' });
      updateFields.categoryId = cat._id;
      updateFields.category = cat.slug;
    }

    const product = await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true })
      .populate('categoryId', 'name slug parentId');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Categories (delegates to Category model)
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ message: 'Categories retrieved successfully', categories });
  } catch (error) {
    next(error);
  }
};
