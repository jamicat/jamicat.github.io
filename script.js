function toggleMessageBox() {
const messageBox = document.getElementById("messageBox");
messageBox.style.display = messageBox.style.display === "none" ? "block" : "none";
}
	
let lastSubmissionTime = 0; 

function submitMessage() {
    var name = document.getElementById("name").value.trim();
    var message = document.getElementById("message").value.trim();

    if (!name || !message) {
        alert("Fill in the fields!");
        return;
    }

    var currentTime = Date.now();
    if (currentTime - lastSubmissionTime < 300000) {
        alert("5 minutes between each message.");
        return;
    }

    lastSubmissionTime = currentTime;

    var timestamp = new Date().toISOString(); 

    var data = {
        name: name,
        comment: message,
        timestamp: timestamp
    };

    var url = "https://script.google.com/macros/s/AKfycbzNzyyzX2Xgc-n16rlpezl8x_EGzwXn-GSSpihv5sj8457b86CXbeqEE7VJszLb5siA/exec"; 
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        mode: "no-cors",  
    });

    document.getElementById("name").value = "";  
    document.getElementById("message").value = "";  
    toggleMessageBox(); 
}

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=53.765762&lon=-2.692337&appid=3b394dfa0c0a624d5b6d72af1bef9a64";
fetch(apiUrl)
.then(response => {
if (!response.ok) {
throw new Error("Network response not ok");
}
return response.json();
})
.then(data => {
const description = data.weather[0].description;
const formattedDescription = description.charAt(0).toUpperCase() + description.slice(1);

document.getElementById("weather-output").textContent = formattedDescription;
})
.catch(error => {
console.error("Error fetching weather:", error);
document.getElementById("weather-output").textContent = "unable to fetch.";
});

 const musicToggleButton = document.getElementById("music-toggle-button");
    const playIcon = document.querySelector(".play-icon");
    const pauseIcon = document.querySelector(".pause-icon");
    const videoBox = document.getElementById("video-box");
    const youtubeVideo = document.getElementById("youtube-video").contentWindow; 
    const nextSongButton = document.getElementById("next-song-button");

    let videoVisible = false;

    musicToggleButton.addEventListener("click", () => {
        if (!videoVisible) {
            videoBox.style.display = "flex";
            youtubeVideo.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            playIcon.style.display = "none";
            pauseIcon.style.display = "inline-block";
            musicToggleButton.classList.add('active');
            videoVisible = true;
        } else {
            videoBox.style.display = "none";
            youtubeVideo.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            playIcon.style.display = "inline-block";
            pauseIcon.style.display = "none";
            musicToggleButton.classList.remove('active');
            videoVisible = false;
        }
    });

    const videoList = [
        "https://www.youtube.com/embed/wSumaFZoZpg?enablejsapi=1&autoplay=1",
        "https://www.youtube.com/embed/BMA171qWYZk?enablejsapi=1&autoplay=1"
    ];

    let currentVideoIndex = 0;

    nextSongButton.addEventListener("click", () => {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        youtubeVideo.postMessage('{"event":"command","func":"loadVideoByUrl","args":["' + videoList[currentVideoIndex] + '"]}', '*');
    });
	
	const terminal = document.getElementById('terminal');
const typingArea = document.getElementById('typing-area');
const buttonArea = document.getElementById('button-area');
const dog = document.getElementById('dog');
const dogAudio = document.getElementById('dog-audio');
const dogImage = document.getElementById('dog');
const toggleDogButton = document.getElementById('toggle-dog-button');
let growInterval;
let scale = 1; 

const messages = [
''
];

let lineIndex = 0;
let charIndex = 0;
let typingSpeed = 30;
let slowEllipsesSpeed = 900;
let hasCleared = false;

