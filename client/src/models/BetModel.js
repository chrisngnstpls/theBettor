class BetModel {
    constructor (_id, _location, _initiator, _balance, _reason, _status){
        this.id = _id
        this.location = _location
        this.initiator = _initiator
        this.balance = _balance
        this.reason = _reason
        this.status = _status
    }
}

module.exports = BetModel;