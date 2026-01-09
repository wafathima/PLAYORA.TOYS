const router = require("express").Router();
const { 
  updateProfile, 
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  getProfile
} = require("../../controllers/user/userController");
const { userProtect } = require("../../middlewares/userAuth");


router.get("/profile", userProtect, getProfile);
router.put("/profile", userProtect, updateProfile);
router.put("/change-password", userProtect, changePassword);


router.get("/addresses", userProtect, getAddresses);
router.post("/addresses", userProtect, addAddress);
router.put("/addresses/:addressId", userProtect, updateAddress);
router.delete("/addresses/:addressId", userProtect, deleteAddress);

module.exports = router;