const calculatePlayerExtremesToObjective = (indexes) => weightedNormalizedMatrixPlayer => {
  const goalNormalizedMatrix = calculateGoalWeightedNormalizedMatrix(indexes, weightedNormalizedMatrixPlayer)
  const extremesToObjective = indexes.reduce((extremesToObjective, index) => {
    const weightedNormalizedMatrix = weightedNormalizedMatrixPlayer.weightedNormalizedMatrix
    const weighetedNormalizedMatrixValuesByIndex = Object.keys(weightedNormalizedMatrix).map(competingPlayer => weightedNormalizedMatrix[competingPlayer][index.name])
    const positiveIdealExtreme = math.max(...weighetedNormalizedMatrixValuesByIndex, goalNormalizedMatrix[index.name])
    const negativeIdealExtreme = math.min(...weighetedNormalizedMatrixValuesByIndex, goalNormalizedMatrix[index.name])
    extremesToObjective[index.name].positiveIdeal = positiveIdealExtreme
    extremesToObjective[index.name].negativeIdeal = negativeIdealExtreme
    return extremesToObjective
  },  {})
  return {...weightedNormalizedMatrixPlayer, extremesToObjective}
}

const calculateCompetingPlayerNegativeEucledianDistance = (indexes, weightedNormalizedMatrix, extremesToObjectivePlayers, competingPlayer) => {
  const weightedNormalizedMatrixValuesAndNegativeIdealValues = indexes.map(index => ([weightedNormalizedMatrix[competingPlayer][index.name], extremesToObjectivePlayers[extremesToObjective][index.name].negativeIdeal]))
  const negativeEucledianDistanceSumChain = weightedNormalizedMatrixValuesAndNegativeIdealValues.reduce((chain, ([weightedValue, negativeIdealValue]) => {
    return chain.sum(math.chain(weightedValue).subtract(negativeIdealValue).square())
  }), math.chain())
  return negativeEucledianDistanceSumChain.sqrt()
}

const calculateCompetingPlayerPositiveEucledianDistance = (indexes, weightedNormalizedMatrix, extremesToObjectivePlayers, competingPlayer) => {
  const weightedNormalizedMatrixValuesAndPositiveIdealValues = indexes.map(index => ([weightedNormalizedMatrix[competingPlayer][index.name], extremesToObjectivePlayers[extremesToObjective][index.name].positiveIdeal]))
  const positiveEucledianDistanceSumChain = weightedNormalizedMatrixValuesAndPositiveIdealValues.reduce((chain, ([weightedValue, positiveIdealValue]) => {
    return chain.sum(math.chain(weightedValue).subtract(positiveIdealValue).square())
  }), math.chain())
  return positiveEucledianDistanceSumChain.sqrt()
}

const calculatePlayerEucledianDistances = (indexes) => extremesToObjectivePlayer => {
  const weightedNormalizedMatrix = extremesToObjectivePlayer.weightedNormalizedMatrix
  const eucledianDistances = Object.keys(weightedNormalizedMatrix).reduce((eucledianDistances, competingPlayer) => {
    eucledianDistances[competingPlayer].positiveDistance = calculateCompetingPlayerPositiveEucledianDistance(indexes, weightedNormalizedMatrix, extremesToObjectivePlayers, competingPlayer)
    eucledianDistances[competingPlayer].negativeDistance = calculateCompetingPlayerNegativeEucledianDistance(indexes, weightedNormalizedMatrix, extremesToObjectivePlayers, competingPlayer)
    return eucledianDistances
  })
  return {...extremesToObjectivePlayer, eucledianDistances}
}

const calculatePlayersScore = (players) => {
  const calculatedGoalsPlayers = players.map(calculatePlayerGoals(players))
  const calculatedGoalsDataPlayers = players.map(calculatePlayerGoalsData(calculatedGoalsPlayers))
  const mappedGoalsDataByIndexPlayers = mapGoalsDataByIndex(calculatedGoalsDataPlayers)
  const assistanceToNormalizedMatrixPlayers = mappedGoalsDataByIndexPlayers.map(calculatePlayerAssistanceToNormalizedMatrix(indexes, mappedGoalsDataByIndexPlayers))
  const normalizedMatrixPlayers = assistanceToNormalizedMatrixPlayers.map(calculatePlayerNormalizedMatrix(indexes, assistanceToNormalizedMatrixPlayers))
  const weightedNormalizedMatrixPlayers = normalizedMatrixPlayers.map(calculatePlayerWeightedNormalized(indexes))
  const extremesToObjectivePlayers = weightedNormalizedMatrixPlayers.map(calculatePlayerExtremesToObjective(indexes))
  const eucledianDistancesPlayers = extremesToObjectivePlayers.map(calculatePlayerEucledianDistances(indexes))
  console.log(JSON.stringify(eucledianDistancesPlayers.find(player => player.name === 'Manaus'), null, 2))
}

calculatePlayersScore(mockPlayerGoals(players))


const calculateIndividualAchievementPercentage = (indexes, allPlayers) => (priorityIndexPlayer) => {
  const individualAchievementPercentage = indexes.reduce((individualAchievementPercentage, index) => {
    const goalValue = findGoalByIndex(priorityIndexPlayer.goals, index.name).value
    const competingPlayersGoalPercentages = Object.keys(priorityIndexPlayer.eucledianDistances).reduce((percentages, competingPlayerName) => {
      const competingPlayerGoalData = getCompetingPlayerGoalDataByIndex(allPlayers, competingPlayerName, index.name)
      const percentage = math.divide(competingPlayerGoalData, goalDataValue)
      percentages.push(percentage)
      return percentages
    }, [])
    const playersGoalsPercentagesAverage = math.mean(competingPlayersGoalPercentages)
    individualAchievementPercentage = math.chain(math.divide(goalDataValue, goalValue)).multiply(index.weight).sum(individualAchievementPercentage).done()
    return individualAchievementPercentage
  }, 0)
  return {...priorityIndexPlayer, individualAchievementPercentage}
}