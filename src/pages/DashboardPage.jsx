import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getAdminOrders,
  getAdminProducts,
  getApiErrorMessage,
} from "../services/api";
import "./DashboardPage.css";

const DashboardPage = ({ adminSession }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const [savedProducts, savedOrders] = await Promise.all([
        getAdminProducts(adminSession?.token),
        getAdminOrders(adminSession?.token),
      ]);

      setProducts(savedProducts);
      setOrders(savedOrders);
    } catch (error) {
      setHasError(true);
      toast.error(
        getApiErrorMessage(error, "Unable to load the admin dashboard right now.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [adminSession?.token]);

  const summaryCards = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length;
    const lowStockProducts = products.filter(
      (product) => product.isActive && product.stock > 0 && product.stock <= 5
    ).length;
    const openOrders = orders.filter((order) =>
      ["PLACED", "PROCESSING", "SHIPPED"].includes(order.status)
    ).length;
    const totalRevenue = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((total, order) => total + order.totalAmount, 0);

    return [
      {
        label: "Active products",
        value: activeProducts,
        note: `${products.length} total in catalog`,
      },
      {
        label: "Open orders",
        value: openOrders,
        note: `${orders.length} total orders`,
      },
      {
        label: "Low stock alerts",
        value: lowStockProducts,
        note: "Items with 5 or fewer units",
      },
      {
        label: "Revenue",
        value: `Rs. ${totalRevenue.toFixed(2)}`,
        note: "Cancelled orders excluded",
      },
    ];
  }, [orders, products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((firstOrder, secondOrder) => {
        return (
          new Date(secondOrder.createdAt).getTime() -
          new Date(firstOrder.createdAt).getTime()
        );
      })
      .slice(0, 5);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => product.isActive && product.stock <= 5)
      .sort((firstProduct, secondProduct) => firstProduct.stock - secondProduct.stock)
      .slice(0, 6);
  }, [products]);

  const statusSummary = useMemo(() => {
    return ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
      (status) => ({
        status,
        count: orders.filter((order) => order.status === status).length,
      })
    );
  }, [orders]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <p className="dashboard-page-kicker">Admin Dashboard</p>
          <h2 className="dashboard-page-title">Quick look at store activity</h2>
        </div>

        <button
          type="button"
          className="dashboard-refresh-btn"
          onClick={loadDashboard}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="dashboard-empty-state">Loading dashboard summary...</div>
      ) : null}

      {hasError ? (
        <div className="dashboard-empty-state">
          We could not load dashboard data right now.
        </div>
      ) : null}

      {!isLoading && !hasError ? (
        <>
          <section className="dashboard-summary-grid">
            {summaryCards.map((card) => (
              <article className="dashboard-summary-card" key={card.label}>
                <span className="dashboard-summary-label">{card.label}</span>
                <strong className="dashboard-summary-value">{card.value}</strong>
                <p className="dashboard-summary-note">{card.note}</p>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-panel-kicker">Order Status</p>
                  <h3 className="dashboard-panel-title">Current delivery flow</h3>
                </div>
              </div>

              <div className="dashboard-status-grid">
                {statusSummary.map((statusItem) => (
                  <div className="dashboard-status-card" key={statusItem.status}>
                    <span className="dashboard-status-name">{statusItem.status}</span>
                    <strong className="dashboard-status-count">
                      {statusItem.count}
                    </strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p className="dashboard-panel-kicker">Inventory Watch</p>
                  <h3 className="dashboard-panel-title">Low stock products</h3>
                </div>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="dashboard-panel-empty">
                  No low stock alerts right now.
                </p>
              ) : (
                <div className="dashboard-list">
                  {lowStockProducts.map((product) => (
                    <div className="dashboard-list-row" key={product.id}>
                      <div>
                        <h4 className="dashboard-list-title">{product.title}</h4>
                        <p className="dashboard-list-meta">
                          {product.category || "Uncategorized"} | {product.brand || "Unknown brand"}
                        </p>
                      </div>
                      <strong className="dashboard-stock-badge">
                        {product.stock} left
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <p className="dashboard-panel-kicker">Recent Orders</p>
                <h3 className="dashboard-panel-title">Latest customer activity</h3>
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <p className="dashboard-panel-empty">
                Orders will appear here after the first checkout.
              </p>
            ) : (
              <div className="dashboard-orders-list">
                {recentOrders.map((order) => (
                  <div className="dashboard-order-row" key={order.id}>
                    <div>
                      <h4 className="dashboard-list-title">
                        {order.user?.name || "Unknown customer"}
                      </h4>
                      <p className="dashboard-list-meta">
                        {order.user?.email || "No email"} | {order.items.length} item(s)
                      </p>
                    </div>

                    <div className="dashboard-order-side">
                      <span className="dashboard-order-status">{order.status}</span>
                      <strong className="dashboard-order-total">
                        Rs. {order.totalAmount.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
