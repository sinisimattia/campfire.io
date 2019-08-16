/**
 * The client script for interfacing yourself with the chat server.
 */
    $(()=>{
        var socket = io();
        var box = $("#message");
        var feed = $("#feed");
        var requests = $("#requests");
        var company = $("#company");
        var userCount = $("#userCount");
        var me;
        var usersConnected;
        var windowFocus = true;

        window.onfocus = () => { windowFocus = true; }
        window.onblur = () => { windowFocus = false; }

        Push.config({ serviceWorker: '//serviceWorker.min.js'});

        $("#msgbox").submit(()=>{
            if ( box.val().trim() !== "" ){
                if ( box.val().substring( 0, "#request".length ).toLowerCase() === "#request" ){
                    socket.emit("message_request", {
                        content: $.trim(box.val().replace("#request", "")),
                        from: me
                    });
                } else {
                    socket.emit("message", {
                        // new Message();
                        content: $.trim(box.val()),
                        from: me
                    });
                }                
            }
            box.val("");
            return false;
        });

        socket.on("echo", (msg) => {
            var previous = feed.children()[ feed.children().length - 1 ];
            if ( previous != undefined && previous.getAttribute("userid") == msg.from.id )
                $(previous).children(".msg-content").append(`<br>${msg.content}`);
            else
                feed.append(messageView(msg));
            
            feed.parent().animate({scrollTop: feed.height() + 30});

            if ( !windowFocus ) Push.create(`${msg.from.username} in ${msg.from.room}`, {
                body: msg.content,
                icon: "/resources/img/campfire.io.png",
                onClick: () => {
                    window.focus();
                    this.close();
                }
            });
        });

        socket.on("echo_request", (msg) => {
            feed.parent().animate({scrollTop: feed.height() + 30});

            requests.append(requestView(msg));

            if ( !windowFocus ) Push.create(`${msg.from.username} in ${msg.from.room}`, {
                body: msg.content,
                icon: "/resources/img/campfire.io.png",
                onClick: () => {
                    window.focus();
                    this.close();
                }
            });
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

        socket.on("newUser", (users, requests) => {
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
        $(userCount).html(users.length || "gruppo");

        $(company).html(usersToList(users)); // replace with .append()
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

    const userInList = (user) => `<li class="pure-menu-item" title="${user.username}#${user.id}"><a class="pure-menu-link">${user.username}</li></a>`;

    const warningView = (msg) => `<li><a>[!] Important comunication from the server: ${msg}</li></a>`;

    const requestView = (request) => `<li class="padding dark rounded request">
    <span class="username rounded padding wide block">${ request.from.username }</span>
    <p class="content">${ request.content }</p>
</li>`