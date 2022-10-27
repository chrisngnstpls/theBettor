# The Bettor

P2P betting platform with third party validation

## How it works 

1. Create a new bet with a reason and a keymaster address. You can enter a fee that will go to the keymaster when bet is resolved, and the amount you wish to lock inside your bet.
2. Second party accepts the bet and the bet is now active.
3. For 5 blocks after bet has been accepted by second party, there's a grace period where the bet can be canceled and all parties get back the amount they have entered.
4. Only key master can resolve the bet (either by sending the initiator's or acceptor's address to the contract)
5. Winning party gets the bet amount minus the keymaster fee. 


## Installation

```
Navigate to the /client folder and run 'npm install'
Make sure to edit the truffle-config.js file under /truffle folder and enter your network details.
Right now this runs on local Ganache chain, but works fine under testnets (you need to deploy)
```

## Notes

This is pre-aplha version and will be frequently updated


