const math = require('mathjs')
const util = require('util')
const ObjectsToCsv = require('objects-to-csv');

const constants = require('./constants')

const calculatePlayersScoreAndRank = (model) => {
  const {indexes, players} = model
  console.log({model})
  const assistanceToNormalizedMatrixPlayers = players.map(calculatePlayerAssistanceToNormalizedMatrix(indexes, players))
  const normalizedMatrixPlayers = assistanceToNormalizedMatrixPlayers.map(calculatePlayerNormalizedMatrix(indexes, assistanceToNormalizedMatrixPlayers))
  const weightedNormalizedMatrixPlayers = normalizedMatrixPlayers.map(calculatePlayerWeightedNormalized(indexes))
  const extremesToObjectivePlayers = weightedNormalizedMatrixPlayers.map(calculatePlayerExtremesToObjective(indexes))
  const eucledianDistancesPlayers = extremesToObjectivePlayers.map(calculatePlayerEucledianDistances(indexes))
  const assistanceToPriorityIndexPlayers = eucledianDistancesPlayers.map(calculatePlayerAssistanceToPriorityIndex(indexes, eucledianDistancesPlayers))
  const priorityIndexPlayers = assistanceToPriorityIndexPlayers.map(calculatePlayerPriorityIndex)
  const individualAchievementPercentagePlayers = priorityIndexPlayers.map(calculateIndividualAchievementPercentage(indexes))
  const scorePlayers = individualAchievementPercentagePlayers.map(calculatePlayerScore)
  const rankPlayers = scorePlayers.map(calculatePlayerRank(scorePlayers))
  console.log(JSON.stringify(rankPlayers.filter(player => player.name === 'Hospitais - SE'), undefined, 2))
  return getResultCsv(rankPlayers, model)
}

// private

const findGoalByIndex = (goals, indexName) => goals.find(goal => goal.indexName === indexName)

const calculateBiggerBetterBiasAssistanceToNormalizedMatrix = (goal, indexPlayerGoalData) => {
  if (indexPlayerGoalData < goal) return math.square(indexPlayerGoalData)
  return math.square(goal)
}

const calculateSmallerBetterBiasAssistanceToNormalizedMatrix = (goal, indexPlayerGoalData) => {
  if (indexPlayerGoalData > goal) return math.square(indexPlayerGoalData)
  return math.square(goal)
}

const getAssistanceToNormalizedMatrixCalculationByIndexBias = indexBias => indexBias === constants.indexesBias.smallerBetter ? calculateSmallerBetterBiasAssistanceToNormalizedMatrix : calculateBiggerBetterBiasAssistanceToNormalizedMatrix

const calculateCompetingPlayerAssistanceToNormalizedMatrix = (indexes, playerGoals, competingPlayer) => indexes.reduce((playerAssistanceToNormalizedMatrix, index) => {
  const goal = findGoalByIndex(playerGoals, index.name).value
  const calculationFunction = getAssistanceToNormalizedMatrixCalculationByIndexBias(index.bias)
  const assistanceToNormalizedMatrixValue = calculationFunction(goal, competingPlayer.goalsData[index.name])
  playerAssistanceToNormalizedMatrix[index.name] = assistanceToNormalizedMatrixValue
  return playerAssistanceToNormalizedMatrix
}, {})

const calculatePlayerAssistanceToNormalizedMatrix = (indexes, allPlayers) => (player) => {
  const competingPlayers = allPlayers.filter(p => p.hierarchicalLevel === player.hierarchicalLevel)
  const assistanceToNormalizedMatrix = competingPlayers.reduce((competingPlayersAssistanceToNormalizedMatrix, currentPlayer) => {
    const competingPlayerAssistanceToNormalizedMatrix = calculateCompetingPlayerAssistanceToNormalizedMatrix(indexes, player.goals, currentPlayer)
    competingPlayersAssistanceToNormalizedMatrix[currentPlayer.name] = competingPlayerAssistanceToNormalizedMatrix
    return competingPlayersAssistanceToNormalizedMatrix
  }, {})
  return {...player, assistanceToNormalizedMatrix}
}

