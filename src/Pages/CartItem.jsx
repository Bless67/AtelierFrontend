import { useNavigate } from "react-router-dom";
import NavBar from "../Layout/NavBar";
import Modal from "../Layout/Modal";
import { deleteCart, getCart, updateCart } from "../utils/CartUtils";
import { toast, ToastContainer } from "react-toastify";

import { useState, useEffect } from "react";
import { useCart } from "../utils/CartProvider";
import Card from "../Layout/Card";

const CartItem = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [deletedItem, setDeletedItem] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { setCartQuantity } = useCart();

  const fetchData = async () => {
    setLoading(true);
    const response = await getCart();
    setData(response);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      let tol = 0;
      data.forEach(
        (item) => (tol += parseInt(item.product.price) * item.quantity)
      );
      setTotal(tol);
    }
  }, [data]);

  const handleCheckout = () => {
    navigate("/checkout", { state: { fromCart: true } });
  };

  const handleUpdate = async (how, quantity, productId) => {
    try {
      if (how === "+" || (how === "-" && quantity > 1)) {
        let newQuantity = how === "+" ? quantity + 1 : quantity - 1;
        await updateCart(productId, newQuantity);
        setData((prevData) =>
          prevData.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        setCartQuantity((prev) => (how === "+" ? prev + 1 : prev - 1));
        toast.success("Cart updated!");
      }
    } catch (err) {
      toast.error("Failed to update quantity.");
      console.error("Failed to update cart:", err);
    }
  };

  const handleDelete = async () => {
    await deleteCart(deletedItem?.productId);
    setData(data.filter((item) => item.id !== deletedItem?.itemId));
    setCartQuantity((prevQuantity) => (prevQuantity -= deletedItem?.quantity));
    setDeletedItem(null);
    setModalOpen(false);
    toast.success("Item removed from cart!");
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setDeletedItem(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar showSearchbtn={true} />
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="dark"
      />
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-gray-700 animate-spin" />
        </div>
      )}

      {data && (
        <div className="container mx-auto py-8">
          <Modal
            isOpen={modalOpen}
            onClose={handleModalClose}
            showCloseButton={false}
          >
            <div>
              <p className="text-center font-medium font-sans ">
                Are you sure you want to delete this item
              </p>
              <div className="flex justify-end items-center mt-3 space-x-4">
                <button
                  onClick={handleModalClose}
                  className="border border-gray-800  px-3 py-1 rounded-2xl font-semibold text-gray-800 cursor-pointer hover:text-gray-950 hover:border-gray-950"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="border border-red-700 px-3 py-1 rounded-2xl text-red-700 font-semibold  cursor-pointer hover:text-red-800 hover:border-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
          {/* Cart Header */}
          {data.length > 0 && (
            <div className="mb-6">
              <h1 className="text-center font-bold text-gray-800 text-2xl mb-2">
                Your Shopping Cart
              </h1>
              <p className="text-center text-gray-500">
                You have {data.length} item{data.length !== 1 ? "s" : ""} in
                your cart
              </p>
            </div>
          )}

          {/* Empty Cart State */}
          {data.length === 0 && (
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
                className="bg-gray-800 hover:bg-gray-900 cursor-pointer text-white py-2 px-6 rounded-md transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}

          {/* Cart Content */}
          {data.length > 0 && (
            <div className="flex flex-col md:flex-row md:justify-between">
              {/* Cart Items Section */}
              <section className="md:w-[65%]">
                {data.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    handleDeleteOpen={setModalOpen}
                    handleUpdate={handleUpdate}
                    setDeletedItem={setDeletedItem}
                  />
                ))}
              </section>

              {/* Cart Summary Section - Desktop */}
              <section className="hidden md:block md:w-[30%]">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
                    Order Summary
                  </h2>
                  <hr className="border-gray-200 mb-4" />

                  <div className="mb-4">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{data.length}</span>
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
                    className="w-full bg-gray-800 hover:bg-gray-900 font-bold py-3 px-4 text-white rounded transition-colors cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Mobile Checkout Button - Fixed at bottom */}
          {data.length > 0 && (
            <section className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-gray-800 text-lg">
                  ₦{total}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-gray-800 hover:bg-gray-900 font-bold py-3 text-white rounded transition-colors cursor-pointer"
              >
                Checkout Now
              </button>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default CartItem;