function type() {
if (lineIndex < messages.length) {
const currentLine = messages[lineIndex];
if (charIndex < currentLine.length) {
typingArea.innerHTML += currentLine[charIndex];
charIndex++;
setTimeout(type, typingSpeed);
} else {
if (lineIndex === 0 && !hasCleared) {
/*typingArea.innerHTML = '';*/
hasCleared = true;
charIndex = 0;
lineIndex++;
setTimeout(type, typingSpeed);

} else {
typingArea.innerHTML += '<br>';
charIndex = 0;
lineIndex++;
setTimeout(type, typingSpeed);
}
}
} else {
showCursor();         
setTimeout(() => {
buttonArea.style.display = 'flex';
}, 500); 
}
}

/*
function typeEllipses(callback) {
  let dots = 0;
  const ellipsisInterval = setInterval(() => {
    if (dots < 3) {
      typingArea.innerHTML += '.';
      dots++;
    } else {
      clearInterval(ellipsisInterval);
      if (callback) {
        typingSpeed = 30;
        callback();
      }
    }
  }, slowEllipsesSpeed);
}*/

function showCursor() {
typingArea.innerHTML += '<div class="cursor"></div>';
}

function removeCursorAndShowButtons() {
const cursor = document.querySelector('.cursor');
if (cursor) cursor.remove();
buttonArea.style.display = 'flex';
}

/*
function showAbout() {
  const aboutMessage = [
    ``,
    ` `,
    ``,
    ` `,
    ``,
    ` `,
    ``,
    ` `,
	``,
	` `,
    ``
  ];

  buttonArea.style.display = 'none';
  typingArea.innerHTML = '';

  let lineIndex = 0;
  let charIndex = 0;

  function typeAbout() {
    if (lineIndex < aboutMessage.length) {
      const currentLine = aboutMessage[lineIndex];

      if (charIndex < currentLine.length) {
        typingArea.innerHTML += currentLine[charIndex];
        charIndex++;
        setTimeout(typeAbout, 10);
      } else {
        typingArea.innerHTML += '<br>';
        charIndex = 0;
        lineIndex++;
        setTimeout(typeAbout, 10);
      }
    } else {
      showCursor();
      setTimeout(removeCursorAndShowButtons, 1000);
    }
  }

  typeAbout();
}
*/

function showSocials() {
const socials = [
{ name: 'Discord', username: '', link: '' }, 
{ name: 'Steam', username: '', link: '' },
{ name: 'Bsky', username: '', link: '' }
];

buttonArea.style.display = 'none';
typingArea.innerHTML = '';

let socialIndex = 0;

function typeSocial() {
if (socialIndex < socials.length) {
const social = socials[socialIndex];
let text = `${social.name} - `;

if (social.link) {
text += `<a href="${social.link}" target="_blank" 
              style="color: white; text-decoration: none;
              text-shadow: 0 0 5px #8be9fd, 0 0 10px #8be9fd;">
              ${social.username}</a>`;
} else {
text += social.username;
}

typingArea.innerHTML += text + '<br>';
socialIndex++;
setTimeout(typeSocial, typingSpeed);
} else {
showCursor();
setTimeout(removeCursorAndShowButtons, 1000);
}
}

typeSocial();
}