const calculateBiggerBetterBiasNormalizedMatrix = (goal, indexPlayerGoalData, playerAssistanceSum) => {
  if (indexPlayerGoalData > goal) return math.chain(goal).divide(math.sqrt(playerAssistanceSum)).done()
  return math.chain(indexPlayerGoalData).divide(math.sqrt(playerAssistanceSum)).done()
}

const calculateSmallerBetterBiasNormalizedMatrix = (goal, indexPlayerGoalData, playerAssistanceSum) => {
  if (indexPlayerGoalData < goal) return math.chain(goal).divide(math.sqrt(playerAssistanceSum)).done()
  return math.chain(indexPlayerGoalData).divide(math.sqrt(playerAssistanceSum)).done()
}

const getNormalizedMatrixCalculationByIndexBias = indexBias => indexBias === constants.indexesBias.smallerBetter ? calculateSmallerBetterBiasNormalizedMatrix : calculateBiggerBetterBiasNormalizedMatrix

const getCompetingPlayerGoalDataByIndex = (allPlayers, competingPlayerName, indexName) => (allPlayers.find(player => player.name === competingPlayerName)).goalsData[indexName]

const calculateCompetingPlayerNormalizedMatrix = (indexes, assistanceToNormalizedMatrix, allPlayers, playerGoals, competingPlayerName) => indexes.reduce((competingPlayerNormalizedMatrix, index) => {
  const assistanceToNormalizedMatrixSum = Object.values(assistanceToNormalizedMatrix)
    .map(assistance => assistance[index.name])
    .reduce((a, b) => a + b, 0)
  const competingPlayerGoalData = getCompetingPlayerGoalDataByIndex(allPlayers, competingPlayerName, index.name)
  const calculationFunction = getNormalizedMatrixCalculationByIndexBias(index.bias)
  const goal = findGoalByIndex(playerGoals, index.name).value
  const normalizedMatrixValue = calculationFunction(goal, competingPlayerGoalData, assistanceToNormalizedMatrixSum)
  competingPlayerNormalizedMatrix[index.name] = normalizedMatrixValue
  return competingPlayerNormalizedMatrix
}, {})

const calculatePlayerNormalizedMatrix = (indexes, allPlayers) => (assistanceToNormalizedMatrixPlayer) => {
  const assistanceToNormalizedMatrix = assistanceToNormalizedMatrixPlayer.assistanceToNormalizedMatrix
  const normalizedMatrix = Object.keys(assistanceToNormalizedMatrix).reduce((normalizedMatrix, competingPlayerName) => {
    const competingPlayerNormalizedMatrix = calculateCompetingPlayerNormalizedMatrix(indexes, assistanceToNormalizedMatrix, allPlayers, assistanceToNormalizedMatrixPlayer.goals, competingPlayerName)
    normalizedMatrix[competingPlayerName] = competingPlayerNormalizedMatrix
    return normalizedMatrix
  }, {})
  return {...assistanceToNormalizedMatrixPlayer, normalizedMatrix}
}

const calculateCompetingPlayerWeightedNormalizedMatrix = (indexes, normalizedMatrix, competingPlayerName) => indexes.reduce((competingPlayerWeightedNormalizedMatrix, index) => {
  const indexNormalizedMatrixValue = normalizedMatrix[competingPlayerName][index.name]
  const weightedValue = math.multiply(indexNormalizedMatrixValue, index.weight)
  competingPlayerWeightedNormalizedMatrix[index.name] = weightedValue
  return competingPlayerWeightedNormalizedMatrix
}, {})

const calculatePlayerWeightedNormalized = indexes => normalizedMatrixPlayer => {
  const normalizedMatrix = normalizedMatrixPlayer.normalizedMatrix
  const weightedNormalizedMatrix = Object.keys(normalizedMatrix).reduce((weightedNormalizedMatrix, competingPlayerName) => {
    const competingPlayerWeightedNormalizedMatrix = calculateCompetingPlayerWeightedNormalizedMatrix(indexes, normalizedMatrix, competingPlayerName)
    weightedNormalizedMatrix[competingPlayerName] = competingPlayerWeightedNormalizedMatrix
    return weightedNormalizedMatrix
  }, {})
  return {...normalizedMatrixPlayer, weightedNormalizedMatrix}
}

