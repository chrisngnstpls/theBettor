const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledContract = require('../ethereum/build/Contract.json');

let accounts;
let inbox;
const INITIAL_STRING = 'Hi there!';
beforeEach(async () => {
    // Get a list of all acc
    accounts = await web3.eth.getAccounts();

    // use one of those acc to deply the contract
    inbox = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
        .deploy({
            data: compiledContract.bytecode,
            arguments: [INITIAL_STRING],
        })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, INITIAL_STRING);
    });

    it('can change the message', async () => {
        await inbox.methods.setMessage('bye').send({ from: accounts[0] });
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, 'bye');
    });
});
