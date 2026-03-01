import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Helper: generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Build a hierarchical tree from a flat list of categories
const buildTree = (categories) => {
  const map = {};
  categories.forEach((c) => { map[c._id.toString()] = { ...c.toObject(), children: [] }; });

  const tree = [];
  categories.forEach((c) => {
    if (c.parentId && map[c.parentId.toString()]) {
      map[c.parentId.toString()].children.push(map[c._id.toString()]);
    } else if (!c.parentId) {
      tree.push(map[c._id.toString()]);
    }
  });
  // Ensure alphabetical ordering at every level
  tree.sort((a, b) => a.name.localeCompare(b.name));
  tree.forEach((node) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
  });
  return tree;
};

// GET /api/categories — return flat list + hierarchical tree
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const tree = buildTree(categories);
    res.status(200).json({ categories, tree });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Also get children
    const children = await Category.find({ parentId: category._id }).sort({ name: 1 });
    res.status(200).json({ category, children });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories — add a new category or sub-category (admin)
// Body: { name, parentId? }  — parentId is null/omitted for main category
export const createCategory = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    let slug;

    if (parentId) {
      // Validate parent exists and is not itself a sub-category
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ message: 'Parent category not found' });
      if (parent.parentId) return res.status(400).json({ message: 'Cannot nest sub-categories more than one level deep' });

      // Prefix sub-category slug with parent slug so same names are allowed under different parents
      slug = `${parent.slug}-${generateSlug(name)}`;

      // Check uniqueness only within the same parent
      const existing = await Category.findOne({ parentId, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
      if (existing) return res.status(400).json({ message: `A sub-category named "${name}" already exists under this category` });
    } else {
      slug = generateSlug(name);

      // Check uniqueness among main categories only
      const existing = await Category.findOne({ parentId: null, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
      if (existing) return res.status(400).json({ message: 'A main category with this name already exists' });
    }

    // Ensure the generated slug is globally unique (edge case: collision with an unrelated slug)
    const slugExists = await Category.findOne({ slug });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    const category = await Category.create({ name, slug, parentId: parentId || null });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id — update a category (admin)
// Body: { name?, parentId? }
export const updateCategory = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    let slug;

    if (parentId) {
      if (parentId === req.params.id) return res.status(400).json({ message: 'Category cannot be its own parent' });
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ message: 'Parent category not found' });
      if (parent.parentId) return res.status(400).json({ message: 'Cannot nest sub-categories more than one level deep' });

      slug = `${parent.slug}-${generateSlug(name)}`;

      // Check uniqueness within same parent, excluding self
      const existing = await Category.findOne({
        parentId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id },
      });
      if (existing) return res.status(400).json({ message: `A sub-category named "${name}" already exists under this category` });
    } else {
      slug = generateSlug(name);

      // Check uniqueness among main categories, excluding self
      const existing = await Category.findOne({
        parentId: null,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id },
      });
      if (existing) return res.status(400).json({ message: 'A main category with this name already exists' });
    }

    // Ensure slug is globally unique (excluding self)
    const slugConflict = await Category.findOne({ slug, _id: { $ne: req.params.id } });
    if (slugConflict) slug = `${slug}-${Date.now().toString(36)}`;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, parentId: parentId || null },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id — delete a category (admin)
// Also deletes all sub-categories and unassigns products
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Collect IDs to delete: the category itself + all its children
    const children = await Category.find({ parentId: category._id });
    const idsToDelete = [category._id, ...children.map((c) => c._id)];

    // Unassign products that belong to any of these categories
    await Product.updateMany(
      { categoryId: { $in: idsToDelete } },
      { $unset: { categoryId: '' }, $set: { category: '' } }
    );

    // Delete children first, then parent
    await Category.deleteMany({ _id: { $in: idsToDelete } });

    res.status(200).json({
      message: `Category "${category.name}" and ${children.length} sub-categor${children.length === 1 ? 'y' : 'ies'} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

