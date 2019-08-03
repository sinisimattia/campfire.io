module.exports = class User {
    constructor(username, id, details){
        this.username = username;
        this.id = id;
        details != undefined ? this.details = details : this.details = {};
    }

    toString(){
        return `${this.username}[${this.id}]`;
    }
}