import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import NavBar from "../Layout/NavBar";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const CheckOrders = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async ({ email }) => {
    setError(null);
    try {
      const response = await api.post("check-orders", { email });
      setData(response.data);
      reset();
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
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

  return (
    <main className="min-h-screen bg-gray-100">
      <NavBar showSearchbtn={true} />

      <section className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 mb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">
          Check Your Orders
        </h1>

        {/* Form */}
        <AnimatePresence>
          {!data && (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative w-full">
                <label
                  htmlFor="email"
                  className="block font-medium text-gray-700 text-sm sm:text-base mb-1"
                >
                  Email Address
                </label>
              </div>

              <div className="flex items-center border rounded-md px-3 py-2">
                <MdEmail className="text-gray-500 mr-2" />
                <input
                  type="email"
                  id="email"
                  autoFocus
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
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

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md text-white font-semibold transition-colors text-sm sm:text-base ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900"
                }`}
              >
                {isSubmitting ? "Checking..." : "Check Orders"}
              </button>

              {error && (
                <p className="text-red-600 text-center mt-2 font-medium text-sm sm:text-base">
                  {error}
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {/* Loading Spinner */}
        {isSubmitting && (
          <div className="flex justify-center py-12">
            <div className="w-14 h-14 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Orders List */}
        <AnimatePresence>
          {data && !isSubmitting && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              {data.length === 0 ? (
                <p className="text-center text-gray-700 font-medium text-sm sm:text-base">
                  Sorry, we couldn't find any orders matching that email. Please
                  double-check and try again.
                </p>
              ) : (
                <div className="space-y-6">
                  {data.map((item) => (
                    <motion.div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 sm:gap-0">
                        <span className="font-semibold text-gray-800 text-base sm:text-lg">
                          Status: {item.status}
                        </span>
                        {item.status === "Paid" ? (
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-block"
                          >
                            <FaCheckCircle className="text-green-600 text-xl sm:text-2xl" />
                          </motion.div>
                        ) : item.status === "Failed" ? (
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-block"
                          >
                            <FaTimesCircle className="text-red-600 text-xl sm:text-2xl" />
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-block"
                          >
                            <FaClock className="text-blue-600 text-xl sm:text-2xl" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-1 text-sm sm:text-base">
                        <span className="font-semibold">Name:</span>{" "}
                        {item.customer_name}
                      </p>
                      <p className="text-gray-700 mb-1 text-sm sm:text-base">
                        <span className="font-semibold">Amount:</span> ₦
                        {item.amount}
                      </p>
                      <p className="text-gray-700 mb-1 text-sm sm:text-base">
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(item.created_at)}
                      </p>
                      <p className="text-gray-700 mb-3 text-sm sm:text-base">
                        <span className="font-semibold">Transaction Id:</span>{" "}
                        {item.transaction_id}
                      </p>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-center text-base sm:text-lg">
                          Products
                        </h3>
                        <ul className="border border-gray-300 rounded-md divide-y divide-gray-200">
                          {item.items?.length > 0 ? (
                            item.items.map((prod, index) => (
                              <li
                                key={index}
                                className="flex justify-between px-3 py-2 text-gray-700 text-sm sm:text-base"
                              >
                                <span>
                                  {prod.product.name} × {prod.quantity}
                                </span>
                                <span>
                                  ₦{prod.product.price * prod.quantity}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-center text-gray-500 italic text-sm sm:text-base">
                              No products found
                            </li>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reset/Search Again Button */}
              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setData(null);
                    setError(null);
                    reset();
                  }}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-900 rounded-md text-white font-semibold transition-colors text-sm sm:text-base"
                >
                  Search Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
};

export default CheckOrders;
