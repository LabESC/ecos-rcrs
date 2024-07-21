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

  static joinMiningAndFinal(miningData, finalData) {
    const miningMap = {};
    for (const item of miningData.issues) {
      miningMap[item.id] = {
        ...item,
        url: `https://github.com/${item.repo}/issues/${item.issueId}`,
      };
    }

    for (const rcr of finalData.rcrs) {
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
    return finalData;
  }

  static joinDefinitionDataWithVotes(definitionData, votes) {
    // . Filtering all the rcrs with going_to_vote = true
    definitionData.rcrs = definitionData.rcrs.filter(
      (rcr) => rcr.going_to_vote === true
    );

    // . Joining the votes with the rcrs
    for (const rcr of definitionData.rcrs) {
      delete rcr.going_to_vote;
      rcr.definition_votes = {
        1: 0,
        2: 0,
        3: 0,
        /*4: 0,
        5: 0,*/
        comments: [],
        counts: 0,
      };
      rcr.final_vote = 0;
      rcr.exclude_to_priority = true;
      rcr.position = 0;
      rcr.olds = [];

      // . Filtering all the votes for the current RCR
      const votesForThisRCR = votes.filter((vote) => vote.id === rcr.id);

      for (const rcrVote of votesForThisRCR) {
        rcr.definition_votes[rcrVote.score] += 1;
        rcr.definition_votes.counts += 1;

        if (rcrVote.comment) {
          rcr.definition_votes.comments.push({
            comment: rcrVote.comment,
            score: rcrVote.score,
          });
        }
      }

      // * Verificar em qual dos atributos de nota há mais votos e definir o atributo final_vote na rcr
      /*if (
        rcr.definition_votes[5] === rcr.definition_votes[4] &&
        rcr.definition_votes[5] !== 0
      ) {
        rcr.final_vote = 5;
        continue;
      }

      if (rcr.definition_votes[5] > rcr.definition_votes[4]) {
        rcr.final_vote = 5;
        continue;
      }

      if (
        rcr.definition_votes[4] === rcr.definition_votes[3] &&
        rcr.definition_votes[4] !== 0
      ) {
        rcr.final_vote = 4;
        continue;
      }

      if (rcr.definition_votes[4] > rcr.definition_votes[3]) {
        rcr.final_vote = 4;
        continue;
      }
    */
      if (
        rcr.definition_votes[3] === rcr.definition_votes[2] &&
        rcr.definition_votes[3] !== 0
      ) {
        rcr.final_vote = 3;
        continue;
      }

      if (rcr.definition_votes[3] > rcr.definition_votes[2]) {
        rcr.final_vote = 3;
        continue;
      }

      if (
        rcr.definition_votes[2] === rcr.definition_votes[1] &&
        rcr.definition_votes[2] !== 0
      ) {
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
      return b.definition_votes.counts - a.definition_votes.counts;
    });

    // * No atributo definition_votes.comments para cada rcr, agrupar pelo score (fazer ele como key) e concatenar os comentarios como string num array (value)
    for (let i = 0; i < definitionData.rcrs.length; i++) {
      const rcr = definitionData.rcrs[i];
      const comments = rcr.definition_votes.comments;
      const commentsByScore = {};

      for (const comment of comments) {
        if (commentsByScore[comment.score]) {
          commentsByScore[comment.score].push(comment.comment);
        } else {
          commentsByScore[comment.score] = [comment.comment];
        }
      }

      definitionData.rcrs[i].definition_votes.comments = commentsByScore;
    }

    // * Definir a posição de cada rcr
    for (let i = 0; i < definitionData.rcrs.length; i++) {
      definitionData.rcrs[i].votes_position = i + 1;
    }

    // . Erasing closing_date and status
    definitionData.closing_date = null;
    definitionData.status = "elaborating";

    return definitionData;
  }

  static joinPriorityDataWithVotes(priorityData, votes) {
    // . Filtering all the rcrs with exclude_to_priority = false
    priorityData.rcrs = priorityData.rcrs.filter(
      (rcr) => rcr.exclude_to_priority === false
    );

    // ! Obtendo um valor para definir a posicao de cada rcr
    // . Agrupando votos por id
    const groupedObjects = votes.reduce((acc, obj) => {
      acc[obj.id] = (acc[obj.id] || []).concat(obj);
      return acc;
    }, {});

    // . Calculando a soma das posicoes
    const positionsSum = Object.entries(groupedObjects).map(([id, objects]) => {
      const positions = objects.map((obj) => obj.position);
      return {
        id: parseInt(id),
        // crie um atributo positions com um objeto chave valor onde a chave é a posicao e o valor é a quantidade de votos
        positions: positions.reduce((acc, position) => {
          acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {}),
        positionsSum: positions.reduce((a, b) => a + b, 0),
      };
    });

    /*// . Calculando a media das posicoes
    const positionsAverage = positionsSum.map((obj) => {
      return { ...obj, positionsAverage: obj.positionsSum / votes.length };
    });

    // . Ordenando os objetos pela media das posicoes ascentemente
    const sortedVotes = positionsAverage.sort(
      (a, b) => a.positionsAverage - b.positionsAverage
    );*/

    // . Ordenando os objetos pela soma das posições ascentemente
    const sortedVotes = positionsSum.sort(
      (a, b) => a.positionsSum - b.positionsSum
    );

    // . Joining the sorted votes with the rcrs and
    for (let i = 0; i < sortedVotes.length; i++) {
      const vote = sortedVotes[i];
      //. search the rcr with the same id
      const rcr = priorityData.rcrs.find((rcr) => rcr.id === vote.id);

      if (!rcr) {
        continue;
      }

      //rcr.votes_position = i + 1;
      rcr.position = i + 1;
      rcr.positions = vote.positions;
    }

    // * Ordenar as rcrs pelo votes_position ascendentemente
    priorityData.rcrs.sort((a, b) => {
      return a.position - b.position;
      //return a.votes_position - b.votes_position;
    });

    // . Erasing closing_date and status
    priorityData.closing_date = null;
    priorityData.status = "elaborating";

    return priorityData;
  }
};
