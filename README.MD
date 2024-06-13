## README

# Multi-Objective Optimization and Simulation Framework

## Overview

This project provides a comprehensive framework for multi-objective optimization and simulation of performance metrics. It includes modules for evaluating and ranking players based on multiple indexed metrics, as well as simulating performance over different time periods. This framework can be used in various domains such as healthcare, sports, and business to assess and improve performance.

## Features

- **Multi-Objective Optimization**: Evaluate and rank players based on multiple performance metrics using a combination of normalization, weighting, and Euclidean distance calculations.
- **Simulation**: Simulate player performance over different periods (day, week, month) and update scores and ranks accordingly.
- **CSV Export**: Generate and export results as CSV files for easy analysis and reporting.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/multi-objective-optimization-framework.git
   cd multi-objective-optimization-framework
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

### Main Functionality

The main functionalities are provided by the following modules:

1. **Player Score and Rank Calculation**:
   - **File**: `index.js`
   - **Function**: `calculatePlayersScoreAndRank(model)`

2. **Simulation**:
   - **File**: `simulator.js`
   - **Function**: `simulate(model, simulateType, simulateGoalsData = {})`

### Example Usage

#### Calculate Players' Scores and Ranks

```javascript
const { calculatePlayersScoreAndRank } = require('./index');

const model = {
  indexes: [
    { name: 'performance', weight: 0.4, bias: 'biggerBetter' },
    { name: 'efficiency', weight: 0.6, bias: 'smallerBetter' }
  ],
  players: [
    { name: 'player1', goals: {}, goalsData: { performance: 8, efficiency: 5 }, hierarchicalLevel: 1, includeInRank: true },
    { name: 'player2', goals: {}, goalsData: { performance: 6, efficiency: 7 }, hierarchicalLevel: 1, includeInRank: true }
  ],
  workDays: 20,
  workedDays: 5
};

const result = calculatePlayersScoreAndRank(model);
console.log(result);
```

#### Simulate Players' Performance

```javascript
const { simulate } = require('./simulator');

const model = {
  name: 'exampleModel',
  indexes: [
    { name: 'performance', weight: 0.4, bias: 'biggerBetter' },
    { name: 'efficiency', weight: 0.6, bias: 'smallerBetter' }
  ],
  players: [
    { name: 'player1', goals: {}, goalsData: { performance: 8, efficiency: 5 }, hierarchicalLevel: 1, includeInRank: true },
    { name: 'player2', goals: {}, goalsData: { performance: 6, efficiency: 7 }, hierarchicalLevel: 1, includeInRank: true }
  ],
  workDays: 20,
  workedDays: 5
};

const simulateType = 'day'; // constants.simulateTypes.day
const simulateGoalsData = {
  player1: { performance: 9, efficiency: 4 },
  player2: { performance: 7, efficiency: 6 }
};

const result = simulate(model, simulateType, simulateGoalsData);
console.log(result);
```

### Integration with COVID-19 Models

The framework includes predefined models for various performance metrics in the context of COVID-19. These models are defined in the `covidIntegratedModel.js` file.

#### Example

```javascript
const { simulate } = require('./simulator');
const { ocupationModel, entranceAndExitModel, equipamentModel, epiModel, teamModel } = require('./covidIntegratedModel');

const simulateType = 'week'; // constants.simulateTypes.week
const simulateGoalsData = {
  'Hospitais - DF': { 'TAXA DE OCUPAÇÃO UTI - COVID': 0.6, 'TAXA DE OCUPAÇÃO ENF. COVID': 0.5 },
  'Hospitais - GO': { 'TAXA DE OCUPAÇÃO UTI - COVID': 0.4, 'TAXA DE OCUPAÇÃO ENF. COVID': 0.3 }
};

const resultOcupation = simulate(ocupationModel, simulateType, simulateGoalsData);
console.log(resultOcupation);

const resultEntranceAndExit = simulate(entranceAndExitModel, simulateType, simulateGoalsData);
console.log(resultEntranceAndExit);

const resultEquipament = simulate(equipamentModel, simulateType, simulateGoalsData);
console.log(resultEquipament);

const resultEpi = simulate(epiModel, simulateType, simulateGoalsData);
console.log(resultEpi);

const resultTeam = simulate(teamModel, simulateType, simulateGoalsData);
console.log(resultTeam);
```

## Documentation

### Player Score and Rank Calculation

**File**: `index.js`

#### `calculatePlayersScoreAndRank(model)`

- **Purpose**: Orchestrates the entire scoring and ranking process.
- **Input**: A model object containing indexes and players.
- **Output**: A CSV file with the ranked results.
- **Steps**:
  1. Normalize player data.
  2. Apply weights to normalized data.
  3. Calculate distances to ideal points.
  4. Determine priority indexes.
  5. Calculate scores.
  6. Rank players.
  7. Export results to a CSV file.

### Simulation

**File**: `simulator.js`

#### `simulate(model, simulateType, simulateGoalsData = {})`

- **Purpose**: Simulates the goals data of players for a specified period (day, week, month) and calculates their scores and ranks.
- **Input**:
  - `model`: An object representing the current model, including players and indexes.
  - `simulateType`: A string indicating the type of simulation (`day`, `week`, `month`).
  - `simulateGoalsData` (optional): An object containing specific goals data to simulate.
- **Output**: An object with updated players' scores and ranks after the simulation.

## Contributing

1. **Fork the repository**
2. **Create a new branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m 'Add some feature'`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Open a pull request**

## License

This project is licensed under the MIT License.

## Contact

For any questions or issues, please contact [rondelli.vladimir@gmail.com].
