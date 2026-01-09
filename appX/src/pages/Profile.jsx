import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios"; 
import { 
  User, Mail, MapPin, Phone, Calendar, 
  Edit2, Save, X, Package, Lock, Home, Briefcase, Map, Plus,
  Heart, ShoppingBag, ShieldCheck, Sparkles, ChevronRight, Trash2, Check,
  Camera, Upload, XCircle, User as UserIcon
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, addAddress, updateAddress, deleteAddress } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [orderLoading, setOrderLoading] = useState(true);

  // Profile form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: ""
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    type: "home",
    isDefault: false
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || ""
      });
      setAddresses(user.addresses || []);
      
      if (user.profileImage) {
        setProfileImage(user.profileImage);
        setProfileImagePreview(user.profileImage);
      }
      
      fetchOrderCount();
    }
  }, [user, navigate]);

  const fetchOrderCount = async () => {
    try {
      setOrderLoading(true);
      const response = await API.get('/user/orders/my');
      if (response.data.success) {
        const orders = response.data.orders || [];
        setOrderCount(orders.length);
      }
    } catch (error) {
      console.error('Error fetching order count:', error);
      setOrderCount(0);
    } finally {
      setOrderLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(' ');
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].charAt(0).toUpperCase();
    }
    return initials;
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-indigo-500";
    const colors = [
      "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
      "bg-violet-500", "bg-cyan-500", "bg-fuchsia-500", "bg-sky-500",
      "bg-lime-500", "bg-orange-500"
    ];
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setProfileImageFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    setProfileImage(null);
    setProfileImagePreview("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return null;

    try {
      setImageUploading(true);
      
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);

      const response = await API.post('/user/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || ""
    });
    
    setProfileImageFile(null);
    setProfileImagePreview(user.profileImage || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsEditing(false);
  };


const handleProfileSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const updatedProfileData = {
      name: formData.name,
      phone: formData.phone,
      bio: formData.bio,
    };

    if (profileImagePreview) {
      updatedProfileData.profileImage = profileImagePreview;
    }

    await updateProfile(updatedProfileData);
    setIsEditing(false);
  } catch (error) {
    console.error("Failed to update profile:", error);
  } finally {
    setLoading(false);
  }
};




  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords don't match" });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });
    
    try {
      const result = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      if (result.success) {
        setPasswordMessage({ 
          type: "success", 
          text: "Password changed successfully!" 
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setPasswordMessage({ 
          type: "error", 
          text: result.message || "Failed to change password" 
        });
      }
    } catch (error) {
      setPasswordMessage({ 
        type: "error", 
        text: error.message || "An error occurred" 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = () => {
    setAddressForm({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      type: "home",
      isDefault: false
    });
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      type: address.type,
      isDefault: address.isDefault
    });
    setEditingAddressId(address._id);
    setShowAddressForm(true);
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddressId) {
        const result = await updateAddress(editingAddressId, addressForm);
        if (result.success) {
          setAddresses(result.addresses);
        }
      } else {
        const result = await addAddress(addressForm);
        if (result.success) {
          setAddresses(result.addresses);
        }
      }
      
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const result = await deleteAddress(addressId);
        if (result.success) {
          setAddresses(result.addresses);
        }
      } catch (error) {
        console.error("Failed to delete address:", error);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const address = addresses.find(addr => addr._id === addressId);
      const result = await updateAddress(addressId, { ...address, isDefault: true });
      if (result.success) {
        setAddresses(result.addresses);
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  if (!user) return null;

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="min-h-screen bg-[#FBFCFE] pb-20">
      {/* Decorative Background Header */}
      <div className="h-48 w-full bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FBFCFE] to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 mb-8 border border-slate-50">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div 
                className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl ring-1 ring-slate-100 flex items-center justify-center ${!profileImagePreview ? avatarColor : 'bg-transparent'} ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}
                onClick={handleImageClick}
              >
                {profileImagePreview ? (
                  <>
                    <img 
                      src={profileImagePreview} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-white text-5xl md:text-6xl font-bold font-serif tracking-tighter">
                    {initials}
                  </span>
                )}
              </div>
              
              {/* Image upload/remove controls */}
              {isEditing && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {profileImagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="p-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
                    title="Change image"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Uploading indicator */}
              {imageUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="text-white text-sm font-semibold">Uploading...</div>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-1">{user.name}</h1>
                  <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2 italic">
                    <Mail className="w-4 h-4" /> {user.email}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  {!isEditing && activeTab === "profile" ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : activeTab === "profile" && (
                    <>
                      <button 
                        onClick={handleProfileSubmit} 
                        disabled={loading || imageUploading} 
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {loading || imageUploading ? "Saving..." : "Save"}
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8 flex flex-wrap gap-2">
                <TabButton 
                  active={activeTab === "profile"} 
                  onClick={() => setActiveTab("profile")}
                  icon={<User className="w-4 h-4" />}
                  label="Profile"
                />
                <TabButton 
                  active={activeTab === "password"} 
                  onClick={() => setActiveTab("password")}
                  icon={<Lock className="w-4 h-4" />}
                  label="Password"
                />
                <TabButton 
                  active={activeTab === "addresses"} 
                  onClick={() => setActiveTab("addresses")}
                  icon={<MapPin className="w-4 h-4" />}
                  label="Addresses"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "profile" && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  Personal Details
                </h2>
                
                {/* Profile Image Upload Info */}
                {isEditing && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Camera className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-slate-900">Profile Image</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Click on your profile image to upload a new one. Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                    </p>
                    {profileImagePreview && (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200">
                          <img 
                            src={profileImagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem 
                    label="Full Name" 
                    value={formData.name} 
                    name="name" 
                    isEditing={isEditing} 
                    onChange={handleInputChange} 
                    icon={<User />} 
                  />
                  <DetailItem 
                    label="Phone Number" 
                    value={formData.phone} 
                    name="phone" 
                    isEditing={isEditing} 
                    onChange={handleInputChange} 
                    icon={<Phone />} 
                    placeholder="Not provided" 
                  />
                  <DetailItem 
                    label="Email" 
                    value={formData.email} 
                    name="email" 
                    isEditing={false} 
                    icon={<Mail />} 
                    placeholder="Email" 
                  />
                  <DetailItem 
                    label="About You" 
                    value={formData.bio} 
                    name="bio" 
                    isEditing={isEditing} 
                    onChange={handleInputChange} 
                    icon={<Sparkles />} 
                    placeholder="Share a bit about yourself..." 
                    isTextArea 
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            )}

            {/* Rest of the code remains the same... */}
            {activeTab === "password" && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  Change Password
                </h2>
                
                {passwordMessage.text && (
                  <div className={`mb-6 p-4 rounded-2xl ${
                    passwordMessage.type === "success" 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-rose-50 text-rose-700"
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <PasswordField 
                      label="Current Password" 
                      name="currentPassword" 
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <PasswordField 
                      label="New Password" 
                      name="newPassword" 
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      helper="Must be at least 6 characters"
                    />
                    <PasswordField 
                      label="Confirm New Password" 
                      name="confirmPassword" 
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" /> 
                      {passwordLoading ? "Changing..." : "Change Password"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        });
                        setPasswordMessage({ type: "", text: "" });
                      }}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                      <X className="w-4 h-4" /> Clear
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    Saved Addresses
                  </h2>
                  <button 
                    onClick={handleAddAddress}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>
                
                {showAddressForm && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                      {editingAddressId ? "Edit Address" : "Add New Address"}
                    </h3>
                    
                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AddressField 
                          label="Full Name *" 
                          name="name" 
                          value={addressForm.name}
                          onChange={handleAddressInputChange}
                          required
                        />
                        <AddressField 
                          label="Phone Number *" 
                          name="phone" 
                          value={addressForm.phone}
                          onChange={handleAddressInputChange}
                          required
                        />
                        <AddressField 
                          label="Address Line 1 *" 
                          name="addressLine1" 
                          value={addressForm.addressLine1}
                          onChange={handleAddressInputChange}
                          required
                        />
                        <AddressField 
                          label="Address Line 2" 
                          name="addressLine2" 
                          value={addressForm.addressLine2}
                          onChange={handleAddressInputChange}
                        />
                        <AddressField 
                          label="City *" 
                          name="city" 
                          value={addressForm.city}
                          onChange={handleAddressInputChange}
                          required
                        />
                        <AddressField 
                          label="State *" 
                          name="state" 
                          value={addressForm.state}
                          onChange={handleAddressInputChange}
                          required
                        />
                        <AddressField 
                          label="Postal Code *" 
                          name="postalCode" 
                          value={addressForm.postalCode}
                          onChange={handleAddressInputChange}
                          required
                        />
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Address Type</label>
                            <div className="flex gap-4">
                              <AddressTypeButton 
                                type="home" 
                                icon={<Home className="w-4 h-4" />}
                                label="Home"
                                selected={addressForm.type === "home"}
                                onClick={() => setAddressForm(prev => ({ ...prev, type: "home" }))}
                              />
                              <AddressTypeButton 
                                type="work" 
                                icon={<Briefcase className="w-4 h-4" />}
                                label="Work"
                                selected={addressForm.type === "work"}
                                onClick={() => setAddressForm(prev => ({ ...prev, type: "work" }))}
                              />
                              <AddressTypeButton 
                                type="other" 
                                icon={<Map className="w-4 h-4" />}
                                label="Other"
                                selected={addressForm.type === "other"}
                                onClick={() => setAddressForm(prev => ({ ...prev, type: "other" }))}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="isDefault"
                              name="isDefault"
                              checked={addressForm.isDefault}
                              onChange={handleAddressInputChange}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <label htmlFor="isDefault" className="text-sm font-semibold text-slate-700">
                              Set as default address
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          type="submit" 
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all"
                        >
                          <Save className="w-4 h-4" /> Save Address
                        </button>
                        <button 
                          type="button" 
                          onClick={handleCancelAddress}
                          className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No saved addresses</h3>
                      <p className="text-slate-500 mb-6">Add your first address to make checkout faster</p>
                      <button 
                        onClick={handleAddAddress}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all mx-auto"
                      >
                        <Plus className="w-4 h-4" /> Add Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <AddressCard 
                        key={address._id}
                        address={address}
                        onEdit={() => handleEditAddress(address)}
                        onDelete={() => handleDeleteAddress(address._id)}
                        onSetDefault={() => handleSetDefaultAddress(address._id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Account Overview Stats */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-indigo-500" /> Activity
              </h3>
              <div className="space-y-4">
                <StatRow label="Orders Completed" value={orderLoading ? "..." : orderCount} />
                <StatRow label="Wishlist Items" value={user?.wishlist?.length || 0} />
                <StatRow label="Saved Addresses" value={addresses.length} />
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Membership</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter rounded-full">Active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 overflow-hidden">
              <h3 className="px-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Navigation</h3>
              <div className="space-y-1">
                <NavButton onClick={() => navigate("/orders")} icon={<Package />} label="Track Orders" />
                <NavButton onClick={() => navigate("/wishlist")} icon={<Heart />} label="My Favorites" />
              </div>
            </div>

            {/* Account Type Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight">Account Tier</h4>
                  <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest opacity-80">
                    {user.isAdmin ? "Administrator" : "Premium Member"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components remain the same...
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function DetailItem({ label, value, name, isEditing, onChange, icon, placeholder, isTextArea }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      {isEditing ? (
        isTextArea ? (
          <textarea 
            name={name} 
            value={value} 
            onChange={onChange} 
            rows="3" 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-medium" 
            placeholder={placeholder}
          />
        ) : (
          <input 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-medium" 
            placeholder={placeholder}
          />
        )
      ) : (
        <div className="flex items-start gap-3 px-4 py-4 bg-[#FBFCFE] border border-slate-50 rounded-2xl group hover:border-indigo-100 transition-colors">
          <span className="text-slate-300 mt-0.5">{icon}</span>
          <span className="text-slate-900 font-medium text-sm leading-relaxed">{value || placeholder}</span>
        </div>
      )}
    </div>
  );
}

function PasswordField({ label, name, value, onChange, required, helper }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type="password" 
        name={name} 
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-medium"
      />
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function AddressField({ label, name, value, onChange, required, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type={type}
        name={name} 
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all text-slate-900 font-medium"
      />
    </div>
  );
}

function AddressTypeButton({ type, icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
          : "border-slate-200 hover:border-slate-300 text-slate-600"
      }`}
    >
      {icon}
      <span className="text-xs font-semibold mt-2">{label}</span>
    </button>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case "home": return <Home className="w-5 h-5" />;
      case "work": return <Briefcase className="w-5 h-5" />;
      default: return <Map className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "home": return "text-emerald-600 bg-emerald-50";
      case "work": return "text-blue-600 bg-blue-50";
      default: return "text-purple-600 bg-purple-50";
    }
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all ${address.isDefault ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(address.type)}`}>
            {getTypeIcon(address.type)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{address.name}</h4>
            <p className="text-slate-600 text-sm">{address.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {address.isDefault ? (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-full">
              Default
            </span>
          ) : (
            <button
              onClick={onSetDefault}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full hover:bg-slate-200 transition-colors"
            >
              Set Default
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        <p className="text-slate-900">{address.addressLine1}</p>
        {address.addressLine2 && (
          <p className="text-slate-900">{address.addressLine2}</p>
        )}
        <p className="text-slate-600">
          {address.city}, {address.state}, {address.country} - {address.postalCode}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}

function NavButton({ onClick, icon, label }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group text-slate-600 hover:text-indigo-600">
      <div className="flex items-center gap-3 font-bold text-sm">
        <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">{icon}</span>
        {label}
      </div>
      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </button>
  );
}