const calculateGoalWeightedNormalizedMatrix = (indexes, weightedNormalizedMatrixPlayer) => indexes.reduce((goalWeightedNormalizedMatrix, index) => {
  const assistanceToNormalizedMatrixSum = Object.values(weightedNormalizedMatrixPlayer.assistanceToNormalizedMatrix)
    .map(assistance => assistance[index.name])
    .reduce((a, b) => a + b, 0)
  const indexGoalValue = findGoalByIndex(weightedNormalizedMatrixPlayer.goals, index.name).value
  const indexGoalNormalizedMatrixValue = math.chain(indexGoalValue).divide(math.sqrt(assistanceToNormalizedMatrixSum)).done()
  goalWeightedNormalizedMatrix[index.name] = math.multiply(indexGoalNormalizedMatrixValue, index.weight)
  return goalWeightedNormalizedMatrix
}, {})

const calculatePlayerExtremesToObjective = (indexes) => weightedNormalizedMatrixPlayer => {
  const goalNormalizedMatrix = calculateGoalWeightedNormalizedMatrix(indexes, weightedNormalizedMatrixPlayer)
  const extremesToObjective = indexes.reduce((extremesToObjective, index) => {
    const weightedNormalizedMatrix = weightedNormalizedMatrixPlayer.weightedNormalizedMatrix
    const weighetedNormalizedMatrixValuesByIndex = Object.keys(weightedNormalizedMatrix).map(competingPlayer => weightedNormalizedMatrix[competingPlayer][index.name])
    const positiveIdealExtreme = index.bias === constants.indexesBias.biggerBetter ? math.max(...weighetedNormalizedMatrixValuesByIndex, goalNormalizedMatrix[index.name]) : math.min(...weighetedNormalizedMatrixValuesByIndex, goalNormalizedMatrix[index.name])
    const negativeIdealExtreme = index.bias === constants.indexesBias.biggerBetter ? math.min(...weighetedNormalizedMatrixValuesByIndex, goalNormalizedMatrix[index.name]) : math.max(...weighetedNormalizedMatrixValuesByIndex, goalNormalizedMatrix[index.name])
    extremesToObjective[index.name] = {}
    extremesToObjective[index.name].positiveIdeal = positiveIdealExtreme
    extremesToObjective[index.name].negativeIdeal = negativeIdealExtreme
    return extremesToObjective
  }, {})
  return {...weightedNormalizedMatrixPlayer, extremesToObjective}
}

const calculateCompetingPlayerNegativeEucledianDistance = (indexes, weightedNormalizedMatrix, extremesToObjectivePlayer, competingPlayer) => {
  const weightedNormalizedMatrixValuesAndNegativeIdealValues = indexes.map(index => ([weightedNormalizedMatrix[competingPlayer][index.name], extremesToObjectivePlayer.extremesToObjective[index.name].negativeIdeal]))
  const negativeEucledianDistanceSumChain = weightedNormalizedMatrixValuesAndNegativeIdealValues.reduce((chain, [weightedValue, negativeIdealValue]) => {
    return chain.sum(math.chain(weightedValue).subtract(negativeIdealValue).square().done())
  }, math.chain())
  return negativeEucledianDistanceSumChain.sqrt().done()
}

const calculateCompetingPlayerPositiveEucledianDistance = (indexes, weightedNormalizedMatrix, extremesToObjectivePlayer, competingPlayer) => {
  const weightedNormalizedMatrixValuesAndPositiveIdealValues = indexes.map(index => ([weightedNormalizedMatrix[competingPlayer][index.name], extremesToObjectivePlayer.extremesToObjective[index.name].positiveIdeal]))
  const positiveEucledianDistanceSumChain = weightedNormalizedMatrixValuesAndPositiveIdealValues.reduce((chain, [weightedValue, positiveIdealValue]) => {
    return chain.sum(math.chain(weightedValue).subtract(positiveIdealValue).square().done())
  }, math.chain())
  return positiveEucledianDistanceSumChain.sqrt().done()
}

