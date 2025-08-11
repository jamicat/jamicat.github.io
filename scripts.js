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
backSpeed: 30,
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
    start(event) {
      const target = event.target;

      if (target.style.transform.includes('translate(-50%, -50%)')) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        target.style.top = rect.top + scrollTop + 'px';
        target.style.left = rect.left + scrollLeft + 'px';
        target.style.transform = 'translate(0, 0)';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);
      }
    },
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
playlist: '9DiJJVfZXUk,Tj_RqPrpr48',
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

const videoId = '9DiJJVfZXUk';
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
const themeBtn = document.getElementById('changeTheme');

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
rewind10.classList.remove('text-purple-200');
rewind10.classList.add('text-purple-50');
canvas.style.opacity = '0';
canvas.style.pointerEvents = 'none'; 
} else {
galaxyVisible = true;
rewind10.classList.add('text-purple-200');
rewind10.classList.remove('text-purple-50');
canvas.style.opacity = '1';
canvas.style.pointerEvents = 'auto';  
}
});

function showList() {
const playlist = [
{
title: "Cavetown - Baby Spoon (Official Video)",
videoId: "9DiJJVfZXUk",
channelAvatar: "https://yt3.googleusercontent.com/oWWGvBTDEGOyU2IkWe9ycVjpyHkvIhgNBJjKfWx4WfIXWYtIZB0L-oEahLKRZ-boo3gt-FwUlg=s160-c-k-c0x00ffffff-no-rj",
channelUrl: "https://www.youtube.com/@cavetown"
},
{
title: "hallows eve masquerade - beetlebug",
videoId: "Tj_RqPrpr48",
channelAvatar: "https://yt3.googleusercontent.com/zuw1vd2r87ydvGCj3D6jeosObilt47sZaEGZ2X-JsOQXEQHfKokoUKJoKOcJbfWaGxSgTn4abg=s160-c-k-c0x00ffffff-no-rj",
channelUrl: "https://www.youtube.com/@auribeetlebug"
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

const tooltip = document.getElementById('tooltip');
themeBtn.addEventListener('click', changeTheme);

function changeTheme()
{
  document.documentElement.classList.toggle('dark');

  tooltip.classList.remove('opacity-0', 'pointer-events-none');
  tooltip.classList.add('opacity-100');

  setTimeout(() => {
    tooltip.classList.add('opacity-0', 'pointer-events-none');
    tooltip.classList.remove('opacity-100');
  }, 1500);
}

function showArt() {
$('#terminalContent').html(`
<div class="text-pink-300 text-lg mb-4 mt-4"></div>
  <div id="artGallery" class="grid grid-cols-3 gap-4">
   <a href="closeup.jpg" class="block rounded overflow-hidden">
    <img src="closeup_thumb.jpg" alt="Jamie - Oliv" class="rounded hover:scale-105 transition transform duration-200" />
      </a>
  <a href="festival.jpg" class="block rounded overflow-hidden">
    <img src="festival_thumb.jpg" alt="Jamie - Festival" class="rounded hover:scale-105 transition transform duration-200" />
      </a>
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
      <div class="text-pink-300 text-lg mb-4 mt-4">Libraries used:</div>
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
let lastGbSubmissionTime = 0;

function showGuestBook() {

  if (document.getElementById('guestBookWindow')) {
    return;
  }

  const guestBookWindow = document.createElement('div');
  guestBookWindow.className = 'terminal absolute p-6 max-w-full w-[90vw] sm:w-[500px]';
  guestBookWindow.style.zIndex = 11;
  guestBookWindow.style.top = '50%';
  guestBookWindow.style.left = '50%';
  guestBookWindow.style.transform = 'translate(-50%, -50%)';
  guestBookWindow.id = 'guestBookWindow';

  guestBookWindow.innerHTML = `
  <div class="drag-area text-pink-300 text-sm mb-2 select-none flex justify-between items-center">
    <span class="flex items-center space-x-2">
      <img src="jami2.png" alt="Avatar2" class="avatar-icon" />
     <span id="typed2" class="text-pink-300 text-lg mt-4 mb-4"></span>
    </span>
    <div class="flex items-center space-x-2 mr-3 -mt-12">
      <button onclick="closeGuestBook()" class="text-pink-300 hover:text-red-400 transition-colors duration-200 text-lg leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-pink-300 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-6">
    <div class="w-full">
      <div class="text-pink-300 text-md mt-2 mb-4 text-center">
       <p id="welcomeMessage" class="text-base">Welcome! Be nice.</p>
      </div>
      <form id="guestbookForm" class="space-y-4 text-white">
        <input id="name" type="text" name="name" placeholder="Name" class="w-full p-2 bg-black bg-opacity-20 border border-pink-300 rounded border-opacity-75" required />
        <textarea id="message" name="message" placeholder="Message!" class="w-full p-2 bg-black bg-opacity-20 border border-pink-300 rounded border-opacity-75" required></textarea>
        <div class="text-center">
          <button type="submit" class="terminal-button">Submit</button>
        </div>
      </form>
    </div>
  </div>
`;

document.body.appendChild(guestBookWindow);

var typed2= new Typed('#typed2', {
  strings: ['<span class="text-white text-xl mr-2 text-pink-glow">Guestbook</span>'],
  typeSpeed: 80,
  showCursor: false,
  cursorChar: '_',
  loop: false,
});

const guestbookCommentBox = document.createElement('div');
guestbookCommentBox.id = 'guestbookComments';
guestbookCommentBox.className = `
  terminal 
  absolute 
  p-4 
  w-[300px] 
  overflow-y-auto 
  bg-black 
  bg-opacity-20 
  text-white 
  text-sm 
  scrollbar-thin 
  scrollbar-thumb-pink-300 
  scrollbar-track-black 
  rounded-lg
`;

guestbookCommentBox.style.zIndex = 10;
document.body.appendChild(guestbookCommentBox);

function updateCommentBoxPosition() {
  const guestWindow = document.getElementById('guestBookWindow');
  const commentBox = document.getElementById('guestbookComments');

  if (!guestWindow || !commentBox) return;

  const rect = guestWindow.getBoundingClientRect();

  commentBox.style.position = 'absolute';
  commentBox.style.top = `${rect.top}px`;
  commentBox.style.left = `${rect.right + 10}px`;
  commentBox.style.height = `${rect.height}px`; 
}

requestAnimationFrame(() => {
  updateCommentBoxPosition();
});

const guestWindow = document.getElementById('guestBookWindow');
const commentBox = document.getElementById('guestbookComments');

if (guestWindow && commentBox) {
  const resizeObserver = new ResizeObserver(() => {
    updateCommentBoxPosition();
  });
  resizeObserver.observe(guestWindow);
}

interact(guestBookWindow)
  .draggable({
    allowFrom: '.drag-area',
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true,
      }),
    ],
    listeners: {
      start(event) {
        const target = event.target;

        if (target.style.transform.includes('translate(-50%, -50%)')) {
          const rect = target.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

          target.style.top = rect.top + scrollTop + 'px';
          target.style.left = rect.left + scrollLeft + 'px';
          target.style.transform = 'translate(0, 0)';
          target.setAttribute('data-x', 0);
          target.setAttribute('data-y', 0);

          updateCommentBoxPosition();
        }
      },
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        updateCommentBoxPosition();
      }
    }
  });

document.getElementById('guestbookForm').addEventListener('submit', async function (e) {
e.preventDefault();

const name = document.getElementById("name").value.trim();
const message = document.getElementById("message").value.trim();
const now = Date.now();

if (!name || !message) {
alert("Fill in the fields!");
return;
}

if (now - lastGbSubmissionTime < 300000) {
alert("5 minutes between each submission.");
return;
}

lastGbSubmissionTime= now;

const data = {
name: `*${name}`,
comment: `*${message}`,
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
const welcomeMessage = document.querySelector('p.text-base');
welcomeMessage.textContent = "Thank you for your comment!";

  setTimeout(() => {
    welcomeMessage.textContent = "Welcome! Be nice.";
  }, 5000);
  loadGuestbookComments();
  });

  /*const name = this.name.value.trim();
  const message = this.message.value.trim();
  if (!name || !message) return;

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    await fetch('YOUR_SUBMIT_URL_HERE', {
      method: 'POST',
      body: new URLSearchParams({ name, message })
    });

    this.reset();
    //loadGuestbookComments(); 
  } catch (err) {
    alert('Failed to send message');
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});*/
loadGuestbookComments();
}
                                                          


async function loadGuestbookComments() {
  const container = document.getElementById('guestbookComments');
  if (!container) {
    console.error('guestbookComments container not found');
    return;
  }

  container.innerHTML = '<p class="text-pink-50 text-sm">Loading ฅᨐฅ...</p>';

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbwcLIsPGubHvVtcUnP2XLYz6x9DKqKTJ64Yusz67w4-bUn9NHaMW21VqmV7f2v5g-T_Ig/exec');
    const raw = await response.text();
    console.log('RAW response:', raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (jsonErr) {
      console.error('Failed to parse JSON:', jsonErr);
      container.innerHTML = '<p class="text-red-400 text-sm">Invalid JSON response.</p>';
      return;
    }

    const { comments } = data;
    if (!Array.isArray(comments)) {
      console.error('Expected comments array but got:', comments);
      container.innerHTML = '<p class="text-red-400 text-sm">Unexpected data format.</p>';
      return;
    }

    console.log('Parsed comments:', comments);

    comments.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA; 
    });

    container.innerHTML = '';

    comments.forEach(entry => {
      const { name, comment, timestamp } = entry;
      console.log('Rendering comment from:', name);

      const div = document.createElement('div');
      div.className = 'bg-pink-50 bg-opacity-[0.03] rounded p-3 mb-2 text-sm text-pink-100';

      div.innerHTML = `
        <div class="mb-1 font-semibold text-white text-pink-glow">${name || 'Anonymous'}</div>
        <div class="mb-1">${comment || ''}</div>
        <div class="text-pink-50 text-xs text-right">${timestamp ? new Date(timestamp).toLocaleString() : ''}</div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error('Error loading comments:', err);
    container.innerHTML = '<p class="text-red-400 text-sm">Failed to load comments.</p>';
  }
}


function closeGuestBook() {
  const gbWindow = document.getElementById('guestBookWindow');
  const commentBox = document.getElementById('guestbookComments');
  if (gbWindow) gbWindow.remove();
  if (commentBox) commentBox.remove();
}

function showMessageForm() {

document.getElementById('terminalContent').innerHTML = `
    <form id="guestbookForm" class="space-y-4 mt-4">
      <input id="name" type="text" name="name" placeholder="meower" class="w-full p-2 rounded bg-black text-white border border-pink-300 bg-opacity-20 border-opacity-75" required>
      <textarea id="message" name="message" placeholder="meow" class="w-full p-2 rounded bg-black text-white border border-pink-300 bg-opacity-20 border-opacity-75" required></textarea>
      <div class="flex justify-center space-x-4 flex-wrap">
      <button type="submit" class="terminal-button">Submit</button>
      <button type="button" class="terminal-button" onclick="resetTerminal()">Back</button>
      </div>
      <div id="formResponse" class="text-pink-300 text-md mt-2 mb-4 text-center"></div>
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
             <div id="typed" class="text-pink-300 text-lg mb-4 mt-4 text-center"></div>
             <div id="buttonRow" class="flex justify-center space-x-4 flex-wrap sm:flex-nowrap">
             <button class="terminal-button ml-2" onclick="showArt()">Art</button>
             <button class="terminal-button ml-5" onclick="showGuestBook()">Guestbook</button>
             <button class="terminal-button ml-3" onclick="showMessageForm()">Message</button>
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
backSpeed: 30,
showCursor: true,
cursorChar: '_',
smartBackspace: false,
loop: true,
});
}

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);














