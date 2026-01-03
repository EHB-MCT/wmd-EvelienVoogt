import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import UserHome from "./user/pages/UserHome.jsx";
import AdminHome from "./admin/pages/AdminHome.jsx";

function UserHome() {
  return <h2>User app</h2>;
}

function AdminHome() {
  return <h2>Admin dashboard</h2>;
}

export default function App() {
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