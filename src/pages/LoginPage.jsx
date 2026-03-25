import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage, loginAdmin } from "../services/api";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formValues.email.trim();
    const password = formValues.password.trim();

    if (!email || !password) {
      const message = "Please enter both email and password.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmitting(true);

      const session = await loginAdmin({ email, password });
      onLogin(session);

      toast.success("Admin login successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const fallbackMessage =
        error?.message === "This account does not have admin access."
          ? error.message
          : "Unable to log in right now.";

      const message = getApiErrorMessage(error, fallbackMessage);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-copy">
          <p className="admin-login-kicker">Store Admin</p>
          <h1 className="admin-login-title">Log in to manage products</h1>
          <p className="admin-login-text">
            Use your admin account to review products, prepare updates, and keep
            the storefront in sync.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-login-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </label>

          <label className="admin-login-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formValues.password}
              onChange={handleInputChange}
            />
          </label>

          {errorMessage ? (
            <p className="admin-login-error">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