const calculatePlayerEucledianDistances = (indexes) => extremesToObjectivePlayer => {
  const weightedNormalizedMatrix = extremesToObjectivePlayer.weightedNormalizedMatrix
  const eucledianDistances = Object.keys(weightedNormalizedMatrix).reduce((eucledianDistances, competingPlayer) => {
    eucledianDistances[competingPlayer] = {}
    eucledianDistances[competingPlayer].positiveDistance = calculateCompetingPlayerPositiveEucledianDistance(indexes, weightedNormalizedMatrix, extremesToObjectivePlayer, competingPlayer)
    eucledianDistances[competingPlayer].negativeDistance = calculateCompetingPlayerNegativeEucledianDistance(indexes, weightedNormalizedMatrix, extremesToObjectivePlayer, competingPlayer)
    return eucledianDistances
  }, {})
  return {...extremesToObjectivePlayer, eucledianDistances}
}

const calculateBiggerBetterBiasAssistanceToPriorityIndex = (goalValue, competingPlayerGoalData, indexWeight) => {
  if (competingPlayerGoalData < goalValue) return math.chain(math.abs(math.subtract(goalValue, competingPlayerGoalData))).divide(goalValue).multiply(indexWeight).done()
  return 0
}

const calculateSmallerBetterBiasAssistanceToPriorityIndex = (goalValue, competingPlayerGoalData, indexWeight) => {
  if (competingPlayerGoalData > goalValue) return math.chain(math.abs(math.subtract(goalValue, competingPlayerGoalData))).divide(goalValue).multiply(indexWeight).done()
  return 0
}

const getAssistanceToPriorityIndexCalculationByIndexBias = indexBias => indexBias === constants.indexesBias.smallerBetter ? calculateSmallerBetterBiasAssistanceToPriorityIndex : calculateBiggerBetterBiasAssistanceToPriorityIndex

const calculateCompetingPlayerAssistanceToPriorityIndex = (indexes, competingPlayerName, allPlayers, playerGoals) => indexes.reduce((competingPlayerAssistanceToPriorityIndex, index) => {
  const competingPlayerGoalData = getCompetingPlayerGoalDataByIndex(allPlayers, competingPlayerName, index.name)
  const goalValue = findGoalByIndex(playerGoals, index.name).value
  const calculationFunction = getAssistanceToPriorityIndexCalculationByIndexBias(index.bias)
  const assistancePriorityIndexValue =  calculationFunction(goalValue, competingPlayerGoalData, index.weight)
  competingPlayerAssistanceToPriorityIndex[index.name] = assistancePriorityIndexValue
  return competingPlayerAssistanceToPriorityIndex
}, {})

const calculatePlayerAssistanceToPriorityIndex = (indexes, allPlayers) => eucledianDistancesPlayer => {
  const assistanceToPriorityIndex = Object.keys(eucledianDistancesPlayer.eucledianDistances).reduce((assistanceToPriorityIndex, competingPlayerName) => {
    const competingPlayerAssistanceToPriorityIndex = calculateCompetingPlayerAssistanceToPriorityIndex(indexes, competingPlayerName, allPlayers, eucledianDistancesPlayer.goals)
    assistanceToPriorityIndex[competingPlayerName] = competingPlayerAssistanceToPriorityIndex
    return assistanceToPriorityIndex
  }, {})
  return {...eucledianDistancesPlayer, assistanceToPriorityIndex}
}

const calculatePlayerPriorityIndex = assistanceToPriorityIndexPlayer => {
  const assistanceToPriorityIndex = assistanceToPriorityIndexPlayer.assistanceToPriorityIndex
  const priorityIndex = Object.keys(assistanceToPriorityIndex).reduce((priorityIndex, competingPlayerName) => {
    const competingPlayerPriorityIndex = Object.entries(assistanceToPriorityIndex[competingPlayerName])
      .sort(([, firstValue], [, secondValue]) => secondValue - firstValue)
      .reduce((competingPlayerPriorityIndex, [indexName, value], index) => {
        competingPlayerPriorityIndex[index + 1] = value === 0 ? '': indexName
        return competingPlayerPriorityIndex
      }, {})
    priorityIndex[competingPlayerName] = competingPlayerPriorityIndex
    return priorityIndex
  }, {})
  return {...assistanceToPriorityIndexPlayer, priorityIndex}
}

