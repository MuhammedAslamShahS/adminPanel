import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getApiErrorMessage,
  updateAdminProduct,
} from "../services/api";
import "./ProductsPage.css";

const emptyFormValues = {
  title: "",
  description: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  imageUrl: "",
  isActive: true,
};

const ProductsPage = ({ adminSession }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formValues, setFormValues] = useState(emptyFormValues);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const savedProducts = await getAdminProducts(adminSession?.token);
      setProducts(savedProducts);
    } catch (error) {
      setHasError(true);
      toast.error(
        getApiErrorMessage(error, "Unable to load admin products right now.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [adminSession?.token]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormValues(emptyFormValues);
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product.id);
    setFormValues({
      title: product.title || "",
      description: product.description || "",
      brand: product.brand || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      imageUrl: product.imageUrl || "",
      isActive: Boolean(product.isActive),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = formValues.title.trim();
    const price = formValues.price.trim();

    if (!title || price === "") {
      toast.error("Title and price are required.");
      return;
    }

    const productPayload = {
      title,
      description: formValues.description.trim(),
      brand: formValues.brand.trim(),
      category: formValues.category.trim(),
      price: Number(formValues.price),
      stock: formValues.stock === "" ? 0 : Number(formValues.stock),
      imageUrl: formValues.imageUrl.trim(),
      isActive: formValues.isActive,
    };

    try {
      setIsSaving(true);

      if (editingProductId) {
        await updateAdminProduct(
          adminSession?.token,
          editingProductId,
          productPayload
        );

        toast.success("Product updated successfully.");
      } else {
        await createAdminProduct(adminSession?.token, productPayload);
        toast.success("Product created successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to save this product right now.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const shouldDelete = window.confirm(
      "Do you want to delete this product?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteAdminProduct(adminSession?.token, productId);
      toast.success("Product deleted successfully.");

      if (editingProductId === productId) {
        resetForm();
      }

      await loadProducts();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to delete this product right now.")
      );
    }
  };

  return (
    <div className="products-page">
      <div className="products-page-header">
        <div>
          <p className="products-page-kicker">Admin Products</p>
          <h2 className="products-page-title">Manage storefront products</h2>
        </div>

        <div className="products-summary-card">
          <span className="products-summary-label">Available Products</span>
          <strong className="products-summary-value">{products.length}</strong>
        </div>
      </div>

      <section className="product-form-panel">
        <div className="product-form-header">
          <div>
            <p className="product-form-kicker">
              {editingProductId ? "Edit Product" : "Create Product"}
            </p>
            <h3 className="product-form-title">
              {editingProductId
                ? "Update selected product"
                : "Add a new product to the storefront"}
            </h3>
          </div>

          {editingProductId ? (
            <button
              type="button"
              className="product-form-secondary-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <form className="product-form-grid" onSubmit={handleSubmit}>
          <label className="product-form-field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Enter product title"
            />
          </label>

          <label className="product-form-field">
            <span>Brand</span>
            <input
              type="text"
              name="brand"
              value={formValues.brand}
              onChange={handleInputChange}
              placeholder="Enter brand name"
            />
          </label>

          <label className="product-form-field">
            <span>Category</span>
            <input
              type="text"
              name="category"
              value={formValues.category}
              onChange={handleInputChange}
              placeholder="Enter category"
            />
          </label>

          <label className="product-form-field">
            <span>Price</span>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formValues.price}
              onChange={handleInputChange}
              placeholder="Enter price"
            />
          </label>

          <label className="product-form-field">
            <span>Stock</span>
            <input
              type="number"
              name="stock"
              min="0"
              step="1"
              value={formValues.stock}
              onChange={handleInputChange}
              placeholder="Enter stock count"
            />
          </label>

          <label className="product-form-field">
            <span>Image URL</span>
            <input
              type="text"
              name="imageUrl"
              value={formValues.imageUrl}
              onChange={handleInputChange}
              placeholder="Paste image URL"
            />
          </label>

          <label className="product-form-field product-form-field-full">
            <span>Description</span>
            <textarea
              name="description"
              rows="4"
              value={formValues.description}
              onChange={handleInputChange}
              placeholder="Write a short product description"
            />
          </label>

          <label className="product-form-checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={formValues.isActive}
              onChange={handleInputChange}
            />
            <span>Product is active</span>
          </label>

          <div className="product-form-actions">
            <button type="submit" className="product-form-submit-btn" disabled={isSaving}>
              {isSaving
                ? editingProductId
                  ? "Updating..."
                  : "Creating..."
                : editingProductId
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </section>

      {isLoading ? (
        <div className="products-empty-state">Loading products...</div>
      ) : null}

      {hasError ? (
        <div className="products-empty-state">
          We could not load products right now.
        </div>
      ) : null}

      {!isLoading && !hasError && products.length === 0 ? (
        <div className="products-empty-state">
          No products found in the admin catalog yet.
        </div>
      ) : null}

      {!isLoading && !hasError && products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card-image-wrap">
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-card-image"
                />
              </div>

              <div className="product-card-content">
                <div className="product-card-top">
                  <span className="product-card-category">
                    {product.category || "Uncategorized"}
                  </span>
                  <span
                    className={`product-status-badge ${
                      product.isActive ? "active" : "inactive"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3 className="product-card-title">{product.title}</h3>
                <p className="product-card-text">
                  {product.description || "No description available."}
                </p>

                <div className="product-card-meta">
                  <span>Brand: {product.brand || "Unknown"}</span>
                  <span>Stock: {product.stock}</span>
                </div>

                <div className="product-card-footer">
                  <strong>Rs. {product.price.toFixed(2)}</strong>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="product-card-action"
                      onClick={() => startEditingProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="product-card-action danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ProductsPage;
