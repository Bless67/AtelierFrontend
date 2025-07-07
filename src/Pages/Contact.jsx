import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import NavBar from "../Layout/NavBar";
import api from "../utils/api";
import { ToastContainer, toast } from "react-toastify";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/customer-message/", data);
      toast.success("Message submitted");
      setSubmitted(true);
      reset();
      window.scrollTo(0, 0);
      setCooldown(60); // set 60 seconds cooldown
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(
          "You’ve reached the limit for sending messages. Please wait and try again."
        );
      } else {
        
        toast.error("There was an error, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      {!submitted ? (
        <motion.div
          className="bg-white text-gray-800 px-4 sm:px-6 lg:px-12 py-12 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-6 text-center"
            variants={fadeUp}
          >
            Contact Us
          </motion.h1>

          <motion.p
            className="mb-8 text-center text-sm sm:text-base leading-relaxed text-gray-600"
            variants={fadeUp}
            custom={1}
          >
            Have questions or want to share your thoughts? Reach out to us and
            we’ll get back to you as soon as possible.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            variants={fadeUp}
            custom={2}
            className="space-y-6"
          >
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">
                Name
              </label>
              <div
                className={`flex items-center border rounded-md px-3 py-2 ${
                  errors.name ? "border-red-500" : ""
                }`}
              >
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full outline-none"
                  placeholder="Your name"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email
              </label>
              <div
                className={`flex items-center border rounded-md px-3 py-2 ${
                  errors.email ? "border-red-500" : ""
                }`}
              >
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="w-full outline-none"
                  placeholder="you@example.com"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block mb-1 font-medium">
                Message
              </label>
              <div
                className={`flex items-center border rounded-md px-3 py-2 ${
                  errors.message ? "border-red-500" : ""
                }`}
              >
                <textarea
                  id="message"
                  rows="5"
                  {...register("message", { required: "Message is required" })}
                  className="w-full outline-none"
                  placeholder="Write your message here..."
                />
              </div>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className={`bg-gray-800 text-white px-6 py-3 rounded font-semibold transition cursor-pointer ${
                loading || cooldown > 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-900"
              }`}
            >
              {loading
                ? "Sending..."
                : cooldown > 0
                ? `Please wait ${cooldown}s`
                : "Send Message"}
            </button>
          </motion.form>
        </motion.div>
      ) : (
        <motion.div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center max-w-2xl mx-auto mt-12"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Thank you for contacting Yabuwat Atelier! We will respond shortly.
        </motion.div>
      )}
    </>
  );
};

export default Contact;
