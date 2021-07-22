const math = require('mathjs')
const { engine } = require('.')
const constants = require('./constants')

const simulate = (model, simulateType, simulateGoalsData = {}) => {
  const {players} = model
  const simulatedGoalsDataPlayers = simulatePlayersGoalsData(players, simulateGoalsData)
  const simulatedGoalsDataModel = {...model, players: simulatedGoalsDataPlayers}
  switch (simulateType) {
    case constants.simulateTypes.day:
      return simulateDay(simulatedGoalsDataModel)
    case constants.simulateTypes.week:
      return simulateWeek(simulatedGoalsDataModel)
    case constants.simulateTypes.month:
      return simulateMonth(simulatedGoalsDataModel)
  }
}

// private

const simulateGoalsData = (simulateGoalsData, playerGoalsData) => Object.entries(simulateGoalsData).reduce((goalsData, [indexName, goalData]) => {
  goalsData[indexName] = goalData
  return goalsData
}, playerGoalsData)

const simulatePlayersGoalsData = (players, simulatePlayersGoalsData) => Object.entries(simulatePlayersGoalsData).reduce((players, [playerName, goalsData]) => {
  const player = players.find(player => player.name === playerName)
  const playerIndex = players.findIndex(player => player.name === playerName)
  const simulatedGoalsData = simulateGoalsData(goalsData, player.goalsData)
  player.goalsData = simulatedGoalsData
  players[playerIndex] = player
  return players
}, players)

const calculateRemainingWorkDays = (workedDays, workDays) => math.subtract(workDays, workedDays)

const calculateAcumulatedGoalData = (acumulatedPeriod, goalData) => math.divide(goalData, acumulatedPeriod)

const calculateSimulatedGoalData = (acumulatedGoalData, remainingWorkDays) => math.multiply(acumulatedGoalData, remainingWorkDays)

const calculatePlayerSimulatedGoalData = (indexes, acumulatedPeriod, workDays, workedDays) => player => {
  const goalsData = player.goalsData
  const simulatedGoalsData = indexes.reduce((simulatedGoalsData, index) => {
    const indexGoalData = goalsData[index.name]
    const remainingWorkDays = calculateRemainingWorkDays(workedDays, workDays)
    const acumulatedGoalData = calculateAcumulatedGoalData(acumulatedPeriod, indexGoalData)
    simulatedGoalsData[index.name] = calculateSimulatedGoalData(acumulatedGoalData, remainingWorkDays)
    return simulatedGoalsData
  }, {})
  return {...player, goalsData: simulatedGoalsData}
}

const simulateDay = model => {
  const {indexes, workedDays, workDays, players} = model
  const simulatedGoalDataPlayers = players.map(calculatePlayerSimulatedGoalData(indexes, workedDays, workDays, workedDays))
  console.log(simulatedGoalDataPlayers[2])
  return engine({...model, players: simulatedGoalDataPlayers})
}

const simulateWeek = model => {
  const {indexes, workedDays, workDays, players, workedWeeks} = model
  const simulatedGoalDataPlayers = players.map(calculatePlayerSimulatedGoalData(indexes, workedWeeks, workDays, workedDays))
  return engine({...model, players: simulatedGoalDataPlayers})
}

const simulateMonth = model => {
  const {indexes, workedDays, workDays, players} = model
  const simulatedGoalDataPlayers = players.map(calculatePlayerSimulatedGoalData(indexes, workedDays, workDays, workedDays))
  return engine({...model, players: simulatedGoalDataPlayers})
}

module.exports = {
  simulate
}