import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      localStorage.setItem("token", res?.data?.token); // Save JWT token
      setIsAuthenticated(true);
      toast.success("Login successful", {
        position: "top-right",
        autoClose: 3000, // 3 seconds
      });
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000, // 3 seconds
    });
  };
  return (
    <div className="app-container">
      <div className="form-container">
        <h2>{isAuthenticated ? "Welcome" : "Login"}</h2>
        {!isAuthenticated ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn">
              Login
            </button>
          </form>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
        {error && <p>{error}</p>}
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;
