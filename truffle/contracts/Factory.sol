// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./Bet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BetFactory {
    using Counters for Counters.Counter;
    Counters.Counter private _betId;
    
    constructor() public payable {}

    struct UserBet {
        uint betIndex;
        address initiator;
        address location;
    }
    mapping(uint => UserBet) public _betIdToDetails;

    UserBet[] public _userBets;
    //This makes it all

    
    function createBet(string memory _name, address _keyMaster, uint256 _fee) public payable {
        require(msg.sender != _keyMaster);
        
        if(msg.value !=0){

            Bet bet = new Bet{value:msg.value}(msg.sender, _name, _keyMaster, address(this), _fee);
            _betId.increment();
            uint256 newBetId = _betId.current();
            

            UserBet memory newUserBet = UserBet({
                betIndex : newBetId,
                initiator : msg.sender,
                location : address(bet)

            });
            // Bet bet = new Bet(msg.sender, _name, _status );
            _betIdToDetails[newBetId] = newUserBet;
            _userBets.push(newUserBet);

        } else {
            revert();
        }
        

    }
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function allBets() public view returns(UserBet[] memory) {
        return _userBets;
    }

}