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
} from "react-icons/fi";
import { BsCartX } from "react-icons/bs";
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

  // Memoized calculations
  const cartSummary = useMemo(() => {
    if (!cartData) return { total: 0, itemCount: 0, uniqueItems: 0 };

    const total = cartData.reduce(
      (sum, item) => sum + parseInt(item.product.price) * item.quantity,
      0
    );
    const itemCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItems = cartData.length;

    return { total, itemCount, uniqueItems };
  }, [cartData]);

  // Optimistic update for better UX
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }) => updateCart(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      setIsUpdating(true);
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistically update cache
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
      // Revert on error
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error("Failed to update quantity. Please try again.");
    },
    onSuccess: () => {
      toast.success("Cart updated!");
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

      // Optimistically remove from cache
      queryClient.setQueryData(
        ["cart"],
        (old) => old?.filter((item) => item.product.id !== productId) || []
      );

      return { previousCart, deletedQuantity: itemToDelete?.quantity || 0 };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error("Failed to remove item. Please try again.");
    },
    onSuccess: (data, variables, context) => {
      toast.success("Item removed from cart!");
      setCartQuantity((prev) => prev - context.deletedQuantity);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleUpdate = (how, quantity, productId) => {
    if (isUpdating) return; // Prevent rapid clicks

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
      toast.warning("Your cart is empty!");
      return;
    }
    navigate("/checkout", { state: { fromCart: true } });
  };

  const handleContinueShopping = () => {
    navigate("/");
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
    <div className="min-h-screen bg-gray-50">
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
              className="ml-3 text-gray-600"
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
            className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg"
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
              <p className="text-red-600 mb-4">
                {error?.message || "Something went wrong. Please try again."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["cart"] })
                }
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
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
            className="container mx-auto py-8 px-4"
          >
            {/* Modal */}
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
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="text-orange-500 mb-4"
                    >
                      <FiAlertTriangle className="w-16 h-16 mx-auto" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Remove Item
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to remove this item from your cart?
                    </p>
                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleModalClose}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDelete}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors inline-flex items-center gap-2"
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
                            <FiRefreshCw className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
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

            {/* Empty Cart */}
            {cartData.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto mt-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                >
                  <BsCartX className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinueShopping}
                  className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 rounded-md transition-colors inline-flex items-center gap-2"
                >
                  <FiShoppingCart className="w-4 h-4" />
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
                  className="mb-8"
                >
                  <h1 className="text-center font-bold text-gray-800 text-3xl mb-2">
                    Your Shopping Cart
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-gray-600"
                  >
                    You have {cartSummary.itemCount} item
                    {cartSummary.itemCount !== 1 ? "s" : ""}
                    {cartSummary.uniqueItems !== cartSummary.itemCount &&
                      ` (${cartSummary.uniqueItems} unique product${
                        cartSummary.uniqueItems !== 1 ? "s" : ""
                      })`}{" "}
                    in your cart
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
                            whileHover={{
                              scale: 1.02,
                              transition: { duration: 0.2 },
                            }}
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
                        className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2"
                      >
                        <FiArrowLeft className="w-4 h-4" />
                        Continue Shopping
                      </motion.button>
                    </motion.div>
                  </motion.section>

                  {/* Summary (Desktop) */}
                  <motion.section
                    variants={summaryVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:w-1/3 mt-8 lg:mt-0 mb-5 md:mb-0"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-lg shadow-md p-6 sticky top-6"
                    >
                      <h2 className="text-xl font-bold text-center text-gray-800 mb-4 flex items-center justify-center gap-2">
                        <FiShoppingCart className="w-5 h-5" />
                        Order Summary
                      </h2>
                      <hr className="border-gray-200 mb-4" />

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3 mb-6"
                      >
                        <div className="flex justify-between">
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
                        <div className="flex justify-between">
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
                        <div className="flex justify-between py-2 border-t border-gray-200">
                          <span className="text-gray-600">Subtotal:</span>
                          <motion.span
                            key={cartSummary.total}
                            initial={{ scale: 1.1, color: "#10b981" }}
                            animate={{ scale: 1, color: "#374151" }}
                            className="font-medium"
                          >
                            {formatCurrency(cartSummary.total)}
                          </motion.span>
                        </div>
                        <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-200">
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
                        className="w-full bg-gray-800 hover:bg-gray-900 font-bold py-3 text-white rounded-md transition-colors md:inline-flex items-center justify-center gap-2 hidden "
                        disabled={cartSummary.itemCount === 0}
                      >
                        <FiCheck className="w-4 h-4" />
                        Proceed to Checkout
                      </motion.button>
                    </motion.div>
                  </motion.section>
                </div>

                {/* Mobile Summary */}
                <motion.section
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-bold text-gray-800">Total:</span>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <FiShoppingCart className="w-3 h-3" />
                        {cartSummary.itemCount} items
                      </div>
                    </div>
                    <motion.span
                      key={cartSummary.total}
                      initial={{ scale: 1.2, color: "#10b981" }}
                      animate={{ scale: 1, color: "#1f2937" }}
                      className="font-bold text-gray-800 text-xl"
                    >
                      {formatCurrency(cartSummary.total)}
                    </motion.span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full bg-gray-800 hover:bg-gray-900 font-bold py-3 text-white rounded-md transition-colors inline-flex items-center justify-center gap-2"
                    disabled={cartSummary.itemCount === 0}
                  >
                    <FiCheck className="w-4 h-4" />
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
