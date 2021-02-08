let yourNickname = "ikramimamoglu";
let room = HBInit({
  roomName: "Fun maps by " + yourNickname,
  noPlayer: true,
});
let teams = {
  blue: 2,
  red: 1,
  spectators: 0,
};
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
room.onPlayerJoin = _onPlayerJoin;
