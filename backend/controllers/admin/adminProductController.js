const Product = require("../../models/Product");

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.getProductStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
    const lowStock = await Product.countDocuments({
      stock: { $lte: 10, $gt: 0 },
      isDeleted: { $ne: true }
    });
    const outOfStock = await Product.countDocuments({
      stock: 0,
      isDeleted: { $ne: true }
    });
    
    const inventory = await Product.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } }
        }
      }
    ]);

    const totalValue = inventory[0]?.totalValue || 0;

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStock,
        outOfStock,
        totalValue
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price || !category)
      return res.status(400).json({ message: "Required fields missing" });

    let imageUrl = null;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `${baseUrl}/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      image: imageUrl,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const update = { ...req.body };

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      update.image = `${baseUrl}/uploads/products/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};


exports.softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product soft deleted",
      product
    });
  } catch (err) {
    next(err);
  }
};