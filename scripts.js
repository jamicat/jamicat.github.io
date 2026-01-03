const themes = {
  Default: {
    glowPrimary: 'text-pink-glow',     
    glowSecondary: 'text-red-glow',    
    buttonColor: 'bg-red-300 hover:bg-red-400',
    buttonTextColor: 'text-black',
    iconColor: 'text-red-300 hover:text-cyan-400',
    galaxyActive: 'text-red-300',
    galaxyInactive: 'text-red-300',
    terminalColor: 'bg-black/25'
  },

  Stars: {
    glowPrimary: 'text-blue-glow',      
    glowSecondary: 'text-pink-glow',    
    buttonColor: 'bg-red-300 hover:bg-red-400',
    buttonTextColor: 'text-white',
    iconColor: 'text-red-300 hover:text-cyan-400',
    galaxyActive: 'text-red-300',
    galaxyInactive: 'text-red-300',
    terminalColor: 'bg-black/20'
  },

  Aero: {
    glowPrimary: 'text-cyan-glow',     
    glowSecondary: 'text-blue-glow',
    buttonColor: 'bg-sky-100 hover:bg-sky-300',
    buttonTextColor: 'text-black',
    iconColor: 'text-sky-100 hover:text-cyan-400',
    galaxyActive: 'text-sky-100',
    galaxyInactive: 'text-sky-100',
    terminalColor: 'bg-white/10'
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return console.warn(`Theme not found: ${themeName}`);

  document.documentElement.setAttribute('data-theme', themeName);

  document.querySelectorAll('.terminal-button:not(.guestbook-submit)').forEach(btn => {
    btn.className = `terminal-button ${theme.buttonColor} ${theme.buttonTextColor} px-3 py-1.5 mt-3 rounded-xl transition duration-300 ease-in-out hover:scale-105 active:scale-95 text-sm`;
});

  const icons = document.querySelectorAll('#videoToggle, #nextTrack, #changeTheme');
  icons.forEach(icon => {
    icon.className = `${theme.iconColor} transition-colors duration-200 text-lg leading-none`;
  });

const terminal = document.getElementById('terminal');
if (terminal) {
  terminal.classList.forEach(cls => {
    if (cls.startsWith('bg-')) terminal.classList.remove(cls);
  });
  terminal.classList.add(theme.terminalColor);
}

const rewind10 = document.getElementById('rewind10');
if (rewind10) {
  Object.values(themes).forEach(t => {
    rewind10.classList.remove(t.galaxyActive, t.galaxyInactive);
  });

  if (typeof galaxyVisible !== 'undefined' && galaxyVisible) {
    rewind10.classList.add(theme.galaxyActive);
  } else {
    rewind10.classList.add(theme.galaxyInactive);
  }
}
  
  document.querySelectorAll(
  '.text-blue-glow, .text-pink-glow, .text-red-glow, .text-green-glow, .text-cyan-glow'
).forEach(el => {
  if (el.classList.contains('no-theme-glow')) return; 
  el.classList.remove('text-blue-glow', 'text-pink-glow', 'text-red-glow', 'text-green-glow', 'text-cyan-glow');
  el.classList.add(theme.glowPrimary);
});

  localStorage.setItem('theme', themeName);
}

let typedInstance;

function initTyped(themeName = 'Default') {
  const typedEl = document.getElementById('typed');
  if (!typedEl) return; 

  if (typedInstance) {
    typedInstance.destroy();
  }

  const glow = themes[themeName].glowPrimary || 'text-blue-glow';

  const strings = [
    `<span class="text-white text-xl mr-2 ${glow}">meow</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">mew</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">nya</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">mrow</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">meow</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">mew</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">nya</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">mrow</span>`,
    `<span class="text-white text-xl mr-2 ${glow}">i made the most of what i know...</span>`
  ];

  typedInstance = new Typed('#typed', {
    strings,
    typeSpeed: 60,
    backSpeed: 30,
    showCursor: false,
    smartBackspace: false,
    loop: true
  });
}

/*var typed3 = new Typed('#typed3', {
  strings: ['<span class="text-white text-xl mr-2 text-blue-glow">Jamie</span>'],
  typeSpeed: 80,
  backspeed: 70,
  showCursor: false,
  cursorChar: '_',
  loop: false,
});*/

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
playlist: 'pf3KyEnacJ8',
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

const videoId = 'pf3KyEnacJ8';
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

rewind10.classList.remove(
  'text-purple-200',
  'text-purple-50',
  'text-pink-500',
  'text-cyan-100'
);
  
const themeName = localStorage.getItem('theme') || 'Default';
const theme = themes[themeName];
  
  if (galaxyVisible) {
    galaxyVisible = false;
    rewind10.classList.remove(theme.galaxyActive);
    rewind10.classList.add(theme.galaxyInactive);
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
  } else {
    galaxyVisible = true;
    rewind10.classList.remove(theme.galaxyInactive);
    rewind10.classList.add(theme.galaxyActive);
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = 'auto';
  }
});

