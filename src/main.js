function connect() {
        PlayerIO.authenticate('cup-pong-blolf5amkovdn4okt5icg', "public", {userId: "alpha" }, {}, function (client) {
            client.multiplayer.createJoinRoom("roomid", "lobby", true, null, { name: "alpha" }, function (connection) {
                var doc = document.getElementById('connectText');
                doc.innerHTML = '<p>Connected!</p>';
                connection.addMessageCallbacck("*", function (message) {
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