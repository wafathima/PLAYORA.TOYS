import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { ShoppingBag, Heart, Search, SlidersHorizontal, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = category
        ? `/user/products?category=${category}`
        : "/user/products";
      const res = await API.get(url);
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = [...products]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "low-high") return a.price - b.price;
      if (sort === "high-low") return b.price - a.price;
      return 0;
    });

  const addToWishlist = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await API.post(`/user/wishlist/add/${id}`);
      toast.success("Saved to favorites");
    } catch (err) {
      toast.error("Error adding to wishlist");
    }
  };

  const addToCart = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await API.post(`/user/cart/add/${id}`);
      toast.success("Added to your bag", {
        icon: '🛍️',
        style: { backgroundColor: '#1e293b', color: '#fff' }
      });
    } catch (err) {
      toast.error("Error adding to cart");
    }
  };


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Refined Header */}
      <header className="pt-12 pb-8 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {category ? category : "All Collections"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{filteredProducts.length} items found</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300"
              onChange={(e) => setSort(e.target.value)}
              value={sort}
            >
              <option value="">Sort: Recommended</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {/* Updated 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProducts.map((p) => {
              const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
              
              return (
                <motion.div
                  key={p._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white border border-slate-400 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-blue-600 transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <img
                      src={p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`) : "https://via.placeholder.com/500"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={p.name}
                      onClick={() => navigate(`/products/${p._id}`)}
                    />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(p._id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-rose-500 transition-colors border border-slate-50"
                    >
                      <Heart className="w-5 h-5" fill={user?.wishlist?.includes(p._id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={() => addToCart(p._id)}
                        className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-rose-700 transition-colors"
                      >
                        Add to bag <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 
                      className="text-lg font-bold text-slate-800 leading-snug mb-2 cursor-pointer hover:text-blue-600 line-clamp-2 min-h-[3.5rem]"
                      onClick={() => navigate(`/products/${p._id}`)}
                    >
                      {p.name}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      {p.originalPrice && (
                        <span className="text-slate-400 line-through text-sm font-medium">₹{p.originalPrice}</span>
                      )}
                      <span className="text-xl font-bold text-green-800 text-[1.1rem]">₹{p.price}</span>
        
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No products match your search.</p>
            <button 
              onClick={() => setSearch("")}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}