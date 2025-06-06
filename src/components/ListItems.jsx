import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { Link } from "react-router-dom";
import ListCard from "../Layout/ListCard";
import { motion, AnimatePresence } from "framer-motion";

const ListItems = () => {
  const fetchData = async () => {
    const response = await api.get(`products/`);
    console.log(response.data);

    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["home"],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-gray-700"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-red-500 mt-10"
      >
        Error fetching products: {error?.message || "Unknown error"}
      </motion.div>
    );
  }

  return (
    <div className="my-8 mx-auto container px-4">
      <p className="text-3xl font-bold text-center md:text-4xl text-gray-700">
        Featured
      </p>

      <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {data?.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: item.id * 0.05 }}
              layout
            >
              <Link to={`/product/${item.id}`} className="block">
                <ListCard item={item} />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default ListItems;
