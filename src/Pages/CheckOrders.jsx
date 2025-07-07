import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import NavBar from "../Layout/NavBar";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEnvelope,
  FaSearch,
  FaShoppingBag,
  FaCalendarAlt,
  FaReceipt,
  FaUser,
  FaArrowLeft,
  FaCopy,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdEmail, MdRefresh } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const CheckOrders = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showTransactionId, setShowTransactionId] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const emailValue = watch("email");

  // Clear error when user starts typing
  useEffect(() => {
    if (error && emailValue) {
      setError(null);
    }
  }, [emailValue, error]);

  const onSubmit = async ({ email }) => {
    setError(null);
    try {
      const response = await api.post("check-orders", { email });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      setData(response.data);

      // Add to search history
      const newSearch = {
        email,
        timestamp: Date.now(),
        count: response.data.length,
      };
      setSearchHistory((prev) => [newSearch, ...prev.slice(0, 2)]);

      reset();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch orders. Please try again.";
      setError(errorMessage);
      setData(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid date";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          label: "Completed",
        };
      case "failed":
      case "cancelled":
        return {
          icon: <FaTimesCircle className="text-red-500" />,
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          label: "Failed",
        };
      case "pending":
        return {
          icon: <FaClock className="text-yellow-500" />,
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          label: "Pending",
        };
      default:
        return {
          icon: <FaClock className="text-blue-500" />,
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          label: status || "Unknown",
        };
    }
  };

  const copyTransactionId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  const toggleTransactionId = (orderId) => {
    setShowTransactionId((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const calculateProductTotal = (product, quantity) => {
    const price = parseFloat(product?.price) || 0;
    const qty = parseInt(quantity) || 0;
    return price * qty;
  };

  const getTotalAmount = (items) => {
    return (
      items?.reduce((total, item) => {
        return total + calculateProductTotal(item.product, item.quantity);
      }, 0) || 0
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <NavBar showSearchbtn={true} />

      <section className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl mb-6 shadow-lg">
            <FaSearch className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Track Your Orders
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Enter your email address to view all your order history and status
            updates
          </p>
        </motion.div>

        {/* Search Form */}
        <AnimatePresence mode="wait">
          {!data && !isSubmitting && (
            <motion.div
              key="search-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg mx-auto mb-8"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MdEmail className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      type="email"
                      id="email"
                      autoFocus
                      placeholder="Enter your email address"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                      className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300 focus:border-gray-400"
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600 flex items-center gap-2"
                      >
                        <FaTimesCircle className="h-4 w-4" />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  <span className="flex items-center justify-center gap-3">
                    <FaSearch className="h-5 w-5" />
                    Search Orders
                  </span>
                </motion.button>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6"
                  >
                    <p className="text-sm text-gray-500 mb-2">
                      Recent searches:
                    </p>
                    <div className="space-y-2">
                      {searchHistory.map((search, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            reset({ email: search.email });
                          }}
                          className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm flex items-center justify-between"
                        >
                          <span className="text-gray-700">{search.email}</span>
                          <span className="text-gray-500">
                            {search.count} orders
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <FaTimesCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                <FaSearch className="absolute inset-0 m-auto h-6 w-6 text-gray-400" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                Searching for your orders...
              </p>
              <p className="text-sm text-gray-500">
                This may take a few moments
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {data && !isSubmitting && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FaShoppingBag className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {data.length === 0
                        ? "No Orders Found"
                        : `${data.length} Order${
                            data.length !== 1 ? "s" : ""
                          } Found`}
                    </h2>
                    <p className="text-gray-500">
                      {data.length === 0
                        ? "We couldn't find any orders for this email"
                        : "Here are all your recent orders"}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setData(null);
                    setError(null);
                    reset();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  Search Again
                </motion.button>
              </div>

              {/* Orders List */}
              {data.length > 0 && (
                <div className="grid gap-6">
                  {data.map((order, index) => {
                    const statusConfig = getStatusConfig(order.status);
                    const orderTotal = getTotalAmount(order.items);

                    return (
                      <motion.div
                        key={order.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-50">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 ${statusConfig.bg} ${statusConfig.border} border rounded-xl flex items-center justify-center`}
                              >
                                {statusConfig.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
                                  >
                                    {statusConfig.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Order placed on {formatDate(order.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                ₦{order.amount || orderTotal.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                              <FaUser className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Customer
                                </p>
                                <p className="font-medium text-gray-900">
                                  {order.customer_name || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Date
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <FaReceipt className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Transaction ID
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      toggleTransactionId(order.id)
                                    }
                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                                  >
                                    {showTransactionId[order.id] ? (
                                      <>
                                        <span className="font-mono">
                                          {order.transaction_id}
                                        </span>
                                        <FaEyeSlash className="h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        <span>••••••••</span>
                                        <FaEye className="h-3 w-3" />
                                      </>
                                    )}
                                  </button>
                                  {showTransactionId[order.id] &&
                                    order.transaction_id && (
                                      <button
                                        onClick={() =>
                                          copyTransactionId(
                                            order.transaction_id
                                          )
                                        }
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        title="Copy transaction ID"
                                      >
                                        <FaCopy
                                          className={`h-3 w-3 ${
                                            copiedId === order.transaction_id
                                              ? "text-green-500"
                                              : "text-gray-400"
                                          }`}
                                        />
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="p-6">
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaShoppingBag className="h-4 w-4" />
                            Products ({order.items?.length || 0})
                          </h3>

                          {order.items?.length > 0 ? (
                            <div className="space-y-3">
                              {order.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {item.product?.name || "Unknown Product"}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Quantity: {item.quantity || 0} × ₦
                                      {item.product?.price || 0}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900">
                                      ₦
                                      {calculateProductTotal(
                                        item.product,
                                        item.quantity
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FaShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                              <p>No products found for this order</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {data.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <FaEnvelope className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Orders Found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We couldn't find any orders associated with this email
                    address. Please double-check your email and try again.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setData(null);
                        setError(null);
                        reset();
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <MdRefresh className="h-5 w-5" />
                      Try Different Email
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
};

export default CheckOrders;
