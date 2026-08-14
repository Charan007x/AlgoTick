import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import "./index.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const Page = path === "/privacy" ? Privacy : path === "/terms" ? Terms : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);