const calculateIndividualAchievementPercentage = indexes => (priorityIndexPlayer) => {
  const individualAchievementPercentage = (indexes.reduce((individualAchievementPercentage, index) => {
    const goalValue = findGoalByIndex(priorityIndexPlayer.goals, index.name).value
    const goalDataValue = index.bias === constants.indexesBias.smallerBetter && priorityIndexPlayer.goalsData[index.name] === 0 ? math.sum(priorityIndexPlayer.goalsData[index.name], 0.1) : priorityIndexPlayer.goalsData[index.name]
    const indexGoalDataPercentage = index.bias === constants.indexesBias.biggerBetter ? math.divide(goalDataValue, goalValue) : math.divide(goalValue, goalDataValue)
    individualAchievementPercentage = math.chain(indexGoalDataPercentage).multiply(index.weight).sum(individualAchievementPercentage).done()
    return individualAchievementPercentage
  }, 0))
  return {...priorityIndexPlayer, individualAchievementPercentage}
}

const calculatePlayerScore = (individualAchievementPercentagePlayer) => {
  const {positiveDistance, negativeDistance} = individualAchievementPercentagePlayer.eucledianDistances[individualAchievementPercentagePlayer.name]
  const eucledianPercentage = negativeDistance === positiveDistance ? 1 : math.chain(negativeDistance).divide(math.sum(positiveDistance, negativeDistance)).done()
  const score = eucledianPercentage >= 1 ? individualAchievementPercentagePlayer.individualAchievementPercentage : eucledianPercentage
  return {...individualAchievementPercentagePlayer, score}
}

const groupPlayersByScore = (competingPlayersScore, groupedPlayersByScore = []) => {
  if (competingPlayersScore.length === 0) return groupedPlayersByScore
  const playerScore = competingPlayersScore.splice(0, 1).flat()
  const sameScorePlayers = competingPlayersScore.filter(([, value]) => value === playerScore[1])
  const playersToGroup = sameScorePlayers.map(([sameScorePlayerName]) => {
    const index = competingPlayersScore.findIndex(([playerName]) => playerName === sameScorePlayerName)
    return competingPlayersScore.splice(index, 1)
  }).flat()
  const groupedPlayers = [playerScore, ...playersToGroup]
  groupedPlayersByScore.push(groupedPlayers)
  return groupPlayersByScore(competingPlayersScore, groupedPlayersByScore)
}

const rankPlayers = groupedPlayersByScore => groupedPlayersByScore
.sort(([[, firstValue]], [[, secondValue]]) => secondValue - firstValue)
.reduce((competingPlayersRank, sortedPlayers, index) => {
  sortedPlayers.forEach(([playerName]) => competingPlayersRank[playerName] = index + 1)
  return competingPlayersRank
}, {})

const calculatePlayerRank = (allPlayers) => (scorePlayer) => {
  const competingPlayersScore = Object.keys(scorePlayer.eucledianDistances).filter(competingPlayerName => {
    const player = allPlayers.find(player => player.name === competingPlayerName)
    return player.includeInRank
  }).reduce((scores, competingPlayerName) => {
    const competingPlayerScore = allPlayers.find(player => player.name === competingPlayerName).score
    scores[competingPlayerName] = competingPlayerScore
    return scores
  }, {})
  const groupedPlayersByScore = groupPlayersByScore(Object.entries(competingPlayersScore))
  const rankedCompetingPlayersScore = rankPlayers(groupedPlayersByScore)
  const rank = rankedCompetingPlayersScore[scorePlayer.name]
  return {...scorePlayer, rank}
}

const getResultCsv = async (rankPlayers, model) => {
  const result = rankPlayers.map(player => {
    // console.log(player.name, player.score, player.rank)
    const score = (player.score * 100) + '%'
    const worstIndexes = Object.entries(player.priorityIndex[player.name]).filter(([indexRank]) => indexRank <= 3).reduce((worstIndexes, [indexRank, indexName]) => {
      if (indexRank === '1') worstIndexes['1° pior indicador'] = indexName
      if (indexRank === '2') worstIndexes['2° pior indicador'] = indexName
      if (indexRank === '3') worstIndexes['3° pior indicador'] = indexName
      return worstIndexes
    }, {})
    return {
      filais: player.name,
      ['PROXIMIDADE AOS OBJETIVOS DA EMPRESA']: score,
      rank: player.rank,
      ...worstIndexes
    }
  })
  const cvs = new ObjectsToCsv(result)
  await cvs.toDisk(`${model.name}-result.csv`)
  return {rankPlayers, model}
}

module.exports = {
  engine: calculatePlayersScoreAndRank
}