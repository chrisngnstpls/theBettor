pragma solidity ^0.4.17;

contract Contract {
    string public message;

    function Contract(string initialMessage) public {
        message = initialMessage;
    }

    function setMessage(string newMessage) public {
        message = newMessage;
    }
}
