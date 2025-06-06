import { baseUrl } from "../utils/CartUtils";
import { Link } from "react-router-dom";
const Card = ({ item, handleDeleteOpen, handleUpdate, setDeletedItem }) => {
  const handleDel = (productId, itemId, quantity) => {
    setDeletedItem({
      productId: productId,
      itemId: itemId,
      quantity: quantity,
    });
    handleDeleteOpen(true);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 mx-4 md:mx-0">
      <div className="flex flex-col md:flex-row md:items-center">
        {/* Product Image */}
        <div className="md:w-1/6 flex justify-center md:justify-start mb-4 md:mb-0">
          <img
            src={
              `${baseUrl}${item.product.images[0].image}` ||
              "/api/placeholder/80/80"
            }
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded-md"
          />
        </div>

        {/* Product Details */}
        <div className="md:w-3/6 md:px-4 text-center md:text-left">
          <h3 className="font-bold text-lg text-blue-600 underline">
            <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
          </h3>
          <p className="text-gray-500 text-sm mb-2">{item.product.category}</p>
          <p className="font-bold text-lg text-gray-800">
            ₦{item.product.price}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="md:w-2/6 flex flex-col items-center md:items-end mt-4 md:mt-0">
          <div className="flex items-center mb-3">
            <button
              onClick={() => handleUpdate("-", item.quantity, item.product.id)}
              disabled={item.quantity <= 1}
              className={`px-3 py-1 rounded-l border border-gray-300 
                ${
                  item.quantity <= 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 cursor-pointer"
                }`}
            >
              -
            </button>
            <span className="px-4 py-1 border-t border-b border-gray-300 bg-gray-50">
              {item.quantity}
            </span>
            <button
              onClick={() => handleUpdate("+", item.quantity, item.product.id)}
              className="px-3 py-1 rounded-r border border-gray-300 bg-white hover:bg-gray-100 cursor-pointer"
            >
              +
            </button>
          </div>
          <button
            onClick={() => handleDel(item.product.id, item.id, item.quantity)}
            className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
