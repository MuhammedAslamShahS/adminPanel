import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ adminSession }) => {
  if (!adminSession?.token || adminSession?.user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
