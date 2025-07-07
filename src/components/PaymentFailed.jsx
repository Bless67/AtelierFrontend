import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MdError,
  MdRefresh,
  MdCreditCard,
  MdShoppingCart,
  MdStorefront,
  MdPhone,
  MdSecurity,
  MdShield,
  MdLightbulb,
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const PaymentFailed = () => {
  const location = useLocation();
  const fromVerify = location.state?.fromVerify;
  const errorData = location.state?.errorData;
  const orderData = location.state?.orderData;
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    // Delay showing actions to reduce immediate frustration
    const timer = setTimeout(() => setShowActions(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!fromVerify) return <Navigate to="/" replace />;

  const handleWhatsAppContact = () => {
    const phoneNumber = "1234567890"; // Replace with your WhatsApp number
    const message = `Hi! I'm having trouble with my payment${
      orderData?.orderId ? ` for order #${orderData.orderId}` : ""
    }. The payment failed and I need assistance.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleTryAgain = () => {
    navigate("/checkout", {
      state: {
        fromCart: true,
        retryPayment: true,
        orderData: orderData,
      },
    });
  };

  const getErrorMessage = () => {
    if (errorData?.message) {
      return errorData.message;
    }
    return "We couldn't process your payment at this time.";
  };

  const getErrorSuggestion = () => {
    const errorCode = errorData?.code;
    switch (errorCode) {
      case "INSUFFICIENT_FUNDS":
        return "Please check your account balance or try a different payment method.";
      case "CARD_DECLINED":
        return "Your card was declined. Please contact your bank or try another card.";
      case "EXPIRED_CARD":
        return "Your card has expired. Please use a different payment method.";
      case "NETWORK_ERROR":
        return "Connection issue detected. Please check your internet and try again.";
      default:
        return "Please try again in a few minutes or contact our support team.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-100 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-orange-100">
        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 p-4 rounded-full shadow-lg">
            <MdError className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Main Error Message */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Payment Issue
          </h1>
          <p className="text-gray-600 text-lg mb-4">{getErrorMessage()}</p>

          {/* Error Details */}
          {(orderData || errorData) && (
            <div className="bg-red-50 rounded-lg p-4 mb-4 border-l-4 border-red-400">
              <div className="text-sm text-gray-700 text-left">
                {orderData?.orderId && (
                  <p>
                    <span className="font-semibold">Order ID:</span> #
                    {orderData.orderId}
                  </p>
                )}
                {orderData?.amount && (
                  <p>
                    <span className="font-semibold">Amount:</span> $
                    {orderData.amount}
                  </p>
                )}
                {errorData?.code && (
                  <p>
                    <span className="font-semibold">Error Code:</span>{" "}
                    {errorData.code}
                  </p>
                )}
                {errorData?.timestamp && (
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {new Date(errorData.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Helpful Suggestion */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-400">
            <div className="flex items-start gap-3">
              <MdLightbulb className="text-blue-500 text-xl mt-0.5" />
              <div className="text-left">
                <p className="font-semibold text-blue-800 text-sm mb-1">
                  What to do next:
                </p>
                <p className="text-blue-700 text-sm">{getErrorSuggestion()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-4 mb-6">
            <button
              onClick={handleTryAgain}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MdRefresh className="w-5 h-5" />
              Try Again
            </button>

            {/* <button
              onClick={() =>
                navigate("/checkout", {
                  state: { fromCart: true, changePaymentMethod: true },
                })
              }
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MdCreditCard className="w-5 h-5" />
              Try Different Payment Method
            </button> */}
          </div>
        )}

        {/* Support Section */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-3 font-medium">
            Need help right away?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppContact}
              className="bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium hover:bg-green-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => (window.location.href = "tel:+1234567890")}
              className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MdPhone className="w-5 h-5" />
              <span>Call Support</span>
            </button>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <MdShoppingCart className="w-5 h-5" />
            Return to Cart
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <MdStorefront className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MdSecurity className="text-green-500 w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1">
              <MdShield className="text-blue-500 w-4 h-4" />
              <span>Protected Payment</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Your payment information is safe. No charges were made.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Questions? Email us at support@yourstore.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
