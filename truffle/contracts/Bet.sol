// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
// pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Holy sh* 
contract Bet {

    using SafeMath for uint;
    uint256 public blockNumber;
    address public initiator;
    address public acceptor;
    address public factory;
    uint public amount;
    string public reason;
    address private keyMaster;
    uint private initiatorCanceled;
    uint private acceptorCanceled;
    uint256 public fee;
    uint public lowestFee;
    uint public highestFee;
    enum BetStatus{ INITIATED, RUNNING, RESOLVED }
    BetStatus status;
    
    constructor(address _initiator, string memory _reason, address _keyMaster, address _parent, uint256 _fee) payable public {
        initiator = _initiator;
        amount = msg.value;
        reason = _reason;
        status = BetStatus.INITIATED;
        keyMaster = _keyMaster;
        initiatorCanceled = 0;
        acceptorCanceled = 0;
        blockNumber = 0;
        factory = _parent;
        fee = _fee;
        lowestFee = 1;
        highestFee = 99;
    }



    modifier differenceOk {
        require(block.number - 5 < blockNumber, "Insufficient block difference, please wait.");
        _;
    }

    modifier feeOk {
        require(fee <= highestFee && fee >= lowestFee, "Error processing keymaster fees");
        _;
    }

    modifier onlyOwner {
        require(msg.sender == initiator ,"Only owner can call this.");
        _;
    }

    modifier onlyKeymaster {
        require(msg.sender == keyMaster, "Only the keymaster can call this.");
        _;
    }

    // Both parties need to aggree to revert the bet and there's a 5 block time window from initiation of the contract

    function agreedCancel() public differenceOk returns(string memory) {
                
        require((msg.sender == initiator || msg.sender == acceptor) && acceptor != address(0x0000000000000000000000000000000000000000));
        
        address payable _initiator = payable(initiator);
        address payable _acceptor = payable(acceptor);
        
        if(initiatorCanceled == 1 && msg.sender == acceptor){
            
            acceptorCanceled = 1;
            _initiator.transfer(address(this).balance / 2);
            _acceptor.transfer(address(this).balance);
           
            status = BetStatus.RESOLVED;

            return ('Final vote by accepting party. Bet resolved');
        }else if(acceptorCanceled == 1 && msg.sender == initiator){
            
            initiatorCanceled = 1;
            _initiator.transfer(address(this).balance / 2);
            _acceptor.transfer(address(this).balance);
            status = BetStatus.RESOLVED;

            return ('Final vote by initiating party. Bet resolved');

        }else if(initiatorCanceled == 0 && acceptorCanceled == 0){
            
            if(msg.sender == initiator){
                initiatorCanceled = 1;
            } else if(msg.sender == acceptor){
                acceptorCanceled = 1;
            }
        }
    }

    function revertBet() public {
        
        require(msg.sender == initiator);
        if(status == BetStatus.INITIATED){
            address payable _initiator = payable(initiator);
            _initiator.transfer(address(this).balance);
            status = BetStatus.RESOLVED;
        } else {
            revert();
        }

    }

    function acceptBet() payable public {
        require(msg.sender != keyMaster);

        if(msg.sender != initiator && msg.value == address(this).balance / 2 && status == BetStatus.INITIATED){
            blockNumber = block.number;
            acceptor = msg.sender;
            status = BetStatus.RUNNING;
        } else {
            revert();
        }
    }
    
    // only keyMaster account can resolve bet winners

    function resolveBet(address payable _winner) public onlyKeymaster feeOk {
        
        require(address(this).balance > 0 && status == BetStatus.RUNNING);
        require(_winner == initiator || _winner == acceptor);
        
        uint256 keyMasterFee = (address(this).balance * fee / 1000);

        address payable _keyMasterAddressPayable = payable(keyMaster);
        
        if(_winner == initiator || _winner == acceptor){
            status = BetStatus.RESOLVED;
            _winner.transfer(address(this).balance - keyMasterFee);
            _keyMasterAddressPayable.transfer(address(this).balance);
        }
        
    }


    function getBalance() public view returns(uint){
        return address(this).balance;
    }
    function getInitiator() public view returns(address){
        return initiator;
    }

    function getBetStatus() public view returns (BetStatus){
        return status;
    }



}
