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

  static joinMiningAndDefinition(miningData, definitionData) {
    const miningMap = {};
    for (const item of miningData.issues) {
      miningMap[item.id] = item;
    }

    for (const rcr of definitionData.rcrs) {
      if (miningMap[rcr.mainIssue]) {
        rcr.mainIssue = miningMap[rcr.mainIssue];
      }

      for (let i = 0; i < rcr.relatedToIssues.length; i++) {
        const relatedIssueId = rcr.relatedToIssues[i];
        if (miningMap[relatedIssueId]) {
          rcr.relatedToIssues[i] = miningMap[relatedIssueId];
        }
      }
    }
    return definitionData;
  }

  static joinDefinitionDataWithVotes(definitionData, votes) {
    // . Filtering all the rcrs with going_to_vote = true
    definitionData.rcrs = definitionData.rcrs.filter(
      (rcr) => rcr.going_to_vote
    );

    // . Joining the votes with the rcrs
    for (const rcr of definitionData.rcrs) {
      rcr.definition_votes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, comments: [] };
      rcr.final_vote = 0;
      rcr.exclude_to_priority = false;
      rcr.position = 0;

      // . Filtering all the votes for the current RCR
      const votesForThisRCR = votes.filter((vote) => vote.id === rcr.id);

      for (const rcrVote of votesForThisRCR) {
        rcr.definition_votes[rcrVote.score] += 1;
        if (rcrVote.comment) {
          rcr.definition_votes.comments.push({
            comment: rcrVote.comment,
            score: rcrVote.score,
          });
        }
      }

      // * Verificar em qual dos atributos de nota há mais votos e definir o atributo final_vote na rcr
      if (rcr.definition_votes[5] === rcr.definition_votes[4]) {
        rcr.final_vote = 5;
        continue;
      }

      if (rcr.definition_votes[5] > rcr.definition_votes[4]) {
        rcr.final_vote = 5;
        continue;
      }

      if (rcr.definition_votes[4] === rcr.definition_votes[3]) {
        rcr.final_vote = 4;
        continue;
      }

      if (rcr.definition_votes[4] > rcr.definition_votes[3]) {
        rcr.final_vote = 4;
        continue;
      }

      if (rcr.definition_votes[3] === rcr.definition_votes[2]) {
        rcr.final_vote = 3;
        continue;
      }

      if (rcr.definition_votes[3] > rcr.definition_votes[2]) {
        rcr.final_vote = 3;
        continue;
      }

      if (rcr.definition_votes[2] === rcr.definition_votes[1]) {
        rcr.final_vote = 2;
        continue;
      }

      if (rcr.definition_votes[2] > rcr.definition_votes[1]) {
        rcr.final_vote = 2;
      } else {
        rcr.final_vote = 1;
      }
    }

    // * Ordenar as rcrs pela nota final
    definitionData.rcrs.sort((a, b) => {
      return b.final_vote - a.final_vote;
    });

    // * Definir a posição de cada rcr
    for (let i = 0; i < definitionData.rcrs.length; i++) {
      definitionData.rcrs[i].position = i + 1;
      definitionData.rcrs[i].votes_position = i + 1;
    }

    // . Erasing closing_date and status
    definitionData.closing_date = null;
    definitionData.status = "elaborating";

    return definitionData;
  }
};
