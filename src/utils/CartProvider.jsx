import { useContext, useState, createContext, useEffect } from "react";
import { getCart } from "./CartUtils";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartQuantity, setCartQuantity] = useState(0);
  const checkQuantity = async () => {
    const data = await getCart();
    let total = 0;
    data.forEach((item) => (total += item.quantity));
    setCartQuantity(total);
  };
  useEffect(() => {
    checkQuantity();
  }, []);

  return (
    <CartContext.Provider
      value={{ cartQuantity, setCartQuantity, checkQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};