function exitTerminal() {
typingArea.innerHTML = '';
const exitMessage = 'Burn bright';
let index = 0;

buttonArea.style.display = 'none';

function typeExitMessage() {
if (index < exitMessage.length) {
typingArea.innerHTML += exitMessage[index];
index++;
setTimeout(typeExitMessage, typingSpeed);
} else {
showCursor();
setTimeout(() => {
alert('You need to close this tab manually.');
}, 1000);
}
}

typeExitMessage();
}
function showArt() {
buttonArea.style.display = 'none'; 
typingArea.innerHTML = ''; 

const artFiles = [
'BRATshirt',
'Sketchpage',
'Chibi',
'Festival',
];

// Dedicated intro because fucky event listeners
const introElement = document.createElement('div');
introElement.innerHTML = ``;

typingArea.appendChild(introElement); 

function displayTree() {
let treeHTML = 'art<br>';
artFiles.forEach((art) => {
treeHTML += `├── <span class="art-link" style="color: white; text-shadow: 0 0 5px #8be9fd, 0 0 10px #8be9fd; cursor: pointer;" data-file="${art}">${art}</span><br>`;
});

const treeElement = document.createElement('div'); 
treeElement.innerHTML = treeHTML; 
typingArea.appendChild(treeElement); 

addArtClickEvents(); 
buttonArea.style.display = 'flex'; 
}

function addArtClickEvents() {
const links = document.querySelectorAll('.art-link');
links.forEach((link) => {
link.addEventListener('click', () => {
const filename = `${link.getAttribute('data-file').replace(/\s+/g, '-')}.png`;
displayArt(filename);
});
});
}

function displayArt(filename) {
typingArea.innerHTML = ''; 
const imageElement = document.createElement('img');
imageElement.src = filename;
imageElement.alt = filename;
imageElement.style = 'max-width:80%; height:auto; display:block; margin: 10px auto;';
typingArea.appendChild(imageElement); 

const introElementClone = introElement.cloneNode(true); 
typingArea.appendChild(introElementClone); 
displayTree(); 
}
displayTree(); 
}
type();	

document.addEventListener("DOMContentLoaded", () => {
const container = document.getElementById("draggable-container");

let isDragging = false;
let offsetX, offsetY;

container.addEventListener("mousedown", (event) => {
isDragging = true;
offsetX = event.clientX - container.getBoundingClientRect().left;
offsetY = event.clientY - container.getBoundingClientRect().top;
container.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (event) => {
if (!isDragging) return;

const newX = event.clientX - offsetX;
const newY = event.clientY - offsetY;

container.style.left = `${newX}px`;
container.style.top = `${newY}px`;
});

document.addEventListener("mouseup", () => {
isDragging = false;
container.style.cursor = "grab";
});
});

document.addEventListener("DOMContentLoaded", () => {
const messages = [
"ฅ(^ω^ฅ)",
"(ฅ^ω^)ฅ",
"ฅ(^ω^)ฅ",
"(๑•ω•́ฅ✧",
"(ฅ`･ω･´)っ=",
"ฅ*•ω•*ฅ",
"ฅ^•ﻌ•^ฅ",
"⊱ฅ•ω•ฅ⊰"
];

const moodText = document.getElementById("mood-text");
let messageIndex = 0;
let charIndex = 0;
let isDeleting = false;
const baseTypingSpeed = 75;
const deleteSpeed = 20;
const pauseBetween = 1500;
const pauseBeforeTyping = 600;

const knockSound = new Audio("knock.mp3");

function typeEffect() {
const currentMessage = messages[messageIndex];
if (!isDeleting) {
moodText.innerText = currentMessage.substring(0, charIndex + 1);
charIndex++;

if (charIndex === currentMessage.length) {

if (messageIndex === messages.length - 1) {
setTimeout(() => {
/*knockSound.play();*/
setTimeout(() => {
/*knockSound.pause();*/
knockSound.currentTime = 0; 
}, 5000); 
}, pauseBetween);
}

isDeleting = true;
setTimeout(typeEffect, pauseBetween);
return;
}
} else {
moodText.innerText = currentMessage.substring(0, charIndex - 1);
charIndex--;
if (charIndex === 0) {
isDeleting = false;
messageIndex = (messageIndex + 1) % messages.length;
setTimeout(typeEffect, pauseBeforeTyping);
return;
}
}
let randomPause = Math.random() < 0.15 ? 250 : 0;
let speed = isDeleting ? deleteSpeed : baseTypingSpeed + randomPause;
setTimeout(typeEffect, speed);
}

setTimeout(() => {
moodText.style.display = "block";
moodText.innerText = "";
typeEffect();
}, 500);
});

window.addEventListener('load', () => {
    document.getElementById('music-toggle-button').click();
    /*document.querySelector('.button3').click();*/

});
