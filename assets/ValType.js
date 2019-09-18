module.exports = class ValType{
    /**
     * Create a value of a given custom type
     * @param {*} value 
     * @param {*} type 
     */
    static create(value, type){
        return {
            value: value,
            type: type
        }
    }
}