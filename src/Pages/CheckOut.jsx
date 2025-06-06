import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { MdPerson, MdEmail, MdPhone } from "react-icons/md";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";
import { getCart } from "../utils/CartUtils";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const spinnerVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
  },
};

const CheckoutForm = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if not from cart page
  useEffect(() => {
    if (!location?.state?.fromCart) {
      navigate("/");
    }
  }, [location, navigate]);

  // Fetch cart contents
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      setCart(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const calculateTotal = () =>
    cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const onSubmit = async (data) => {
    if (cart.length === 0) {
      toast.warn("Cart is empty.");
      return;
    }

    setSubmitLoading(true);

    const customer_name = `${capitalize(data.firstName)} ${capitalize(
      data.lastName
    )}`;

    toast
      .promise(
        api.post("init-payment/", {
          customer_name,
          customer_email: data.email,
          customer_phone: data.phone,
          cart,
        }),
        {
          pending: "Processing payment...",
          success: {
            render({ data }) {
              const link = data.data.payment_link;
              setTimeout(() => {
                window.location.href = link;
              }, 1000);
              return "Redirecting to payment...";
            },
          },
          error: {
            render({ data }) {
              console.error("Payment init failed:", data);
              return "Payment initialization failed.";
            },
          },
        }
      )
      .finally(() => setSubmitLoading(false));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer position="top-center" pauseOnHover={false} />

      <button
        onClick={() => navigate("/cart")}
        className="mb-4 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-300 self-start"
      >
        ← Back to Cart
      </button>

      <motion.div
        className="w-full max-w-lg bg-white shadow-md rounded-lg p-6 sm:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Checkout</h2>

        {loading ? (
          <motion.div
            className="flex justify-center items-center h-40"
            variants={spinnerVariants}
            animate="animate"
          >
            <div className="h-12 w-12 animate-spin border-4 border-gray-300 border-t-gray-700 rounded-full" />
          </motion.div>
        ) : (
          <>
            {cart.length > 0 && (
              <motion.div
                className="mb-6"
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
              >
                <h3 className="text-lg font-semibold mb-2">Cart Summary</h3>
                <ul className="text-sm mb-3 space-y-1">
                  {cart.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        ₦{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-right font-bold">
                  Total: ₦{calculateTotal().toLocaleString()}
                </p>
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              {/* First & Last Name Side by Side */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* First Name */}
                <div className="w-full">
                  <div className="flex items-center border rounded-md px-3 py-2">
                    <MdPerson className="text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="First Name"
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: { value: 2, message: "Too short" },
                      })}
                      className="w-full outline-none capitalize"
                      style={{ textTransform: "capitalize" }}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="w-full">
                  <div className="flex items-center border rounded-md px-3 py-2">
                    <MdPerson className="text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Last Name"
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: { value: 2, message: "Too short" },
                      })}
                      className="w-full outline-none capitalize"
                      style={{ textTransform: "capitalize" }}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email with stronger regex */}
              <div className="flex items-center border rounded-md px-3 py-2">
                <MdEmail className="text-gray-500 mr-2" />
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      // More robust pattern:
                      value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                      message: "Invalid email format",
                    },
                  })}
                  className="w-full outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}

              {/* Phone */}
              <div className="flex items-center border rounded-md px-3 py-2">
                <MdPhone className="text-gray-500 mr-2" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^0[789][01]\d{8}$/,
                      message: "Enter a valid 11-digit Nigerian phone number",
                    },
                  })}
                  className="w-full outline-none"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={submitLoading}
                whileTap={{ scale: 0.95 }}
                className={`w-full bg-gray-800 text-white font-semibold p-3 rounded-md hover:bg-gray-900 transition ${
                  submitLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                Proceed to Payment
              </motion.button>
            </motion.form>
          </>
        )}
      </motion.div>
    </main>
  );
};

export default CheckoutForm;
