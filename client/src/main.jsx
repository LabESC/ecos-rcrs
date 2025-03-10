import React from "react";
import ReactDOM from "react-dom/client";

// ! Importação de páginas
// . CSS
import "./index.css";

// . Auth
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import MyPersonalData from "./pages/Auth/MyPersonalData.jsx";
import Activate from "./pages/Auth/Activate.jsx";

// . Environments
import MyEnvironment from "./pages/Environments/My.jsx";
import EnvironmentDetail from "./pages/Environments/Detail.jsx";
import EnvironmentDetailNew from "./pages/Environments/DetailsNew.jsx";
import NewEnvironment from "./pages/Environments/New.jsx";
import EnvironmentDetailDefinition from "./pages/Environments/DetailDefinition.jsx";
import EnvironmentDetailPriority from "./pages/Environments/DetailPriority.jsx";
import EnvironmentFinalReport from "./pages/Environments/DetailFinal.jsx";

// . Environments -> Issues
import IssueDetail from "./pages/Environments/Issues/Detail.jsx";
import IssueDetailNew from "./pages/Environments/Issues/DetailNew.jsx";

// . Environment for VotingUsers
import DefinitionDataPage from "./pages/VotingUserEnvironment/DefinitionData.jsx";
import PriorityDataPage from "./pages/VotingUserEnvironment/PriorityData.jsx";
import PriorityDataPageNew from "./pages/VotingUserEnvironment/PriorityDataNew.jsx";

// ! Criando rotas
import { Routes, BrowserRouter, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<SignUp />}></Route>
        <Route path="/activate" element={<Activate />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/my-data" element={<MyPersonalData />}></Route>
        <Route path="/my-environments" element={<MyEnvironment />}></Route>
        <Route
          path="/environment/:id"
          element={
            <EnvironmentDetailNew /> // <EnvironmentDetail />
          }
        ></Route>
        <Route
          path="/environment/:enviroment-id/issue/:id"
          element={
            <IssueDetailNew />
            //<IssueDetail />
          }
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
        <Route
          path="/environment/:id/priorityvote"
          element={
            <PriorityDataPageNew
            // PriorityDataPage
            />
          }
        />
        <Route
          path="/environment/:id/priority"
          element={<EnvironmentDetailPriority />}
        />
        <Route
          path="/environment/:id/final-report"
          element={<EnvironmentFinalReport />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
