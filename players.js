const math = require('mathjs')
const util = require('util')
const ObjectsToCsv = require('objects-to-csv');

const constants = require('./constants')

const getModelPlayers = (modelName, players) => {
  const modelPlayers = players.map(player => {
    const modelGoals = player.goals[modelName]
    const modelGoalsData = player.goalsData[modelName]
    return {...player, goals: modelGoals, goalsData: modelGoalsData}
  })
  const calculatedGoalPlayers = modelPlayers.map(calculatePlayerGoals(modelPlayers))
  const calculatedGoalDataPlayers = calculatedGoalPlayers.map(calculatePlayerGoalsData(calculatedGoalPlayers))
  return mapGoalsDataByIndex(calculatedGoalDataPlayers)
}

const mapGoalsDataByIndex = (calculatedGoalsDataPlayers) => calculatedGoalsDataPlayers.map(player => {
  const goalsDataByIndex = player.goalsData.reduce((goalsDataByIndex, goalData) => {
    goalsDataByIndex[goalData.indexName] = goalData.value
    return goalsDataByIndex
  }, {})
  player.goalsData = goalsDataByIndex
  return player
})

// private

const findGoalByType = (goals, type) => goals.find(goal => goal.type === type)

const calculateCmv = (goal, allGoals) => {
  const salesGoal = findGoalByType(allGoals, constants.goals.types.sales).value
  const commercialMarginGoal = findGoalByType(allGoals, constants.goals.types.commercialMargin).value
  const value =  math.chain(1).subtract(math.divide(commercialMarginGoal, salesGoal)).done()
  return {...goal, value}
}

const calculateEbtida = (goal, allGoals) => {
  const salesGoal = findGoalByType(allGoals, constants.goals.types.sales).value
  const commercialMarginGoal = findGoalByType(allGoals, constants.goals.types.commercialMargin).value
  const expenses = findGoalByType(allGoals, constants.goals.types.expenses).value
  const value = math.chain(math.subtract(commercialMarginGoal, expenses)).divide(salesGoal).done()
  return {...goal, value}
}

const calculateGoalChildrenAverage = (goal, parentPlayer, allPlayers) => {
  const children = getAllParentChildren(parentPlayer.name, allPlayers)
  const childrenGoalsByType = getChildrenGoalsByType(children, goal.type)
  const value = math.mean(childrenGoalsByType)
  return {...goal, value}
}

const getAllParentChildren = (parentPlayerName, allPlayers) => allPlayers.filter(player => player.parent === parentPlayerName)

const getChildrenGoalsByType = (children, goalType) => children.map(child => child.goals.find(goal => goal.type === goalType).value)

const getChildrenGoalsDataByType = (children, goalType) => children.map(child => child.goalsData.find(goalData => goalData.type === goalType).value)
const getChildrenGoalsDataIndexName = (children, indexName) => children.map(child => child.goalsData.find(goalData => goalData.indexName === indexName).value)

const calculateGoalChildrenSum = (goal, parentPlayer, allPlayers) => {
  const children = getAllParentChildren(parentPlayer.name, allPlayers)
  const childrenGoalsByType = getChildrenGoalsByType(children, goal.type)
  const value = childrenGoalsByType.reduce((a, b) => a + b, 0)
  return {...goal, value}
}

const calculateGoalDataChildrenSum = (goalData, parentPlayer, allPlayers) => {
  const children = getAllParentChildren(parentPlayer.name, allPlayers)
  const childrenGoalsDataByType = getChildrenGoalsDataIndexName(children, goalData.indexName)
  const value = childrenGoalsDataByType.reduce((a, b) => a + b, 0)
  return {...goalData, value}
}

const calculateGoalDataChildrenAverage = (goalData, parentPlayer, allPlayers) => {
  const children = getAllParentChildren(parentPlayer.name, allPlayers)
  const childrenGoalsDataByType = getChildrenGoalsDataIndexName(children, goalData.indexName)
  const value =  math.mean(childrenGoalsDataByType)
  return {...goalData, value}
}

const calculateGoalDataChildrensChildrenAverage = (goalData, parentPlayer, allPlayers) => {
  const children = getAllParentChildren(parentPlayer.name, allPlayers)
  const childrensChildren = children.map(player => getAllParentChildren(player.name, allPlayers)).flat()
  const childrensChildrenGoalDataByIndex = getChildrenGoalsDataIndexName(childrensChildren, goalData.indexName)
  const value =  math.mean(childrensChildrenGoalDataByIndex)
  return {...goalData, value}
}

const calculateGoal = (goal, player, allPlayers) => {
  switch (goal.operation) {
    case constants.goals.operations.cmv:
      return calculateCmv(goal, player.goals)
    case constants.goals.operations.ebtida:
      return calculateEbtida(goal, player.goals)
    case constants.goals.operations.childrenSum:
      return calculateGoalChildrenSum(goal, player, allPlayers)
    case constants.goals.operations.childrenAverage:
      return calculateGoalChildrenAverage(goal, player, allPlayers)
    default:
      return goal
  }
}

const calculateGoalsData = (goalData, player, allPlayers) => {
  switch (goalData.operation) {
    case constants.goals.operations.cmv:
      return calculateCmv(goalData, player.goalsData)
    case constants.goals.operations.ebtida:
      return calculateEbtida(goalData, player.goalsData)
    case constants.goals.operations.childrenSum:
      return calculateGoalDataChildrenSum(goalData, player, allPlayers)
    case constants.goals.operations.childrenAverage:
      return calculateGoalDataChildrenAverage(goalData, player, allPlayers)
    case constants.goals.operations.childrensChildrenAverage:
      return calculateGoalDataChildrensChildrenAverage(goalData, player, allPlayers)
    default:
      return goalData
  }
}

const areAllGoalsCalculated = (goals) => goals.filter(goal => goal.value === undefined || goal.value === null).length === 0

const calculatePlayerGoals = allPlayers => (player) => {
  if (areAllGoalsCalculated(player.goals)) return player
  const goalToCalculate = player.goals.find(goal => !goal.value)
  const calculatedGoal = calculateGoal(goalToCalculate, player, allPlayers)
  const goalIndex = player.goals.findIndex(goal => goal.type === goalToCalculate.type && goal.operation === goalToCalculate.operation)
  player.goals[goalIndex] = calculatedGoal
  return calculatePlayerGoals(allPlayers)(player)
}

const calculatePlayerGoalsData = allPlayers => (player) => {
  if (areAllGoalsCalculated(player.goalsData)) return player
  const goalDataToCalculate = player.goalsData.find(goalData => !goalData.value)
  const calculatedGoalData = calculateGoalsData(goalDataToCalculate, player, allPlayers)
  const goalIndex = player.goalsData.findIndex(goalData => goalData.indexName === goalDataToCalculate.indexName)
  player.goalsData[goalIndex] = calculatedGoalData
  return calculatePlayerGoalsData(allPlayers)(player)
}

module.exports = {
  getModelPlayers,
  mapGoalsDataByIndex
}