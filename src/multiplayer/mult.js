let findingMatch = false;
let haveInvite = false;
let invitedBy = "";

function generateGuestName() {
    let guest = "guest";
    guest += (Math.random() * (999 - 100) + 100);
    return guest;
}

function connect(fromGame) {

    let info = null;
    if (!fromGame) {
        let u = document.getElementById("usernametextbox").value;
        let p = document.getElementById("passwordtextbox").value;
        info = {
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
    } else {
        info = {
            userId: global.u,
            username: global.u,
            password: global.p
        };
    }
    
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', (game.isGuest ? "guest" : "public"), info, {}, function (client) {
        global.cli = client;
        global.cli.multiplayer.createJoinRoom("lobbyroom", "lobby", true, null, { name: client.connectUserId }, function (connection) {
            global.con = connection;
            console.log("Connected");
            connection.send("init", false);
            document.getElementById('connectText').innerHTML = '<p>Connected!</p>';
            global.con.addMessageCallback("*", function (message) {
                switch (message.type) {
                    case "join":
                        if (message.getString(0) != global.userid) {
                            addText("*USER " + message.getString(0).substring(6) + ' joined!');
                        }
                        break;
                    case "system":
                        addText("*SYSTEM: " + message.getString(0));
                        break;
                    case 'findmatch':
                        if (global.userid === message.getString(1) || global.userid === message.getString(2)) {
                            global.myturn = (global.userid === message.getString(1));
                            game.inMatch = true;
                            findingMatch = false;
                            remove('matchbutton');
                            //disconnect();
                            connectToGame(message.getString(0));
                            initCups(10);
                            renderCups(10);
                            setup();
                            //connectToGame(message.getString(0));
                        }
                        break;
                    case "banned":

                        break;
                    case "chat":
                        addText(message.getString(0).substring(6) + ": " + message.getString(1));
                        break;
                    case "dm":
                        addText('DM (from ' + message.getString(0).substring(6) + '): ' + message.getString(1));
                        break;
                    case "invite":
                        haveInvite = true;
                        invitedBy = message.getString(0).substring(6);
                        addText(`*USER ${invitedBy} invited you to play. \n Respond with either: /invite yes, or /invite no`);
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
        global.cli.multiplayer.createJoinRoom(roomId, "cuppong", true, null, { name: getUserid() }, function (connection) {
            global.con = connection;
            global.con.addMessageCallback("*", function (message) {
                connection.send("init", global.userid);
                clearText();
                switch (message.type) {
                    case "join":
                        //global.isSpectator = message.getBoolean(0);
                        if (message.getString(0) == getUserid()) {
                            global.myturn = true;
                        } else {
                            global.myturn = false;
                        }
                        //alert(`got join, m0= ${message.getString(0)} uid= ${client.connectUserId}, turn=${global.myturn}`);
                        break;
                    case "system":
                        addText(output.value += "*SYSTEM: " + message.getString(0));
                        break;
                    case "pause":

                        break;
                    case "cup":
                            opcups[(global.cupCount-1) - message.getInt(0)].hit = true;
                        break;
                    case "turn":
                        global.myturn = message.getBoolean(0);
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
                        game.inMatch = false;
                        connect();
                        break;
                    case "opponent":
                        //alert(`Opponent: ${message.getString(0)}`);
                        break;
                    case "chat":
                        addText(message.getString(0).substring(6) + ": " + message.getString(1));
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
    
    if (!findingMatch && !game.inMatch) {
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

function say() {
    var text = document.getElementById('chatinput').value;
    text = text.trim();
    if (text) {
        if (text.startsWith('/dm ')) {
            global.con.send("dm", text.split(' ')[1], text.split(' ')[2]);
            addText('DM (to ' + text.split(' ')[1] + '): ' + text.split(' ')[2]);
        } else if (text.startsWith('/invite ')) {
            if ((text.split(' ')[1] == 'yes' || text.split(' ')[1] == 'no') && haveInvite) {
                haveInvite = false;
                global.con.send('respondinvite', global.userid, invitedBy, text.split(' ')[1] == 'yes');
                invitedBy = false;
            } else {
                global.con.send('invite', text.split(' ')[1]);
                addText(`Invite sent to ${text.split(' ')[1]}`)
            }
        } else if (text.startsWith('/ban')) {
        
        }
        else {
            global.con.send('chat', text);
        }
        document.getElementById('chatinput').value = "";
    }
}

function addText(text) {
    document.getElementById('chatoutput').value += text + '\n';
}

function clearText() {
    document.getElementById('chatoutput').value = "";
}
