/**
 * @author ikramimamoglu
 * @copyright 2021
 */
let sure = 5;
let team = 1;
let yourNickname = "ikramimamoglu";
let room = HBInit({
  roomName: "Eglence haritalari > " + yourNickname,
  noPlayer: true,
  maxPlayers: 16,
});
let {
  setPlayerAdmin: adminlikver,
  setPlayerTeam,
  sendAnnouncement: duyuru,
  sendChat: mesaj,
} = room;
let { parse: strtoJSON, stringify: JSONtoStr } = JSON;
let randompass = null;
let teams = {
  blue: 2,
  red: 1,
  spectators: 0,
};
let mapIndex = 0,
  sayac = {
    saniye: 0,
    dakika: 0,
  };
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
let mention = (name) => {
  return `@${name.replace(" ", "_")}`;
};

let playerdata = new Map();
function _onPlayerJoin(p) {
  let { auth, id, conn, name } = p;
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
    return duyuru(`${name},hos geldin`);
  }
  setPlayerTeam(id, teams.red);
  addPlayerData();
  welcomeMsg();
}
function _onPlayerChat(p, m) {
  let { admin, id, name } = p;
  function setPassword() {
    if (!admin)
      return duyuru(
        "Bu komutu kullanabilmeniz icin admin olmaniz gerekmektedir! " +
          mention(name),
        id
      );
    if (randompass == null) {
      randompass = String(Math.floor(Math.random() * 10000));
      room.setPassword(randompass);
      duyuru("Odanin sifresi degistirildi", null);
    } else {
      randompass = null;
      room.setPassword(randompass);
      duyuru("Odanin sifresi sifirlandi!", null);
    }
  }
  function Pass() {
    if (!admin)
      return "Bu komutu kullanabilmeniz icin admin olmaniz gerekmektedir.";
    return randompass == null
      ? "Odanin sifresi yok!"
      : "Odanin sifresi: " + randompass;
  }
  function getUserInfo() {
    let data;
    let idregex = /#\d+/g;
    if (idregex.test(m)) {
      if (!admin)
        return duyuru(
          "Baska birisinin bilgilerini gorebilmek icin admin olmaniz gerekmektedir :)",
          id
        );
      let ids = m.match(idregex);
      ids.forEach((e) => {
        e = Number(e.replace("#", ""));
        data = playerdata.get(e);
        duyuru(
          `${e} idli kullanicinin bilgileri:
IPv4: ${data.IPv4Addr}
Auth: ${data.auth}`,
          id
        );
      });
    } else {
      data = playerdata.get(id);
      duyuru(
        `${name}, iste bilgileriniz:
IPv4: ${data.IPv4Addr}
Auth: ${data.auth}
ID: ${id}`,
        id
      );
    }
  }
  if (m.startsWith("!pass")) {
    setPassword();
  }
  if (m.startsWith("?pass")) {
    duyuru(Pass(), id);
  }
  if (m.startsWith("!info")) {
    getUserInfo();
  }
}

function _onPlayerLeave(p) {
  // playerdata.delete(p.id); Isterseniz bunu aktif ederek kullanici ciktiginda verilerinin silinmesini saglayabilirsiniz.
}
/**
 *
 * @param {String} hData Handlebars
 * @param {Number} team TeamID
 *
 */
function _Map(hData, team = teams.red) {
  if (typeof hData != "string" || typeof team != "number")
    throw new Error(
      "hData parametresi string degil/team parametresi sayi (number) degil"
    );
  return {
    HandlebarsData: hData,
    team: team,
  };
}
function addNewMap(mapString, team = teams.red) {
  let jsondata = strtoJSON(localStorage.getItem("server"));
  jsondata.maps.push(_Map(mapString, team));
  localStorage.setItem("server", JSONtoStr(jsondata));
  console.log("Map basariyla eklendi.");
}
function _onRoomLink(url) {
  console.log("Oda acildi! URL : " + url);
  if (!localStorage.getItem("server")) {
    let JSONData = {
      maps: [_Map()],
    };
    localStorage.setItem("server", JSONtoStr(JSONData));
  }
  let map = strtoJSON(localStorage.getItem("server")).maps[mapIndex]; // Map array'indeki ilk haritayi acar.
  room.setCustomStadium(map);
  room.startGame();
}
room.onPlayerJoin = _onPlayerJoin;
room.onPlayerChat = _onPlayerChat;
room.onPlayerLeave = _onPlayerLeave;
room.onRoomLink = _onRoomLink;
setInterval(() => {
  mapIndex += 1;
  if (mapIndex == strtoJSON(localStorage.getItem("server")).maps.length) {
    mapIndex = 0;
  }
  let stadium = strtoJSON(localStorage.getItem("server")).maps[mapIndex];
  room.stopGame();
  room.setCustomStadium(stadium);
  room.startGame();
}, sure * 1000 * 60);
