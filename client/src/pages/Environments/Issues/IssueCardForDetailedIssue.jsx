import { Badge, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { setIssueDataToLocalStorage } from "../../../api/Environments";

export function IssueCardForDetailedIssue(props) {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  //const redirect = useNavigate();

  // ! Extraindo variáveis do props
  const { issue, onClick } = props;

  // console.log(issue);

  return (
    <Box className="IssueCard" onClick={onClick}>
      {issue.id ? (
        <Typography
          className="IssueCardTxt"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#313131",
            fontSize: 10,
          }}
        >
          <strong style={{ marginRight: "4px" }}> Issue ID: </strong>#{issue.id}
        </Typography>
      ) : (
        ""
      )}
      <Box className="IssueCardRepoAndQuantity">
        <Typography
          className="IssueCardTxt"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#313131",
            fontSize: 10,
          }}
        >
          <strong style={{ marginRight: "4px" }}> Repo: </strong>
          {issue.repo}
        </Typography>
      </Box>
      <Typography
        style={{
          display: "flex",
          alignItems: "center",
          color: "#313131",
          fontSize: 10,
        }}
      >
        <strong style={{ marginRight: "4px" }}>
          Related to main issue score:
        </strong>
        {issue.relatedToScore}
      </Typography>
      <Box className="IssueCardBody">
        <Box className="IssueCardBodyChild">
          <strong style={{ marginBottom: "8px" }}> Content: </strong>
          {issue.body}
        </Box>
      </Box>
    </Box>
  );
}
