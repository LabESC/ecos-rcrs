import { Alert, Box, Typography } from "@mui/material";
import {
  OrganizationIcon,
  BeakerIcon,
  StackIcon,
  PeopleIcon,
  ListOrderedIcon,
  TasklistIcon,
  AlertFillIcon,
  CheckCircleIcon,
} from "@primer/octicons-react";

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
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <BeakerIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Generating topics
            </Typography>
          </Box>
        );

      case "mining_error":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <AlertFillIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Mining error
            </Typography>
          </Box>
        );

      case "topics_error":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <AlertFillIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Topics error
            </Typography>
          </Box>
        );

      case "mining_done":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <StackIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Waiting for topics generation
            </Typography>
          </Box>
        );

      case "waiting_rcr_voting":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <PeopleIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Waiting for RCR definition voting
            </Typography>
          </Box>
        );

      case "waiting_rcr_priority":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <PeopleIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Waiting for RCR priority voting
            </Typography>
          </Box>
        );

      case "topics_done":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <StackIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Topics generation done
            </Typography>
          </Box>
        );

      case "rcr_voting_done":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <ListOrderedIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              RCR definition voting done
            </Typography>
          </Box>
        );

      case "rcr_priority_done":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <TasklistIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              RCR priority voting done
            </Typography>
          </Box>
        );

      case "done":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <CheckCircleIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Done
            </Typography>
          </Box>
        );

      default:
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <AlertFillIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Error
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      className="EnvironmentCard"
      style={{
        display: "flex",
        marginBottom: 20,
        borderRadius: 8,
        padding: "0.8em",
        width: 230,
        height: 125,
        background: getColor(environment.status),
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      // !! IMPLEMENTAR: onClick={() => {}}
    >
      <Box>
        <OrganizationIcon size={28} />
        <Typography style={{ fontWeight: "500" }}>
          {environment.name}
        </Typography>
      </Box>
      <Box>
        <Typography> {getStatusMessage(environment.status)} </Typography>
      </Box>
    </Box>
  );
}
