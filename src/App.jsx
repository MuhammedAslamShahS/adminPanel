import { Navigate, Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  clearAdminSession,
  readAdminSession,
  saveAdminSession,
} from "./utils/adminSession";

const App = () => {
  const [adminSession, setAdminSession] = useState(() => readAdminSession());

  const isLoggedIn = useMemo(() => {
    return Boolean(adminSession?.token && adminSession?.user?.role === "ADMIN");
  }, [adminSession]);

  const handleLogin = (session) => {
    saveAdminSession(session);
    setAdminSession(session);
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? "/products" : "/login"} replace />}
      />

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/products" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route element={<ProtectedRoute adminSession={adminSession} />}>
        <Route
          element={
            <AdminLayout adminSession={adminSession} onLogout={handleLogout} />
          }
        >
          <Route
            path="/products"
            element={<ProductsPage adminSession={adminSession} />}
          />
          <Route
            path="/orders"
            element={<OrdersPage adminSession={adminSession} />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
