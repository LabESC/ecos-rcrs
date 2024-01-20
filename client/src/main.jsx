import React from "react";
import ReactDOM from "react-dom/client";

// ! Importação de páginas
// . CSS
import "./index.css";

// . Auth
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";

// . Environments
import MyEnvironment from "./pages/Environments/My.jsx";

// ! Criando rotas
import { Routes, BrowserRouter, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<SignUp />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/my-environments" element={<MyEnvironment />}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
