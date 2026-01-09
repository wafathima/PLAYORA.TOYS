const User = require("../../models/User");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("wishlist", "name price images")
      .populate("cart.product", "name price images");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;

    if (req.body.profileImage !== undefined) {
      updates.profileImage = req.body.profileImage;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide both current and new password" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be at least 6 characters long" 
      });
    }
    
    const user = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    await user.save();
    
    res.json({
      success: true,
      message: "Password changed successfully"
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: "Password change failed" 
    });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      country, 
      postalCode, 
      type, 
      isDefault 
    } = req.body;
    
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ 
        success: false,
        message: "Please fill all required fields" 
      });
    }
    
    const user = await User.findById(req.user._id);
    
    const newAddress = {
      name,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      country: country || "India",
      postalCode,
      type: type || "home",
      isDefault: isDefault || false
    };
    
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    user.addresses.push(newAddress);
    await user.save();
    
    res.json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses
    });
    
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add address" 
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;
    
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Address not found" 
      });
    }
    
    if (updateData.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...updateData,
      _id: user.addresses[addressIndex]._id
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses
    });
    
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update address" 
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== addressId
    );
    
    await user.save();
    
    res.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses
    });
    
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete address" 
    });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    
    res.json({
      success: true,
      addresses: user.addresses || []
    });
    
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch addresses" 
    });
  }
};

