import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAdminOrders,
  getApiErrorMessage,
  updateAdminOrderStatus,
} from "../services/api";
import "./OrdersPage.css";

const orderStatuses = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const OrdersPage = ({ adminSession }) => {
  const [orders, setOrders] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const savedOrders = await getAdminOrders(adminSession?.token);
      setOrders(savedOrders);
      setStatusDrafts(
        savedOrders.reduce((drafts, order) => {
          drafts[order.id] = order.status;
          return drafts;
        }, {})
      );
    } catch (error) {
      setHasError(true);
      toast.error(
        getApiErrorMessage(error, "Unable to load admin orders right now.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [adminSession?.token]);

  const handleStatusChange = (orderId, nextStatus) => {
    setStatusDrafts((currentDrafts) => ({
      ...currentDrafts,
      [orderId]: nextStatus,
    }));
  };

  const handleSaveStatus = async (orderId) => {
    const nextStatus = statusDrafts[orderId];

    try {
      setSavingOrderId(orderId);
      const updatedOrder = await updateAdminOrderStatus(
        adminSession?.token,
        orderId,
        nextStatus
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
      );

      toast.success("Order status updated successfully.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update this order right now.")
      );
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-page-header">
        <div>
          <p className="orders-page-kicker">Admin Orders</p>
          <h2 className="orders-page-title">Track and update placed orders</h2>
        </div>

        <div className="orders-summary-card">
          <span className="orders-summary-label">Total Orders</span>
          <strong className="orders-summary-value">{orders.length}</strong>
        </div>
      </div>

      {isLoading ? (
        <div className="orders-empty-state">Loading orders...</div>
      ) : null}

      {hasError ? (
        <div className="orders-empty-state">
          We could not load orders right now.
        </div>
      ) : null}

      {!isLoading && !hasError && orders.length === 0 ? (
        <div className="orders-empty-state">
          No orders have been placed yet.
        </div>
      ) : null}

      {!isLoading && !hasError && orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <div className="admin-order-top">
                <div>
                  <p className="admin-order-id">Order ID: {order.id}</p>
                  <p className="admin-order-meta">
                    Customer: {order.user?.name || "Unknown"} ({order.user?.email || "no-email"})
                  </p>
                  <p className="admin-order-meta">
                    Payment: {order.paymentMethod.toUpperCase()} | Total: Rs.{" "}
                    {order.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div className="admin-order-status-panel">
                  <select
                    className="admin-order-status-select"
                    value={statusDrafts[order.id] || order.status}
                    onChange={(event) =>
                      handleStatusChange(order.id, event.target.value)
                    }
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="admin-order-status-btn"
                    onClick={() => handleSaveStatus(order.id)}
                    disabled={savingOrderId === order.id}
                  >
                    {savingOrderId === order.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="admin-order-items">
                {order.items.map((item) => (
                  <div className="admin-order-item" key={item.id}>
                    <div className="admin-order-item-image-wrap">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="admin-order-item-image"
                      />
                    </div>

                    <div>
                      <h3 className="admin-order-item-title">{item.title}</h3>
                      <p className="admin-order-item-meta">
                        Quantity: {item.quantity}
                      </p>
                      <p className="admin-order-item-meta">
                        Price: Rs. {item.price.toFixed(2)}
                      </p>
                      <p className="admin-order-item-meta">
                        Subtotal: Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default OrdersPage;
