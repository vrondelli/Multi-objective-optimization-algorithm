const math = require('mathjs')
const ObjectsToCsv = require('objects-to-csv')

const constants = require('./constants')
const {calculateIntegratedModel} = require('./integratedModel')
const {doPlanning} = require('./planning')
const {getModelPlayers} = require('./players')
const { simulate } = require('./simulator')

const ocupationModel = {
  name: 'Ocupação-teste',
  indexes: [
    {
      name: 'TAXA DE OCUPAÇÃO UTI - COVID',
      bias: constants.indexesBias.smallerBetter,
      weight: math.divide(50, 100)
    },
    {
      name: 'TAXA DE OCUPAÇÃO ENF. COVID',
      bias: constants.indexesBias.smallerBetter,
      weight: math.divide(50, 100)
    },
  ],
  integratedModelWeight: math.divide(30, 100),
  workDays: 20,
  workedDays: 2,
  weeks: 4,
  workedWeeks: 0.4
}

const entranceAndExitModel = {
  name: 'Entrada - Saída-teste',
  indexes: [
    {
      name: 'INTERNAÇÃO  ENF - COVID-19',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(6).done()
    },
    {
      name: 'INTERNAÇÃO UTI - COVID - 19',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(6).done()
    },
    {
      name: 'SAÍDA DIÁRIA - UTI - ÓBITOS',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(6).done()
    },
    {
      name: 'SAÍDA DIÁRIA - UTI - ALTA',
      bias: constants.indexesBias.biggerBetter,
      weight: math.chain(1).divide(6).done()
    },
    {
      name: 'SAÍDA DIÁRIA - ENF - ÓBITOS',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(6).done()
    },
    {
      name: 'SAÍDA DIÁRIA - ENF - ALTAS',
      bias: constants.indexesBias.biggerBetter,
      weight: math.chain(1).divide(6).done()
    },
  ],
  integratedModelWeight: math.divide(10, 100),
  workDays: 20,
  workedDays: 1,
  weeks: 4,
  workedWeeks: 0.2

}

const equipamentModel = {
  name: 'Equipamentos-teste',
  indexes: [
    {
      name: 'Taxa de ocupação dos ventiladores',
      bias: constants.indexesBias.smallerBetter,
      weight: math.divide(50, 100)
    },
    {
      name: 'Taxa de ocupação dos monitores',
      bias: constants.indexesBias.smallerBetter,
      weight: math.divide(50, 100)
    },
  ],
  integratedModelWeight: math.divide(20, 100),
  workDays: 20,
  workedDays: 1,
  weeks: 4,
  workedWeeks: 0.2
}

