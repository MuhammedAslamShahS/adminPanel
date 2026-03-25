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

export {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getApiErrorMessage,
  loginAdmin,
  logoutAdmin,
  updateAdminProduct,
};
