import { Alert, Box, Typography, Badge } from "@mui/material";
import {
  OrganizationIcon,
  BeakerIcon,
  StackIcon,
  PeopleIcon,
  ListOrderedIcon,
  TasklistIcon,
  AlertFillIcon,
  CheckCircleIcon,
  XCircleFillIcon,
  CopyIcon,
} from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
import {
  setEnvironmentNameToLocalStorage,
  requestMiningData,
} from "../../api/Environments.jsx";

export function EnvironmentCard(props) {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Extraindo variáveis do props
  const { status, id, name, action, votingCount } = props;

  const getColor = (status) => {
    switch (status) {
      case "mining_error":
      case "topics_error":
      case "cancelled":
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
            <Typography style={{ fontSize: 9, marginLeft: "0.6em" }}>
              {`Waiting for RCR definition voting (${votingCount} votes)`}
            </Typography>
          </Box>
        );

      case "waiting_rcr_priority":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <PeopleIcon size={18} />
            <Typography style={{ fontSize: 9, marginLeft: "0.6em" }}>
              {`Waiting for RCR priority voting (${votingCount} votes)`}
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

      case "cancelled":
        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <XCircleFillIcon size={18} />
            <Typography style={{ fontSize: 10, marginLeft: "0.6em" }}>
              Cancelled
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

  const canClone = (status) => {
    // ! Retorna se o ambiente pode ser clonado (ele so pode apos a geracao de topicos)
    return (
      status === "topics_done" ||
      status === "waiting_rcr_voting" ||
      status === "waiting_rcr_priority" ||
      status === "rcr_voting_done" ||
      status === "rcr_priority_done" ||
      status === "done"
    );
  };

  return (
    <Badge
      badgeContent={
        canClone(status) ? (
          <CopyIcon
            size={12}
            style={{
              margin: "2em !important",
              visibility: canClone(status) ? "visible" : "hidden",
            }}
          />
        ) : (
          ""
        )
      }
      key={`badge-${id}`}
      onClick={() => {
        // !! IMPLEMENTAR FUNCAO DE CLONAR AMBIENTE
        console.log("cliquei");
      }}
      sx={{
        "& .MuiBadge-badge": {
          color: "black",
          backgroundColor: canClone(status)
            ? "#d6d6d6 !important"
            : "transparent !important",
          cursor: canClone(status) ? "pointer" : "default",
          padding: "1em 0.8em",
          "&:hover": {
            color: "blue",
          },
        },
      }}
    >
      <Box
        className="EnvironmentCard"
        style={{
          display: "flex",
          marginBottom: 20,
          borderRadius: 8,
          padding: "0.8em",
          width: 230,
          height: 125,
          background: getColor(status),
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        onClick={action}
      >
        <Box>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <OrganizationIcon size={28} />
          </Box>
          <Typography style={{ fontWeight: "500" }}>{name}</Typography>
        </Box>
        <Box>
          <Typography> {getStatusMessage(status)} </Typography>
        </Box>
      </Box>
    </Badge>
  );
}
