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
import EnvironmentDetail from "./pages/Environments/Detail.jsx";
import NewEnvironment from "./pages/Environments/New.jsx";
import EnvironmentDetailDefinition from "./pages/Environments/DetailDefinition.jsx";

// . Environments -> Issues
import IssueDetail from "./pages/Environments/Issues/Detail.jsx";

// . Environment for VotingUsers
import DefinitionDataPage from "./pages/VotingUserEnvironment/DefinitionData.jsx";

// . Likert - teste
import LikertScale from "./pages/VotingUserEnvironment/LikertScale.jsx";

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
        <Route path="/environment/:id" element={<EnvironmentDetail />}></Route>
        <Route
          path="/environment/:enviroment-id/issue/:id"
          element={<IssueDetail />}
        ></Route>
        <Route path="/new-environment" element={<NewEnvironment />}></Route>
        <Route
          path="/environment/:id/definitionvote"
          element={<DefinitionDataPage />}
        />
        <Route
          path="/environment/:id/definition"
          element={<EnvironmentDetailDefinition />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
