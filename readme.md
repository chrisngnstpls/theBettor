# Solidity with React Boilerplate
![logo](https://i.imgur.com/AXGl9Z3.jpg)
Features:
- Compiles the contract
- Deploys the contract to ethereum network
- Tests the contract

# File info
| Directory/file        | Description                                                                                                                                                                                                                                                                                                         |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ethereum/compile.js   | Compiles the smart contract and output it to a json file for easier access later.                                                                                                                                                                                                                                   |
| ethereum/web3.js      | An already instantiated Web3 instance that has sane checking if `window` is accessible. This is useful when you're trying to develop the app in nextjs or something similar.                                                                                                                                        |
| ethereum/deploy.js    | Deploys the contract to the Ethereum network. Requires `compile.js` to run first so it can access the compiled contract. You need to change the mnemonic to the one that is tied to your own account and your own Infura endpoint either on Rinkeby or Mainnet. Just create a '.env' file and put everything there. |
| ethereum/contract.js  | Used for easier interaction with your own contract. You can rename it based on the name of your own contract.                                                                                                                                                                                                       |
| ethereum/contracts    | Directory of your own smart contracts                                                                                                                                                                                                                                                                               |
| ethereum/build        | Generated **after** you run `compile.js`                                                                                                                                                                                                                                                                            |
| test/Contract.test.js | A generic test file for your smart contract. Uses `mocha`.                                                                                                                                                                                                                                                          |
| src                   | Directory of ui-related files                                                                                                                                                                                                                                                                                       |


# Scripts
| Script         | Description                                                                         |
|----------------|-------------------------------------------------------------------------------------|
| test           | Runs `contract-build` to compile the contract **and then** runs `mocha` for testing |
| start          | (Generic CRA script) Starts the frontend app                                        |
| contract-build | Runs `ethereum/compile.js` to compile to contract                                   |
| react-build    | (Generic CRA script) Builds the react app                                           |
| react-test     | (Generic CRA script) Runs react test                                                |
| react-eject    | (Generic CRA script) Ejects react app                                               |


<br/>

# Important notes / FAQ
### > Metamask isn't showing when I'm trying to transact!
Most cases you need to add `window.ethereum.enable()` before trying to
execute methods from your contract. So, you'll have it like this:
```
...

import Contract from '../ethereum/contract';


try {

    window.ethereum.enable()    // you'll add this
    await contract.methods.setMessage().send({
                from: accounts[0],
                value: "A New Message! Bonjour!",
            });
}
```
Although, I already defined it in `web3.js` file. If you still encountered this issue, let me know.

### > Will you keep adding more?
If possible, yes. I would like to add things like:
- Boilerplate for calling the methods of the contract in React ('cause right now it's just plain reactjs)
- Handler of multiple contracts
- Boilerplate in other frameworks like NextJS or GatsbyJS
- Easy `npx` script that creates the dir

Any requests? Message me and I'll try my best to provide it or better, create a pull request!
