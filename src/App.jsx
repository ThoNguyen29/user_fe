// src/App.jsx - Blockchain Integrated Version with Routing
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </Router>
        </CartProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
