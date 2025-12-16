// CartItem.jsx - IMPROVED VERSION
import { useNavigate } from "react-router-dom";
import NavBar from "../Layout/NavBar";
import Modal from "../Layout/Modal";
import Card from "../Layout/Card";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiAlertTriangle,
  FiRefreshCw,
  FiArrowLeft,
  FiTrash2,
  FiX,
  FiCheck,
  FiArrowRight,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { BsCartX, BsWhatsapp } from "react-icons/bs";
import { MdError } from "react-icons/md";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, deleteCart, updateCart } from "../utils/CartUtils";
import { useCart } from "../utils/CartProvider";

const CartItem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCartQuantity } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [deletedItem, setDeletedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Fetch Cart
  const {
    data: cartData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const handleWhatsAppCheckout = () => {
    const phoneNumber = `${import.meta.env.VITE_CHECKOUT_WHATSAPP_NUMBER}`;

    // Create detailed message with product names and quantities
    const items = cartData
      ?.map(
        (item, index) =>
          `${index + 1}. ${item.product.name} (x${item.quantity})`
      )
      .join("\n");

    const totalAmount = formatCurrency(cartSummary.total);

    const message = `Hi! I'd like to purchase the following items:

${items}

Total Items: ${cartSummary.itemCount}
Total Amount: ${totalAmount}

Please confirm availability and provide payment details. Thank you!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    toast.success("🟢 Redirecting to WhatsApp...");
  };

  // Memoized calculations
  const cartSummary = useMemo(() => {
    if (!cartData)
      return { total: 0, itemCount: 0, uniqueItems: 0, savings: 0 };

    const total = cartData.reduce(
      (sum, item) => sum + parseInt(item.product.original_price)) * item.quantity,
      0
    );

    const originalTotal = cartData.reduce((sum, item) => {
      const originalPrice = item.product.price
      return sum + parseInt(originalPrice) * item.quantity;
    }, 0);

    const itemCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItems = cartData.length;
    const savings = originalTotal - total;

    return { total, itemCount, uniqueItems, savings, originalTotal };
  }, [cartData]);

  // Optimistic update for better UX
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }) => updateCart(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      setIsUpdating(true);
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(
        ["cart"],
        (old) =>
          old?.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ) || []
      );

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error("❌ Failed to update quantity. Please try again.");
    },
    onSuccess: () => {
      toast.success("✅ Cart updated!");
    },
    onSettled: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Delete Item with optimistic update
  const deleteCartMutation = useMutation({
    mutationFn: (productId) => deleteCart(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData(["cart"]);
      const itemToDelete = previousCart?.find(
        (item) => item.product.id === productId
      );

      queryClient.setQueryData(
        ["cart"],
        (old) => old?.filter((item) => item.product.id !== productId) || []
      );

      return { previousCart, deletedQuantity: itemToDelete?.quantity || 0 };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error("❌ Failed to remove item. Please try again.");
    },
    onSuccess: (data, variables, context) => {
      toast.success("🗑️ Item removed from cart!");
      setCartQuantity((prev) => prev - context.deletedQuantity);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleUpdate = (how, quantity, productId) => {
    if (isUpdating) return;

    if (how === "+" || (how === "-" && quantity > 1)) {
      const newQuantity = how === "+" ? quantity + 1 : quantity - 1;
      updateCartMutation.mutate({ productId, quantity: newQuantity });
      setCartQuantity((prev) => (how === "+" ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = () => {
    if (deletedItem?.productId) {
      deleteCartMutation.mutate(deletedItem.productId);
      setDeletedItem(null);
      setModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setDeletedItem(null);
  };

  const handleCheckout = () => {
    if (cartSummary.itemCount === 0) {
      toast.warning("⚠️ Your cart is empty!");
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleContinueShopping = () => {
    navigate("/catalog");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2,
      },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  const summaryVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar showSearchbtn={true} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
        className="mt-16"
        pauseOnHover={false}
        newestOnTop={true}
      />

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
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
              className="ml-3 text-gray-600 font-medium"
            >
              Loading your cart...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="max-w-md mx-auto mt-10 p-6 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg mx-4"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-red-600 mb-4"
              >
                <MdError className="w-12 h-12 mx-auto" />
              </motion.div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to load cart
              </h3>
              <p className="text-red-600 mb-4 text-sm">
                {error?.message || "Something went wrong. Please try again."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["cart"] })
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 font-medium shadow-md"
              >
                <FiRefreshCw className="w-4 h-4" />
                Retry
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto py-6 sm:py-8 px-4"
          >
            {/* Delete Modal */}
            <AnimatePresence>
              {modalOpen && (
                <Modal
                  isOpen={modalOpen}
                  onClose={handleModalClose}
                  showCloseButton={false}
                >
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="text-orange-500 mb-4"
                    >
                      <FiAlertTriangle className="w-16 h-16 mx-auto" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Remove Item?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to remove this item from your cart?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleModalClose}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 font-medium"
                      >
                        <FiX className="w-5 h-5" />
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 font-medium shadow-md"
                        disabled={deleteCartMutation.isPending}
                      >
                        {deleteCartMutation.isPending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <FiRefreshCw className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <FiTrash2 className="w-5 h-5" />
                        )}
                        {deleteCartMutation.isPending
                          ? "Removing..."
                          : "Remove"}
                      </motion.button>
                    </div>
                  </motion.div>
                </Modal>
              )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <AnimatePresence>
              {checkoutModalOpen && (
                <Modal
                  isOpen={checkoutModalOpen}
                  onClose={() => setCheckoutModalOpen(false)}
                  showCloseButton={true}
                >
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="text-green-500 mb-4"
                    >
                      <BsWhatsapp className="w-16 h-16 mx-auto" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Complete Your Purchase
                    </h3>
                    <p className="text-gray-600 mb-2">
                      You'll be redirected to WhatsApp to complete your order
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Order Summary:</strong>
                      </p>
                      <div className="text-left text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">
                            {cartSummary.itemCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-green-700">
                            {formatCurrency(cartSummary.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCheckoutModalOpen(false)}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 font-medium"
                      >
                        <FiX className="w-5 h-5" />
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleWhatsAppCheckout}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2 font-medium shadow-md"
                      >
                        <BsWhatsapp className="w-5 h-5" />
                        Continue to WhatsApp
                      </motion.button>
                    </div>
                  </motion.div>
                </Modal>
              )}
            </AnimatePresence>

            {/* Empty Cart */}
            {cartData.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center max-w-md mx-auto mt-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                >
                  <BsCartX className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-8">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinueShopping}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2 font-medium shadow-lg"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Start Shopping
                </motion.button>
              </motion.div>
            )}

            {/* Cart Content */}
            {cartData.length > 0 && (
              <>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6 sm:mb-8"
                >
                  <h1 className="text-center font-bold text-gray-800 text-2xl sm:text-3xl lg:text-4xl mb-2">
                    Shopping Cart
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-gray-600 text-sm sm:text-base"
                  >
                    You have <strong>{cartSummary.itemCount}</strong> item
                    {cartSummary.itemCount !== 1 ? "s" : ""}
                    {cartSummary.uniqueItems !== cartSummary.itemCount &&
                      ` (${cartSummary.uniqueItems} unique product${
                        cartSummary.uniqueItems !== 1 ? "s" : ""
                      })`}
                  </motion.p>
                </motion.div>

                <div className="flex flex-col lg:flex-row lg:gap-8">
                  {/* Items */}
                  <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:w-2/3"
                  >
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {cartData.map((item) => (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Card
                              item={item}
                              handleDeleteOpen={setModalOpen}
                              handleUpdate={handleUpdate}
                              setDeletedItem={setDeletedItem}
                              isUpdating={isUpdating}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Continue Shopping Button */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6"
                    >
                      <motion.button
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleContinueShopping}
                        className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
                      >
                        <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        Continue Shopping
                      </motion.button>
                    </motion.div>
                  </motion.section>

                  {/* Summary (Desktop) */}
                  <motion.section
                    variants={summaryVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:w-1/3 mt-8 lg:mt-0 mb-24 lg:mb-0"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl shadow-xl p-6 sticky top-6"
                    >
                      <h2 className="text-xl font-bold text-center text-gray-800 mb-4 flex items-center justify-center gap-2">
                        <FiPackage className="w-5 h-5" />
                        Order Summary
                      </h2>
                      <hr className="border-gray-200 mb-4" />

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3 mb-6"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Items:</span>
                          <motion.span
                            key={cartSummary.itemCount}
                            initial={{ scale: 1.2, color: "#10b981" }}
                            animate={{ scale: 1, color: "#374151" }}
                            className="font-medium"
                          >
                            {cartSummary.itemCount}
                          </motion.span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Unique Products:
                          </span>
                          <motion.span
                            key={cartSummary.uniqueItems}
                            initial={{ scale: 1.2, color: "#10b981" }}
                            animate={{ scale: 1, color: "#374151" }}
                            className="font-medium"
                          >
                            {cartSummary.uniqueItems}
                          </motion.span>
                        </div>
                        {cartSummary.savings > 0 && (
                          <div className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-2 rounded">
                            <span className="text-green-700 font-medium">
                              You Save:
                            </span>
                            <motion.span
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="font-bold text-green-700"
                            >
                              {formatCurrency(cartSummary.savings)}
                            </motion.span>
                          </div>
                        )}
                        <div className="flex justify-between py-3 border-t border-gray-200">
                          <span className="text-gray-600">Subtotal:</span>
                          <motion.span
                            key={cartSummary.total}
                            initial={{ scale: 1.1, color: "#10b981" }}
                            animate={{ scale: 1, color: "#374151" }}
                            className="font-semibold"
                          >
                            {formatCurrency(cartSummary.total)}
                          </motion.span>
                        </div>
                        <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300">
                          <span>Total:</span>
                          <motion.span
                            key={cartSummary.total}
                            initial={{ scale: 1.2, color: "#10b981" }}
                            animate={{ scale: 1, color: "#1f2937" }}
                          >
                            {formatCurrency(cartSummary.total)}
                          </motion.span>
                        </div>
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black font-bold py-4 text-white rounded-xl transition-all md:inline-flex items-center justify-center gap-2 hidden shadow-lg"
                        disabled={cartSummary.itemCount === 0}
                      >
                        <FiCheck className="w-5 h-5" />
                        Proceed to Checkout
                      </motion.button>

                      {/* Trust badges */}
                      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-center">
                        <div className="flex flex-col items-center">
                          <FiTruck className="w-6 h-6 text-green-600 mb-1" />
                          <span className="text-xs text-gray-600">
                            Free Delivery
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <FiCheck className="w-6 h-6 text-blue-600 mb-1" />
                          <span className="text-xs text-gray-600">
                            Secure Checkout
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.section>
                </div>

                {/* Mobile Summary */}
                <motion.section
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-10 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">
                        Total Amount
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <FiShoppingCart className="w-3 h-3" />
                        {cartSummary.itemCount} item
                        {cartSummary.itemCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <motion.div
                      key={cartSummary.total}
                      initial={{ scale: 1.2, color: "#10b981" }}
                      animate={{ scale: 1, color: "#1f2937" }}
                      className="font-bold text-gray-800 text-xl"
                    >
                      {formatCurrency(cartSummary.total)}
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black font-bold py-4 text-white rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-lg"
                    disabled={cartSummary.itemCount === 0}
                  >
                    <FiCheck className="w-5 h-5" />
                    Checkout Now
                  </motion.button>
                </motion.section>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartItem;
