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
    if (!u || !p) {
        game.isGuest = true;
        info = {
            userId: generateGuestName()
        };
    }
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', (game.isGuest ? "guest" : "public"), info, {}, function (client) {
        global.cli = client;
        global.cli.multiplayer.createJoinRoom("lobbyroom", "lobby", true, null, { name: info.userId }, function (connection) {
            global.con = connection;
            console.log("Connected");
            document.getElementById('connectText').innerHTML = '<p>Connected!</p>';
            global.con.addMessageCallback("*", function (message) {
                switch (message.type) {
                    case "join":
                        alert(`${message.getString(0)} joined`);
                        break;
                    case "system":
                        let mes = message.getString(0);
                        break;
                    case 'findmatch':
                        alert(`${message.getString(1)} and ${message.getString(2)}`);
                        if (global.cli.connectUserId === message.getString(1) || global.cli.connectUserId === message.getString(2)) {
                            game.inMatch = true;
                            remove('matchbutton');
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
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', "public", {userId: "alpha" }, {}, function (client) {
        global.cli = client;
        global.cli.multiplayer.createJoinRoom(roomId, "game", true, null, { name: "alpha" }, function (connection) {
            global.con = connection;
            global.con.addMessageCallback("*", function (message) {
                switch (message.type) {
                    case "join":
                        global.isSpectator = message.getBoolean(0);
                        break;
                    case "system":
                        let mes = m.getString(0);
                        break;
                    case "pause":

                        break;
                }
            });
        });
        document.removeChild('signinbutton');
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
    ctx.drawImage(images.table, 0, 0, 1000, 1000);
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

function remove(id) {
    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
}
