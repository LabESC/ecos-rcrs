import React, { useState } from "react";

/*
const VotingScale = ({ onChangeLevel, rcrId }) => {
  const [activeOption, setActiveOption] = useState(2);

  const updatingActiveOption = (event, newLevel) => {
    setActiveOption(newLevel);
    onChangeLevel(newLevel, rcrId);
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={activeOption}
      exclusive
      onChange={updatingActiveOption}
      aria-label="Platform"
      id={`votingScale-${rcrId}`}
    >
      <ToggleButton
        value="1"
        style={{
          "&:hover": {
            color: "red",
          },
        }}
      >
        NO
      </ToggleButton>
      <ToggleButton value="2">I DON'T KNOW</ToggleButton>
      <ToggleButton value="3">YES</ToggleButton>
    </ToggleButtonGroup>
  );
};*/

import Likert from "react-likert-scale";
import "./Likert.css";

const VotingScale = ({ onChangeLevel, rcrId }) => {
  const [color, setColor] = useState("3");

  const likertOptions = {
    question: "",
    responses: [
      { value: 1, text: "NO" }, // 'Strongly Disagree',
      { value: 2, text: "I DON'T KNOW" }, // 'Disagree',
      {
        value: 3,
        text: "YES", //, checked: true
      },
    ],
    onChange: (response) => {
      setColor(response.value);
      onChangeLevel(response.value, rcrId);
    },
  };
  return <Likert {...likertOptions} class={`likert${color}`} />;
};

export default VotingScale;
