import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import { useState } from "react";

const Card = ({
  item,
  handleDeleteOpen,
  handleUpdate,
  setDeletedItem,
  isUpdating,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleDel = (productId, itemId, quantity) => {
    setDeletedItem({
      productId: productId,
      itemId: itemId,
      quantity: quantity,
    });
    handleDeleteOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getImageUrl = () => {
    if (item?.product?.images?.[0]?.image_url) {
      return item.product.images[0].image_url;
    }
    return "/api/placeholder/80/80";
  };

  const totalPrice = parseInt(item.product.price) * item.quantity;
  const hasDiscount =
    item.product.original_price &&
    item.product.original_price < item.product.price;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-6 mb-4 border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
          <div className="relative w-full sm:w-24 md:w-28 lg:w-32 aspect-square mx-auto sm:mx-0">
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg" />
            )}

            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-4xl">🖼️</span>
              </div>
            ) : (
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                src={getImageUrl()}
                alt={item.product.name}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {/* Left side - Product info */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product.id}`}>
                <h3 className="font-bold text-base sm:text-lg text-blue-600 hover:text-blue-800 transition-colors mb-1 line-clamp-2">
                  {item.product.name}
                </h3>
              </Link>

              {item.product.category && (
                <p className="text-gray-500 text-xs sm:text-sm mb-2">
                  {item.product.category}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <p className="font-bold text-lg sm:text-xl text-gray-800">
                  {formatCurrency(item.product.original_price)}
                </p>
                {hasDiscount && (
                  <>
                    <p className="text-sm text-gray-500 line-through">
                      {formatCurrency(item.product.price)}
                    </p>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      {Math.round(
                        ((item.product.price - item.product.original_price)) /
                          item.product.price) *
                          100
                      }
                      % OFF
                    </span>
                  </>
                )}
              </div>

              {/* Mobile: Quantity and delete */}
              <div className="flex items-center justify-between sm:hidden mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handleUpdate("-", item.quantity, item.product.id)
                    }
                    disabled={item.quantity <= 1 || isUpdating}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      item.quantity <= 1 || isUpdating
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border-gray-300 hover:border-red-300"
                    }`}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus className="w-4 h-4" />
                  </motion.button>

                  <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center">
                    {item.quantity}
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handleUpdate("+", item.quantity, item.product.id)
                    }
                    disabled={isUpdating}
                    className="p-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-green-50 text-gray-700 hover:text-green-600 hover:border-green-300 transition-all disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    <FiPlus className="w-4 h-4" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    handleDel(item.product.id, item.id, item.quantity)
                  }
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                  aria-label="Remove item"
                >
                  <FiTrash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Right side - Desktop controls */}
            <div className="hidden sm:flex flex-col items-end justify-between gap-3">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    handleUpdate("-", item.quantity, item.product.id)
                  }
                  disabled={item.quantity <= 1 || isUpdating}
                  className={`p-2 rounded-lg transition-all ${
                    item.quantity <= 1 || isUpdating
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-300"
                  }`}
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-4 h-4" />
                </motion.button>

                <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center">
                  {item.quantity}
                </span>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    handleUpdate("+", item.quantity, item.product.id)
                  }
                  disabled={isUpdating}
                  className="p-2 rounded-lg bg-white hover:bg-green-50 text-gray-700 hover:text-green-600 border border-gray-200 hover:border-green-300 transition-all disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Total Price */}
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Total</div>
                <motion.div
                  key={totalPrice}
                  initial={{ scale: 1.1, color: "#10b981" }}
                  animate={{ scale: 1, color: "#1f2937" }}
                  className="font-bold text-xl text-gray-800"
                >
                  {formatCurrency(totalPrice)}
                </motion.div>
              </div>

              {/* Delete Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  handleDel(item.product.id, item.id, item.quantity)
                }
                className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg font-medium"
                aria-label="Remove item"
              >
                <FiTrash2 className="w-4 h-4" />
                Remove
              </motion.button>
            </div>
          </div>

          {/* Mobile: Total price */}
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-600">Item Total:</span>
            <motion.span
              key={totalPrice}
              initial={{ scale: 1.1, color: "#10b981" }}
              animate={{ scale: 1, color: "#1f2937" }}
              className="font-bold text-lg text-gray-800"
            >
              {formatCurrency(totalPrice)}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