//rewind10.click();

function showList() {
const playlist = [
{
title: "YUNGBLUD, The Smashing Pumpkins - Zombie ",
videoId: "pf3KyEnacJ8",
channelAvatar: "https://yt3.googleusercontent.com/nYTKh5VVSOqq9vK5CoEQY8HWlMxKshHQ0H_eM0lBraA7YtQqwDavCFTYRUHH5DG07SWwRNfn=s160-c-k-c0x00ffffff-no-rj",
channelUrl: "https://www.youtube.com/@yungblud"
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
    <button class="terminal-button" onclick="resetTerminal()">back</button>
  </div>
`;

$('#terminalContent').html(html);

const currentTheme = localStorage.getItem('theme') || 'Default';
applyTheme(currentTheme);

//changeTyped3('<span class="text-white text-xl mr-2 text-blue-glow">Playlist</span>');
}

document.addEventListener('DOMContentLoaded', () => {
  const changeThemeBtn = document.getElementById('changeTheme');
  const tooltip = document.getElementById('tooltip');
  const defaultBtn = document.getElementById('themeDefault');
  const starsBtn = document.getElementById('themeStars');
  const aeroBtn = document.getElementById('themeAero');

  changeThemeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    const isVisible = tooltip.classList.contains('opacity-100');
    if (isVisible) hideTooltip();
    else showTooltip();
  });

  document.addEventListener('click', (e) => {
    if (!tooltip.contains(e.target) && e.target !== changeThemeBtn) {
      hideTooltip();
    }
  });

  defaultBtn.addEventListener('click', () => {
    applyTheme('Default');
    initTyped('Default');
    hideTooltip();
  });
  starsBtn.addEventListener('click', () => {
    applyTheme('Stars');
    initTyped('Stars');
    hideTooltip();
  });
  aeroBtn.addEventListener('click', () => {
    applyTheme('Aero');
    initTyped('Aero');
    hideTooltip();
  });
  function showTooltip() {
    tooltip.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
    tooltip.classList.add('opacity-100');
  }
  function hideTooltip() {
    tooltip.classList.add('opacity-0', 'pointer-events-none', 'invisible');
    tooltip.classList.remove('opacity-100');
  }
});


function showArt() {
$('#terminalContent').html(`
<div class="text-pink-300 text-lg mb-4 mt-4"></div>
  <div id="artGallery" class="grid grid-cols-3 gap-4">
  <a href="chibi.png" class="block rounded overflow-hidden">
    <img src="chibi_thumb.png" alt="Jamie - Chibi" class="rounded hover:scale-105 transition transform duration-200" />
      </a>
      <a href="sp.png" class="block rounded overflow-hidden">
    <img src="sp_thumb.png" alt="Jamie - Sketchpage" class="rounded hover:scale-105 transition transform duration-200" />
      </a>
    </div>
  <div class="mt-4 flex justify-center">
  <button class="terminal-button" onclick="resetTerminal()">back</button>
    </div>
  `);

setTimeout(() => {
lightGallery(document.getElementById('artGallery'), {
thumbnail: true,
zoom: true,
download: false,
});
}, 100); 
  
const currentTheme = localStorage.getItem('theme') || 'Default';
applyTheme(currentTheme);
//changeTyped3('<span class="text-white text-xl mr-2 text-blue-glow">Art</span>');
}

function changeTyped3(newText) {
  if (!typed3) return;

  typed3.strings = [newText];

  typed3.reset(true);
}

function siteFAQ() {
  $('#terminalContent').html(`
    <div class="text-white text-sm space-y-2 mt-6">
      <p class="cursor-pointer hover:text-white transition" onclick="somethingNew()">
        <span class="text-pink-glow">[13/10]</span> - 
        <span class="underline text-blue-glow">Hello Heaven, Hello</span>
      </p>
      <p class="cursor-pointer hover:text-white transition" onclick="aboutPost()">
        <span class="text-pink-glow">[15/08]</span> - 
        <span class="underline text-blue-glow">About</span>
      </p>
    </div>
    <div id="buttonRow" class="flex justify-center mt-4">
      <button class="terminal-button" onclick="resetTerminal()">back</button>
    </div>
  `);
  //changeTyped3('<span class="text-white text-xl mr-2 text-blue-glow">About</span>');
  const currentTheme = localStorage.getItem('theme') || 'Default';
  applyTheme(currentTheme);
}

function aboutPost() {
  $('#terminalContent').html(`
    <div class="text-pink-100 text-sm mb-4 mt-4 space-y-4">
      <p>
        Welcome to my little corner of the internet. I almost typed bespoke for lack of a better word, 
        and though it feels a bit loaded, it is exactly what this is: a small piece of shared personal space. 
        I like to litter it with occasional fur art updates, music I have been attached to lately, and bits 
        of code that refuse to stay foldered. Really, it is just whatever I feel in the moment, on a whim, 
        and if you are reading this, I hope that you find something worth your time.
      </p>
      <p>
        A creative outlet has always been a kind of lifeline for me. For some fellow furs and friends, 
        it loops back into the IT world we claim to despise, creating a curious middle ground between work and play. One friend of 
        mine has coined the phrase <em>working in hating IT</em>, which we jokingly called copium jargon, 
        and so naturally we adopted that too. 
      </p>
      <p>
        This site is my playful contradiction, a place where my busy 
        mind channels itself into something more hobbyesque, proving, ironically, that less can be more in an 
        age of information overload.
      </p>
      <p>
        Now go and click on something, or nothing. 
        <span class="text-blue-glow text-white relative inline-block group cursor-pointer underline">
          >Thanks for visiting!
          <img src="thankyou.png" alt="Thank you!"
               class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[300px] h-[311px] max-w-none z-50 rounded shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover:opacity-100 group-hover:visible pointer-events-none"/>
        </span>
      </p>
      <p class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="20" viewBox="20 20">
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="pink">tldr :3</text>
        </svg>
        <span> - dog pics soon</span>
      </p>
    </div>
    
    <div id="buttonRow" class="flex justify-center mt-4">
      <button class="terminal-button" onclick="siteFAQ()">back</button>
    </div>
  `);

 const currentTheme = localStorage.getItem('theme') || 'Default';
 applyTheme(currentTheme);
}

function somethingNew() {
  $('#terminalContent').html(`
  
    <div class="text-pink-100 text-sm mb-4 mt-4 space-y-4">
    <div class="flex justify-center mt-4">
      <p>
        <a href="https://www.youtube.com/watch?v=xrZX47RbeJs" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="text-blue-glow hover:text-white hover:underline transition">
          🖤YUNGBLUD - Hello Heaven, Hello
        </a>
      </p>
      </div>

      <p>
  <em>Last year.</em> It wasn’t my worst year, but it wasn’t my comfiest either. I’m no longer bitter about it.
</p>
<p>
  When you stay in a loop long enough, it’s easy to forget that life can actually feel different. I’m not going to overshare in a public infodump, but I felt the urge to type out some thanks for my closest friends.
</p>
<p>
  After a turning point, it took a little time to find my footing again. I projected frustration onto some friends near and dear, but through that, I started to rebuild my understanding of myself. The upside is that now, I feel healthier and happier than I can remember.
</p>
<p>
  This year, I reconnected with my love for music. I got to attend <span class="text-blue-glow text-white relative inline-block group cursor-pointer underline">
          Bludfest year 2
          <img src="bgy2.jpg" alt="Thank you!"
               class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[400px] h-[300px] max-w-none z-50 rounded shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover:opacity-100 group-hover:visible pointer-events-none"/>
        </span> at Milton Keynes and feel part of something much bigger than myself. Being part of a modern rock movement aimed at my age group wasn’t something I planned for, and the energy and collective morale completely swept me off my feet. In the months leading up to the festival, I felt a magnetic pull toward YUNGBLUD in particular, followed my gut, and met so many people from similar walks of life.
</p>
<p>
  Maybe I’m too shy or awkward to say it often, but I love my friends like family.
  
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="20 20" class="inline-block">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="pink">Thank you c:</text>
  </svg>
</p>

    </div>

    <div id="buttonRow" class="flex justify-center mt-4">
      <button class="terminal-button" onclick="siteFAQ()">back</button>
    </div>
  `);

  const currentTheme = localStorage.getItem('theme') || 'Default';
  applyTheme(currentTheme);
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
  <div class="drag-area flex justify-between items-center select-none mb-2 text-sm">
    <span class="flex items-center space-x-2">
      <img src="g1.gif" alt="Avatar2" class="avatar-icon2" />
      <span id="typed2" class="text-lg mt-4 mb-4 text-blue-glow no-theme-glow">guestbook</span>
    </span>
    <div class="flex items-center space-x-2 mr-3 -mt-12">
      <button onclick="closeGuestBook()" class="text-gray-400 hover:text-white transition-colors duration-200 text-lg leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-6">
    <div class="w-full">
      <div class="text-gray-200 text-md mt-2 mb-4 text-center">
        <p id="welcomeMessage" class="text-base">meow</p>
      </div>
      <form id="guestbookForm" class="space-y-4 text-gray-200">
        <input id="name" type="text" name="name" placeholder="name"
          class="w-full p-2 rounded border border-gray-500 bg-gray-800 bg-opacity-30 text-white" required />
        <textarea id="message" name="message" placeholder="message"
          class="w-full p-2 rounded border border-gray-500 bg-gray-800 bg-opacity-30 text-white" required></textarea>
        <div class="text-center">
          <button type="submit" class="terminal-button bg-sky-100 hover:bg-sky-300 text-black guestbook-submit">submit</button>
        </div>
      </form>
    </div>
  </div>
`;
document.body.appendChild(guestBookWindow);

var typed2 = new Typed('#typed2', {
  strings: ['guestbook'],  
  typeSpeed: 0,            
  backSpeed: 0,
  showCursor: false,
  smartBackspace: false,
  loop: false
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
alert("5 minutes between submits");
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
welcomeMessage.textContent = "meow!";

  setTimeout(() => {
    welcomeMessage.textContent = "meow";
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

 container.innerHTML = '<p class="text-gray-200 text-sm">loading ฅᨐฅ</p>';

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
  div.className = 'bg-pink-50 bg-opacity-[0.03] rounded p-3 mb-2 text-sm';

  div.innerHTML = `
    <div class="mb-1 font-semibold text-white text-blue-glow no-theme-glow">${name || 'Anonymous'}</div>
    <div class="mb-1 text-gray-200">${comment || ''}</div>
    <div class="text-gray-400 text-[0.65rem] leading-[1rem] text-right">
      ${timestamp ? new Date(timestamp).toLocaleString() : ''}
    </div>
  `;

  container.appendChild(div);
});

  } catch (err) {
    console.error('Error loading comments:', err);
    container.innerHTML = '<p class="text-gray-400 text-sm">Failed to load.</p>';
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
      <input id="name" type="text" name="name" placeholder="meower" class="w-full p-2 rounded bg-black text-white border border-pink-300 bg-opacity-20 border-opacity-50" required>
      <textarea id="message" name="message" placeholder="meow" class="w-full p-2 rounded bg-black text-white border border-pink-300 bg-opacity-20 border-opacity-50" required></textarea>
      <div class="flex justify-center space-x-4 flex-wrap">
      <button type="submit" class="terminal-button">submit</button>
      <button type="button" class="terminal-button" onclick="resetTerminal()">back</button>
      </div>
      <div id="formResponse" class="text-pink-100 text-md mt-2 mb-4 text-center"></div>
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
document.getElementById("formResponse").textContent = "meow!";
}

function resetTerminal() {
  $('#terminalContent').html(`
  <div id="typed" class="text-pink-300 text-lg mb-4 mt-4 text-center"></div>
  <div id="buttonRow" class="flex justify-center space-x-4 flex-wrap sm:flex-nowrap">
    <button class="terminal-button ml-2" onclick="showArt()">art</button>
    <button class="terminal-button ml-5" onclick="showGuestBook()">guestbook</button>
    <button class="terminal-button" onclick="showList()">playlist</button>
  </div>
`);
const currentTheme = localStorage.getItem('theme') || 'Default';
applyTheme(currentTheme);
initTyped(currentTheme);
}


const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'Default';
  applyTheme(savedTheme);
  initTyped(savedTheme);
});



























































