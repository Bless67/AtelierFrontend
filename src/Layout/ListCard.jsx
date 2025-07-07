import { motion } from "framer-motion";
import { useState, memo } from "react";
import {
  BsCart3,
  BsEye,
  BsHeart,
  BsHeartFill,
  BsStar,
  BsStarFill,
  BsStarHalf,
} from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { MdRemoveRedEye } from "react-icons/md";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const ListCard = memo(({ item, onAddToCart, onQuickView, onWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Validate required data
  if (!item || !item.images || item.images.length === 0) {
    return <SkeletonCard />;
  }

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <motion.article
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        y: -8,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.3,
      }}
      className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer select-none border border-gray-100"
      role="article"
      aria-label={`Product: ${item.name}`}
      tabIndex={0}
    >
      {/* Quick Action Buttons */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlist?.(item);
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-colors"
            aria-label={`Add ${item.name} to wishlist`}
          >
            <AiOutlineHeart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView?.(item);
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            aria-label={`Quick view ${item.name}`}
          >
            <MdRemoveRedEye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
          </motion.button>
        </div>
      </div>

      {/* Product Badge */}
      {item.isNew && (
        <div className="absolute top-3 left-3 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          New
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden bg-gray-50">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-green-500"
            />
          </div>
        )}

        <img
          src={
            imageError
              ? "/api/placeholder/400/400"
              : `${item.images[0].medium_url}`
          }
          alt={`${item.name} - ${item.category} product image`}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            filter: imageError ? "none" : "brightness(1.05)",
            padding: imageError ? "20px" : "8px",
          }}
        />

        {/* Overlay for additional actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Add to Cart Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(item);
          }}
          aria-label={`Add ${item.name} to cart`}
        >
          <FaShoppingCart className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors">
            {truncateText(item.name, 40)}
          </h3>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-green-700">
            {formatPrice(item.price)}
          </span>
          {item.original_price && item.original_price > item.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(item.original_price)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
            {item.category}
          </span>

          {item.name && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  const rating = 5;
                  if (i < Math.floor(rating)) {
                    return (
                      <BsStarFill key={i} className="text-xs text-yellow-400" />
                    );
                  } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                    return (
                      <BsStarHalf key={i} className="text-xs text-yellow-400" />
                    );
                  } else {
                    return <BsStar key={i} className="text-xs text-gray-300" />;
                  }
                })}
              </div>
              <span className="text-xs text-gray-500">
                ({item.reviewCount || 24})
              </span>
            </div>
          )}
        </div>

        {/* Stock Status */}
        {item.stock !== undefined && (
          <div className="mt-2">
            {item.stock > 0 ? (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {item.stock < 10 ? `Only ${item.stock} left` : "In Stock"}
              </span>
            ) : (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Out of Stock
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
});

// Skeleton component for loading states
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse border border-gray-100">
    <div className="w-full aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

ListCard.displayName = "ListCard";

export default ListCard;
