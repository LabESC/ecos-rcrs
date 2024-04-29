// Article: https://www.researchgate.net/publication/343676895_Requirements_Change_Requests_Classification_An_Ontology-Based_Approach
const customerChangeRequestWords = [
  // . Functional change
  "must contain",
  "play",
  "view",
  "select",
  "manage",
  "operate",

  // . Technical change
  "maintain",
  "produce",
  "corporate",
  "load",
  "upload",
  "syncronize",
  "appearance",
  "transaction",
  // . External change
  "cannot",
  "please",
  "doesn't",
  "none",
  "problems",
  "no access",
  "bugs",
  "stopped working",

  // . Internal change
  "product must",
  "product shall",
  "administrator must",
  "system must",
  "application parameters",
  "change",

  // . Create
  "add",
  "build",
  "design",
  "generate",
  "organize",
  "set up",
  "produce",

  // . Delete
  "delete",
  "black out",
  "destroy",
  "exclude",
  "cut out",
  "eliminate",
  "cancel",

  // . Modify
  "adapt",
  "revise",
  "modify",
  "correct",
  "rework",
  "repair",
];

// Article: https://doi.org/10.1016/j.jss.2017.12.028

const lifeCycleWords = [
  "platform",
  "OS",
  "development",
  "testing",
  "debug",
  "maintain",
  "evolve",
  "document",
  "localize",
  "manual",
  "portable",
  "configurable",
  "installation",
  "compile",
  "build",
];

const allWords = [
  ...new Set([...customerChangeRequestWords, ...lifeCycleWords]),
];

module.exports = {
  allWords,
};
