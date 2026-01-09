const Product = require("../../models/Product");

exports.getProducts = async (req, res, next) => {
  try {
    const filter = { isDeleted: false }; 
    
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
  _id: req.params.id, 
  isDeleted: false 
});

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

