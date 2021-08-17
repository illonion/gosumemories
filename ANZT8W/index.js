let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
let mapid = document.getElementById('mapid');

// NOW PLAYING
let mapContainer = document.getElementById("mapContainer");
let mapSong = document.getElementById("mapSong");
let mapTitle = document.getElementById("mapTitle");
let mapDifficulty = document.getElementById("mapDifficulty");

let cs = document.getElementById("cs");
let ar = document.getElementById("ar");
let od = document.getElementById("od");
let hp = document.getElementById("hp");

// FOR FLAGS
let teamBlueFlag = document.getElementById("flagIconBlue");
let teamRedFlag = document.getElementById("flagIconRed");

// TEAM OVERALL SCORE
let teamBlueName = document.getElementById("teamBlueName");
let teamRedName = document.getElementById("teamRedName");

// STAR AVAILABILITY
let scoreBlue = document.getElementById("scoreBlue");
let scoreRed = document.getElementById("scoreRed");
let teamBlue = document.getElementById("teamBlue");
let teamRed = document.getElementById("teamRed");

// TEAM PLAYING SCORE
let playScoreBlue = document.getElementById("playScoreBlue");
let playScoreRed = document.getElementById("playScoreRed");

// MOVING SCORE BAR
let movingScoreBarLeft = document.getElementById("movingScoreBarLeft");
let movingScoreBarRight = document.getElementById("movingScoreBarRight");

// GRAPHICS COMPONENTS
let bottom = document.getElementById("bottom");

// CHATS
let chats = document.getElementById("chats");

socket.onopen = () => {
    console.log("Successfully Connected");
};

let animation = {
    playScoreBlue:  new CountUp('playScoreBlue', 0, 0, 0, .2, {useEasing: true, useGrouping: true,   separator: " ", decimal: "." }),
    playScoreRed:  new CountUp('playScoreRed', 0, 0, 0, .2, {useEasing: true, useGrouping: true,   separator: " ", decimal: "." }),
}

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let tempImg;
let tempMapSong;
let tempMapArtist;
let tempMapName;
let tempMapDiff;

let tempCs;
let tempAr;
let tempOd;
let tempHp;

let scoreBlueTemp;
let scoreRedTemp;
let scoreEvent;
let teamNameBlueTemp;
let teamNameRedTemp;
let teamNameBlueFlagTemp;
let teamNameRedFlagTemp;
let gameState;

let chatLen = 0;
let tempClass = 'unknown';

