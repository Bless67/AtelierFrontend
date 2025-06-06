import { useLocation, Navigate, Link } from "react-router-dom";
const PaymentSuccess = () => {
  const location = useLocation();
  const fromVerify = location.state?.fromVerify;

  if (!fromVerify) return <Navigate to={"/"} />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-green-700 mb-2">
          Payment Successful
        </h2>
        <p className="text-gray-700 mb-4">Thank you for your purchase</p>
        <p className="text-blue-600 text-sm mb-6 ">
          Have questions? Contact us on whatsapp
        </p>
        <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition cursor-pointer">
          <Link to={"/orders"}>Check Orders</Link>
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
