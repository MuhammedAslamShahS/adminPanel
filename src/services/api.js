import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const getApiErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.error || error?.response?.data?.message || fallbackMessage;
};

const normalizeProduct = (product) => {
  if (!product) {
    return null;
  }

  return {
    ...product,
    image: product.imageUrl || "",
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
  };
};

const normalizeOrderItem = (orderItem) => {
  if (!orderItem) {
    return null;
  }

  return {
    ...orderItem,
    image: orderItem.imageUrl || "",
    price: Number(orderItem.price || 0),
    quantity: Number(orderItem.quantity || 1),
  };
};

const normalizeOrder = (order) => {
  if (!order) {
    return null;
  }

  return {
    ...order,
    totalAmount: Number(order.totalAmount || 0),
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
  };
};

const loginAdmin = async ({ email, password }) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const user = response.data?.data?.user;
  const token = response.data?.data?.token;

  if (!user || user.role !== "ADMIN") {
    throw new Error("This account does not have admin access.");
  }

  return {
    user,
    token,
  };
};

const logoutAdmin = async (token) => {
  const response = await apiClient.post("/auth/logout", {}, buildAuthConfig(token));
  return response.data;
};

const getAdminProducts = async (token) => {
  const response = await apiClient.get("/admin/products", buildAuthConfig(token));
  const products = response.data?.data?.products || [];

  return products.map(normalizeProduct);
};

const createAdminProduct = async (token, productData) => {
  const response = await apiClient.post(
    "/admin/products",
    productData,
    buildAuthConfig(token)
  );

  return normalizeProduct(response.data?.data?.product);
};

const updateAdminProduct = async (token, productId, productData) => {
  const response = await apiClient.patch(
    `/admin/products/${productId}`,
    productData,
    buildAuthConfig(token)
  );

  return normalizeProduct(response.data?.data?.product);
};

const deleteAdminProduct = async (token, productId) => {
  const response = await apiClient.delete(
    `/admin/products/${productId}`,
    buildAuthConfig(token)
  );

  return response.data;
};

const getAdminOrders = async (token) => {
  const response = await apiClient.get("/admin/orders", buildAuthConfig(token));
  const orders = response.data?.data?.orders || [];

  return orders.map(normalizeOrder);
};

const updateAdminOrderStatus = async (token, orderId, status) => {
  const response = await apiClient.patch(
    `/admin/orders/${orderId}/status`,
    { status },
    buildAuthConfig(token)
  );

  return normalizeOrder(response.data?.data?.order);
};

export {
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  getAdminProducts,
  getApiErrorMessage,
  loginAdmin,
  logoutAdmin,
  updateAdminOrderStatus,
  updateAdminProduct,
};
