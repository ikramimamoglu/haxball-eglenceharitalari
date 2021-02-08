let yourNickname = "ikramimamoglu";
let room = HBInit({
  roomName: "Eglence haritalari > " + yourNickname,
  noPlayer: true,
  maxPlayers: 16,
});
let randompass = null;
let teams = {
  blue: 2,
  red: 1,
  spectators: 0,
};
let mention = (name) => {
  return name.replace(" ", "_");
};
function JSONtoStr(...args) {
  let res = [];
  for (let arg in args) {
    if (typeof arg != "object") continue;
    res.push(arg);
  }
  return res;
}
function strtoJSON(...args) {
  let res = [];
  for (const arg in args) {
    if (typeof arg != "string") return;
    res.push(arg);
  }
  return res;
}
function setPlayerTeam(pID, tID) {
  room.setPlayerTeam(pID, tID);
}
window.playerdata = new Map();
function _onPlayerJoin(p) {
  let auth = p.auth,
    id = p.id,
    conn = p.conn,
    name = p.name;
  function decryptHex(str) {
    let hexString = str;
    let strOut = "";
    for (let x = 0; x < hexString.length; x += 2) {
      strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
    }
    return strOut;
  }
  function addPlayerData() {
    let playerData = {
      IPv4Addr: decryptHex(conn),
      id: String(id),
      name: String(name),
      auth: String(auth),
    };
    playerdata.set(id, playerData);
  }
  function welcomeMsg() {
    return room.sendAnnouncement(`${name},hos geldin`);
  }
  setPlayerTeam(id, teams.red);
  addPlayerData();
  welcomeMsg();
}
function _onPlayerChat(p, m) {
  let admin = p.admin,
    id = p.id,
    name = p.name;
  function setPassword() {
    if (!admin)
      return room.sendAnnouncement(
        "Bu komutu kullanabilmeniz icin admin olmaniz gerekmektedir! " +
          "@" +
          mention(name),
        id
      );
    if (randompass == null) {
      randompass = String(Math.floor(Math.random() * 10000));
      room.setPassword(randompass);
      room.sendAnnouncement("Odanin sifresi degistirildi", null);
    } else {
      randompass = null;
      room.setPassword(randompass);
      room.sendAnnouncement("Odanin sifresi sifirlandi!", null);
    }
  }
  function Pass() {
    if (!admin)
      return "Bu komutu kullanabilmeniz icin admin olmaniz gerekmektedir.";
    return randompass == null
      ? "Odanin sifresi yok!"
      : "Odanin sifresi: " + randompass;
  }
  if (m == "!pass" || m.startsWith("!pass")) {
    setPassword();
  }
  if (m == "?pass" || m.startsWith("?pass")) {
    room.sendAnnouncement(Pass(), id);
  }
}
room.onPlayerJoin = _onPlayerJoin;
room.onPlayerChat = _onPlayerChat;