socket.onmessage = event => {
    let data = JSON.parse(event.data);
	console.log(data);
	if(scoreVisibleTemp !== data.tourney.manager.bools.scoreVisible) {
		scoreVisibleTemp = data.tourney.manager.bools.scoreVisible;
		if(scoreVisibleTemp) {
			// Score visible -> Set bg bottom to full
			chats.style.opacity = 0;
			playScoreBlue.style.opacity = 1;
			playScoreRed.style.opacity = 1;
		} else {
			// Score invisible -> Set bg to show chats
			chats.style.opacity = 1;
			playScoreBlue.style.opacity = 0;
			playScoreRed.style.opacity = 0;
		}
	}
	if(starsVisibleTemp !== data.tourney.manager.bools.starsVisible) {
		starsVisibleTemp = data.tourney.manager.bools.starsVisible;
		if(starsVisibleTemp) {
			scoreBlue.style.opacity = 1;
			scoreRed.style.opacity = 1;
		} else {
			scoreBlue.style.opacity = 0;
			scoreRed.style.opacity = 0;
		}
	}
	if(tempImg !== data.menu.bm.path.full){
        tempImg = data.menu.bm.path.full;
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25').replace(/\\/g,'/');
        mapContainer.style.backgroundImage = `url('http://` + location.host + `/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}')`;
    }
	if (tempMapArtist !== data.menu.bm.metadata.artist) {
		tempMapArtist = data.menu.bm.metadata.artist;
		tempMapSong = tempMapArtist + " - ";
	}
    if(tempMapName !== data.menu.bm.metadata.title){
        tempMapName = data.menu.bm.metadata.title;
        mapTitle.innerText = tempMapName;
		tempMapSong += tempMapName + " ";

		if(mapTitle.getBoundingClientRect().width >= 380) {
			mapTitle.classList.add("wrap");
		} else {
			mapTitle.classList.remove("wrap");
		}
    }
    if(tempMapDiff !== '[' + data.menu.bm.metadata.difficulty + ']'){
        tempMapDiff = '[' + data.menu.bm.metadata.difficulty + ']';
        mapDifficulty.innerText = tempMapDiff;
		tempMapSong += tempMapDiff;
		mapSong.innerText = tempMapSong;
    }

	if(data.menu.bm.stats.CS != tempCs){
        tempCs = data.menu.bm.stats.CS;
        cs.innerHTML= `${Math.round(tempCs * 10) / 10}`;
    }
    if(data.menu.bm.stats.AR != tempAr){
        tempAr = data.menu.bm.stats.AR;
        ar.innerHTML= `${Math.round(tempAr * 10) / 10}`;
    }
    if(data.menu.bm.stats.OD != tempOd){
        tempOd = data.menu.bm.stats.OD;
        od.innerHTML= `${Math.round(tempOd * 10) / 10}`;
    }
    if(data.menu.bm.stats.HP != tempHp){
        tempHp = data.menu.bm.stats.HP;
        hp.innerHTML= `${Math.round(tempHp * 10) / 10}`;
    }

	if (bestOfTemp !== Math.ceil(data.tourney.manager.bestOF / 2) || scoreBlueTemp !== data.tourney.manager.stars.left || scoreRedTemp !== data.tourney.manager.stars.right) {
		
		// Courtesy of Victim-Crasher
		bestOfTemp = Math.ceil(data.tourney.manager.bestOF / 2);

		// To know where to blow or pop score
		if (scoreBlueTemp < data.tourney.manager.stars.left) {
			scoreEvent = "blue-add";
		} else if (scoreBlueTemp > data.tourney.manager.stars.left) {
			scoreEvent = "blue-remove";
		} else if (scoreRedTemp < data.tourney.manager.stars.right) {
			scoreEvent = "red-add";
		} else if (scoreRedTemp > data.tourney.manager.stars.right) {
			scoreEvent = "red-remove";
		}

		scoreBlueTemp = data.tourney.manager.stars.left;
		scoreBlue.innerHTML = "";
		for (var i = 0; i < scoreBlueTemp; i++) {
			if (scoreEvent === "blue-add" && i === scoreBlueTemp - 1) {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFillAnimate");
				scoreBlue.appendChild(scoreFill);
			} else {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFill");
				scoreBlue.appendChild(scoreFill);
			}
		}
		for (var i = 0; i < bestOfTemp - scoreBlueTemp; i++) {
			if (scoreEvent === "blue-remove" && i === 0) {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score scoreNoneAnimate");
				scoreBlue.appendChild(scoreNone);
			} else {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score");
				scoreBlue.appendChild(scoreNone);
			}
		}

		scoreRedTemp = data.tourney.manager.stars.right;
		scoreRed.innerHTML = "";
		for (var i = 0; i < bestOfTemp - scoreRedTemp; i++) {
			if (scoreEvent === "red-remove" && i === bestOfTemp - scoreRedTemp - 1) {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score scoreNoneAnimate");
				scoreRed.appendChild(scoreNone);
			} else {
				let scoreNone = document.createElement("div");
				scoreNone.setAttribute("class", "score");
				scoreRed.appendChild(scoreNone);
			}
		}
		for (var i = 0; i < scoreRedTemp; i++) {
			if (scoreEvent === "red-add" && i === 0) {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFillAnimate");
				scoreRed.appendChild(scoreFill);
			} else {
				let scoreFill = document.createElement("div");
				scoreFill.setAttribute("class", "score scoreFill");
				scoreRed.appendChild(scoreFill);
			}
		}
	}
	if(teamNameBlueTemp !== data.tourney.manager.teamName.left) {
		if (data.tourney.manager.teamName.left == "") {
			teamBlueName.style.display = "none";
		} else {
			teamBlueName.style.display = "block";
			teamNameBlueTemp = data.tourney.manager.teamName.left;
			teamBlueName.innerHTML = teamNameBlueTemp;
			teamNameBlueFlagTemp = "icons/" + teamNameBlueTemp + ".png";
			teamBlueFlag.setAttribute("src", teamNameBlueFlagTemp);
		}
	}
	if(teamNameRedTemp !== data.tourney.manager.teamName.right) {
		if (data.tourney.manager.teamName.right == "") {
			teamRedName.style.display = "none";
		} else {
			teamRedName.style.display = "block";
			teamNameRedTemp = data.tourney.manager.teamName.right;
			teamRedName.innerHTML = teamNameRedTemp;
			teamNameRedFlagTemp = "icons/" + teamNameRedTemp + ".png";
			teamRedFlag.setAttribute("src", teamNameRedFlagTemp);
		}
	}
	if(scoreVisibleTemp) {
		playScoreBlueTemp = data.tourney.manager.gameplay.score.left;
		playScoreRedTemp = data.tourney.manager.gameplay.score.right;
		
		animation.playScoreBlue.update(playScoreBlueTemp);
		animation.playScoreRed.update(playScoreRedTemp);
		
		if(playScoreBlueTemp > playScoreRedTemp) {
			// Blue is Leading
			playScoreBlue.style.backgroundColor = '#ad81db';
			playScoreRed.style.backgroundColor = '#454545';

			movingScoreBarLeft.style.width = ((playScoreBlueTemp - playScoreRedTemp) / 300000 * 960) + "px";
			movingScoreBarRight.style.width = "0px";
		} else if (playScoreBlueTemp == playScoreRedTemp) {
			// Tie
			playScoreBlue.style.backgroundColor = '#ad81db';
			playScoreRed.style.backgroundColor = '#ad81db';

			movingScoreBarLeft.style.width = "0px";
			movingScoreBarRight.style.width = "0px";
		} else {
			// Red is Leading
			playScoreBlue.style.backgroundColor = '#454545';
			playScoreRed.style.backgroundColor = '#ad81db';
			
			movingScoreBarLeft.style.width = "0px";
			movingScoreBarRight.style.width = ((playScoreRedTemp - playScoreBlueTemp) / 300000 * 960) + "px";
		}
	}
	if(!scoreVisibleTemp) {
		movingScoreBarRight.style.width = "0px";
		movingScoreBarLeft.style.width = "0px";
		if(chatLen != data.tourney.manager.chat.length) {
			// There's new chats that haven't been updated
			
			if(chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.manager.chat.length)) {
				// Starts from bottom
				chats.innerHTML = "";
				chatLen = 0;
			}
			
			// Add the chats
			for(var i=chatLen; i < data.tourney.manager.chat.length; i++) {
				tempClass = data.tourney.manager.chat[i].team;
				
				// Chat variables
				let chatParent = document.createElement('div');
				chatParent.setAttribute('class', 'chat');

				let chatTime = document.createElement('div');
				chatTime.setAttribute('class', 'chatTime');
				
				let wholeChat = document.createElement('div');
				wholeChat.setAttribute('class', 'wholeChat');

				let chatName = document.createElement('div');
				chatName.setAttribute('class', 'chatName');

				let chatText = document.createElement('div');
				chatText.setAttribute('class', 'chatText');
				
				chatTime.innerText = data.tourney.manager.chat[i].time;
				chatName.innerText = data.tourney.manager.chat[i].name + ":\xa0";
				chatText.innerText = data.tourney.manager.chat[i].messageBody;
				
				chatName.classList.add(tempClass);
				
				chatParent.append(chatTime);
				chatParent.append(wholeChat);
				wholeChat.append(chatName);
				wholeChat.append(chatText);
				chats.append(chatParent);
			}
			
			// Update the Length of chat
			chatLen = data.tourney.manager.chat.length;
			
			// Update the scroll so it's sticks at the bottom by default
			chats.scrollTop = chats.scrollHeight;
		}
	}
}