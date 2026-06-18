const asyncHandler = require("express-async-handler");
const FoodItem = require("../models/FoodItem");

// @desc    Get all food items (public — used by FoodSelection page)
// @route   GET /api/food
// @access  Public
const getAllFoodItems = asyncHandler(async (req, res) => {
  const { category, available } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (available !== undefined) filter.isAvailable = available === "true";

  const items = await FoodItem.find(filter).sort({ category: 1, sortOrder: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: items });
});

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
const getFoodItemById = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }
  res.status(200).json({ success: true, data: item });
});

// @desc    Create food item
// @route   POST /api/food
// @access  Private/Admin
const createFoodItem = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, veg, isAvailable, sortOrder } = req.body;

  if (!name || !price || !category) {
    res.status(400);
    throw new Error("Name, price and category are required");
  }

  const item = await FoodItem.create({
    name,
    description,
    price: Number(price),
    image,
    category,
    veg: veg !== undefined ? Boolean(veg) : true,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    sortOrder: sortOrder ? Number(sortOrder) : 0,
  });

  res.status(201).json({ success: true, data: item });
});

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Private/Admin
const updateFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }

  const updated = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete food item
// @route   DELETE /api/food/:id
// @access  Private/Admin
const deleteFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }

  await item.deleteOne();
  res.status(200).json({ success: true, message: "Food item deleted" });
});

module.exports = { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem };
