module.exports = class Message {
    /**
     * 
     * @param {string} content 
     * @param {User} from 
     */
    constructor(content, from){
        this.content = content;
        this.from = from;
    }
}