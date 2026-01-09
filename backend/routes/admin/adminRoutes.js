const router = require("express").Router();
const { adminProtect } = require("../../middlewares/adminAuth");
const { getDashboardStats } = require("../../controllers/admin/adminController");

router.use(adminProtect);

router.get("/dashboard/stats", getDashboardStats);

module.exports = router;