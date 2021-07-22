const math = require('mathjs')
const util = require('util')
const ObjectsToCsv = require('objects-to-csv');


const constants = require('./constants')

const indexes = [
  {
    name: 'Venda',
    bias: constants.indexesBias.biggerBetter,
    weight: math.divide(30, 100)
  },
  {
    name: 'Venda-Qtde',
    bias: constants.indexesBias.biggerBetter,
    weight: math.divide(5, 100)
  },
  {
    name: 'CMV',
    bias: constants.indexesBias.smallerBetter,
    weight: math.divide(15, 100)
  },
  {
    name: 'Margem-Comerc',
    bias: constants.indexesBias.biggerBetter,
    weight: math.divide(15, 100)
  },
  {
    name: 'Desp-Operac',
    bias: constants.indexesBias.smallerBetter,
    weight: math.divide(10, 100)
  },
  {
    name: 'EBTIDA',
    bias: constants.indexesBias.biggerBetter,
    weight: math.divide(25, 100)
  }
]

const players = [
  {
    name: 'São-Paulo',
    parent: 'Regional-Sudeste',
    goalsData: [
      {
        value: 2300.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 900,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 782.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 700.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Rio-de-Janeiro',
    parent: 'Regional-Sudeste',
    goalsData: [
      {
        value: 2300.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 900,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 782.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 700.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Belo-Horizonte',
    parent: 'Regional-Sudeste',
    goalsData: [
      {
        value: 2300.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 900,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 782.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 700.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Porto-Alegre',
    parent: 'Regional-Sul',
    goalsData: [
      {
        value: 2000.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 700,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 900.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 650.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Florianópolis',
    parent: 'Regional-Sul',
    goalsData: [
      {
        value: 2000.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 700,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 900.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 650.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Salvador',
    parent: 'Regional-Nordeste',
    goalsData: [
      {
        value: 1700.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 500,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 612.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 450.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Recife',
    parent: 'Regional-Nordeste',
    goalsData: [
      {
        value: 1800.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 300,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 703.00,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 500.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Fortaleza',
    parent: 'Regional-Nordeste',
    goalsData: [
      {
        value: 2300.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 600,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 1043.28,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 580.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Belém',
    parent: 'Regional-Norte',
    goalsData: [
      {
        value: 2200.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 500,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 864.60,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 650.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Manaus',
    parent: 'Regional-Norte',
    goalsData: [
      {
        value: 1500.00,
        type: constants.goals.types.sales,
        indexName: 'Venda'
      },
      {
        value: 300,
        type: constants.goals.types.quantitySold,
        indexName: 'Venda-Qtde'
      },
      {
        value: 581.85,
        type: constants.goals.types.commercialMargin,
        indexName: 'Margem-Comerc'
      },
      {
        value: 350.00,
        type: constants.goals.types.expenses,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Regional-Sudeste',
    parent: 'Nacional',
    goalsData: [
      {
        type: constants.goals.types.sales,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda'
      },
      {
        type: constants.goals.types.quantitySold,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda-Qtde'
      },
      {
        type: constants.goals.types.commercialMargin,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Margem-Comerc'
      },
      {
        type: constants.goals.types.expenses,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Regional-Sul',
    parent: 'Nacional',
    goalsData: [
      {
        type: constants.goals.types.sales,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda'
      },
      {
        type: constants.goals.types.quantitySold,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda-Qtde'
      },
      {
        type: constants.goals.types.commercialMargin,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Margem-Comerc'
      },
      {
        type: constants.goals.types.expenses,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Regional-Nordeste',
    parent: 'Nacional',
    goalsData: [
      {
        type: constants.goals.types.sales,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda'
      },
      {
        type: constants.goals.types.quantitySold,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda-Qtde'
      },
      {
        type: constants.goals.types.commercialMargin,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Margem-Comerc'
      },
      {
        type: constants.goals.types.expenses,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Regional-Norte',
    parent: 'Nacional',
    goalsData: [
      {
        type: constants.goals.types.sales,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda'
      },
      {
        type: constants.goals.types.quantitySold,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda-Qtde'
      },
      {
        type: constants.goals.types.commercialMargin,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Margem-Comerc'
      },
      {
        type: constants.goals.types.expenses,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
  {
    name: 'Nacional',
    goalsData: [
      {
        type: constants.goals.types.sales,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda'
      },
      {
        type: constants.goals.types.quantitySold,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Venda-Qtde'
      },
      {
        type: constants.goals.types.commercialMargin,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Margem-Comerc'
      },
      {
        type: constants.goals.types.expenses,
        operation: constants.goals.operations.childrenSum,
        indexName: 'Desp-Operac'
      },
      {
        operation: constants.goals.operations.cmv,
        type: constants.goals.types.metric,
        indexName: 'CMV'
      },
      {
        operation: constants.goals.operations.ebtida,
        type: constants.goals.types.metric,
        indexName: 'EBTIDA'
      }
    ]
  },
]

const mockPlayerGoals = players => players.map(player => {
  const parentPlayerNames = ['Regional-Norte', 'Nacional', 'Regional-Sudeste','Regional-Sul','Regional-Nordeste']
  const goals = !parentPlayerNames.includes(player.name) ? [
    {
      value: 100000.00,
      type: constants.goals.types.sales,
      indexName: 'Venda'
    },
    {
      value: 40000.00,
      type: constants.goals.types.quantitySold,
      indexName: 'Venda-Qtde'
    },
    {
      type: constants.goals.types.metric,
      operation: constants.goals.operations.cmv,
      indexName: 'CMV'
    },
    {
      value: 45000.00,
      type: constants.goals.types.commercialMargin,
      indexName: 'Margem-Comerc'
    },
    {
      value: 20000.00,
      type: constants.goals.types.expenses,
      indexName: 'Desp-Operac'
    },
    {
      type: constants.goals.types.metric,
      operation: constants.goals.operations.ebtida,
      indexName: 'EBTIDA'
    },
  ] : [
    {
      type: constants.goals.types.sales,
      operation: constants.goals.operations.childrenSum,
      indexName: 'Venda'
    },
    {
      type: constants.goals.types.quantitySold,
      operation: constants.goals.operations.childrenSum,
      indexName: 'Venda-Qtde'
    },
    {
      type: constants.goals.types.commercialMargin,
      operation: constants.goals.operations.childrenSum,
      indexName: 'Margem-Comerc'
    },
    {
      type: constants.goals.types.expenses,
      operation: constants.goals.operations.childrenSum,
      indexName: 'Desp-Operac'
    },
    {
      type: constants.goals.types.metric,
      operation: constants.goals.operations.cmv,
      indexName: 'CMV'
    },
    {
      type: constants.goals.types.metric,
      operation: constants.goals.operations.ebtida,
      indexName: 'EBTIDA'
    },
  ]
  const hierarchicalLevel = !parentPlayerNames.includes(player.name) ? 3 : 2
  const includeInRank = player.name !== 'Nacional'
  return {...player, goals, hierarchicalLevel, includeInRank}
})