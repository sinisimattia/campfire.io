var $ = require("jquery");
modules.exports = class ChatUI {
    /**
     * @author Mattia Sinisi
     * @param {string} feedID The element id of the chat feed.
     * @param {string} chatFormID The element id of the message box form.
     * @param {function} onSubmit The function to be called when the form is submitted.
     */
    constructor(feedID, chatFormID, onSubmit){
        this.feed = $(`#${feedID}`);
        this.chat = $(`#${chatFormID}`);

        $("#msgbox").submit(()=>{
            if ( box.val() !== "" ) onSubmit();
            box.val("");
            return false;
        });
    };
}