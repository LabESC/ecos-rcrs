module.exports = class Environment {
  static joinComparisonsAndTopics(topicData, miningData) {
    let newTopics = [];

    for (let index = 0; index < topicData.topics.length; index++) {
      const topic = topicData.topics[index];
      newTopics.push({
        topic: topic.join(","),
        issues: [],
        id: index,
        name: "#" + index + " - " + topic.join(","),
      });
    }

    for (const comparison of topicData.comparisons) {
      for (const data of miningData.issues) {
        if (data.id === comparison.id) {
          comparison.body = data.body;
          comparison.repo = data.repo;
          comparison.issueId = data.issueId;
          comparison.tags = data.tags;
          break;
        }
      }

      for (const topic of newTopics) {
        if (topic.id === comparison.topicNum) {
          topic.issues.push(comparison);
        }
      }
    }

    return newTopics;
  }

  static joinComparisonsAndTopics2(topicData, miningData) {
    let newTopics = [];

    for (let index = 0; index < topicData.topics.length; index++) {
      const topic = topicData.topics[index];
      newTopics.push({
        topic: topic.join(","),
        issues: [],
        id: index,
        name: "#" + index + " - " + topic.join(","),
      });
    }

    for (const comparison of topicData.comparisons) {
      for (const data of miningData.issues) {
        if (data.id === comparison.id) {
          comparison.body = data.body;
          comparison.repo = data.repo;
          comparison.issueId = data.issueId;
          comparison.tags = data.tags;
          break;
        }
      }

      for (const topic of newTopics) {
        if (topic.id === comparison.topicNum) {
          topic.issues.push(comparison);
        }
      }
    }

    return newTopics;
  }
};