const epiModel = {
  name: 'EPI-test',
  indexes: [
    {
      name: 'Fator de Utilização - FILTRO',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - ÓCULOS',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - CAIXA DE LUVA',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - VISEIRA',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - AVENTAL/CAPOTE',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - MÁSCARA CIRÚRGICA',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
    {
      name: 'Fator de Utilização - MÁSCARA-N95',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(8).done()
    },
  ],
  integratedModelWeight: math.divide(20, 100),
  workDays: 22,
  workedDays: 1,
  weeks: 4,
  workedWeeks:  0.2
}


const teamModel = {
  name: 'Equipe-teste',
  indexes: [
    {
      name: 'Ocupação do quadro - MÉDICOS',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(5).done()
    },
    {
      name: 'Ocupação do quadro - FISIOTERAPEUTAS',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(5).done()
    },
    {
      name: 'Ocupação do quadro - ENFERMEIROS',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(5).done()
    },
    {
      name: 'Ocupação do quadro - TEC. ENFERMAGEM',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(5).done()
    },
    {
      name: 'Ocupação do quadro - HIGIENIZAÇÃO',
      bias: constants.indexesBias.smallerBetter,
      weight: math.chain(1).divide(5).done()
    },
  ],
  integratedModelWeight: math.divide(20, 100),
  workDays: 20,
  workedDays: 1,
  weeks: 4,
  workedWeeks: 0.2
}

const players = [
  {
    name: 'Região Centro-Oeste',
    hierarchicalLevel: 1,
    parent: 'Brasil',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        }
      ],
      [entranceAndExitModel.name]: [
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - VISEIRA'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - DF',
    hierarchicalLevel: 2,
    parent: 'Região Centro-Oeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(54.8197278911565, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(45.9973878788826, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 750,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 214,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 78,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 126,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 85,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 1359,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(62.5188679245283, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(62.2264150943396, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(20, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(20.8365384615384, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(108.757281553398, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.2718446601942, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(37.0291262135923, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.3495145631068, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(51.4313725490196, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(30.2718446601942, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.3461538461538, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.923076923077, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(88.4571428571429, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.6476190476191, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(73.9550561797753, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - GO',
    hierarchicalLevel: 2,
    parent: 'Região Centro-Oeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(23.4365228267667, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(20.4793479294442, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 213,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 172,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 63,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 95,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 26,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 565,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(43.3951612903226, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(53.7580645161291, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(4.13008130081301, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(20.2032520325203, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.7967479674797, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(10.2439024390244, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.30894308943089, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.0731707317073, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.7235772357724, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(6.40163934426229, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(94.4193548387096, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(86.0564516129032, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(94.508064516129, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.8943089430894, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(99.6612903225806, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - MS',
    hierarchicalLevel: 2,
    parent: 'Região Centro-Oeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(38.2201518418136, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(21.2609761397935, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 143,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 55,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 154,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 526,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 111,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 3155,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(39.9259259259259, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(52.0617283950617, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.9893617021277, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.695652173913, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(76.8241758241758, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(11.5505617977528, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.9148936170213, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(28.8452380952381, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(37.8235294117647, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(13.6744186046512, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.7901234567901, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.8170731707318, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(73.9634146341463, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(75.2592592592592, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(86.4406779661017, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - MT',
    hierarchicalLevel: 2,
    parent: 'Região Centro-Oeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(45.1143790849673, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(31.77174039243, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 74,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 52,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 25,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 6,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 0,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 29,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(82.7777777777778, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(55.0555555555555, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(0.0555555555555556, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(2.16666666666667, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(0.388888888888889, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.2352941176471, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(0.941176470588235, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.88888888888889, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.33333333333333, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(2.66666666666667, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(100, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(101.888888888889, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(99.0555555555556, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.7777777777778, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(99.3333333333334, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Região Nordeste',
    hierarchicalLevel: 1,
    parent: 'Brasil',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        }
      ],
      [entranceAndExitModel.name]: [
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - VISEIRA'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - AL',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(90.9758965314521, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(85.6185897435898, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 943,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 808,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 131,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 25,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 118,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 56,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(60, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(79.952380952381, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(0, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.5, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(29.64, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(52.625, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(7.66666666666667, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(42.2, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(58.24, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(45.4, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(92.1111111111111, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.9259259259259, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(87.6666666666667, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(74.9259259259259, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(100, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - BA',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(90.4882034695332, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(56.3696594909295, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 498,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 419,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 195,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 93,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 69,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 449,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(49.84, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(53.0799999999999, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(4.15217391304348, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.3840579710145, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.1449275362319, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(27.2481751824817, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(37.889705882353, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(44.5755395683454, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(38.4100719424461, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.6546762589928, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.3394495412844, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.4867256637168, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.4403669724771, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(82.7777777777778, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(87.0884955752212, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - CE',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(103.730241725226, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(88.1375193670185, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 668,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 417,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 214,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 196,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 101,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 2116,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(69.7413793103448, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(77.2558139534884, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.39873417721518, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(18.6772151898734, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.753164556962, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(15.3459119496855, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(12.25, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(38.0778443113772, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(28.4583333333334, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.2168674698795, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(97.4152046783626, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(94.6337209302326, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(96.3294797687862, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(88.453488372093, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.8888888888889, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - MA',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(71.8406757714839, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(72.6495981977934, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 1294,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 518,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 235,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 75,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 45,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 478,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(69.6875, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(79, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(25.3455882352941, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(25.9219858156029, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(62.5035460992908, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(36.822695035461, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.6985294117647, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(48.0845070422535, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(98.5957446808511, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(96.6408450704226, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(95.0215053763441, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(71.5, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.436170212766, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(86.1935483870968, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.7176470588235, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - PB',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(60.9205898268398, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(36.4066708965026, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 161,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 109,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 62,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 31,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 8,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 126,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(51.9722222222222, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(64.5, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(20.6111111111111, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(13.5833333333333, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(32.6666666666667, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(35.9722222222222, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(60.3611111111111, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(54.1388888888889, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(46.2222222222222, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.1666666666667, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(71.0833333333333, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.3611111111111, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(88.5555555555556, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.3055555555556, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(98.3611111111111, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - PE',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(92.6147515945064, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(84.2044802571875, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 1204,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 790,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 410,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 346,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 190,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 3673,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(67.9515151515151, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(65.3333333333333, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(4.25806451612903, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(8.3010752688172, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.46236559139785, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(5.91304347826087, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(1.72043010752688, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.5268817204301 , 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(15.5851063829787, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.08602150537634, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(87.4186046511628, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(86.7837837837838, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.0328947368421, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.9078947368421, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.0948905109489, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - PI',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(68.4627329192547, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(47.6038159371493, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 66,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 43,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 21,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 14,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 7,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 161,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(35, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(66.1228070175439, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(0.441176470588235, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(4.91176470588235, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(36.9583333333333, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(5.33333333333333, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(37.469387755102, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(55.46, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.4081632653061, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(13.3061224489796, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.0000000000001, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(88.5555555555556, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(86.0317460317461, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.063492063492, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(88.754716981132, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - RN',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(74.312169667029, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(70.3448376980648, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 142,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 90,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 51,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 18,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 9,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 199,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(32.0340909090909, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(59.875, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(14.2125, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.5, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(32.5357142857143, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(14.4931506849315, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(27.425, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.3448275862069, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(43.2068965517241, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(26.2298850574713, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(77.8735632183908, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.8604651162791, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(71.4827586206897, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.9770114942529, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(80.8295454545454, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - SE',
    hierarchicalLevel: 2,
    parent: 'Região Nordeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(132.630738846955, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(54.8245614035088, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 116,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 125,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 12,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 20,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 5,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 30,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(40, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(79.6756756756757, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.1176470588236, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(0, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(55.4054054054054, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(0, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.4375, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(53.7222222222222, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(66.4594594594595, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(77.4324324324324, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.9655172413793, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(14.1153846153846, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(51.6551724137931, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(44.3448275862069, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(56.741935483871, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Região Norte',
    hierarchicalLevel: 1,
    parent: 'Brasil',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        }
      ],
      [entranceAndExitModel.name]: [
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - VISEIRA'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - AC',
    hierarchicalLevel: 2,
    parent: 'Região Norte',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(54.9852790578597, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(52.10678895214, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 1330,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 282,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 40,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 20,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 54,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 82,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(38.9666666666667, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(49.0166666666667, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(19.0476190476191, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.4285714285714, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.7380952380952, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.9047619047619, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(19.0476190476191, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(62.2142857142857, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(45.4047619047619, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.9285714285714, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.046511627907, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(78.1162790697674, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(95.9333333333333, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(74.6833333333333, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(98.7857142857143, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - AM',
    hierarchicalLevel: 2,
    parent: 'Região Norte',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(81.8060311925873, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(68.5042129311575, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 2904,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 1136,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 759,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 564,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 1019,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 1933,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(73.101083032491, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(74.9420289855072, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.5474452554745, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(30.3905109489051, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(28.2150537634409, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.5418181818182, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(49.2051282051282, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(43.5992779783393, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(36.0287769784173, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(27.9714285714286, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.1628959276018, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.5176991150443, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(94.9013452914798, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(81.4821428571429, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.4713656387665, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - AP',
    hierarchicalLevel: 2,
    parent: 'Região Norte',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(63.1444313262495, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(166.827768377485, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 27,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 26,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 14,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 3,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 10,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 44,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(58.9473684210526, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(61.4736842105263, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(0, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.7, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.2, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.9, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(0, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.5555555555556, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(38.4545454545455, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(48.7, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(81.7222222222222, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(78, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(73.5294117647059, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(78.9411764705882, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(78.4117647058824, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - PA',
    hierarchicalLevel: 2,
    parent: 'Região Norte',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(82.856926799758, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(57.926276603262, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 276,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 174,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 43,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 22,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 24,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 49,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.5652173913043, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(64.7391304347826, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(78.952380952381, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(56.8846153846154, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(48.2272727272727, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(44.8846153846154, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(71.1, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(48.8846153846154, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.2, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(36.0769230769231, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(83.85, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.2105263157895, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89.2, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(81.15, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(89, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - TO',
    hierarchicalLevel: 2,
    parent: 'Região Norte',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(34.1779556650246, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(26.1098008111217, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 100,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 53,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 17,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 6,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 8,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 61,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.8666666666667, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(33.6808510638298, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(26.6666666666667, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(60.1929824561404, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(55.3728813559322, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(48.6140350877193, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(19.4878048780488, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(77.2586206896552, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(58.6724137931034, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(35.7704918032787, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(52.7931034482759, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(67.7758620689656, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(76.3620689655173, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(70.1551724137932, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(60.3913043478261, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - RO',
    hierarchicalLevel: 2,
    parent: 'Região Norte',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(4.46428571428571, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(11.2044817927171, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 21,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 3,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 4,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 7,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 3,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 167,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.95, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(30.9, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(7.6, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(4.75, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.2, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(3.15, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(0, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.55, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(25.55, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.2, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.25, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.4, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(95.45, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(85.3, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(100, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Região Sudeste',
    hierarchicalLevel: 1,
    parent: 'Brasil',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        }
      ],
      [entranceAndExitModel.name]: [
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - VISEIRA'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - ES',
    hierarchicalLevel: 2,
    parent: 'Região Sudeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(86.6061882690403, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(47.9697016103044, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 792,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 1322,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 324,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 374,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 79,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 1088,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(37.0674157303371, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(57.9888268156425, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(11.3877551020408, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(10.4520547945206, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(14.1941176470588, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(8.06338028169014, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.4345238095238, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(32.1169590643275, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(16.8245614035088, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(11.3918128654971, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(87.8268156424581, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(82.7039106145251, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.0446927374303, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(83.0393258426966, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(92.2470588235294, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - MG',
    hierarchicalLevel: 2,
    parent: 'Região Sudeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(61.9082491582492, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(44.5332884478289, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 485,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 135,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 105,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 265,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 57,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 1780,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.8333333333333, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(61.5784313725491, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(17.0350877192983, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(27.625, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.8859649122807, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.9327731092437, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(42.7444444444444, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(47.6967213114754, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(25.1311475409836, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(29.9590163934426, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(92.3490566037736, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(97.1428571428571, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.9615384615385, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(93.8942307692308, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(98.9238095238095, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - RJ',
    hierarchicalLevel: 2,
    parent: 'Região Sudeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(72.0119952287135, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(64.9588821836614, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 791,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 403,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 375,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 132,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 135,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 948,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(50.8631578947368, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(67.5531914893617, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(10.1086956521739, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(6.02222222222222, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.1222222222222, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.3578947368421, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(23.4021739130435, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.9894736842105, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(25.7717391304348, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(30.6210526315789, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.010989010989, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(85.5222222222222, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(82.088888888889, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(73.8539325842697, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(94.8735632183908, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - SP',
    hierarchicalLevel: 2,
    parent: 'Região Sudeste',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(86.0318962738456, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(90.9047552477854, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 2744,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 1569,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 409,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 147,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 372,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 2478,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(44.8339100346021, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(52.1868512110725, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.8795620437956, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(38.4082397003746, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(39.711678832116, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.4890510948905, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(35.0717488789238, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(42.2727272727273, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(38.6909090909091, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(36.7700729927007, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.3986013986014, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(64.9548611111111, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.5277777777778, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.53125, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(96.59375, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Região Sul',
    hierarchicalLevel: 1,
    goals: {},
    parent: 'Brasil',
    goalsData: {
      [ocupationModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        }
      ],
      [entranceAndExitModel.name]: [
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          operation: constants.goals.operations.childrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Fator de Utilização - VISEIRA'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrenAverage,
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - PR',
    hierarchicalLevel: 2,
    parent: 'Região Sul',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(52.3257466447885, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(25.4762542030673, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 636,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 575,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 102,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 164,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 103,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 597,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(37.7763713080168, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(48.7572016460905, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(4.64077669902913, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(9.39669421487603, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(13.7727272727273, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(11.0980392156863, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(13.6570247933884, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.9297520661157, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(19.4938271604938, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(15.201646090535, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(98.8762376237624, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.0904522613066, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(98.3532110091743, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.1605504587156, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(96.1909090909091, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - RS',
    hierarchicalLevel: 2,
    parent: 'Região Sul',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(43.9914075723967, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(29.9544458498401, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 1261,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 426,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 199,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 460,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 333,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 3280,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(43.7829787234043, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(64.3463203463204, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(12.3318181818182, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(5.95495495495495, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.8333333333333, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(24.0225225225225, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(15.6940639269406, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(29.2217194570136, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(27.5381165919283, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(10.1351351351352, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(92.7393162393163, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.25, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(88.6652360515019, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(84.7811158798283, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(83.8940677966101, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Hospitais - SC',
    hierarchicalLevel: 2,
    parent: 'Região Sul',
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          value: math.divide(43.8992902135194, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          value: math.divide(19.0688364039362, 100),
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        },
      ],
      [entranceAndExitModel.name]: [
        {
          value: 391,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          value: 387,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          value: 84,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          value: 310,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          value: 158,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          value: 3869,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(30.2690582959641, 100),
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          value: math.divide(39.8513513513514, 100),
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(27.1394422310757, 100),
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(15.6294820717132, 100),
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(29.1673306772909, 100),
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(22.444, 100),
          indexName: 'Fator de Utilização - VISEIRA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(31.5697211155379, 100),
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(39.1071428571429, 100),
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(33.2063492063492, 100),
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(21.3690476190476, 100),
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          value: math.divide(94.284518828452, 100),
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(85.6333333333333, 100),
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(91.5767634854772, 100),
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(92.1280991735536, 100),
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          value: math.divide(90.9560975609756, 100),
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
  {
    name: 'Brasil',
    hierarchicalLevel: 1,
    goals: {},
    goalsData: {
      [ocupationModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
        },
        {
          operation: constants.goals.operations.childrensChildrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
        }
      ],
      [entranceAndExitModel.name]: [
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO  ENF - COVID-19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'INTERNAÇÃO UTI - COVID - 19'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - UTI - ALTA'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS'
        },
        {
          operation: constants.goals.operations.childrenSum,
          type: constants.goals.types.fixedValue,
          indexName: 'SAÍDA DIÁRIA - ENF - ALTAS'
        },
      ],
      [equipamentModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Taxa de ocupação dos ventiladores'
        },
        {
          operation: constants.goals.operations.childrensChildrenAverage,
          type: constants.goals.types.percentage,
          indexName: 'Taxa de ocupação dos monitores'
        }
      ],
      [epiModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - FILTRO'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - ÓCULOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - CAIXA DE LUVA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - MÁSCARA-N95'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Fator de Utilização - VISEIRA'
        },
      ],
      [teamModel.name]: [
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Ocupação do quadro - MÉDICOS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Ocupação do quadro - ENFERMEIROS'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
        },
        {
          type: constants.goals.types.percentage,
          operation: constants.goals.operations.childrensChildrenAverage,
          indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
        },
      ]
    }
  },
]

const mockOcupationGoals = (players) => {
  const statePlayerGoal = [
    {
      value: math.divide(65.9914025043578, 100),
      type: constants.goals.types.percentage,
      indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
    },
    {
      value: math.divide(54.6621030287154, 100),
      type: constants.goals.types.percentage,
      indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
    },
  ]
  const regionPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(60.9358488237952, 100),
      indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
    },
    {
      value: math.divide(49.3644114707087, 100),
      type: constants.goals.types.percentage,
      indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
    }
  ]
  const NationalPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(59.392262253922, 100),
      indexName: 'TAXA DE OCUPAÇÃO UTI - COVID'
    },
    {
      value: math.divide(49.1958927258439, 100),
      type: constants.goals.types.percentage,
      indexName: 'TAXA DE OCUPAÇÃO ENF. COVID'
    }
  ]
  return players.map(player => {
    const goals = player.hierarchicalLevel === 1 && player.parent ? regionPlayerGoal : (!player.parent ? NationalPlayerGoal : statePlayerGoal)
    player.goals[ocupationModel.name] = goals
    return player
  })
}

const mockEntranceAnExitGoals = (players) => {
  const statePlayerGoal = [
    {
      indexName: 'INTERNAÇÃO  ENF - COVID-19',
      type: constants.goals.types.fixedValue,
      value: 693,
    },
    {
      indexName: 'INTERNAÇÃO UTI - COVID - 19',
      type: constants.goals.types.fixedValue,
      value: 396,
    },
    {
      indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS',
      type: constants.goals.types.fixedValue,
      value: 159,
    },
    {
      indexName: 'SAÍDA DIÁRIA - UTI - ALTA',
      type: constants.goals.types.fixedValue,
      value: 156,
    },
    {
      indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS',
      type: constants.goals.types.fixedValue,
      value: 120,
    },
    {
      indexName: 'SAÍDA DIÁRIA - ENF - ALTAS',
      type: constants.goals.types.fixedValue,
      value: 1107,
    },
  ]
  const regionPlayerGoal = [
    {
      indexName: 'INTERNAÇÃO  ENF - COVID-19',
      type: constants.goals.types.fixedValue,
      value: 3606,
    },
    {
      indexName: 'INTERNAÇÃO UTI - COVID - 19',
      type: constants.goals.types.fixedValue,
      value: 2061,
    },
    {
      indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS',
      type: constants.goals.types.fixedValue,
      value: 825,
    },
    {
      indexName: 'SAÍDA DIÁRIA - UTI - ALTA',
      type: constants.goals.types.fixedValue,
      value: 809,
    },
    {
      indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS',
      type: constants.goals.types.fixedValue,
      value: 626,
    },
    {
      indexName: 'SAÍDA DIÁRIA - ENF - ALTAS',
      type: constants.goals.types.fixedValue,
      value: 5754,
    },
  ]
  const NationalPlayerGoal = [
    {
      indexName: 'INTERNAÇÃO  ENF - COVID-19',
      type: constants.goals.types.fixedValue,
      value: 14424,
    },
    {
      indexName: 'INTERNAÇÃO UTI - COVID - 19',
      type: constants.goals.types.fixedValue,
      value: 8242.4,
    },
    {
      indexName: 'SAÍDA DIÁRIA - UTI - ÓBITOS',
      type: constants.goals.types.fixedValue,
      value: 3300.8,
    },
    {
      indexName: 'SAÍDA DIÁRIA - UTI - ALTA',
      type: constants.goals.types.fixedValue,
      value: 3236,
    },
    {
      indexName: 'SAÍDA DIÁRIA - ENF - ÓBITOS',
      type: constants.goals.types.fixedValue,
      value: 2503.2,
    },
    {
      indexName: 'SAÍDA DIÁRIA - ENF - ALTAS',
      type: constants.goals.types.fixedValue,
      value: 23017.6,
    },
  ]
  return players.map(player => {
    const goals = player.hierarchicalLevel === 1 && player.parent ? regionPlayerGoal : (!player.parent ? NationalPlayerGoal : statePlayerGoal)
    player.goals[entranceAndExitModel.name] = goals
    return player
  })
}

const mockEquipamentGoals = (players) => {
  const statePlayerGoal = [
    {
      value: math.divide(51.5987037134445, 100),
      type: constants.goals.types.percentage,
      indexName: 'Taxa de ocupação dos ventiladores'
    },
    {
      value: math.divide(59.8042811572003, 100),
      type: constants.goals.types.percentage,
      indexName: 'Taxa de ocupação dos monitores'
    },
  ]
  const regionPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(48.9320233707305, 100),
      indexName: 'Taxa de ocupação dos ventiladores'
    },
    {
      value: math.divide(57.6935237337229, 100),
      type: constants.goals.types.percentage,
      indexName: 'Taxa de ocupação dos monitores'
    }
  ]
  const NationalPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(46.4388333421, 100),
      indexName: 'Taxa de ocupação dos ventiladores'
    },
    {
      value: math.divide(53.8238530414803, 100),
      type: constants.goals.types.percentage,
      indexName: 'Taxa de ocupação dos monitores'
    }
  ]
  return players.map(player => {
    const goals = player.hierarchicalLevel === 1 && player.parent ? regionPlayerGoal : (!player.parent ? NationalPlayerGoal : statePlayerGoal)
    player.goals[equipamentModel.name] = goals
    return player
  })
}

const mockEpiGoals = (players) => {
  const statePlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(18.1557401381567, 100),
      indexName: 'Fator de Utilização - FILTRO'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(21.6352642229252, 100),
      indexName: 'Fator de Utilização - ÓCULOS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(34.4799190650275, 100),
      indexName: 'Fator de Utilização - CAIXA DE LUVA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(22.7099240931071, 100),
      indexName: 'Fator de Utilização - VISEIRA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(26.6741047437598, 100),
      indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(38.6801682559281, 100),
      indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(37.1101907162941, 100),
      indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(28.5862801843898, 100),
      indexName: 'Fator de Utilização - MÁSCARA-N95'
    },
  ]
  const regionPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(17.6480666138166, 100),
      indexName: 'Fator de Utilização - FILTRO'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(20.2425445545101, 100),
      indexName: 'Fator de Utilização - ÓCULOS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(34.018948380207, 100),
      indexName: 'Fator de Utilização - CAIXA DE LUVA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(22.1836809549615, 100),
      indexName: 'Fator de Utilização - VISEIRA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(25.5188312693466, 100),
      indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(36.2894144020111, 100),
      indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(33.9979890161391, 100),
      indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(25.1927623360536, 100),
      indexName: 'Fator de Utilização - MÁSCARA-N95'
    },
  ]
  const NationalPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(16.340166124341, 100),
      indexName: 'Fator de Utilização - FILTRO'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(19.4717378006327, 100),
      indexName: 'Fator de Utilização - ÓCULOS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(31.0319271585248, 100),
      indexName: 'Fator de Utilização - CAIXA DE LUVA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(20.4389316837964, 100),
      indexName: 'Fator de Utilização - VISEIRA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(24.0066942693838, 100),
      indexName: 'Fator de Utilização - CIRCUITO DE ASPIRAÇÃO FECHADO (stericath)'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(34.8121514303353, 100),
      indexName: 'Fator de Utilização - AVENTAL/CAPOTE'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(33.3991716446647, 100),
      indexName: 'Fator de Utilização - MÁSCARA CIRÚRGICA'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(25.7276521659508, 100),
      indexName: 'Fator de Utilização - MÁSCARA-N95'
    },
  ]
  return players.map(player => {
    const goals = player.hierarchicalLevel === 1 && player.parent ? regionPlayerGoal : (!player.parent ? NationalPlayerGoal : statePlayerGoal)
    player.goals[epiModel.name] = goals
    return player
  })
}

const mockTeamGoals = (players) => {
  const statePlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(86.1574688410147, 100),
      indexName: 'Ocupação do quadro - MÉDICOS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(81.5471602520197, 100),
      indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(86.8542021657354, 100),
      indexName: 'Ocupação do quadro - ENFERMEIROS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(82.4088006426977, 100),
      indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(88.8310382253364, 100),
      indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
    },
  ]
  const regionPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(88.3509146006043, 100),
      indexName: 'Ocupação do quadro - MÉDICOS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(82.5248274510037, 100),
      indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(88.1314573424578, 100),
      indexName: 'Ocupação do quadro - ENFERMEIROS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(84.2730403247481, 100),
      indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(89.6499261164229, 100),
      indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
    },
  ]
  const NationalPlayerGoal = [
    {
      type: constants.goals.types.percentage,
      value: math.divide(77.5417219569132, 100),
      indexName: 'Ocupação do quadro - MÉDICOS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(73.3924442268177, 100),
      indexName: 'Ocupação do quadro - FISIOTERAPEUTAS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(78.1687819491619, 100),
      indexName: 'Ocupação do quadro - ENFERMEIROS'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(74.1679205784279, 100),
      indexName: 'Ocupação do quadro - TEC. ENFERMAGEM'
    },
    {
      type: constants.goals.types.percentage,
      value: math.divide(79.9479344028028, 100),
      indexName: 'Ocupação do quadro - HIGIENIZAÇÃO'
    },
  ]
  return players.map(player => {
    const goals = player.hierarchicalLevel === 1 && player.parent ? regionPlayerGoal : (!player.parent ? NationalPlayerGoal : statePlayerGoal)
    player.goals[teamModel.name] = goals
    return player
  })
}

const mockIncludeInRank = (players) => players.map(player => ({...player, includeInRank: player.name !== 'Brasil'}))

mockEntranceAnExitGoals(players)
mockEpiGoals(players)
mockOcupationGoals(players)
mockEquipamentGoals(players)
mockTeamGoals(players)

// calculateIntegratedModel([ocupationModel, entranceAndExitModel, equipamentModel, epiModel, teamModel], mockIncludeInRank(players))

const ocupationModelPlayers = getModelPlayers(ocupationModel.name, players)
// const ocupationModelPlanningPlayers = doPlanning(ocupationModel, ocupationModelPlayers)

// const planningCsvData = ocupationModelPlanningPlayers.map(player => {
//   const ocupationModelPlanning = player.planning[ocupationModel.name]
//   const planning = ocupationModel.indexes.reduce((planning, {name}) => {
//     const dayPlanning = ocupationModelPlanning.day[name]
//     const weekPlanning = ocupationModelPlanning.week[name]
//     planning[`day - ${name}`] = `${dayPlanning * 100}%`
//     planning[`week - ${name}`] = `${weekPlanning * 100}%`
//     return planning
//   }, {})
//   return {player: player.name, ...planning}
// })

// const csv = new ObjectsToCsv(planningCsvData)
// csv.toDisk('ocupation-planning.csv')

console.log(epiModel)

const epiModelPlayers = getModelPlayers(epiModel.name, players)

simulate({...epiModel, players: epiModelPlayers}, constants.simulateTypes.day, )

// {['Hospitais - DF']: {['Fator de Utilização - FILTRO']: math.divide(10, 100)}}