const router = require("express").Router();
const upload = require("../../middlewares/upload.middleware");
const { adminProtect } = require("../../middlewares/adminAuth");

const {
  createProduct,
  updateProduct,
   getAllProducts,   
  getProductById,      
  getProductStats, 
  softDeleteProduct
} = require("../../controllers/admin/adminProductController");

router.use(adminProtect);
router.get("/", getAllProducts);
router.get("/stats", getProductStats);
router.get("/:id", getProductById);

router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", softDeleteProduct);

module.exports = router;
