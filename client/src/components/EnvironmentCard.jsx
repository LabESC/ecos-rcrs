import { Box, Typography } from "@mui/material";
import { OrganizationIcon, BeakerIcon } from "@primer/octicons-react";
export function EnvironmentCard(props) {
  const { environment } = props;
  const getColor = (status) => {
    switch (status) {
      case "mining_error":
      case "topics_error":
        return "#FACECE";

      case "mining_done":
      case "waiting_rcr_voting":
      case "waiting_rcr_priority":
        return "#F2EBE1";

      case "topics_done":
      case "rcr_voting_done":
      case "rcr_priority_done":
      case "done":
        return "#E1F2E1";

      default:
        return "#E1ECF2";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "mining":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <BeakerIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Mining repositories
            </Typography>
          </Box>
        );

      case "making_topics":
        return "Generating topics";

      case "mining_error":
        return "Mining error";

      case "topics_error":
        return "Topics error";

      case "mining_done":
        return "Mining done";

      case "waiting_rcr_voting":
        return "Waiting for RCR definition voting";

      case "waiting_rcr_priority":
        return "Waiting for RCR priority voting";

      case "topics_done":
        return "Topics generation done";

      case "rcr_voting_done":
        return "RCR definition voting done";

      case "rcr_priority_done":
        return "RCR priority voting done";

      case "done":
        return "Done";

      default:
        return "Error";
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        marginBottom: 20,
        borderRadius: 8,
        padding: "0.8em",
        width: 260,
        height: 130,
        background: getColor(environment.status),
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <OrganizationIcon size={30} />
        <Typography style={{ fontWeight: "500" }}>
          {" "}
          {environment.name}{" "}
        </Typography>
      </Box>
      <Box>
        <Typography> {getStatusMessage(environment.status)} </Typography>
      </Box>
    </Box>
  );
}
