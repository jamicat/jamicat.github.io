const themes = {
  Default: {
    glowPrimary: 'text-blue-glow',      
    glowSecondary: 'text-pink-glow',   
    typed2Text: 'guest wall!',
    typed3Text: 'jamie',
    avatar: 'acl.png',
    gbAvatar: 'aclolly.png',
    headingFont: 'Fink',
    bodyFont: 'nintendoh',
    buttonColor: 'bg-transparent hover:bg-transparent',
    buttonTextColor: 'text-white text-blue-glow',
    iconColor: 'text-red-300 hover:text-blue-200',
    hoverRing: 'hover:ring-blue-200',
    galaxyActive: 'text-blue-200',
    galaxyInactive: 'text-red-300',
    playActive: 'text-blue-200',
    playInactive: 'text-red-300',
    terminalColor: 'bg-transparent',
    terminal2Bg: 'bg-transparent',
    gwterminalBg: 'bg-transparent',
    borderColor: 'rgba(255,255,255,0.15)', 
    shadowColor: 'rgba(255,255,255,0.08)'
    
  },

  Cat: {
    glowPrimary: 'text-blue-glow',      
    glowSecondary: 'text-pink-glow',  
    typedOverride: 'text-rose-200',
    typed2Text: 'guest wall"',
    typed3Text: '-jamie',
    avatar: 'haato1.png',
    gbAvatar: 'haatowing.png',
    headingFont: 'all_starregular',
    bodyFont: 'spirits',
    buttonColor: 'bg-transparent hover:bg-transparent',
    buttonTextColor: 'text-white text-blue-glow',
    iconColor: 'text-rose-200 hover:text-white',
    hoverRing: 'hover:ring-teal-400',
    galaxyActive: 'text-white',
    galaxyInactive: 'text-rose-200',
    playActive: 'text-white',
    playInactive: 'text-rose-200',
    terminalColor: 'bg-blue-200/5',
    terminal2Bg: 'bg-blue-200/5',
    gwterminalBg: 'bg-blue-200/5',
    borderColor: 'rgba(255,255,255,0.15)', 
    shadowColor: 'none'
  },

  Stars: {
   glowPrimary: 'text-pink-glow',     
    glowSecondary: 'text-red-glow',   
    typed2Text: 'guest wall!',
    typed3Text: 'jamie',
    avatar: 'g1.gif',
    gbAvatar: 'pbcat.gif',
    headingFont: 'nunito',
    bodyFont: 'nunito',
    buttonColor: 'bg-red-300 hover:bg-red-400',
    buttonTextColor: 'text-black',
    iconColor: 'text-red-300 hover:text-cyan-400',
    hoverRing: 'hover:ring-cyan-400',
    galaxyActive: 'text-cyan-400',
    galaxyInactive: 'text-red-300',
    playActive: 'text-cyan-400',
    playInactive: 'text-red-300',
    terminalColor: 'bg-black/20',
    terminal2Bg: 'bg-black/20',
    gwterminalBg: 'bg-black/20',
    borderColor: 'transparent',
    shadowColor: 'none'
  },

  Aero: {
    glowPrimary: 'text-cyan-glow',     
    glowSecondary: 'text-blue-glow',
    typed2Text: 'guest wall!',
    typed3Text: 'jamie',
    avatar: 'acl.png',
    gbAvatar: 'aclolly.png',
    headingFont: 'Fink',
    bodyFont: 'nintendoh',
    buttonColor: 'bg-transparent hover:bg-transparent',
    buttonTextColor: 'text-white text-cyan-glow',
    iconColor: 'text-sky-100 hover:text-cyan-400',
    hoverRing: 'hover:ring-sky-400',
    galaxyActive: 'text-sky-100',
    galaxyInactive: 'text-sky-100',
    playActive: 'text-cyan-400',
    playInactive: 'text-sky-100',
    terminalColor: 'bg-transparent',
    terminal2Bg: 'bg-transparent',
    gwterminalBg: 'bg-transparent',
    borderColor: 'rgba(255,255,255,0.15)', 
    shadowColor: 'rgba(255,255,255,0.08)'
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return console.warn(`Theme not found: ${themeName}`);

  document.documentElement.setAttribute('data-theme', themeName);
  document.documentElement.setAttribute('data-theme', themeName);
  document.documentElement.classList.toggle(
  'theme-stars',
  themeName === 'Stars'
 );

document.documentElement.classList.toggle(
  'theme-cat',
  themeName === 'Cat'
);

  const mainAvatar = document.getElementById('mainAvatar');
  if (mainAvatar && theme.avatar) {
    mainAvatar.src = theme.avatar;
  }

  const gbAvatar = document.getElementById('gbAvatar');
  if (gbAvatar && theme.gbAvatar) {
    gbAvatar.src = theme.gbAvatar;
  }

  document.querySelectorAll('.replyAvatar').forEach(img => {
    if (theme.replyAvatar) {
      img.src = theme.replyAvatar;
    }
  });

  document.documentElement.style.setProperty(
    '--heading-font',
    theme.headingFont
  );
  
  document.documentElement.style.setProperty(
    '--body-font',
    theme.bodyFont
  );

const typed3El = document.getElementById('typed3');

if (typed3El) {
  typed3El.textContent = theme.typed3Text || 'jamie';
}

const typed2El = document.getElementById('typed2');

if (typed2El) {
  typed2El.textContent = theme.typed2Text || 'guest wall!';
}

 document.querySelectorAll('.terminal-button:not(.guestbook-submit)').forEach(btn => {
  btn.classList.add('theme-body');
  Object.values(themes).forEach(t => {
    t.buttonTextColor.split(' ').forEach(cls => {
      btn.classList.remove(cls);
    });
    t.buttonColor.split(' ').forEach(cls => {
      btn.classList.remove(cls);
    });
  });
  theme.buttonTextColor.split(' ').forEach(cls => {
    btn.classList.add(cls);
  });
  theme.buttonColor.split(' ').forEach(cls => {
    btn.classList.add(cls);
  });
});

  const icons = document.querySelectorAll('#videoToggle, #nextTrack, #changeTheme');
  icons.forEach(icon => {
    icon.className = `${theme.iconColor} transition-colors duration-200 text-lg leading-none`;
  });

const terminal = document.getElementById('terminal');

if (terminal) {
  terminal.classList.remove('no-decor');

  if (themeName === 'Stars') {
    terminal.classList.add('no-decor');
  }
}
  
if (terminal) {
  terminal.classList.forEach(cls => {
    if (cls.startsWith('bg-')) terminal.classList.remove(cls);
  });
  terminal.classList.add(theme.terminalColor);
  terminal.style.boxShadow =
  themeName === 'Stars' || themeName === 'Cat'
    ? 'none'
    : `3px 3px 0 ${theme.shadowColor}`;
  terminal.style.borderColor = theme.borderColor;
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

const toggleBtn = document.getElementById('videoToggle');
if (toggleBtn) {
  Object.values(themes).forEach(t => {
    toggleBtn.classList.remove(t.playActive, t.playInactive);
  });

  if (isPlaying) {
    toggleBtn.classList.add(theme.playActive);
  } else {
    toggleBtn.classList.add(theme.playInactive);
  }
}
  
  document.querySelectorAll(
  '.text-blue-glow, .text-pink-glow, .text-red-glow, .text-aquag-glow, .text-cyan-glow, .text-darkblue-glow'
).forEach(el => {
  if (el.classList.contains('no-theme-glow')) return;
  el.classList.remove('text-blue-glow', 'text-pink-glow', 'text-red-glow', 'text-aquag-glow', 'text-cyan-glow', 'text-darkblue-glow');
  el.classList.add(theme.glowPrimary);
});
  localStorage.setItem('theme', themeName);

  document.querySelectorAll('.terminal2').forEach(el => {
  Object.values(themes).forEach(t => {
    el.classList.remove(t.terminal2Bg);
  });
  el.classList.add(theme.terminal2Bg);
});

document.querySelectorAll('.gwterminal').forEach(el => {
  Object.values(themes).forEach(t => {
    el.classList.remove(t.gwterminalBg);
  });
  el.classList.add(theme.gwterminalBg);
  el.classList.remove('no-decor');
  if (themeName === 'Stars') {
    el.classList.add('no-decor');
  }
  el.style.borderColor = theme.borderColor;

  el.style.boxShadow =
     themeName === 'Stars' || themeName === 'Cat'
      ? 'none'
      : `3px 3px 0 ${theme.shadowColor}`;
});

const typedEl = document.getElementById('typed');
if (typedEl) {
  const allowed = [
    'text-blue-glow',
    'text-pink-glow',
    'text-red-glow',
    'text-aquag-glow',
    'text-cyan-glow',
    'text-darkblue-glow'
  ];

  typedEl.classList.remove(...allowed);
  if (theme.typedOverride) {
    typedEl.classList.add(theme.typedOverride);
  }
}
}

function updatePlayButtonTheme() {
  const themeName = localStorage.getItem('theme') || 'Default';
  const theme = themes[themeName];
  const toggleBtn = document.getElementById('videoToggle');
  Object.values(themes).forEach(t => {
    toggleBtn.classList.remove(t.playActive, t.playInactive);
  });
  if (isPlaying) {
    toggleBtn.classList.add(theme.playActive);
  } else {
    toggleBtn.classList.add(theme.playInactive);
  }
}

let typedInstance;

function initTyped(themeName = 'Default') {
  const typedEl = document.getElementById('typed');
  if (!typedEl) return; 

  if (typedInstance) {
    typedInstance.destroy();
  }

  const glow = themes[themeName].glowPrimary || 'text-aquag-glow';

  const strings = [
    `<span class="text-white theme-body text-sm mr-2 ${glow}">select one!</span>`,
  ];

  typedInstance = new Typed('#typed', {
    strings,
    typeSpeed: 30,
    backSpeed: 30,
    showCursor: false,
    smartBackspace: false,
    loop: false
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

let PLAYLIST = []

async function loadPlaylist() {
  const res = await fetch('/api/playlist');
  PLAYLIST = await res.json();
  return PLAYLIST;
}

let player;
let isPlaying = false;
let galaxyVisible = false;
let playerReady = false;
let ytReady = false;
let playlistReady = false;
loadPlaylist().then(() => {
  playlistReady = true;
  initTyped(localStorage.getItem('theme') || 'Default');

  if (PLAYLIST?.length) {
    const posterEl = document.getElementById('videoPoster');
    const currentVideoId = PLAYLIST[0].videoId;

    if (posterEl && currentVideoId) {
      const highRes = `https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`;
      posterEl.style.backgroundImage = `url(${highRes})`;
    }
  }
  maybeInitPlayer();
});
window.onYouTubeIframeAPIReady = () => {
  ytReady = true;
  maybeInitPlayer();
};

function maybeInitPlayer() {
  if (!ytReady || !playlistReady) return;
  player = new YT.Player('background-video-iframe', {
    videoId: PLAYLIST[0].videoId,
    playerVars: {
      autoplay: 0,
      mute: 0,
      controls: 0,
      loop: 1,
      playlist: PLAYLIST.map(v => v.videoId).join(','),
      playsinline: 1,
      modestbranding: 1,
      rel: 0,
      fs: 0,
      showinfo: 0,
      iv_load_policy: 3
    },
    events: {
      onReady: () => {
  playerReady = true;
  const savedVolume =
    parseInt(localStorage.getItem('volume') || '50', 10);
  player.setVolume(savedVolume);
  if (volumeSlider) {
    volumeSlider.value = savedVolume;
  }
},
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

function onYouTubeIframeAPIReady() {
  player = new YT.Player('background-video-iframe', {
    videoId: PLAYLIST?.[0]?.videoId || '',
    playerVars: {
      autoplay: 0,
      mute: 0,
      controls: 0,
      loop: 1,
      playlist: PLAYLIST.map(v => v.videoId).join(','),
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

async function initPoster() {
  const posterEl = document.getElementById('videoPoster');
  const currentVideoId = PLAYLIST?.[0]?.videoId;
  if (!currentVideoId || !posterEl) return;
  const highRes = `https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`;
  const fallback = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
  const img = new Image();
  img.onload = () => {
    posterEl.style.backgroundImage = `url(${highRes})`;
  };
  img.onerror = () => {
    posterEl.style.backgroundImage = `url(${fallback})`;
  };
  img.src = highRes;
}

const toggleBtn = document.getElementById('videoToggle');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const themeBtn = document.getElementById('changeTheme');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');
let previousVolume = 50;
let muted = false;

if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    if (!player || !playerReady) return;
    const volume = parseInt(e.target.value, 10);
    player.setVolume(volume);
    localStorage.setItem('volume', volume);
    if (volume === 0) {
      muted = true;
      document.getElementById('wave1').style.display = 'none';
      document.getElementById('wave2').style.display = 'none';
      document.getElementById('muteLine1').style.display = '';
      document.getElementById('muteLine2').style.display = '';
    } else {
      previousVolume = volume;
      muted = false;
      document.getElementById('wave1').style.display = '';
      document.getElementById('wave2').style.display = '';
      document.getElementById('muteLine1').style.display = 'none';
      document.getElementById('muteLine2').style.display = 'none';
    }
  });
}

volumeIcon.addEventListener('click', () => {
  if (!player || !playerReady) return;
  if (!muted) {
    previousVolume = parseInt(volumeSlider.value, 10);
    player.setVolume(0);
    volumeSlider.value = 0;
    document.getElementById('wave1').style.display = 'none';
    document.getElementById('wave2').style.display = 'none';
    document.getElementById('muteLine1').style.display = '';
    document.getElementById('muteLine2').style.display = '';
    muted = true;
  } else {
    player.setVolume(previousVolume);
    volumeSlider.value = previousVolume;
    document.getElementById('wave1').style.display = '';
    document.getElementById('wave2').style.display = '';
    document.getElementById('muteLine1').style.display = 'none';
    document.getElementById('muteLine2').style.display = 'none';
    muted = false;
  }
});

toggleBtn.addEventListener('click', () => {
  if (!player || !playerReady) return;
  const themeName = localStorage.getItem('theme') || 'Default';
  const theme = themes[themeName];
  if (isPlaying) {
    player.pauseVideo();
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    toggleBtn.classList.remove(theme.playActive);
    toggleBtn.classList.add(theme.playInactive);
  } else {
    player.playVideo();
    pauseIcon.classList.remove('hidden');
    playIcon.classList.add('hidden');
    toggleBtn.classList.remove(theme.playInactive);
    toggleBtn.classList.add(theme.playActive);
  }
  isPlaying = !isPlaying;
  updatePlayButtonTheme();
});

document.getElementById('nextTrack').addEventListener('click', () => {
  if (player && typeof player.nextVideo === 'function') {
    const currentIndex = PLAYLIST.findIndex(v => v.videoId === player.getVideoData().video_id);
    const nextIndex = (currentIndex + 1) % PLAYLIST.length;
    player.loadVideoById(PLAYLIST[nextIndex].videoId);
    isPlaying = true;
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    const themeName = localStorage.getItem('theme') || 'Default';
    const theme = themes[themeName];
    toggleBtn.classList.remove(theme.playInactive);
    toggleBtn.classList.add(theme.playActive);
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

  let html = `<div class="space-y-4 mt-4">`;

  PLAYLIST.forEach(item => {
    html += `
      <div class="flex items-center space-x-3">
        <a href="${item.channelUrl}" target="_blank">
          <img src="${item.channelAvatar}" width="40" height="40" class="rounded-full" />
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
}

document.addEventListener('DOMContentLoaded', () => {
  const changeThemeBtn = document.getElementById('changeTheme');
  const tooltip = document.getElementById('tooltip');
  const catBtn = document.getElementById('themeCat');
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

  catBtn.addEventListener('click', () => {
    applyTheme('Cat');
    initTyped('Cat');
    hideTooltip();
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
  <div id="artGallery" class="grid grid-cols-2 gap-4">
   <a href="2.png" class="block rounded overflow-hidden">
    <img src="2.png" alt="jamie - saproena" class="rounded hover:scale-105 transition transform duration-200" />
      </a>
    <a href="anim_jam.gif" class="block rounded overflow-hidden">
    <img src="anim_thumb.jpg" alt="jamie - xandy" class="rounded hover:scale-105 transition transform duration-200" />
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
      <div id="about" class="text-blue-glow text-white theme-body text-sm mb-4 mt-4">libraries used:</div>
      <ul class="list-disc list-inside text-white space-y-1">
      <li id="about" class="text-blue-glow text-white theme-body text-xs">jquery, typed.js, interact.js, tailwind css, youtube iframe api, lightgallery, three.js, cloudflare worker & apis, websockets (guest wall updates), sqlite db, custom guest wall api, custom playlist api, local storage (themes)</li>
      </ul>
      </div>
      <div id="buttonRow" class="flex justify-center">
      <button class="terminal-button" onclick="resetTerminal()">back</button>
      </div>
      `);
  //changeTyped3('<span class="text-white text-xl mr-2 text-blue-glow">About</span>');
  const currentTheme = localStorage.getItem('theme') || 'Default';
  applyTheme(currentTheme);
}

/*function aboutPost() {

const terminal = document.getElementById('terminal');
terminal.classList.remove('sm:w-[480px]');
terminal.classList.add('sm:w-[600px]');
  
   $('#terminalContent').html(`
    <div class="text-pink-100 text-[13px] font-medium space-y-4">

 <div class="flex justify-center">
      <p>
        <a href="https://www.youtube.com/" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="text-blue-glow hover:text-white hover:underline transition font-medium">
          Song title
        </a>
      </p>
      </div>

      <p>
    
      </p>
      
    

      <p>
       
      </p>
    </div>

    <div id="buttonRow" class="flex justify-center mt-4">
      <button class="terminal-button" onclick="siteFAQ()">Back</button>
    </div>
  `);


 const currentTheme = localStorage.getItem('theme') || 'Default';
 applyTheme(currentTheme);
}

function somethingNew() {
  $('#terminalContent').html(`
  `);

  const currentTheme = localStorage.getItem('theme') || 'Default';
  applyTheme(currentTheme);
}*/

let lastSubmissionTime = 0;
let lastGbSubmissionTime = 0;
let guestbookSocket = null;

function showGuestBook() {

  if (document.getElementById('guestBookWindow')) {
    return;
  }

   const guestBookWindow = document.createElement('div');
  guestBookWindow.className = `
  terminal2
  absolute
  p-6
  max-w-full
  w-[90vw]
  sm:w-[500px]
  text-white
  rounded-3xl
  border
  border-pink-200/20
`;
  guestBookWindow.style.zIndex = 11;
  guestBookWindow.style.top = '50%';
  guestBookWindow.style.left = '50%';
  guestBookWindow.style.transform = 'translate(-50%, -50%)';
  guestBookWindow.id = 'guestBookWindow';

 guestBookWindow.innerHTML = `<div class="drag-area flex justify-between items-center select-none mb-2 text-sm"> 
 <span class="flex items-center space-x-2"> 
 <img id="gbAvatar" src="aclolly.png" alt="Avatar2" class="avatar-icon2" />
 <span id="typed2" class="theme-heading font-medium text-3xl mt-10 mb-3 text-blue-glow no-theme-glow"> guest wall!
 </span> 
 </span> 
 <div class="flex items-center space-x-2 mr-3 -mt-12"> 
 <button onclick="closeGuestBook()" class="text-pink-200 hover:text-pink-100 transition-colors duration-200 text-lg leading-none"> 
 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-pink-200 hover:text-pink-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> 
 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> 
 </svg> 
 </button> 
 </div> 
 </div> 
 <div class="flex flex-col sm:flex-row gap-6"> 
 <div class="w-full">
 <div class="text-blue-100/80 text-md mt-2 mb-4 text-center"> 
 <p id="welcomeMessage" class="text-blue-glow text-white theme-body text-sm"> meow! </p> </div>
 <form id="guestbookForm" class="space-y-4 text-blue-100"> 
 <input id="name" type="text" name="name" placeholder="name" class="theme-body text-xs w-full p-2 rounded bg-pink-100/10 text-pink-100 placeholder-blue-100/80" required /> 
 <textarea id="message" name="message" placeholder="message" class="theme-body text-xs w-full p-2 rounded bg-pink-100/10 text-pink-100 placeholder-blue-100/80" required ></textarea> 
 <div class="text-center"> 
 <button type="submit" class="theme-body text-xs terminal-button text-white guestbook-submit" > submit </button> 
 </div> 
 </form> 
 </div> 
 </div>`;
document.body.appendChild(guestBookWindow);

/*var typed2 = new Typed('#typed2', {
  strings: ['guestbook'],  
  typeSpeed: 0,            
  backSpeed: 0,
  showCursor: false,
  smartBackspace: false,
  loop: false
});*/

const guestbookCommentBox = document.createElement('div');
guestbookCommentBox.id = 'guestbookComments';
guestbookCommentBox.className = `
  gwterminal
  absolute
  p-4
  w-[300px]
  overflow-y-auto
  border
  border-pink-200/20
  text-white
  text-sm
  scrollbar-thin
  scrollbar-thumb-pink-300
  scrollbar-track-transparent
  rounded-3xl
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
name: name,
comment: message,
timestamp: new Date().toISOString(),
};

const url = "/api/comments";

await fetch(url, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data),
});

document.getElementById("name").value = "";
document.getElementById("message").value = "";
const welcomeMessage = document.querySelector('p.text-base');
welcomeMessage.textContent = "submitted ᨐ";

  setTimeout(() => {
    welcomeMessage.textContent = "leave a message!";
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
function connectGuestbookSocket() {
  if (guestbookSocket && guestbookSocket.readyState === WebSocket.OPEN) {
    return;
  }
  guestbookSocket = new WebSocket(`wss://${location.host}/api/ws`);
  guestbookSocket.onmessage = (event) => {
    if (event.data === "refresh") {
      loadGuestbookComments();
    }
  };
  guestbookSocket.onclose = () => {
    console.log("Guestbook WS closed, reconnecting...");
    setTimeout(connectGuestbookSocket, 2000);
  };
  guestbookSocket.onerror = (err) => {
    console.error("Guestbook WS error:", err);
  };
}
connectGuestbookSocket();
loadGuestbookComments();

const currentTheme = localStorage.getItem('theme') || 'Default';
applyTheme(currentTheme);
}
                                                          
async function loadGuestbookComments() {

  fetchDiscordStatus();

  const container = document.getElementById('guestbookComments');
  if (!container) return;

  container.innerHTML = '<p class="text-blue-100 text-sm">Loading ฅᨐฅ</p>';

  try {

    const response = await fetch('/api/list');
    const data = await response.json();

    const comments = data.comments || [];

    container.innerHTML = '';

    comments.forEach(entry => {

      const div = document.createElement('div');

      div.className = 'bg-pink-50 bg-opacity-[0.03] rounded p-3 mb-2 text-sm';

div.innerHTML = `
  <div class="gb-name theme-body text-sm mb-1 font-medium text-white text-blue-glow no-theme-glow break-all">
    ${entry.name || 'Anonymous'}
  </div>

  <div class="gb-comment theme-body text-[0.65rem] mb-1 text-pink-100 break-all">
    ${entry.comment || ''}
  </div>

  <div class="text-blue-100 opacity-80 text-[0.55rem] text-right">
    ${entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
  </div>

  ${
    entry.reply
      ? `
      <div class="border-t border-dashed border-blue-100/80 my-3 opacity-60"></div>

      <div class="mb-1 flex items-center gap-1 font-medium">
  <img class="replyAvatar w-8 h-8 rounded-full shadow-md object-cover" alt="Discord Avatar">
  <span class="gb-name theme-body text-sm text-white text-blue-glow">jamie</span>
</div>

      <div class="gb-comment theme-body text-[0.70rem] mb-1 text-pink-100 break-all">
        ${entry.reply}
      </div>

      <div class="text-blue-100 opacity-80 text-[0.55rem] text-right">
        ${entry.reply_timestamp
          ? new Date(entry.reply_timestamp).toLocaleString()
          : ''
        }
      </div>
      `
      : ''
  }
`;

      container.appendChild(div);

    });
    
    const theme = localStorage.getItem('theme') || 'Default';
    applyTheme(theme);
    fetchDiscordStatus();

  } catch (err) {

    console.error("Guestbook load error:", err);
    container.innerHTML = '<p class="text-blue-100 text-sm">Failed to load.</p>';

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
});

document.getElementById("name").value = "";
document.getElementById("message").value = "";
document.getElementById("formResponse").textContent = "meow!";
}

function resetTerminal() {

const terminal = document.getElementById('terminal');
terminal.classList.remove('sm:w-[600px]');
terminal.classList.add('sm:w-[480px]');
  
  $('#terminalContent').html(`
  <div id="typed" class="text-pink-300 text-lg mb-4 mt-4 text-center"></div>
  <div id="buttonRow" class="flex justify-center space-x-4 flex-wrap sm:flex-nowrap">
    <button class="theme-body text-xs terminal-button ml-2" onclick="showArt()">art</button>
    <button class="theme-body text-xs terminal-button" onclick="showList()">playlist</button>
    <button class="terminal-button ml-5 theme-body text-xs" onclick="showGuestBook()">guest wall</button>
    <button class="theme-body text-xs terminal-button ml-2" onclick="siteFAQ()">about</button>
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
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    savedTheme = 'Default';
    localStorage.setItem('theme', savedTheme);
  }
  applyTheme(savedTheme);
  initTyped(savedTheme);
});
