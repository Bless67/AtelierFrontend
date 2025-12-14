// SingleProduct.jsx - COMPLETE IMPROVED VERSION
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NavBar from "../Layout/NavBar";
import ProductCarousel from "../Layout/ProductCarousel";
import { ToastContainer, toast } from "react-toastify";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaHeart,
  FaShare,
  FaShieldAlt,
  FaTruck,
  FaUndo,
} from "react-icons/fa";

import {
  getSingleCart,
  addCart,
  updateCart,
  deleteCart,
} from "../utils/CartUtils";
import { useCart } from "../utils/CartProvider";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const SingleProduct = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { setCartQuantity, cartQuantity } = useCart();
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const fetchData = async () => {
    const response = await api.get(`product/${id}/`);
    return response.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000,
  });

  const handleAddCart = async (productId, quantity) => {
    try {
      await addCart(productId, quantity);
      setCartQuantity((prevQuantity) => prevQuantity + quantity);
      setCartData((prevData) => ({ ...prevData, quantity: quantity }));
      toast.success("🛒 Added to cart successfully!", {
        className: "!bg-green-50 !text-green-800 !border-l-4 !border-green-400",
      });
    } catch (err) {
      toast.error("Failed to add to cart!");
    }
  };

  const handleUpdate = async (how, quantity, productId) => {
    try {
      let newQuantity = how === "+" ? quantity + 1 : quantity - 1;

      if (newQuantity < 1) {
        await deleteCart(productId);
        setCartData({});
        setCartQuantity((prev) => prev - 1);
        toast.success("Item removed from cart!");
      } else {
        await updateCart(productId, newQuantity);
        setCartData((prevData) => ({ ...prevData, quantity: newQuantity }));
        setCartQuantity((prev) => (how === "+" ? prev + 1 : prev - 1));
        toast.success("Cart updated!");
      }
    } catch (err) {
      toast.error("Failed to update cart!");
    }
  };

  const fetchCartData = async () => {
    try {
      setCartLoading(true);
      setCartError(null);
      const response = await getSingleCart(id);
      setCartData(response || {});
    } catch (err) {
      setCartError(err);
      setCartData({});
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCartData();
    }
  }, [id]);

  const isInCart = () => {
    return (
      cartData &&
      typeof cartData === "object" &&
      Object.keys(cartData).length > 0
    );
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? "💔 Removed from wishlist" : "💖 Added to wishlist!"
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.name,
          text: `Check out this product: ${data?.name}`,
          url: window.location.href,
        });
        toast.success("🔗 Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(window.location.href);
          toast.success("🔗 Link copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("🔗 Link copied to clipboard!");
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const renderCartControls = (isMobile = false) => {
    if (cartLoading) {
      return (
        <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-14 rounded-xl"></div>
      );
    }

    if (!isInCart()) {
      return (
        <motion.button
          onClick={() => handleAddCart(data.id, 1)}
          disabled={!data}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative overflow-hidden ${
            isMobile
              ? "w-full flex items-center justify-center gap-3 text-lg font-semibold py-4 px-6 rounded-xl"
              : "flex items-center gap-3 text-lg font-semibold py-4 px-8 rounded-xl"
          } bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <FaShoppingCart className="text-xl relative z-10" />
          <span className="relative z-10">Add to Cart</span>
        </motion.button>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`${
          isMobile
            ? "flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border border-gray-100"
            : "flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
        }`}
      >
        <motion.button
          onClick={() => handleUpdate("-", parseInt(cartData?.quantity), id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 text-gray-600 hover:text-red-500 border-2 border-gray-200 hover:border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200"
        >
          <FaMinus className="text-sm" />
        </motion.button>

        <div className="flex items-center gap-2 px-4">
          <span className="text-xl font-bold text-gray-800">
            {cartData?.quantity}
          </span>
          <span className="text-sm text-gray-500">in cart</span>
        </div>

        <motion.button
          onClick={() => handleUpdate("+", parseInt(cartData?.quantity), id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 text-gray-600 hover:text-green-500 border-2 border-gray-200 hover:border-green-300 rounded-lg hover:bg-green-50 transition-all duration-200"
        >
          <FaPlus className="text-sm" />
        </motion.button>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar showSearchbtn={true} />
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-gray-700"
            />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="ml-3 text-gray-600"
            >
              Loading product and cart...
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar showSearchbtn={true} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-[80vh]"
        >
          <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md mx-4">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load this product. Please try again later.
            </p>
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["product", id] })
              }
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar showSearchbtn={true} />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />

      {cartError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg"
        >
          <div className="flex items-center">
            <div className="text-orange-400 mr-3">⚠️</div>
            <p className="text-orange-800 text-sm">
              Cart data couldn't be loaded, but you can still add items to cart
            </p>
          </div>
        </motion.div>
      )}

      {data && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 py-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <motion.div
              variants={itemVariants}
              className="space-y-4 overflow-hidden"
            >
              <ProductCarousel images={data.images} productName={data.name} />
            </motion.div>

            {/* Product Info */}
            <motion.div
              variants={itemVariants}
              className="space-y-6 overflow-hidden"
            >
              {/* Header Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight"
                    >
                      {data.name}
                    </motion.h1>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 sm:p-3 rounded-full border-2 border-gray-200 bg-gray-50 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
                      aria-label="Share product"
                    >
                      <FaShare className="text-sm sm:text-base" />
                    </motion.button>
                  </div>
                </div>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {formatCurrency(data.original_price)}
                    </span>
                    {data.original_price &&
                      data.original_price > data.price && (
                        <>
                          <span className="text-base sm:text-lg text-gray-500 line-through">
                            {formatCurrency(data.price)}
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-md">
                            {Math.round(
                              ((data.price - data.original_price) /
                                data.price) *
                                100
                            )}
                            % off
                          </span>
                        </>
                      )}
                  </div>
                </motion.div>

                {/* Category */}
                {data.category && (
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      {data.category}
                    </span>
                  </div>
                )}

                {/* Desktop Cart Controls */}
                <div className="hidden lg:block mb-6">
                  {renderCartControls(false)}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <FaTruck className="text-green-500 text-lg sm:text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Free Delivery</p>
                  </div>
                  <div className="text-center">
                    <FaShieldAlt className="text-blue-500 text-lg sm:text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Secure Payment</p>
                  </div>
                  <div className="text-center">
                    <FaUndo className="text-purple-500 text-lg sm:text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Easy Returns</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Description
                </h3>
                <div className="relative">
                  <p
                    className={`text-sm sm:text-base text-gray-600 leading-relaxed ${
                      showFullDescription ? "" : "line-clamp-4"
                    }`}
                  >
                    {data.description}
                  </p>

                  {data.description && data.description.length > 200 && (
                    <motion.button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      whileHover={{ scale: 1.02 }}
                      className="text-blue-600 hover:text-blue-800 font-medium mt-2 transition-colors duration-200 text-sm sm:text-base"
                    >
                      {showFullDescription ? "Show Less" : "Read More"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Sticky Cart */}
          <AnimatePresence>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="lg:hidden sticky bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-10 pb-safe mt-5"
            >
              {renderCartControls(true)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default SingleProduct;
