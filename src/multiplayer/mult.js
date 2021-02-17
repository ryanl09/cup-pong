let findingMatch = false;

function generateGuestName() {
    let guest = "guest";
    guest += (Math.random() * (999 - 100) + 100);
    return guest;
}

function connect() {
    let u = document.getElementById("usernametextbox").value;
    let p = document.getElementById("passwordtextbox").value;
    let info = {
        userId: u,
        username: u,
        password: p
    };
    global.u = u;
    global.p = p;
    global.userid = "simple" + u;
    global.cuid = global.userid;
    if (!u || !p) {
        game.isGuest = true;
        info = {
            userId: generateGuestName()
        };
    }
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', (game.isGuest ? "guest" : "public"), info, {}, function (client) {
        global.cli = client;
        global.cli.multiplayer.createJoinRoom("lobbyroom", "lobby", true, null, { name: client.connectUserId }, function (connection) {
            global.con = connection;
            console.log("Connected");
            document.getElementById('connectText').innerHTML = '<p>Connected!</p>';
            global.con.addMessageCallback("*", function (message) {
                switch (message.type) {
                    case "join":
                        //alert(`${message.getString(0)} joined`);
                        break;
                    case "system":
                        let mes = message.getString(0);
                        //alert(mes);
                        break;
                    case 'findmatch':
                        if (global.userid === message.getString(1) || global.userid === message.getString(2)) {
                            global.myturn = (global.userid === message.getString(1));
                            game.inMatch = true;
                            findingMatch = false;
                            remove('matchbutton');
                            connectToGame(message.getString(0));
                            initCups(10);
                            renderCups(10);
                            setup();
                            //disconnect();
                            //connectToGame(message.getString(0));
                        }
                        break;
                    case "banned":

                        break;
                }
            });
        });
    canvasLobby();
    }, function (error) {
        alert(`Error: ${error}`);
    });
}

function connectToGame(roomId) {
    let info = {
        userId: global.u,
        username: global.u,
        password: global.p
    }
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', "public", info, {}, function (client) {
        global.cli = client;
        global.cli.multiplayer.createJoinRoom(roomId, "cuppong", true, null, { name: client.connectUserId }, function (connection) {
            global.con = connection;
            global.con.addMessageCallback("*", function (message) {
                switch (message.type) {
                    case "join":
                        //global.isSpectator = message.getBoolean(0);
                        if (message.getString(0) === client.connectUserId) {
                            global.myturn = true;
                        } else {
                            global.myturn = false;
                        }
                        //alert(`got join, m0= ${message.getString(0)} uid= ${client.connectUserId}, turn=${global.myturn}`);
                        break;
                    case "system":
                        let mes = message.getString(0);
                        //alert(mes);
                        break;
                    case "pause":

                        break;
                    case "cup":
                        alert(`${message.getString(0)}`);
                        if (message.getString(0) !== global.userid) {
                            opcups[(global.cupCount-1) - message.getInt(1)].hit = true;
                        }
                        break;
                    case "turn":
                        if (global.userid !== message.getString(0)) {
                            global.myturn = message.getBoolean(1);
                        }
                        //alert(`got join, m0= ${message.getString(0)} uid= ${client.connectUserId}, turn=${global.myturn}, cond=${message.getString(0) === global.cli.connectUserId}`);
                        break;
                    case "gameover":
                        var won = message.getString(0) === global.userid;
                        global.con.send("stats", global.shots, global.hit);
                        global.shots = 0;
                        global.hits = 0;
                        global.con.disconnect();
                        canvasLobbyAltered();
                        alert(won ? `You won!` : `You lost :(`);
                        global.inMatch = false;
                        break;
                }
            });
        });
        //document.removeChild('signinbutton');
    }, function (error) {
        alert(`Error: ${error}`);
    });
}

function disconnect() {
    global.con.disconnect();
    global.con = null;
    document.getElementById('connectText').innerHTML = '<p>Not connected</p>';
    document.getElementById('flatbutton').innerHTML = '<button class="w3-button w3-black" onclick="connectToLobby()">Connect!</button>';
}

function matchmakingQueue() {
    if (!findingMatch && !global.inMatch) {
        findingMatch = true;
        global.con.send('findmatch');
    }
}

function register() {
    let u = document.getElementById("usernametextbox").value;
    let p = document.getElementById("passwordtextbox").value;
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', "public", {
        register: true,
        username: u,
        password: p,
    }, {}, function (client) {
        alert("Successfully registered! You may now sign in.");
    }, function(error) {
        alert(`Error: ${error}`);
    });
}

function canvasLobby() {
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.drawImage(images.table, 0, 0, 800, 800);
    remove('signinbutton');
    remove('registerbutton');
    remove('usernametextbox');
    remove('passwordtextbox');
    remove('usernamelabel');
    remove('passwordlabel');
    var matchbutton = document.createElement("div");
    matchbutton.innerHTML = '<button id="matchbutton" class="w3-button w3-black" onclick="matchmakingQueue()">Find match</button>';
    document.body.appendChild(matchbutton);

}

function canvasLobbyAltered() {
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.drawImage(images.table, 0, 0, 800, 800);
    var matchbutton = document.createElement("div");
    matchbutton.innerHTML = '<button id="matchbutton" class="w3-button w3-black" onclick="matchmakingQueue()">Find match</button>';
    document.body.appendChild(matchbutton);

}

function remove(id) {
    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
}
