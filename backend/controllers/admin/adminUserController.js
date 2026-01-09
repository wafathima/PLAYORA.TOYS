const User = require("../../models/User");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "admin"  } }) 
      .select("-password -__v")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" }, });
    const activeUsers = await User.countDocuments({ 
      role: { $ne: "admin" },
      isBlocked: false 
    });
    const blockedUsers = await User.countDocuments({ 
      role:{ $ne: "admin" },
      isBlocked: true 
    });
    const newUsersToday = await User.countDocuments({
      role:{ $ne: "admin" },
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersToday
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {
      isBlocked: action === "block",
      blockedAt: action === "block" ? new Date() : null,
      blockedBy: action === "block" ? req.admin._id : null
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).select("-password -__v");

    res.json({
      success: true,
      message: `User ${action === "block" ? "blocked" : "unblocked"} successfully`,
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password -__v");

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};