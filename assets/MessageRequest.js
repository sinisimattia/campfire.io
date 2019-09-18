const Message = require("./Message");

module.exports = class MessageRequest extends Message{
    /**
     * A request displayed for a given amount of time
     * @param {string} content 
     * @param {User} from
     * @param {number} expiration
     */
    constructor(content, from, expiration){
        super(content, from);
        this.expiration = expiration;
    }
}