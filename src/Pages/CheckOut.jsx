import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { MdPerson, MdEmail, MdPhone } from "react-icons/md";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";
import { getCart } from "../utils/CartUtils";
import Modal from "../Layout/Modal";

const CheckoutForm = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verificationCodeSent, setverificationCodeSent] = useState(false);
  const [verificationCodeDigits, setverificationCodeDigits] = useState(
    Array(6).fill("")
  );
  const [verifyingverificationCode, setVerifyingverificationCode] =
    useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiryTimer, setExpiryTimer] = useState(0);
  const [showverificationCodeModal, setShowverificationCodeModal] =
    useState(false);

  const [emailWarning, setEmailWarning] = useState(false);
  const [sendingVerificationCode, setSendingVerificationCode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!location?.state?.fromCart) navigate("/");
  }, [location, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      setCart(response);
    } catch (error) {
      toast.error("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    let resendInterval, expiryInterval;
    if (verificationCodeSent) {
      if (resendTimer > 0) {
        resendInterval = setInterval(
          () => setResendTimer((prev) => prev - 1),
          1000
        );
      }
      if (expiryTimer > 0) {
        expiryInterval = setInterval(
          () => setExpiryTimer((prev) => prev - 1),
          1000
        );
      }
    }
    return () => {
      clearInterval(resendInterval);
      clearInterval(expiryInterval);
    };
  }, [verificationCodeSent, resendTimer, expiryTimer]);

  // ✅ Add effect to reset verification code state when timer expires
  useEffect(() => {
    if (expiryTimer === 0 && verificationCodeSent) {
      setverificationCodeSent(false);
      setverificationCodeDigits(Array(6).fill(""));
      setShowverificationCodeModal(false);
      toast.info("Verification code expired. Please request a new one.");
    }
  }, [expiryTimer, verificationCodeSent]);

  const sendverificationCodeHandler = async (email) => {
    if (!email) {
      toast.error("Enter a valid email");
      return false;
    }
    if (resendTimer > 0) return false;

    setSendingVerificationCode(true);
    try {
      await api.post("/send-verification_code/", { email });
      setverificationCodeSent(true);
      setResendTimer(60);
      setExpiryTimer(300);
      toast.success("Verification Code sent to email");
      return true;
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to send verification code"
      );
      return false;
    } finally {
      setSendingVerificationCode(false);
    }
  };

  const verifyVerificationCodeHandler = async () => {
    const email = getValues("email");
    const verificationCode = verificationCodeDigits.join("");
    if (verificationCode.length !== 6)
      return toast.error("Enter complete 6-digit verificationCode");

    setVerifyingverificationCode(true);
    try {
      await api.post("/verify-verification_code/", {
        email,
        verification_code: verificationCode,
      });
      setEmailVerified(true);
      setEmailWarning(false);
      setShowverificationCodeModal(false);
      // Reset verification code state after successful verification
      setverificationCodeSent(false);
      setverificationCodeDigits(Array(6).fill(""));
      toast.success("Email verified");
    } catch (err) {
      toast.error("Verification failed,invalid verification code");
    } finally {
      setVerifyingverificationCode(false);
    }
  };

  const handleverificationCodeChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newDigits = [...verificationCodeDigits];
    newDigits[index] = val.charAt(0);
    setverificationCodeDigits(newDigits);
    if (index < 5 && val) {
      const next = document.getElementById(`verificationCode-${index + 1}`);
      next?.focus();
    }
  };

  const handleverificationCodeKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...verificationCodeDigits];
      if (newDigits[index]) {
        newDigits[index] = "";
        setverificationCodeDigits(newDigits);
      } else if (index > 0) {
        const prev = document.getElementById(`verificationCode-${index - 1}`);
        prev?.focus();
        newDigits[index - 1] = "";
        setverificationCodeDigits(newDigits);
      }
    }
  };

  const handleverificationCodePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length !== 6)
      return toast.error("Paste 6-digit verificationCode only");
    const digits = paste.slice(0, 6).split("");
    setverificationCodeDigits(digits);
    document.getElementById("verificationCode-5")?.focus();
  };

  const calculateTotal = () =>
    cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const onSubmit = async (data) => {
    if (!cart.length) return toast.warn("Cart is empty");

    if (!emailVerified) {
      toast.warn("Verify email before continuing");
      setEmailWarning(true);
      const emailInput = document.getElementById("email-input");
      emailInput?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setEmailWarning(false);

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
          pending: "Processsing payment...",
          success: {
            render({ data }) {
              const link = data.data.payment_link;
              setTimeout(() => (window.location.href = link), 1000);
              return "Redirecting to payment...";
            },
          },
          error: {
            render({ data }) {
              return "Payment initialization failed";
            },
          },
        }
      )
      .finally(() => setSubmitLoading(false));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <ToastContainer position="top-center" pauseOnHover={false} />
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/cart")}
          className="mb-4 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-300"
        >
          ← Back to Cart
        </button>
      </div>

      <motion.div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 mx-auto">
          Checkout
        </h2>
        {loading ? (
          <div className="h-40 flex justify-center items-center">
            <div className="h-12 w-12 animate-spin border-4 border-gray-300 border-t-gray-700 rounded-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {cart.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold">Cart Summary</h3>
                <ul className="text-sm mb-2">
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
              </div>
            )}

            {/* FIRST NAME + LAST NAME */}
            <div className="flex gap-4">
              <div className="w-full">
                <div
                  className={`flex items-center border rounded-md px-3 py-2 ${
                    errors.firstName ? "border-red-500" : ""
                  }`}
                >
                  <MdPerson className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="First Name"
                    {...register("firstName", {
                      required: "First name is required",
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "First name must contain only letters",
                      },
                    })}
                    className="w-full outline-none"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <div
                  className={`flex items-center border rounded-md px-3 py-2 ${
                    errors.lastName ? "border-red-500" : ""
                  }`}
                >
                  <MdPerson className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...register("lastName", {
                      required: "Last name is required",
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "Last name must contain only letters",
                      },
                    })}
                    className="w-full outline-none"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div>
              <div
                className={`flex items-center border rounded-md px-3 py-2 ${
                  errors.email ? "border-red-500" : ""
                }`}
              >
                <MdEmail className="text-gray-500 mr-2" />
                <input
                  id="email-input"
                  disabled={emailVerified}
                  type="email"
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
              {emailWarning && (
                <p className="text-red-600 text-xs mt-1">
                  Please verify your email before proceeding
                </p>
              )}
              {!emailVerified && (
                <div className="mt-1">
                  {(!verificationCodeSent || expiryTimer === 0) && (
                    <button
                      type="button"
                      disabled={sendingVerificationCode}
                      className="text-blue-600 underline text-sm disabled:text-gray-400 disabled:no-underline"
                      onClick={async () => {
                        const email = getValues("email");
                        if (!email)
                          return toast.error("Please enter your email");

                        const success = await sendverificationCodeHandler(
                          email
                        );
                        if (success) {
                          setShowverificationCodeModal(true);
                        }
                      }}
                    >
                      {sendingVerificationCode
                        ? "Sending verification code..."
                        : "Verify Email"}
                    </button>
                  )}

                  {/* Show "Enter Code" button only when code is sent, not expired, and modal is closed */}
                  {verificationCodeSent &&
                    expiryTimer > 0 &&
                    !showverificationCodeModal && (
                      <button
                        type="button"
                        onClick={() => setShowverificationCodeModal(true)}
                        className="text-green-600 underline text-sm"
                      >
                        Enter Code
                      </button>
                    )}
                </div>
              )}
            </div>

            {/* PHONE FIELD */}
            <div>
              <div
                className={`flex items-center border rounded-md px-3 py-2 ${
                  errors.phone ? "border-red-500" : ""
                }`}
              >
                <MdPhone className="text-gray-500 mr-2" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^(\+234|0)[789][01]\d{8}$/,
                      message:
                        "Enter a valid Nigerian phone number (e.g. 0803xxxxxxx or +234803xxxxxxx)",
                    },
                  })}
                  className="w-full outline-none"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-gray-800 text-white font-semibold py-3 rounded-md"
            >
              {submitLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        )}
      </motion.div>

      <Modal
        isOpen={showverificationCodeModal}
        onClose={() => setShowverificationCodeModal(false)}
        title="Verify Email"
      >
        <h2 className="font-bold text-xl text-center mb-2">
          Verify Your Email
        </h2>
        <p className="text-sm text-center mb-4">
          Enter the 6-digit verification code sent to{" "}
          <b>{getValues("email")}</b>
        </p>
        <div className="flex flex-col gap-4">
          <div
            className="flex justify-center gap-2"
            onPaste={handleverificationCodePaste}
          >
            {verificationCodeDigits.map((digit, index) => (
              <input
                key={index}
                id={`verificationCode-${index}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleverificationCodeChange(e, index)}
                onKeyDown={(e) => handleverificationCodeKeyDown(e, index)}
                className="w-10 text-center border rounded-md p-2 text-xl"
              />
            ))}
          </div>

          <button
            onClick={verifyVerificationCodeHandler}
            disabled={verifyingverificationCode || expiryTimer === 0}
            className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            {verifyingverificationCode ? "Verifying..." : "Verify"}
          </button>

          <div className="flex justify-between text-xs text-gray-500">
            {resendTimer > 0 ? (
              <span>Resend in {resendTimer}s</span>
            ) : (
              <button
                onClick={async () => {
                  await sendverificationCodeHandler(getValues("email"));
                }}
                disabled={sendingVerificationCode}
                className="text-blue-600 underline text-xs disabled:text-gray-400 disabled:no-underline"
              >
                {sendingVerificationCode ? "Sending..." : "Resend Code"}
              </button>
            )}
            <span>Expires in {expiryTimer}s</span>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default CheckoutForm;
