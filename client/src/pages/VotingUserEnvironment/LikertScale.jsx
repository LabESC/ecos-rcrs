import React from "react";
import Likert from "react-likert-scale";
import "./Likert.css";

const LikertScale = ({ onChangeLevel, rcrId }) => {
  const likertOptions = {
    question: "",
    responses: [
      { value: 1, text: "1" }, // 'Strongly Disagree',
      { value: 2, text: "2" }, // 'Disagree',
      {
        value: 3,
        text: "3", //, checked: true
      }, // 'Neutral',
      { value: 4, text: "4" }, //  'Agree',
      { value: 5, text: "5" }, // 'Strongly Agree'
    ],
    onChange: (response) => {
      onChangeLevel(response.value, rcrId);
    },
  };
  return <Likert {...likertOptions} />;
};

export default LikertScale;
