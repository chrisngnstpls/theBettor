const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// NOTE: Change contract file/name if needed
//const contractPath = path.resolve(__dirname, 'contracts', 'Contract.sol');
const factoryPath = path.resolve(__dirname, 'contracts', 'Factory.sol');
const betPath = path.resolve(__dirname, 'contracts', 'Bet.sol');
//const source = fs.readFileSync(contractPath, 'utf8');
const factorySource = fs.readFileSync(factoryPath, 'utf8');
const betSource = fs.readFileSync(betPath, 'utf8');

// console.log(factorySource, betSource)
//const output = solc.compile(source, 1).contracts;
// const outputFactory = solc.compile(factorySource, 1).contracts;
// const outputBet = solc.compile(betSource, 1).contracts;

fs.ensureDirSync(buildPath);

// for (let contract in outputFactory) {
//     fs.outputJsonSync(
//         path.resolve(buildPath, contract.replace(':', '') + '.json'),
//         output[contract]
//     );
// }

// for (let contract in outputBet) {
//     fs.outputJsonSync(
//         path.resolve(buildPath, contract.replace(':', '') + '.json'),
//         output[contract]
//     );
// }
var inputFactory = {
    language:'Solidity',
    sources : {
        'Factory.sol' : {
            content : factorySource
        }
    },
    settings : {
        outputSelection : {
            '*' : {
                '*' : ['*']
            }
        }
    }
}

var inputBet = {
    language:'Solidity',
    sources : {
        'Bet.sol' : {
            content : betSource
        }
    },
    settings : {
        outputSelection : {
            '*' : {
                '*' : ['*']
            }
        }
    }
}
var outputFactory = JSON.parse(solc.compile(JSON.stringify(inputFactory)))
var outputBet = JSON.parse(solc.compile(JSON.stringify(inputBet)))

exports.abi = outputFactory.contracts['Factory.sol']['BetFactory'].abi;
exports.bytecode = output.contracts['Factory.sol']['BetFactory'].evm.bytecode.object;









