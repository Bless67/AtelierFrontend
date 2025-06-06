import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../utils/CartProvider";
import api from "../utils/api";

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reference = new URLSearchParams(location.search).get("reference");
  const { setCartQuantity } = useCart();
  const [status, setStatus] = useState("pending"); // "pending", "success", "failure"

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await api.get(`verify-payment/${reference}`);
        console.log(res.data);
        if (res.status === 200) {
          setCartQuantity(0);
          setStatus("success");
        } else {
          setStatus("failure");
        }
      } catch (error) {
        console.error(error);
        setStatus("failure");
      }
    };

    if (reference) verifyPayment();
  }, [reference, setCartQuantity]);

  useEffect(() => {
    if (status === "success") {
      navigate("/success", { state: { fromVerify: true } });
    } else if (status === "failure") {
      navigate("/failure", { state: { fromVerify: true } });
    }
  }, [status, navigate]);

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="w-16 h-16 mx-auto mt-40 mb-2 animate-spin border-4 border-gray-300 border-t-gray-800 rounded-full" />
      <p>Verifying payment...</p>
    </div>
  );
};

export default Verify;
