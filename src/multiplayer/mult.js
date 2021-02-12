function connect() {
    PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', "public", {userId: "alpha" }, {}, function (client) {
        client.multiplayer.createJoinRoom("lobbyroom", "lobby", true, null, { name: "alpha" }, function (connection) {
            global.con = connection;
            document.getElementById('connectText').innerHTML = '<p>Connected!</p>';
            document.getElementById('btnConnect').innerHTML = '<button onclick="disconnect()">Disconnect</button>';
            connection.addMessageCallback("*", function (message) {
                switch (message.type) {
                    case "init":
                        break;
                    case "system":
                        break;
                }
            });
        });
    });
}

function disconnect() {
    global.con.disconnect();
    global.con = null;
    document.getElementById('connectText').innerHTML = '<p>Not connected</p>';
    document.getElementById('btnConnect').innerHTML = '<button onclick="connect()">Connect</button>';
}