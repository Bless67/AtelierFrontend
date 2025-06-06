import { useLocation, Navigate,useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const location = useLocation();
  const fromVerify = location.state?.fromVerify;
  const navigate=useNavigate()

  if (!fromVerify) return <Navigate to={"/"} />;
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-red-700 mb-2">
          Payment Failed
        </h2>
        <p className="text-red-700 bg-red-50 p-2 text-sm mb-4">
          Please try again or contact support
        </p>
        <p className="text-blue-600 text-sm mb-6 ">
          Have questions? Contact us on whatsapp
        </p>
        <button onClick={()=>navigate("/checkout", { state: { fromCart: true } })} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition cursor-pointer">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;
