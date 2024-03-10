import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SignOutIcon } from "@primer/octicons-react";
import { removeLoggedUser } from "../api/Auth";

export const MyEnvironmentsButtonOpened = () => {
  const redirect = useNavigate();
  const goToMyEnvironments = async () => {
    redirect("/my-environments");
  };

  return (
    <Button
      className="Button"
      variant="contained"
      style={{
        background: "#B3DEF5",
        color: "#000000",
        borderRadius: "5px",
        width: "100%",
        fontSize: "12px",
        fontWeight: "bold",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        textTransform: "none",
      }}
      onClick={goToMyEnvironments}
    >
      <HomeIcon size={14} />
      <Typography
        style={{
          marginLeft: "0.5em",
          fontSize: "12px",
          fontStyle: "bold",
        }}
      >
        My Environments
      </Typography>
    </Button>
  );
};

export const MyEnvironmentsButtonClosed = () => {
  const redirect = useNavigate();
  const goToMyEnvironments = async () => {
    redirect("/my-environments");
  };

  return (
    <Button
      className="Button"
      variant="contained"
      style={{
        background: "#B3DEF5",
        color: "#000000",
        borderRadius: "5px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
      onClick={goToMyEnvironments}
    >
      <HomeIcon size={14} />
    </Button>
  );
};

export const LogOutButtonOpened = () => {
  const redirect = useNavigate();
  const logOut = async () => {
    await removeLoggedUser();
    redirect("/");
  };

  return (
    <Button
      className="Button"
      variant="contained"
      style={{
        background: "none",
        color: "#000000",
        borderRadius: "5px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        boxShadow: "none",
      }}
      onClick={logOut}
    >
      <SignOutIcon size={14} />
      <Typography
        style={{ marginLeft: "0.5em", fontSize: "12px", fontWeight: "bold" }}
      >
        Log Out
      </Typography>
    </Button>
  );
};

export const LogOutButtonClosed = () => {
  const redirect = useNavigate();
  const logOut = async () => {
    await removeLoggedUser();
    redirect("/");
  };

  return (
    <Button
      className="Button"
      variant="contained"
      style={{
        background: "none",
        color: "#000000",
        borderRadius: "5px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        boxShadow: "none",
      }}
      onClick={logOut}
    >
      <SignOutIcon size={14} />
    </Button>
  );
};

export const SuccessButton = (props) => {
  const {
    icon,
    message,
    uppercase,
    width,
    height,
    action,
    marginLeft,
    marginRight,
    backgroundColor,
    visibility,
  } = props;

  return (
    <Button
      className="Button"
      variant="contained"
      style={{
        background: backgroundColor ? backgroundColor : "#B3DEF5",
        color: "#000000",
        borderRadius: "5px",
        height: height,
        width: width,
        fontSize: "12px",
        fontWeight: "bold",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        textTransform: uppercase ? "uppercase" : "none",
        marginLeft: marginLeft ? marginLeft : "auto",
        marginRight: marginRight ? marginRight : "auto",
        visibility: visibility ? visibility : "visible",
      }}
      onClick={action}
    >
      {icon}
      <Typography
        style={{ marginLeft: "0.5em", fontSize: "12px", fontWeight: "bold" }}
      >
        {message}
      </Typography>
    </Button>
  );
};

export const CSVButton = (props) => {
  const {
    icon,
    message,
    uppercase,
    width,
    height,
    action,
    marginLeft,
    marginRight,
    backgroundColor,
    visibility,
    id,
  } = props;

  return (
    <Button
      className="Button"
      variant="contained"
      id="csvButton"
      style={{
        background: backgroundColor ? backgroundColor : "#B3DEF5",
        color: "#000000",
        borderRadius: "5px",
        height: height,
        width: width,
        fontSize: "12px",
        fontWeight: "bold",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        textTransform: uppercase ? "uppercase" : "none",
        marginLeft: marginLeft ? marginLeft : "auto",
        marginRight: marginRight ? marginRight : "auto",
        visibility: visibility ? visibility : "visible",
      }}
      onClick={action}
    >
      {icon}
      <Typography
        style={{ marginLeft: "0.5em", fontSize: "12px", fontWeight: "bold" }}
      >
        {message}
      </Typography>
    </Button>
  );
};
