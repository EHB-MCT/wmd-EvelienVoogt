import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import UserHome from "./user/pages/UserHome.jsx";
import AdminHome from "./admin/pages/AdminHome.jsx";
import { startSessionOnce } from "./lib/tracking.js";

export default function App() {
  useEffect(() => {
    startSessionOnce().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <nav style={{ marginBottom: 16 }}>
        <Link to="/">User</Link> |{" "}
        <Link to="/admin">Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </BrowserRouter>
  );
}