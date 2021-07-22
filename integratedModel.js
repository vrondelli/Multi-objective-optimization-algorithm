const math = require('mathjs')

const constants = require('./constants')
const {engine} = require('./index')
const {getModelPlayers, mapGoalsDataByIndex} = require('./players')

const calculateIntegratedModel = async (models, players) => {
  const modelsResults = await Promise.all(models.map(calculateModel(players)))
  const integratedModel = assembleIntegratedModel(models)
  const integratedModelPlayers = assembleIntegratedModelPlayers(models, modelsResults, players)
  const mappedGoalDataPlayers = mapGoalsDataByIndex(integratedModelPlayers)
  return engine({...integratedModel, players: mappedGoalDataPlayers})
}

// private

const calculateModel = players => (model) => {
  const modelPlayers = getModelPlayers(model.name, players)
  return engine({...model, players: modelPlayers})
}

const assembleIntegrateModelGoals = models => models.map(model => ({
  type: constants.goals.types.percentage,
  value: math.divide(100, 100),
  indexName: model.name
}))

const assembleIntegratedModelGoalsData = (modelResults, player) => modelResults.map(({model, rankPlayers}) => {
  const rankedPlayer = rankPlayers.find(rankedPlayer => rankedPlayer.name === player.name)
  return {
    type: constants.goals.types.percentage,
    value: rankedPlayer.score,
    indexName: model.name
  }
})

const assembleIntegratedModelPlayers = (models, modelResults, players) => players.map(player => {
  const goals = assembleIntegrateModelGoals(models)
  const goalsData = assembleIntegratedModelGoalsData(modelResults, player)
  return {...player, goals, goalsData}
})

const assembleIntegratedModel = models => {
  const integratedModelIndexes = models.map((model) => ({
    name: model.name,
    bias: constants.indexesBias.biggerBetter,
    weight: model.integratedModelWeight
  }))
  return {name: 'IntegratedModel', indexes: integratedModelIndexes}
}

module.exports = {
  calculateIntegratedModel
}