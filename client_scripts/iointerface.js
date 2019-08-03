/**
 * You'll need Socket.IO client and jQuery ^3.4.1 in order to execute this.
 */
$(()=>{
    var socket = io();
    var box = $("#message");
    var feed = $("#feed");
    var me;
    var usersConnected;

    $("#msgbox").submit(()=>{
        if ( box.val() !== "" ) socket.emit("message", {
            // new Message();
            content: $.trim(box.val()),
            from: me
        });
        box.val("");
        return false;
    });

    socket.on("echo", (msg) => {
        var previous = feed.children()[ feed.children().length - 1 ];
        if ( previous != undefined && previous.getAttribute("userid") == msg.from.id )
            $(previous).children(".msg-content").append(`<br>${msg.content}`);
        else
            feed.append(messageView(msg));
        
        feed.animate({scrollTop: feed.height() + 30});
    });

    socket.on("warning", (msg) => {
        feed.append(warningView(msg));
    });

    socket.on("message", (whoami) => {
        me = whoami;
        me.username = document.getElementById("io").getAttribute("username");
        me.room = document.getElementById("io").getAttribute("room");
        socket.emit("updateUser", me);
        // = new User();
    });

    socket.on("newUser", (users) => {
        usersConnected = users;
        updateCount(users);
    });

    socket.on("typing", (who) => {
        if ( who.id != me.id ) {
            $("#typing").html(`${who.username} sta scrivendo...`);
            setTimeout(() => {
                $("#typing").html("");
            }, 2000);
        }
    })

    socket.on("bye", (users) => {
        usersConnected = users.list;
        updateCount(users.list);
        feed.append(left(users));
    });

    /**
     * UI
     */
    $("#home").click(() => {
        socket.disconnect();
    });

    $("#message").keypress(() => {
        socket.emit("typing", me);
    });
});

function updateCount(users){
    $("#userCount").html(users.length || "gruppo");

    $("#company").html(usersToList(users));
}

function usersToList(users){
    var l = ``;
    $.each(users, (i) => {
        l += userInList(users[i]);
    });                
    return l;
}

/**
 * Thank you Cristian Sanchez from StackOverflow <3
 * TODO: implement in ChatUI.js as method
 */
function colorFromString(i){
    i = hashCode(i);
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

/**
 * VIEWS
 * TODO: Implement these in ChatUI.js
 */
const messageView = ({from, content}) => `<li class="flex v-margin" style="color:white" userid="${from.id}">
    <div class="flex padding rounded-left bold" style="background-color:#${colorFromString(from.id)};">
        <a class="centered block" title="${from.username}#${from.id}">${from.username}</a>
    </div>
    <div class="block dark rounded-right padding msg-content" >
        <a>${content}</a>
    </div>
</li>`;

const left = (users) => `<li class="rounded h-padding group centered-txt">
    <a class="author wide">
        <b>${users.wholeft.username}#${users.wholeft.id}</b> ha abbandonato la chat.
    </a>
</li>`;

const userInList = (user) => `<li title="${user.username}#${user.id}">${user.username}</li>`;

const warningView = (msg) => `<li><a>[!] Important comunication from the server: ${msg}</li></a>`;