//TODO: Implement day/night cycle

/**
 * Modules
 */
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const consolidate = require("consolidate");
const User = require("./assets/User");
const html = require("html-escaper");

/**
 * Configuration
 */
const config = require("./config.json");

/**
 * Important variables
 */
var users = [];
var messageRequests = [];

// Set folders for static files · refer to string in first argument to access folder specified in second argument
app.use("/css", express.static(config.views.folder + "/css"));
app.use("/img", express.static(config.views.folder + "/img"));
app.use("/fonts", express.static(config.views.folder + "/fonts"));

app.use("/scripts", express.static(config.scripts.folder));
app.use("/scripts", express.static(config.scripts.assets));
app.use("/scripts", express.static(config.scripts.modules + "/socket.io-client/dist"));
app.use("/scripts", express.static(config.scripts.modules + "/push.js/bin/"));

/**
 * Handling request data
 */
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("/views", __dirname + "/" + config.views.folder);
app.engine("html", consolidate.swig);
app.set("view engine", "html");

/**
 * Pages
 */
app.post("/chat", (req, res) => {
    res.render(config.views.pages.chat, {
        username: html.escape(req.body.username || config.default.username),
        room: html.escape(req.body.custom_room || req.body.room || config.default.room),
        background: config.views.prefs.background.list.chat,
        usersConnected: users.length,
        messageRequests: messageRequests
    });
});

app.get("/chat", (req, res) => {
    res.redirect("/");
});

app.get("/", (req, res) => {
    res.render("welcome.html", {
        usersConnected: users.length,
        background: config.views.prefs.background.list.frontpage,
        rooms: config.rooms,
        def: config.default,
        ver: config.info.version
    });
});

/**
 * APIs
 */
/*app.get("/api/getusers", (req, res) => {
    res.setHeader("Content-type", "application/json");
    res.send(JSON.stringify(users));
});*/

/**
 * Socket.io
 */
io.on("connection", (socket) => {
    var currentUser = new User("Anon", socket.id, );
    socket.send(currentUser);
    users.push(currentUser);

    socket.on("disconnect", () => {
        var wholeft = users.filter((user)=> {
            return user.id == socket.id;
        })[0];

        users.filter(({id}, index) => {
            if (socket.id === id) {
                users.splice(index, 1);
            }
        });

        io.to(wholeft.details.room).emit("bye", {
            list: users.filter((user)=> {
                return user.details.room === wholeft.details.room;
            }),
            wholeft: wholeft
        });

        socket.leave(wholeft.details.room);
    });

    socket.on("typing", (who) => {
        socket.to(who.room).emit("typing", who);
    });

    socket.on("message", (msg) => {
        if (msg.content != ""){
            msg.content = html.escape(msg.content);
            io.to(msg.from.room).emit("echo", msg);
        }        
    });

    socket.on("message_request", (msg) => {
        if (msg.content != ""){
            msg.content = html.escape(msg.content);
            io.to(msg.from.room).emit("echo_request", msg);
            messageRequests.push(msg);
        }        
    });

    socket.on("updateUser", ({username, room}) => {
        users.filter(({id}, index) => {
            if (socket.id === id){
                users[index].username = html.escape(username);
                users[index].details.room = html.escape(room);
            }
        });

        socket.join(room);

        io.to(room).emit("newUser", users.filter((user)=> {
            return user.details.room === room;
        }));
    });
});

/**
 * Server
 */
http.listen(process.env.PORT || config.port, () => {
    console.log(`Listening to specified port: (${process.env.PORT || config.port})`);
});

/**
 * FUTURE PLANS
 * ··················
 * Make this activate every hour
 * Every request has a time of publishing ( just hours )
 * every hour every number in the array gets 1 subtracted to it
 * if 0 then remove;
 */

setInterval(() => {
    messageRequests = [];
}, config.cleanTimeout);