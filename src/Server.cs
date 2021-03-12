using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PlayerIO.GameLibrary;

namespace Cup_Pong_Server
{
    public class Player : BasePlayer
    {
        private string name;
        private bool spectator;
        private bool admin;
        private bool online;

        public string Name
        {
            get
            {
                return name;
            }
            set
            {
                name = value;
            }
        }

        public bool isSpectator
        {
            get
            {
                return spectator;
            }
            set
            {
                spectator = value;
            }
        }

        public bool isAdmin
        {
            get
            {
                return admin;
            }
            set
            {
                admin = value;
            }
        }

        public bool isOnline
        {
            get
            {
                return online;
            }
            set
            {
                online = value;
            }
        }
    }

    [RoomType("lobby")]
    public class LobbyCode : Game<Player>
    {
        List<Player> users = new List<Player>();
        List<string> onlineRoomIds = new List<string>();

        string roomId = "";
        const int ROOMID_LENGTH = 5;
        Random rand = new Random();
        int firstPlayer = -1;

        public override void UserJoined(Player pl)
        {
            pl.isOnline = true;
            bool banned = false;// pl.PlayerObject.GetBool("isBanned");
            if (banned)
            {
                Broadcast("banned", "You are banned!");
                pl.Disconnect();
            } 
            else
            {
                Broadcast("system", "Welcome!");
                users.Add(pl);
            }
            Broadcast("join", pl.ConnectUserId);
        }

        public override void UserLeft(Player pl)
        {
            pl.isOnline = false;
            users.Remove(pl);
            
        }

        public override void GotMessage(Player pl, Message m)
        {
            switch (m.Type)
            {
                case "init":
                    if (!pl.PlayerObject.ExistsInDatabase)
                    {
                        pl.PlayerObject.Save();
                    }
                    if (!m.GetBoolean(0))
                    {
                        if (!pl.PlayerObject.Contains("totalCupsHit"))
                        {
                            pl.PlayerObject.Set("totalCupsHit", 0);
                            pl.PlayerObject.Set("totalShotsTaken", 0);
                            pl.PlayerObject.Save();
                        }
                    }
                    break;
                case "chat":
                    Broadcast("chat", pl.ConnectUserId, m.GetString(0));
                    break;
                case "dm":
                    foreach (Player user in Players)
                    {
                        if (user.ConnectUserId == "simple" + m.GetString(0))
                        {
                            user.Send("dm", pl.ConnectUserId, m.GetString(1));
                        }
                    }
                    break;
                case "findmatch":
                    if (firstPlayer == -1) { firstPlayer = users.IndexOf(pl); }
                    if (users.Count >= 2 && firstPlayer != users.IndexOf(pl))
                    {
                        roomId = generateRoomId();
                        Broadcast("findmatch", roomId, users[firstPlayer].ConnectUserId, pl.ConnectUserId);
                        users.Remove(users[firstPlayer]);
                        users.Remove(pl);
                        firstPlayer = -1;
                    }
                    break;
                case "invite":
                    foreach (Player inviteuser in Players)
                    {
                        if (inviteuser.ConnectUserId == "simple" + m.GetString(0))
                        {
                            inviteuser.Send("invite", pl.ConnectUserId);
                        }
                    }
                    break;
                case "respondinvite":
                    Player p1 = null;
                    Player p2 = null;
                    if (m.GetBoolean(2))
                    {
                        string privateRoomId = generateRoomId();
                        foreach (Player invaccepted in Players)
                        {
                            if (invaccepted.ConnectUserId == m.GetString(0) && p1 == null)
                            {
                                p1 = invaccepted;
                            }
                            if (invaccepted.ConnectUserId == "simple" + m.GetString(1) && p2 == null)
                            {
                                p2 = invaccepted;
                            }
                        }
                        if (p1 != null && p2 != null)
                        {
                            p1.Send("findmatch", privateRoomId, p1.ConnectUserId, p2.ConnectUserId);
                            p2.Send("findmatch", privateRoomId, p1.ConnectUserId, p2.ConnectUserId);
                            users.Remove(p1);
                            users.Remove(p2);
                        } 
                        else
                        {
                            if (p1 != null)
                            {
                                p1.Send("system", "Unknown error. Please make sure the other user is online.");
                            }
                            if (p2 != null)
                            {
                                p2.Send("system", "Unknown error. Please make sure the other user is online.");
                            }
                        }
                    }
                    else
                    {
                        foreach (Player invreject in Players)
                        {
                            if (invreject.ConnectUserId == "simple" + m.GetString(1))
                            {
                                invreject.Send("system", m.GetString(0).Substring(6) + " rejected your invite.");
                            }
                        }
                    }
                    break;
                case "addfriend":
                    break;
                case "removefriend":

                    break;
            }
        }

        public string generateRoomId()
        {
            string str = "";
            for (int i = 0; i < ROOMID_LENGTH; i++)
            {
                str += (char)rand.Next(48, 90);
            }
            return str;
        }
    }

    [RoomType("cuppong")]

    public class GameCode : Game<Player>
    {
        private List<Player> users = new List<Player>();
        private string player1 = "";
        private string player2 = "";
        public override void UserJoined(Player player)
        {
            player.isOnline = true;
            if (player1 != "" && player2 == "")
            {
                player2 = player.ConnectUserId;
                player.isSpectator = false;
            }
            if (player1 == "")
            {
                player1 = player.ConnectUserId;
                player.isSpectator = false;
            }
            if (player1 != "" && player2 != "")
            {
                player.isSpectator = true;
            }
            //users.Add(player);
            Broadcast("join", player1, player2);
        }

        public override void UserLeft(Player player)
        {
            player.isOnline = false;
            if (!player.isSpectator)
            {
                Broadcast("pause", player.ConnectUserId);
            }
            Broadcast("left", player.ConnectUserId);
            /*
            users.Remove(player); 
            int nonSpectators = 0;
            foreach (Player p in users)
            {
                nonSpectators += Convert.ToInt32(p.isSpectator);
            }
            if (nonSpectators == 0)
            {
                Broadcast("system", "All players have left, room is closing.");
                foreach (Player p in users)
                {
                    p.Disconnect();
                }
            }*/
        }

        public override void GotMessage(Player player, Message m)
        {
            switch (m.Type)
            {
                case "init":
                    foreach (Player p in Players)
                    {
                        if (p.ConnectUserId != m.GetString(0))
                        {
                            string format = m.GetString(0).Substring(6);
                            p.Send("opponent", m.GetString(0));
                        }
                    }
                    break;
                case "cup":
                    foreach (Player user in Players)
                    {
                        if (user.ConnectUserId != m.GetString(0))
                        {
                            user.Send("cup", m.GetInt(1));
                            break;
                        }
                    }
                    break;
                case "turn":
                    foreach (Player user in Players)
                    {
                        if (user.ConnectUserId != m.GetString(0))
                        {
                            user.Send("turn", true);
                        }
                        else
                        {
                            user.Send("turn", false);
                        }
                    }
                    break;
                case "chat":
                    Broadcast("chat", player.ConnectUserId, m.GetString(0));
                    break;
                case "gameover":
                    Broadcast("gameover", m.GetString(0));
                    break;
                case "stats":
                    int shots = player.PlayerObject.GetInt("totalShotsTaken") + m.GetInt(0);
                    int hit = player.PlayerObject.GetInt("totalCupsHit") + m.GetInt(1);
                    player.PlayerObject.Set("totalShotsTaken", shots);
                    player.PlayerObject.Set("totalCupsHit", hit);
                    player.PlayerObject.Save();
                    break;
            }
        }
    }
}
