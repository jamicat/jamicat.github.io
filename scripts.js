var typed = new Typed('#typed', {
strings: [
'<span class="text-white text-xl mr-2 text-pink-glow">ฅ(^ω^ฅ)</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">(ฅ^ω^)ฅ</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">ฅ(^ω^)ฅ</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">(๑•ω•́ฅ✧</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">(ฅ`･ω･´)っ=</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">ฅ*•ω•*ฅ</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">ฅ^•ﻌ•^ฅ</span>',
'<span class="text-white text-xl mr-2 text-pink-glow">⊱ฅ•ω•ฅ⊰</span>'
],
typeSpeed: 60,
backSpeed: 0,
showCursor: true,
cursorChar: '_',
smartBackspace: false,
loop: true,
});

interact('#terminal').draggable({
allowFrom: '.drag-area',
inertia: true,
modifiers: [
interact.modifiers.restrictRect({
restriction: 'parent',
endOnly: true,
}),
],
listeners: {
move(event) {
const target = event.target;
const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
target.style.transform = `translate(${x}px, ${y}px)`;
target.setAttribute('data-x', x);
target.setAttribute('data-y', y);
},
},
});

let player;
let isPlaying = false;
let galaxyVisible = false;
function onYouTubeIframeAPIReady() {
player = new YT.Player('background-video-iframe', {
videoId: videoId,
playerVars: {
autoplay: 0,
mute: 0,
controls: 0,
loop: 1,
playlist: 'viimfQi_pUw,6tc-GD-DEXw',
playsinline: 1,
modestbranding: 1,
rel: 0,
fs: 0,
showinfo: 0,
iv_load_policy: 3
},
events: {
       /*onReady: () => {
        toggleBtn.click(); 
      },*/
onStateChange: (event) => {
const posterEl = document.getElementById('videoPoster');
const iframeEl = document.getElementById('background-video-iframe');
if (event.data === YT.PlayerState.PLAYING) {
posterEl.style.opacity = '0';
iframeEl.style.opacity = '1';
}

if (event.data === YT.PlayerState.PAUSED) {
const currentVideoId = player.getVideoData().video_id;

const highRes = `https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`;
const fallback = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
const thumbImg = new Image();
thumbImg.onload = () => {
posterEl.style.backgroundImage = `url(${highRes})`;
};
thumbImg.onerror = () => {
posterEl.style.backgroundImage = `url(${fallback})`;
};
thumbImg.src = highRes;
posterEl.style.opacity = '1';
iframeEl.style.opacity = '0';
}
}
}
});
}

const videoId = 'viimfQi_pUw';
const posterEl = document.getElementById('videoPoster');
const iframeEl = document.getElementById('background-video-iframe');
const highRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
const fallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
const img = new Image();
img.onload = () => {
posterEl.style.backgroundImage = `url(${highRes})`;
};
img.onerror = () => {
posterEl.style.backgroundImage = `url(${fallback})`;
};
img.src = highRes;

const toggleBtn = document.getElementById('videoToggle');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

toggleBtn.addEventListener('click', () => {
if (!player) return;
if (isPlaying) {
player.pauseVideo();
playIcon.classList.remove('hidden');
pauseIcon.classList.add('hidden');
} else {
player.playVideo();
pauseIcon.classList.remove('hidden');
playIcon.classList.add('hidden');
}
isPlaying = !isPlaying;
});

document.getElementById('nextTrack').addEventListener('click', () => {
if (player && typeof player.nextVideo === 'function') {
player.nextVideo();
isPlaying = true;
pauseIcon.classList.remove('hidden');
playIcon.classList.add('hidden');
}   
});

let galaxyScriptLoaded = false;

rewind10.addEventListener('click', async () => {

if (!galaxyScriptLoaded) {
await import('./galaxy.js');
galaxyScriptLoaded = true;
}

const guiElement = document.querySelector('.lil-gui');

if (guiElement) {
if (guiElement.style.display === 'none' || !guiElement.style.display) {
guiElement.style.display = 'block';
} else {
guiElement.style.display = 'none';
}
}

const canvas = document.getElementById('canvas');  

if (galaxyVisible) {
galaxyVisible = false;
rewind10.classList.remove('text-white');
rewind10.classList.add('text-pink-600');
canvas.style.opacity = '0';
canvas.style.pointerEvents = 'none'; 
} else {
galaxyVisible = true;
rewind10.classList.add('text-white');
rewind10.classList.remove('text-pink-600');
canvas.style.opacity = '1';
canvas.style.pointerEvents = 'auto';  
}
});

function showList() {
const playlist = [
{
title: "Billie Eilish - Ocean Eyes (Official Music Video)",
videoId: "viimfQi_pUw",
channelAvatar: "https://yt3.googleusercontent.com/dirvtoDAmx-u0UR76-pxfhYL6Wxj2vfL2geUcxDwk62tTWWhGG6QDGc63RG3NdOz38-yBwRHDQ=s160-c-k-c0x00ffffff-no-rj",
channelUrl: "https://www.youtube.com/@BillieEilish"
},
{
title: "YUNGBLUD - Hello Heaven, Hello (From The Blacklodge)",
videoId: "6tc-GD-DEXw",
channelAvatar: "https://yt3.googleusercontent.com/nYTKh5VVSOqq9vK5CoEQY8HWlMxKshHQ0H_eM0lBraA7YtQqwDavCFTYRUHH5DG07SWwRNfn=s160-c-k-c0x00ffffff-no-rj",
channelUrl: "https://www.youtube.com/@YUNGBLUD"
}
];

let html = `<div class="space-y-4 mt-4">`;

playlist.forEach(item => {
html += `
     <div class="flex items-center space-x-3">
       <a href="${item.channelUrl}" target="_blank">
          <img src="${item.channelAvatar}" width="40" height="40" class="rounded-full border border-opacity-0 border-white" alt="avatar">
       </a>
       <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" class="text-blue-500 text-base">
         ${item.title}
       </a>
     </div>
   `;
});

html += `
   <div class="mt-6 flex justify-center">
     <button class="terminal-button" onclick="resetTerminal()">Back</button>
   </div>
 `;

$('#terminalContent').html(html);
}

