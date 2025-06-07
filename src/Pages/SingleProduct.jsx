import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import NavBar from "../Layout/NavBar";
import ProductCarousel from "../Layout/ProductCarousel";
import { ToastContainer, toast } from "react-toastify";
import { FaCartShopping, FaPlus, FaMinus } from "react-icons/fa6";
import {
  getSingleCart,
  addCart,
  updateCart,
  deleteCart,
} from "../utils/CartUtils";
import { useCart } from "../utils/CartProvider";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { motion } from "framer-motion";

const SingleProduct = () => {
  const { id } = useParams();
  const { setCartQuantity, cartQuantity } = useCart();
  const [cartData, setCartData] = useState(null);

  const fetchData = async () => {
    const response = await api.get(`product/${id}/`);
    console.log(response.data);
    return response.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", id],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000,
  });

  const handleAddCart = (productId, quantity) => {
    addCart(productId, quantity);
    setCartQuantity((prevQuantity) => prevQuantity + quantity);
    setCartData((prevData) => ({ ...prevData, quantity: quantity }));
    toast.success("Cart added!");
  };

  const handleUpdate = async (how, quantity, productId) => {
    try {
      let newQuantity = how === "+" ? quantity + 1 : quantity - 1;

      if (newQuantity < 1) {
        await deleteCart(productId);
        setCartData({});
        setCartQuantity((prev) => prev - 1);
        toast.success("Item removed from cart!");
      } else {
        await updateCart(productId, newQuantity);
        setCartData((prevData) => ({ ...prevData, quantity: newQuantity }));
        setCartQuantity((prev) => (how === "+" ? prev + 1 : prev - 1));
        toast.success("Cart updated!");
      }
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const fetchCartData = async () => {
    const response = await getSingleCart(id);
    setCartData(response);
  };

  useEffect(() => {
    fetchCartData();
  }, []);

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
      {isLoading && (
        <div className="w-16 h-16 mx-auto my-40 animate-spin border-4 border-gray-300 border-t-gray-800 rounded-full" />
      )}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 my-10 bg-red-200 text-2xl p-10 font-semibold mx-auto w-[80%]"
        >
          There was an error fetching product,please try again
        </motion.div>
      )}

      {data && cartData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 px-6 md:p-12 text-gray-800">
          {/* Product Image */}
          <div className="flex justify-center items-center w-[90%] mt-5 md:mt-0 mx-auto md:mx-0">
            <ProductCarousel images={data.images} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                {data.name}
              </h2>
              <p className="text-3xl font-semibold text-gray-800 mb-5">
                ₦{data.price}
              </p>
              <p className=" font-semibold text-gray-800 mb-5">
                Category: {data.category}
              </p>

              {/* Desktop Cart Controls */}
              <div className="hidden md:flex items-center my-6">
                {cartData && Object.keys(cartData).length === 0 ? (
                  <button
                    onClick={() => handleAddCart(data.id, 1)}
                    className="flex items-center gap-3 text-lg bg-gray-800 hover:bg-gray-900 transition-all duration-200 p-4 px-6 rounded-xl text-white font-medium cursor-pointer"
                  >
                    <FaCartShopping className="text-xl" />
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-md">
                    <button
                      onClick={() =>
                        handleUpdate("-", parseInt(cartData?.quantity), id)
                      }
                      className="p-3 text-gray-500 border border-gray-500 rounded-md hover:bg-gray-100 cursor-pointer"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-4 py-1 text-xl border-gray-300">
                      {cartData?.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdate("+", parseInt(cartData?.quantity), id)
                      }
                      className="p-3 text-gray-500 border border-gray-500 hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      <FaPlus />
                    </button>
                  </div>
                )}
              </div>

              <hr className="my-8 border-gray-300" />

              {/* Product Description */}
              <div>
                <h3 className="text-2xl font-semibold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed text-justify text-base">
                  {data.description} Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Tempora autem sit illum omnis voluptatibus
                  aperiam nesciunt sequi. Ad laudantium maxime suscipit porro,
                  atque recusandae ut. Perspiciatis neque sapiente beatae
                  aliquid nobis quidem nisi tenetur iste necessitatibus rerum
                  officia, sit esse numquam vel, nemo inventore dignissimos,
                  repellat consequatur voluptatum totam exercitationem.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Cart Controls */}
          <div className="md:hidden sticky bottom-0 left-0 right-0 pb-2  z-50">
            {cartData && Object.keys(cartData).length === 0 ? (
              <button
                onClick={() => handleAddCart(data.id, 1)}
                className="w-full flex items-center justify-center gap-3 text-lg bg-gray-800 hover:bg-gray-900 p-4 rounded-md text-white font-medium cursor-pointer"
              >
                <FaCartShopping className="text-xl" />
                Add to Cart
              </button>
            ) : (
              <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-md">
                <button
                  onClick={() =>
                    handleUpdate("-", parseInt(cartData?.quantity), id)
                  }
                  className="p-3 text-gray-500 border border-gray-500 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <FaMinus />
                </button>
                <span className="px-4 py-1 text-xl border-gray-300">
                  {cartData?.quantity}
                </span>

                <button
                  onClick={() =>
                    handleUpdate("+", parseInt(cartData?.quantity), id)
                  }
                  className="p-3 text-gray-500 border border-gray-500 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <FaPlus />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProduct;
