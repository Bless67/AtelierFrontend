import { baseUrl } from "../utils/CartUtils";
import { motion } from "framer-motion";

const ListCard = ({ item }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className=" overflow-hidden mt-2 cursor-pointer select-none bg-white"
    >
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-lg">
        <img
          src={`${baseUrl}${item.images[0].image}`}
          alt={item.name || "Product image"}
          className="w-full h-full object-cover p-2"
          loading="lazy"
        />
      </div>

      <div className="p-4 text-center text-gray-700">
        <p className="text-lg font-semibold">{item.name}</p>
        <p className="text-md font-bold text-green-700 mt-1">₦{item.price}</p>
        <p className="text-sm mt-1 text-gray-500">
          Category: <span className="font-normal">{item.category}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ListCard;
