import { useNavigate } from "react-router-dom";
import NavBar from "../Layout/NavBar";
import Modal from "../Layout/Modal";
import Card from "../Layout/Card";
import { toast, ToastContainer } from "react-toastify";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, deleteCart, updateCart } from "../utils/CartUtils";
import { useCart } from "../utils/CartProvider";

const CartItem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCartQuantity } = useCart();

  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletedItem, setDeletedItem] = useState(null);

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

  // Calculate total
  useEffect(() => {
    if (cartData) {
      const totalAmount = cartData.reduce(
        (sum, item) => sum + parseInt(item.product.price) * item.quantity,
        0
      );
      setTotal(totalAmount);
    }
  }, [cartData]);

  // Update Quantity
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }) => updateCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Cart updated!");
    },
    onError: () => {
      toast.error("Failed to update quantity.");
    },
  });

  // Delete Item
  const deleteCartMutation = useMutation({
    mutationFn: (productId) => deleteCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Item removed from cart!");
    },
    onError: () => {
      toast.error("Item failed to remove.");
    },
  });

  const handleUpdate = (how, quantity, productId) => {
    if (how === "+" || (how === "-" && quantity > 1)) {
      const newQuantity = how === "+" ? quantity + 1 : quantity - 1;
      updateCartMutation.mutate({ productId, quantity: newQuantity });
      setCartQuantity((prev) => (how === "+" ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = () => {
    if (deletedItem?.productId) {
      deleteCartMutation.mutate(deletedItem.productId);
      setCartQuantity((prev) => prev - deletedItem.quantity);
      setDeletedItem(null);
      setModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setDeletedItem(null);
  };

  const handleCheckout = () => {
    navigate("/checkout", { state: { fromCart: true } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar showSearchbtn={true} />
      <ToastContainer position="top-left" autoClose={3000} theme="dark" />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-gray-700 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center text-red-600 mt-10">
          Failed to load cart: {error.message}
        </div>
      )}

      {cartData && (
        <div className="container mx-auto py-8">
          {/* Modal */}
          <Modal
            isOpen={modalOpen}
            onClose={handleModalClose}
            showCloseButton={false}
          >
            <div>
              <p className="text-center font-medium font-sans">
                Are you sure you want to delete this item?
              </p>
              <div className="flex justify-end items-center mt-3 space-x-4">
                <button
                  onClick={handleModalClose}
                  className="border border-gray-800 px-3 py-1 rounded-2xl font-semibold text-gray-800 hover:text-gray-950 hover:border-gray-950"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="border border-red-700 px-3 py-1 rounded-2xl text-red-700 font-semibold hover:text-red-800 hover:border-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>

          {/* Empty Cart */}
          {cartData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto mt-10">
              <svg
                className="w-24 h-24 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 rounded-md"
              >
                Start Shopping
              </button>
            </div>
          )}

          {/* Cart Content */}
          {cartData.length > 0 && (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-center font-bold text-gray-800 text-2xl mb-2">
                  Your Shopping Cart
                </h1>
                <p className="text-center text-gray-500">
                  You have {cartData.length} item
                  {cartData.length !== 1 ? "s" : ""} in your cart
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between">
                {/* Items */}
                <section className="md:w-[65%]">
                  {cartData.map((item) => (
                    <Card
                      key={item.id}
                      item={item}
                      handleDeleteOpen={setModalOpen}
                      handleUpdate={handleUpdate}
                      setDeletedItem={setDeletedItem}
                    />
                  ))}
                </section>

                {/* Summary (Desktop) */}
                <section className="hidden md:block md:w-[30%]">
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                    <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
                      Order Summary
                    </h2>
                    <hr className="border-gray-200 mb-4" />
                    <div className="mb-4">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{cartData.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₦{total}</span>
                      </div>
                      <div className="flex justify-between py-3 text-lg font-bold">
                        <span>Total:</span>
                        <span>₦{total}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gray-800 hover:bg-gray-900 font-bold py-3 text-white rounded"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </section>
              </div>

              {/* Mobile Summary */}
              <section className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="font-bold text-gray-800 text-lg">
                    ₦{total}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gray-800 hover:bg-gray-900 font-bold py-3 text-white rounded"
                >
                  Checkout Now
                </button>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartItem;