function showArt() {
$('#terminalContent').html(`
 <div class="text-pink-600 text-lg mb-4 mt-4"></div>
   <div id="artGallery" class="grid grid-cols-2 gap-4">
   <a href="art1.jpg" class="block rounded overflow-hidden">
     <img src="art1_thumb.jpg" alt="Jamie - Pearl" class="rounded hover:scale-105 transition transform duration-200" />
       </a>
     <a href="art2.jpg" class="block rounded overflow-hidden">
     <img src="art2_thumb.jpg" alt="Jamie - Pixel Fit" class="rounded hover:scale-105 transition transform duration-200" />
       </a>
     <a href="art3.jpg" class="block rounded overflow-hidden">
     <img src="art3_thumb.jpg" alt="Jamie - Tokyo" class="rounded hover:scale-105 transition transform duration-200" />
       </a>
     <a href="art4.jpg" class="block rounded overflow-hidden">
     <img src="art4_thumb.jpg" alt="Bludfest 2025" class="rounded hover:scale-105 transition transform duration-200" />
       </a>
     </div>
   <div class="mt-4 flex justify-center">
   <button class="terminal-button" onclick="resetTerminal()">Back</button>
     </div>
   `);

setTimeout(() => {
lightGallery(document.getElementById('artGallery'), {
thumbnail: true,
zoom: true,
download: false,
});
}, 100); 
}

function siteFAQ() {
$('#terminalContent').html(`
       <div class="text-red-300 text-lg mb-4 mt-4">Libraries used:</div>
       <ul class="list-disc list-inside text-white space-y-1">
       <li class="text-pink-glow">jQuery</li>
        <li class="text-pink-glow">Typed.js</li>
        <li class="text-pink-glow">Interact.js</li>
        <li class="text-pink-glow">Tailwind CSS</li>
        <li class="text-pink-glow">YouTube IFrame API</li>
       </ul>
       </div>
       <div id="buttonRow" class="flex justify-center">
       <button class="terminal-button" onclick="resetTerminal()">Back</button>
       </div>
       `);
}

let lastSubmissionTime = 0;
function showMessageForm() {

document.getElementById('terminalContent').innerHTML = `
     <form id="guestbookForm" class="space-y-4 mt-4">
       <input id="name" type="text" name="name" placeholder="meower" class="w-full p-2 rounded bg-gray-700 text-white border border-pink-600 bg-opacity-20 border-opacity-75" required>
       <textarea id="message" name="message" placeholder="meow" class="w-full p-2 rounded bg-gray-700 text-white border border-pink-600 bg-opacity-20 border-opacity-75" required></textarea>
       <div class="flex justify-center space-x-4 flex-wrap">
       <button type="submit" class="terminal-button">Submit</button>
       <button type="button" class="terminal-button" onclick="resetTerminal()">Back</button>
       </div>
       <div id="formResponse" class="text-pink-600 mt-2"></div>
     </form>
   `;

const form = document.getElementById('guestbookForm');
form.addEventListener('submit', submitMessage);
}

function submitMessage(event) {
event.preventDefault();
const name = document.getElementById("name").value.trim();
const message = document.getElementById("message").value.trim();
const now = Date.now();

if (!name || !message) {
alert("Fill in the fields!");
return;
}

if (now - lastSubmissionTime < 300000) {
alert("5 minutes between each message.");
return;
}

lastSubmissionTime = now;

const data = {
name: name,
comment: message,
timestamp: new Date().toISOString(),
};

const url = "https://script.google.com/macros/s/AKfycbyHw5sLKQB5OWs3pRSed4T2e-0aX32fwg03OXbyVH_UB6pOyzhCntv_9PDaU8WXeuql/exec";

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
document.getElementById("formResponse").textContent = "Thank you for your message!";
}

       function resetTerminal() {
              $('#terminalContent').html(`
              <div id="typed" class="text-pink-600 text-lg mb-4 mt-4 text-center"></div>
              <div id="buttonRow" class="flex justify-center space-x-4 flex-wrap">
              <button class="terminal-button ml-2" onclick="showArt()">Art</button>
              <!--button class="terminal-button ml-3" onclick="showMessageForm()">Message</button-->
              <button class="terminal-button" onclick="showList()">Playlist</button>
              <button class="terminal-button ml-4" onclick="siteFAQ()">FAQ</button>
              </div>
              `);
       
              new Typed('#typed', {

       strings: ['<span class="text-white text-xl mr-2 text-pink-glow">ฅ(^ω^ฅ)</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">(ฅ^ω^)ฅ</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">ฅ(^ω^)ฅ</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">(๑•ω•́ฅ✧</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">(ฅ`･ω･´)っ=</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">ฅ*•ω•*ฅ</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">ฅ^•ﻌ•^ฅ</span>',
                 '<span class="text-white text-xl mr-2 text-pink-glow">⊱ฅ•ω•ฅ⊰</span>'],
              typeSpeed: 60,
              backSpeed: 0,
              showCursor: true,
              cursorChar: '_',
              smartBackspace: false,
              loop: true,
       });
}

       const tag = document.createElement('script');
       tag.src = "https://www.youtube.com/iframe_api";
       document.head.appendChild(tag);
