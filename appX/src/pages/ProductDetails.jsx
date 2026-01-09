
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from 'react-hot-toast'; 
import { ShoppingBag, Heart, ChevronLeft, Star, ShieldCheck, Truck, RefreshCw, Minus, Plus, Check, Award, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const res = await API.get(`/user/products/${id}`);
      setProduct(res.data.product || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await API.post(`/user/cart/add/${id}`, { quantity });
      toast.success("Added to your bag", { 
        icon: '🛍️',
        style: {
          background: '#4F46E5',
          color: '#fff',
        }
      });
    } catch (err) {
      toast.error("Error adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };


  const addToWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await API.post(`/user/wishlist/add/${id}`);
      toast.success("Saved to favorites", { 
        icon: '💖',
        style: {
          background: '#EC4899',
          color: '#fff',
        }
      });
    } catch (err) {
      toast.error("Error adding to wishlist");
    }
  };

  const generateRandomRating = () => (4.0 + Math.random() * 1.0).toFixed(1);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-medium tracking-wide animate-pulse">Curating product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-3xl mb-8">
          <Package className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-serif text-slate-900 mb-4 tracking-tight">Piece Unavailable</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">This exquisite piece seems to have found another home or is currently being curated.</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Explore Our Collection
        </button>
      </div>
    );
  }

  const productImages = [
    product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`) : "https://via.placeholder.com/600x600",
  ];

  const discountPercentage = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-indigo-50/20 to-purple-50/10 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Navigation */}
        <nav className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-medium text-sm transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="group-hover:translate-x-1 transition-transform">Back to Collection</span>
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="text-slate-400 text-sm">{product.category || "Premium"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left: Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Main Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-purple-100/10 rounded-[2.5rem] -z-10"></div>
              <div className="aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center p-12 backdrop-blur-sm">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
              
              {discountPercentage > 0 && (
                <div className="absolute top-6 right-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-tight shadow-lg shadow-emerald-200">
                    Save {discountPercentage}%
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-4 justify-center">
                {productImages.map((img, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-24 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                      selectedImage === index 
                        ? "border-indigo-600 shadow-lg shadow-indigo-100 scale-105" 
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      alt=""
                    />
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-indigo-600/10"></div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">In Stock</p>
                  <p className="text-xs text-slate-500">Ready to ship</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Premium Quality</p>
                  <p className="text-xs text-slate-500">Handcrafted</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full border border-indigo-100">
                  {product.category || "Premium Selection"}
                </span>
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-2.5 rounded-full border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-900">{generateRandomRating()}</span>
                  <span className="text-xs text-amber-400">•</span>
                  <span className="text-xs text-amber-800 font-medium">Verified Reviews</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-serif text-slate-900 leading-tight mb-6 tracking-tight">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="mb-10">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-bold text-slate-900">₹{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-xl text-slate-400 line-through font-light">₹{product.oldPrice}</span>
                  )}
                </div>
                {product.oldPrice && (
                  <p className="text-emerald-600 font-semibold text-sm">
                    You save ₹{product.oldPrice - product.price} ({discountPercentage}%)
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-200 to-transparent"></div>
                <p className="text-slate-600 text-lg leading-relaxed pl-4 italic border-l-2 border-indigo-100">
                  "{product.description || "A masterpiece of craftsmanship, designed for enduring beauty and exceptional performance. Each detail is carefully considered to deliver an unparalleled experience."}"
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-12">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Select Quantity</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-14 h-14 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors border-r border-slate-100"
                  >
                    <Minus className="w-5 h-5 text-slate-600" />
                  </button>
                  <span className="w-20 text-center font-bold text-slate-900 text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-14 h-14 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors border-l border-slate-100"
                  >
                    <Plus className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <span className="text-slate-500 text-sm">
                  {quantity} {quantity === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-16">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={addToCart}
                disabled={addingToCart}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Shopping Bag
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={addToWishlist}
                className="w-full bg-white border-2 border-slate-200 text-slate-900 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 hover:shadow-md"
              >
                <Heart className="w-5 h-5" />
                Save to Favorites
              </motion.button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-100">
              <div className="text-center group">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-1">Free Shipping</h4>
                <p className="text-xs text-slate-500">3-5 business days</p>
              </div>
              
              <div className="text-center group">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-1">2-Year Warranty</h4>
                <p className="text-xs text-slate-500">Quality assured</p>
              </div>
              
              <div className="text-center group">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-1">Easy Returns</h4>
                <p className="text-xs text-slate-500">30-day policy</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}