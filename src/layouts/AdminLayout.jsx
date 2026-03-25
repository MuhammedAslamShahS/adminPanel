import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage, logoutAdmin } from "../services/api";
import "./AdminLayout.css";

const AdminLayout = ({ adminSession, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin(adminSession?.token);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to contact the server. Logging out locally."
      );
      toast.info(message);
    } finally {
      onLogout();
      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <p className="admin-brand-label">Store Admin</p>
          <h1 className="admin-brand-title">Control Room</h1>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Orders
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-user-email">{adminSession?.user?.email}</p>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
