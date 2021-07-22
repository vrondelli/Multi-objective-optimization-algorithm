
const math = require('mathjs')

const constants = require('./constants')

const findGoalByIndex = (goals, indexName) => goals.find(goal => goal.indexName === indexName)

const doDayPlanning = (model, players) => players.map(player => {
  const {indexes, workDays, workedDays} = model
  const indexesDayPlanning = indexes.reduce((dayPlanning, index) => {
    const goalValue = findGoalByIndex(player.goals, index.name).value
    const goalDataValue = player.goalsData[index.name]
    let indexDayPlanning = math.chain(math.subtract(goalValue, goalDataValue)).divide(math.subtract(workDays, workedDays)).done()
    if (index.bias === constants.indexesBias.smallerBetter && indexDayPlanning >= 0 || index.bias === constants.indexesBias.biggerBetter && indexDayPlanning <= 0) indexDayPlanning = 0
    dayPlanning[index.name] = indexDayPlanning
    return dayPlanning
  }, {})
  player.dayPlanning = indexesDayPlanning
  return player
})

const doWeekPlanning = (model, players) => players.map(player => {
  const {indexes, weeks, workedWeeks, workDays, workedDays} = model
  const indexesWeekPlanning = indexes.reduce((weekPlanning, index) => {
    const goalValue = findGoalByIndex(player.goals, index.name).value
    const goalDataValue = player.goalsData[index.name]
    const weeksRemaining = math.subtract(weeks, workedWeeks)
    let indexWeekPlanning = math.chain(math.subtract(goalValue, goalDataValue)).divide(weeksRemaining).done()
    if (index.bias === constants.indexesBias.smallerBetter && indexWeekPlanning >= 0 || index.bias === constants.indexesBias.biggerBetter && indexWeekPlanning <= 0) indexWeekPlanning = 0
    if (weeksRemaining < 1) {
      const indexDayPlanning = player.dayPlanning[index.name]
      indexWeekPlanning = math.chain(math.subtract(workDays, workedDays)).multiply(indexDayPlanning).done()
    }
    weekPlanning[index.name] = indexWeekPlanning
    return weekPlanning
  }, {})
  player.weekPlanning = indexesWeekPlanning
  return player
})

const assembleModelPlanningResult = ({name}, players) => players.map(player => {
  const modelPlanning = {
    ...player.planning,
    [name]: {
      day: player.dayPlanning,
      week: player.weekPlanning
    }
  }
  player.dayPlanning = undefined
  player.weekPlanning = undefined
  return {...player, planning: modelPlanning}
})

const doPlanning = (model, players) => {
  const dayPlanningPlayers = doDayPlanning(model, players)
  const weekPlanningPlayers = doWeekPlanning(model, dayPlanningPlayers)
  return assembleModelPlanningResult(model, weekPlanningPlayers)
}

module.exports = {
  doPlanning
}