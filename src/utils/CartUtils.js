import Cookies from "js-cookie";
import api from "./api";

export const baseUrl = " http://127.0.0.1:8000";

export const getTemporaryUserId = () => {
  let temporaryUserId = Cookies.get("temporary_user");
  if (!temporaryUserId) {
    temporaryUserId = `temp_${Math.random().toString(36).substr(2, 9)}`;
    Cookies.set("temporary_user", temporaryUserId, {
      expires: 30,
    });
  }
  return temporaryUserId;
};

export const addCart = async (productId, quantity) => {
  const response = await api.post(`cart/`, {
    productId: productId,
    quantity: quantity,
  });
  console.log(response.data);
  return response.data;
};

export const updateCart = async (productId, quantity) => {
  const response = await api.put(`cart/`, {
    productId: productId,
    quantity: quantity,
  });
  console.log(response.data);
  return response.data;
};

export const deleteCart = async (productId) => {
  const response = await api.delete(`cart/`, {
    params: { productId: productId },
  });

  return response.data;
};

export const getCart = async () => {
  const response = await api.get(`cart/`);
  console.log(response.data);
  return response.data;
};
export const getSingleCart = async (productId) => {
  const response = await api.get(`cart/${productId}/`);
  console.log(response.data);
  return response.data;
};

export const mergeCart = async () => {
  const response = await api.post("merge/");
  console.log(response.data);
  return response.data;
};
