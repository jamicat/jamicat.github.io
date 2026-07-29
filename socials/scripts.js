const themes = {
  Default: {
    glowPrimary: 'text-blue-glow',      
    glowSecondary: 'text-pink-glow',   
    typed2Text: 'guestbook!',
    typed3Text: 'jamie',
    avatar: 'acl.png',
    gbAvatar: 'aclolly.png',
    headingFont: 'Fink',
    bodyFont: 'nintendoh',
    buttonColor: 'bg-transparent hover:bg-transparent',
    buttonTextColor: 'text-white text-blue-glow',
    aboutButtonStyle: 'bg-transparent hover:bg-transparent text-blue-200',
    iconColor: 'text-red-300 hover:text-blue-200',
    hoverRing: 'hover:ring-blue-200',
    galaxyActive: 'text-blue-200',
    galaxyInactive: 'text-red-300',
    playActive: 'text-blue-200',
    playInactive: 'text-red-300',
    terminalColor: 'bg-black/5',
    terminal2Bg: 'bg-black/5',
    gwterminalBg: 'bg-black/5',
    borderColor: 'rgba(255,255,255,0.15)', 
    shadowColor: 'none'
    
  },

  Cat: {
    glowPrimary: 'text-blue-glow',      
    glowSecondary: 'text-pink-glow',  
    typedOverride: 'text-red-200',
    typed2Text: 'guestbook"',
    typed3Text: '-jamie',
    avatar: 'haato1.png',
    gbAvatar: 'haatowing.png',
    headingFont: 'all_starregular',
    bodyFont: 'spirits',
    buttonColor: 'bg-transparent hover:bg-transparent',
    buttonTextColor: 'text-white text-blue-glow',
    aboutButtonStyle: 'bg-transparent hover:bg-transparent text-white',
    iconColor: 'text-red-200 hover:text-white',
    hoverRing: 'hover:ring-teal-400',
    galaxyActive: 'text-white',
    galaxyInactive: 'text-red-200',
    playActive: 'text-white',
    playInactive: 'text-red-200',
    terminalColor: 'bg-blue-200/5',
    terminal2Bg: 'bg-blue-200/5',
    gwterminalBg: 'bg-blue-200/5',
    borderColor: 'rgba(255,255,255,0.15)', 
    shadowColor: 'none'
  },

  Stars: {
   glowPrimary: 'text-pink-glow',     
    glowSecondary: 'text-red-glow',   
    typed2Text: 'guestbook!',
    typed3Text: 'jamie',
    avatar: 'g1.gif',
    gbAvatar: 'pbcat.gif',
    headingFont: 'nunito',
    bodyFont: 'nunito',
    buttonColor: 'bg-rose-300 hover:bg-rose-400',
    buttonTextColor: 'text-black',
    aboutButtonStyle: 'bg-[#ffad63] hover:bg-[#ffad63] text-black',
    iconColor: 'text-rose-300 hover:text-cyan-400',
    hoverRing: 'hover:ring-cyan-400',
    galaxyActive: 'text-cyan-400',
    galaxyInactive: 'text-rose-300',
    playActive: 'text-cyan-400',
    playInactive: 'text-rose-300',
    terminalColor: 'bg-black/20',
    terminal2Bg: 'bg-black/20',
    gwterminalBg: 'bg-black/20',
    borderColor: 'transparent',
    shadowColor: 'none'
  },

  Aero: {
    glowPrimary: 'text-cyan-glow',     
    glowSecondary: 'text-blue-glow',
    typed2Text: 'guestbook!',
    typed3Text: 'jamie',
    avatar: 'acl.png',
    gbAvatar: 'aclolly.png',
    headingFont: 'Fink',
    bodyFont: 'nintendoh',
    buttonColor: 'bg-transparent hover:bg-transparent',
    buttonTextColor: 'text-white text-cyan-glow',
    aboutButtonStyle: 'bg-[#ffad63]',
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

const terminalMinimizedLabel =
  document.getElementById(
    "terminalMinimizedLabel"
  );

if (terminalMinimizedLabel) {
  terminalMinimizedLabel.textContent =
    "jamie";

  terminalMinimizedLabel.classList.toggle(
    "hidden",
    !document
      .getElementById("terminal")
      ?.classList.contains(
        "terminal-minimized"
      )
  );
}

const typed2El = document.getElementById('typed2');

if (typed2El) {
  typed2El.textContent = theme.typed2Text || 'guest wall!';
}

document.querySelectorAll(
  '.terminal-button:not(.guestbook-submit):not(#aboutButton)'
).forEach(btn => {
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

const aboutBtn = document.getElementById('aboutButton');

if (aboutBtn) {
  aboutBtn.classList.add('theme-body');

  Object.values(themes).forEach(t => {
    t.buttonTextColor
      .split(' ')
      .forEach(cls => aboutBtn.classList.remove(cls));

    t.buttonColor
      .split(' ')
      .forEach(cls => aboutBtn.classList.remove(cls));

    if (t.aboutButtonStyle) {
      t.aboutButtonStyle
        .split(' ')
        .forEach(cls => aboutBtn.classList.remove(cls));
    }
  });
  
  theme.aboutButtonStyle
    .split(' ')
    .forEach(cls => aboutBtn.classList.add(cls));
}

const icons = document.querySelectorAll(
    "#videoToggle, #nextTrack, #changeTheme, #terminalMinimize"
);

icons.forEach(icon => {

    Object.values(themes).forEach(t => {
        t.iconColor
            .split(" ")
            .forEach(cls => icon.classList.remove(cls));
    });

    theme.iconColor
        .split(" ")
        .forEach(cls => icon.classList.add(cls));

    icon.classList.add(
        "transition-colors",
        "duration-200",
        "text-lg",
        "leading-none"
    );
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

  window.setTerminalPlaybackControlsVisible = function (visible) {

    toggleBtn?.classList.toggle(
        "hidden",
        !visible
    );

    document
        .getElementById("nextTrack")
        ?.classList.toggle(
            "hidden",
            !visible
        );

};
  
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

 if (window.chat?.watchParty) {
    window.setTerminalPlaybackControlsVisible(
        !window.chat.watchParty.enabled
    );
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
    `<span class="text-white theme-body text-sm mr-2 ${glow}">⋆.˚ ☾⭒.˚⏾⋆.˚</span>`,
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


function getPhoneLayoutMode() {
    const portraitPhone =
        window.matchMedia(
            "(max-width: 640px) " +
            "and (orientation: portrait) " +
            "and (pointer: coarse)"
        ).matches;

    const landscapePhone =
        window.matchMedia(
            "(max-width: 950px) " +
            "and (max-height: 500px) " +
            "and (orientation: landscape) " +
            "and (pointer: coarse)"
        ).matches;

    if (landscapePhone) {
        return "landscape";
    }

    if (portraitPhone) {
        return "portrait";
    }

    return null;
}


function clampPhoneWindowToViewport(element) {
    const phoneMode =
        getPhoneLayoutMode();

    if (!phoneMode) {
        return;
    }

  if (!element) {
    return;
}
    const transform =
        element.style.transform || "";

    const stillUsesCentredTransform =
        transform.includes(
            "translate(-50%, -50%)"
        );

    if (stillUsesCentredTransform) {
        element.style.top =
            phoneMode === "landscape"
                ? "50%"
                : "42%";

        return;
    }

    window.requestAnimationFrame(() => {
      const viewport =
    window.visualViewport;

const viewportWidth =
    viewport?.width ||
    window.innerWidth;

const viewportHeight =
    viewport?.height ||
    window.innerHeight;

const viewportLeft =
    viewport?.offsetLeft || 0;

const viewportTop =
    viewport?.offsetTop || 0;

        const edgeGap = 8;

      const leftBoundary =
    viewportLeft + edgeGap;

const topBoundary =
    viewportTop + edgeGap;

const rightBoundary =
    viewportLeft +
    viewportWidth -
    edgeGap;

const bottomBoundary =
    viewportTop +
    viewportHeight -
    edgeGap;

        const rect =
            element
                .getBoundingClientRect();

        let x =
            parseFloat(
                element.getAttribute(
                    "data-x"
                )
            ) || 0;

        let y =
            parseFloat(
                element.getAttribute(
                    "data-y"
                )
            ) || 0;

        if (rect.left < leftBoundary) {
    x += leftBoundary - rect.left;
}

       if (rect.right > rightBoundary) {
    x -= rect.right - rightBoundary;
}

        if (rect.top < topBoundary) {
    y += topBoundary - rect.top;
}

        if (rect.bottom > bottomBoundary) {
    y -= rect.bottom - bottomBoundary;
}

        element.setAttribute(
            "data-x",
            String(x)
        );

        element.setAttribute(
            "data-y",
            String(y)
        );

        element.style.transform =
            `translate(${x}px, ${y}px)`;
    });
}


let phoneTerminalResizeTimer = null;

function schedulePhoneTerminalClamp() {
    window.clearTimeout(
        phoneTerminalResizeTimer
    );

    phoneTerminalResizeTimer =
        window.setTimeout(() => {

            clampPhoneWindowToViewport(
                document.getElementById("terminal")
            );

            const chatWindow =
                document.getElementById("chatWindow");

            if (chatWindow) {
                clampPhoneWindowToViewport(chatWindow);
            }

            const guestBookWindow =
                document.getElementById("guestBookWindow");

            if (guestBookWindow) {
                clampPhoneWindowToViewport(
                    guestBookWindow
                );
            }

        }, 150);
}

clampPhoneWindowToViewport(
    document.getElementById("terminal")
);

const chatWindow =
    document.getElementById("chatWindow");

if (chatWindow) {
    clampPhoneWindowToViewport(chatWindow);
}

const guestBookWindow =
    document.getElementById("guestBookWindow");

if (guestBookWindow) {
    clampPhoneWindowToViewport(guestBookWindow);
}

window.addEventListener(
    "resize",
    schedulePhoneTerminalClamp
);

window.addEventListener(
    "orientationchange",
    schedulePhoneTerminalClamp
);

window.visualViewport?.addEventListener(
    "resize",
    schedulePhoneTerminalClamp
);

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

const API = "https://jamicat.ahrly.workers.dev";

let PLAYLIST = [];
let player = null;
let playerReady = false;
let ytReady = false;
let playlistReady = false;
let galaxyVisible = false;

let playbackMode = "normal";
let normalPlaylistIndex = 0;

let watchPartyState = {
  enabled: false,
  currentVideoId: null,
  currentIndex: 0,
  startedAt: null,
  paused: false,
  pausedAt: null,
  queue: []
};

let loadedVideoId = null;
let currentWatchPartyState = null;
let isPlaying = false;
let suppressPlayerEvents = false;
let watchPartySyncTimer = null;

const toggleBtn =
  document.getElementById("videoToggle");

const nextTrackBtn =
  document.getElementById("nextTrack");

const playIcon =
  document.getElementById("playIcon");

const pauseIcon =
  document.getElementById("pauseIcon");

const themeBtn =
  document.getElementById("changeTheme");

const terminal =
  document.getElementById("terminal");

const terminalMinimizeBtn =
  document.getElementById(
    "terminalMinimize"
  );

const terminalMinimizeIcon =
  document.getElementById(
    "terminalMinimizeIcon"
  );

const terminalRestoreIcon =
  document.getElementById(
    "terminalRestoreIcon"
  );

const terminalMinimizedLabel =
  document.getElementById(
    "terminalMinimizedLabel"
  );

let terminalMinimized = false;

const volumeSlider =
  document.getElementById("volumeSlider");

const volumeIcon =
  document.getElementById("volumeIcon");

let previousVolume = 50;
let muted = false;

function setTerminalMinimized(minimized) {
  if (!terminal) {
    return;
  }

  terminalMinimized =
    minimized === true;

  terminal.classList.toggle(
    "terminal-minimized",
    terminalMinimized
  );

  terminalMinimizeIcon?.classList.toggle(
    "hidden",
    terminalMinimized
  );

  terminalRestoreIcon?.classList.toggle(
    "hidden",
    !terminalMinimized
  );

  terminalMinimizeBtn?.setAttribute(
    "aria-expanded",
    terminalMinimized
      ? "false"
      : "true"
  );

  terminalMinimizeBtn?.setAttribute(
    "aria-label",
    terminalMinimized
      ? "restore terminal"
      : "minimize terminal"
  );

  terminalMinimizeBtn?.setAttribute(
    "title",
    terminalMinimized
      ? "restore terminal"
      : "minimize terminal"
  );
  
terminalMinimizedLabel?.classList.toggle(
  "hidden",
  !terminalMinimized
);
}

window.setTerminalMinimized =
  setTerminalMinimized;

async function loadPlaylist() {
  try {
    const response =
      await fetch(`${API}/api/playlist`);

    if (!response.ok) {
      throw new Error(
        `playlist request failed (${response.status})`
      );
    }

    const result =
      await response.json();

    PLAYLIST =
      Array.isArray(result)
        ? result
        : [];

    normalPlaylistIndex = 0;
  } catch (error) {
    console.error(
      "could not load playlist:",
      error
    );

    PLAYLIST = [];
  } finally {
    playlistReady = true;
    maybeInitPlayer();
  }
}

function getNormalVideoId() {
  return (
    PLAYLIST[normalPlaylistIndex]
      ?.videoId || null
  );
}

function getActiveVideoId() {
  if (playbackMode === "watch-party") {
    return (
      watchPartyState.currentVideoId ||
      watchPartyState.queue[
        watchPartyState.currentIndex
      ]?.videoId ||
      null
    );
  }

  return getNormalVideoId();
}

function setPoster(videoId) {
  const posterEl =
    document.getElementById("videoPoster");

  if (!posterEl) {
    return;
  }

  if (!videoId) {
    posterEl.style.backgroundImage = "none";
    posterEl.style.opacity = "0";
    return;
  }

  const highRes =
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const fallback =
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const image =
    new Image();

  image.onload = () => {
    posterEl.style.backgroundImage =
      `url(${highRes})`;
  };

  image.onerror = () => {
    posterEl.style.backgroundImage =
      `url(${fallback})`;
  };

  image.src = highRes;
}

function showBlackPlayerBackground() {
  const posterEl =
    document.getElementById("videoPoster");

  const iframeEl =
    document.getElementById(
      "background-video-iframe"
    );

  if (posterEl) {
    posterEl.style.backgroundImage = "none";
    posterEl.style.opacity = "0";
  }

  if (iframeEl) {
    iframeEl.style.opacity = "0";
  }
}

function updatePlaybackIcons(playing) {
  isPlaying = playing === true;

  playIcon?.classList.toggle(
    "hidden",
    isPlaying
  );

  pauseIcon?.classList.toggle(
    "hidden",
    !isPlaying
  );

  updatePlayButtonTheme();

  window.dispatchEvent(
    new CustomEvent(
      "site-player-state",
      {
        detail: {
          playing: isPlaying,
          mode: playbackMode,
          videoId: loadedVideoId
        }
      }
    )
  );
}

function loadActiveVideo({
  autoplay = false,
  force = false
} = {}) {
  if (!player || !playerReady) {
    return;
  }

  const videoId =
    getActiveVideoId();

  if (!videoId) {
    suppressPlayerEvents = true;

    try {
      player.stopVideo();
      player.clearVideo?.();
    } finally {
      suppressPlayerEvents = false;
    }

    loadedVideoId = null;
    updatePlaybackIcons(false);
    showBlackPlayerBackground();
    return;
  }

  if (
    !force &&
    loadedVideoId === videoId
  ) {
    if (autoplay) {
      player.playVideo();
    }

    return;
  }

  loadedVideoId = videoId;
  setPoster(videoId);

  if (autoplay) {
    player.loadVideoById(videoId);
  } else {
    player.cueVideoById(videoId);
    const posterEl =
    document.getElementById(
        "videoPoster"
    );

const iframeEl =
    document.getElementById(
        "background-video-iframe"
    );

if (posterEl) {
    posterEl.style.opacity = "1";
}

if (iframeEl) {
    iframeEl.style.opacity = "0";
}
  }
}

function applyWatchPartyState(state) {
  const previousEnabled =
    watchPartyState.enabled;

  const previousVideoId =
    watchPartyState.currentVideoId;

  watchPartyState = {
    enabled:
      state?.enabled === true,

    currentVideoId:
      state?.currentVideoId || null,

    currentIndex:
      Number.isInteger(state?.currentIndex)
        ? state.currentIndex
        : 0,

    startedAt:
      Number.isFinite(
        Number(state?.startedAt)
      )
        ? Number(state.startedAt)
        : null,

    paused:
      state?.paused === true,

    pausedAt:
      Number.isFinite(
        Number(state?.pausedAt)
      )
        ? Number(state.pausedAt)
        : null,

    queue:
      Array.isArray(state?.queue)
        ? state.queue
        : []
  };

  playbackMode =
    watchPartyState.enabled
      ? "watch-party"
      : "normal";

  window.setTerminalPlaybackControlsVisible?.(
    !watchPartyState.enabled
  );

 window.setTerminalMinimized?.(
  watchPartyState.enabled
);

  if (!player || !playerReady) {
    return;
  }

  if (!watchPartyState.enabled) {
    const leavingWatchParty =
      previousEnabled === true;

    loadActiveVideo({
      autoplay: false,
      force: leavingWatchParty
    });

    updatePlaybackIcons(false);
    return;
  }

  const videoId =
    watchPartyState.currentVideoId;

  if (!videoId) {
    loadActiveVideo({
      force: true
    });

    return;
  }

  const videoChanged =
    previousVideoId !== videoId ||
    previousEnabled !== true ||
    loadedVideoId !== videoId;

  const pausedTime =
    Number.isFinite(
      watchPartyState.pausedAt
    )
      ? Math.max(
          0,
          watchPartyState.pausedAt
        )
      : 0;

  const playingTime =
    Number.isFinite(
      watchPartyState.startedAt
    )
      ? Math.max(
          0,
          (
            Date.now() -
            watchPartyState.startedAt
          ) / 1000
        )
      : 0;

  const targetTime =
    watchPartyState.paused
      ? pausedTime
      : playingTime;

  if (videoChanged) {
    loadedVideoId = videoId;
    setPoster(videoId);

    player.loadVideoById({
  videoId,
  startSeconds: targetTime
});

if (watchPartyState.paused) {
  player.pauseVideo();
  updatePlaybackIcons(false);
} else {
  updatePlaybackIcons(true);
}

return;
  }

  const actualTime =
    typeof player.getCurrentTime ===
      "function"
      ? player.getCurrentTime()
      : 0;

  if (
    Number.isFinite(actualTime) &&
    Math.abs(
      actualTime - targetTime
    ) > 1.5
  ) {
    player.seekTo(
      targetTime,
      true
    );
  }

  if (watchPartyState.paused) {
    player.pauseVideo();
    updatePlaybackIcons(false);
  } else {
    player.playVideo();
    updatePlaybackIcons(true);
  }
}

function correctWatchPartyDrift() {
  if (
    !player ||
    !playerReady ||
    playbackMode !== "watch-party" ||
    !watchPartyState.enabled ||
    watchPartyState.paused ||
    !watchPartyState.currentVideoId ||
    !Number.isFinite(
      watchPartyState.startedAt
    )
  ) {
    return;
  }

  if (
    typeof player.getCurrentTime !==
      "function" ||
    typeof player.seekTo !==
      "function"
  ) {
    return;
  }

  const playerState =
    typeof player.getPlayerState ===
      "function"
      ? player.getPlayerState()
      : null;

  if (
    playerState !==
    YT.PlayerState.PLAYING
  ) {
    return;
  }

  const expectedTime =
    Math.max(
      0,
      (
        Date.now() -
        watchPartyState.startedAt
      ) / 1000
    );

  const actualTime =
    player.getCurrentTime();

  if (!Number.isFinite(actualTime)) {
    return;
  }

  const drift =
    expectedTime - actualTime;

  if (Math.abs(drift) <= 0.75) {
    return;
  }

  console.debug(
    "Correcting Watch Party drift:",
    {
      expectedTime,
      actualTime,
      drift
    }
  );

  player.seekTo(
    expectedTime,
    true
  );
}

function startWatchPartySyncLoop() {
  if (watchPartySyncTimer !== null) {
    return;
  }

  watchPartySyncTimer =
    window.setInterval(
      correctWatchPartyDrift,
      4000
    );
}

function maybeInitPlayer() {
  if (
    !ytReady ||
    !playlistReady ||
    player
  ) {
    return;
  }

  const initialVideoId =
    getActiveVideoId();

  player =
    new YT.Player(
      "background-video-iframe",
      {
        videoId:
          initialVideoId || "",

        playerVars: {
          autoplay: 0,
          mute: 0,
          controls: 0,
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
            startWatchPartySyncLoop();

            const savedVolume =
              parseInt(
                localStorage.getItem(
                  "volume"
                ) || "50",
                10
              );

            player.setVolume(savedVolume);

            if (volumeSlider) {
              volumeSlider.value =
                savedVolume;
            }

            if (watchPartyState.enabled) {
              applyWatchPartyState(
                watchPartyState
              );
            } else {
              loadActiveVideo({
                autoplay: false,
                force: true
              });
            }
          },

          onStateChange: event => {
            if (suppressPlayerEvents) {
              return;
            }

            const posterEl =
              document.getElementById(
                "videoPoster"
              );

            const iframeEl =
              document.getElementById(
                "background-video-iframe"
              );

            if (
              event.data ===
              YT.PlayerState.PLAYING
            ) {
              isPlaying = true;

              if (posterEl) {
                posterEl.style.opacity =
                  "0";
              }

              if (iframeEl) {
                iframeEl.style.opacity =
                  "1";
              }

              updatePlaybackIcons(true);
              return;
            }

            if (
              event.data ===
              YT.PlayerState.PAUSED
            ) {
              isPlaying = false;

              const currentVideoId =
                player
                  .getVideoData()
                  .video_id;

              setPoster(currentVideoId);

              if (posterEl) {
                posterEl.style.opacity =
                  "1";
              }

              if (iframeEl) {
                iframeEl.style.opacity =
                  "0";
              }

              updatePlaybackIcons(false);
              return;
            }
if (
  event.data ===
  YT.PlayerState.ENDED
) {
  updatePlaybackIcons(false);

  if (
    playbackMode ===
    "normal"
  ) {
    playNextNormalVideo();
    return;
  }

  if (
    playbackMode ===
    "watch-party" &&
    watchPartyState.currentVideoId
  ) {
    fetch(
      `${API}/api/watchparty/next`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          clientId:
            window.chat?.clientId ||
            null
        })
      }
    ).then(response => {
      if (!response.ok) {
        throw new Error(
          `automatic next failed (${response.status})`
        );
      }
    }).catch(error => {
      console.error(
        "Watch Party automatic next failed:",
        error
      );
    });
  }
}
          }
        }
      }
    );
}

window.onYouTubeIframeAPIReady =
  () => {
    ytReady = true;
    maybeInitPlayer();
  };

function playNextNormalVideo() {
  if (!PLAYLIST.length) {
    return;
  }

  normalPlaylistIndex =
    (
      normalPlaylistIndex + 1
    ) % PLAYLIST.length;

  loadActiveVideo({
    autoplay: true,
    force: true
  });
}

window.watchPartyPlayer = {
 applyState(state) {
  currentWatchPartyState = state;
  applyWatchPartyState(state);
},

 getState() {
    let currentTime = null;
    let duration = null;

    if (
        player &&
        playerReady
    ) {
        if (
            typeof player.getCurrentTime ===
                "function"
        ) {
            const value =
                player.getCurrentTime();

            if (Number.isFinite(value)) {
                currentTime = value;
            }
        }

        if (
            typeof player.getDuration ===
                "function"
        ) {
            const value =
                player.getDuration();

            if (Number.isFinite(value)) {
                duration = value;
            }
        }
    }

    return {
        ready: playerReady,
        playing: isPlaying,
        mode: playbackMode,
        videoId: loadedVideoId,
        currentTime,
        duration
    };
},

  play() {
    if (
      !player ||
      !playerReady ||
      !getActiveVideoId()
    ) {
      return;
    }

    player.playVideo();
  },

  pause() {
    if (
      !player ||
      !playerReady
    ) {
      return;
    }

   if (
    typeof player.pauseVideo ===
    "function"
) {
    player.pauseVideo();
}
  }
};

window.setTerminalPlaybackControlsVisible =
  function (visible) {
    toggleBtn?.classList.toggle(
      "hidden",
      !visible
    );

    nextTrackBtn?.classList.toggle(
      "hidden",
      !visible
    );
  };

terminalMinimizeBtn?.addEventListener(
  "click",
  event => {
    event.preventDefault();
    event.stopPropagation();

    setTerminalMinimized(
      !terminalMinimized
    );
  }
);

toggleBtn?.addEventListener(
  "click",
  () => {
    if (
      playbackMode !== "normal" ||
      !player ||
      !playerReady
    ) {
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
    } else if (getActiveVideoId()) {
      player.playVideo();
    }
  }
);

nextTrackBtn?.addEventListener(
  "click",
  () => {
    if (
      playbackMode !== "normal"
    ) {
      return;
    }

    playNextNormalVideo();
  }
);

if (volumeSlider) {
  volumeSlider.addEventListener(
    "input",
    event => {
      if (
        !player ||
        !playerReady
      ) {
        return;
      }

      const volume =
        parseInt(
          event.target.value,
          10
        );

      player.setVolume(volume);

      localStorage.setItem(
        "volume",
        volume
      );

      muted =
        volume === 0;

      if (!muted) {
        previousVolume = volume;
      }

      document
        .getElementById("wave1")
        ?.style
        .setProperty(
          "display",
          muted ? "none" : ""
        );

      document
        .getElementById("wave2")
        ?.style
        .setProperty(
          "display",
          muted ? "none" : ""
        );

      document
        .getElementById("muteLine1")
        ?.style
        .setProperty(
          "display",
          muted ? "" : "none"
        );

      document
        .getElementById("muteLine2")
        ?.style
        .setProperty(
          "display",
          muted ? "" : "none"
        );
    }
  );
}

volumeIcon?.addEventListener(
  "click",
  () => {
    if (
      !player ||
      !playerReady ||
      !volumeSlider
    ) {
      return;
    }

    if (!muted) {
      previousVolume =
        parseInt(
          volumeSlider.value,
          10
        );

      player.setVolume(0);
      volumeSlider.value = 0;
      muted = true;
    } else {
      player.setVolume(
        previousVolume
      );

      volumeSlider.value =
        previousVolume;

      muted = false;
    }

    volumeSlider.dispatchEvent(
      new Event("input")
    );
  }
);

loadPlaylist();

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
  const terminal = document.getElementById('terminal');

  terminal.classList.remove('sm:w-[480px]');
  terminal.classList.add('sm:w-[600px]');

  $('#terminalContent').html(`
    <div class="mt-3 text-white">

      <div
  id="aboutScroll"
  class="
    themed-scrollbar
    max-h-[52vh]
    sm:max-h-[58vh]
    overflow-y-auto
    overscroll-contain
    pr-3
    text-left
  "
>
        <div class="space-y-5">

          <section class="space-y-3">
            <h2 class="theme-heading text-blue-glow text-xl text-center">
              about me
            </h2>

            <p class="about-text">
              Hi! I'm Jamie, and welcome to my little corner of the internet! 🐾
            </p>

            <p class="about-text">
              This is where I share the music I'm currently obsessed with,
              showcase art commissions, and slowly build my own little comfy
              techy space on the web. I've poured a lot of love into this place,
              and hopefully that passion shines through! I hope you enjoy
              exploring it as much as I've enjoyed making it 🎀.
            </p>
          </section>

          <section class="space-y-3">
            <h3 class="about-heading text-blue-glow">the website</h3>

            <p class="about-text">
              The website is intentionally minimal, clutter-free and light. I
              wanted it to feel calm and easy to browse without every pixel
              screaming “this is Jamie!!”
            </p>

            <p class="about-text">
              Instead, you'll find little hints of me scattered around - the
              fursona artwork, the mascots, the soft design choices, and the
              slightly excessive amount of nerdy optimisation hidden behind
              the scenes.
            </p>

            <p class="about-text">
              If you're into that sort of thing, there's a section below
              showing off some of the libraries powering the interactive bits
              too!
            </p>
          </section>

          <section class="space-y-3">
            <h3 class="about-heading text-blue-glow">themes</h3>

            <p class="about-text">
              The theme selector (the little brush icon) changes more than just
              the colours. Each theme has its own personality.
            </p>

            <p class="about-text">
              The Animal Crossing theme borrows little touches from the game's
              UI and interactions, while the default theme leans into pixel
              cats, terminal windows, and retro SSH vibes. I want every theme
              to feel familiar, comfy, and just different enough ☁️.
            </p>
          </section>

          <section class="space-y-3">
            <h3 class="about-heading text-blue-glow">always a work in progress</h3>

            <p class="about-text">
              This website will probably never be “finished”, and I love that.
              Keeping things simple means I can keep tinkering, adding new
              ideas, making silly little themes, and nurturing this hobby for
              as long as I like.
            </p>

            <p class="about-text">
              There are always more things I want to build (my desktop is SO
              messy).
            </p>
          </section>

          <section class="space-y-3">
            <h3 class="about-heading text-blue-glow">away from the keyboard</h3>

         <p class="about-text">
  As a cat away from the keyboard, I've always felt happiest surrounded by
  cosy, cute, pastel-coloured things. Being feminine has always been part of
  who I am, so it's only fitting that my fursona is a little more
  pastel-toned too.
</p>

<p class="about-text">
  I'm a feminine, gay guy who loves expressing myself through fashion,
  staying comfy, and experimenting with new aesthetics 💅. I'm always finding
  new outfits to obsess over and collecting new plushies (30+... I don't have
  a problem :3).
</p>
          </section>

          <section class="space-y-3">
            <h3 class="about-heading text-blue-glow">working cat</h3>

            <p class="about-text">
              As a working cat, I'm an L2 NOC engineer. I spend my days
              configuring and troubleshooting networks, working alongside
              different teams to untangle complicated problems and keep things
              running smoothly.
            </p>

            <p class="about-text">
              It's rewarding work, but it definitely leaves me wanting a
              creative outlet, and this place is exactly that.
            </p>
          </section>

          <section class="space-y-3">
            <h3 class="about-heading text-blue-glow">usually found...</h3>

            <p class="about-text">
              When I'm not working, you'll probably find me playing games with
              friends, obsessing over whatever music is currently living
              rent-free in my head, dreaming about my next festival, or
              (mostest likely) eeping 😺💤.
            </p>
          </section>

          <section class="space-y-3 pb-2">
            <h3 class="about-heading text-blue-glow">libraries used</h3>

            <p class="about-text opacity-90">
              jQuery, Typed.js, Interact.js, Tailwind CSS, YouTube IFrame API,
              LightGallery, Three.js, Cloudflare Workers & API, Cloudflare Durable Objects for the live chat, WebSockets
              for guestbook updates, SQLite, custom guestbook and playlist
              APIs, and local storage for themes.
            </p>
          </section>

        </div>
      </div>


      <div id="buttonRow" class="flex justify-center pt-4">
        <button id="aboutButton"
          class="terminal-button theme-body text-xs"
          onclick="resetTerminal()"
        >
          back
        </button>
      </div>

    </div>
  `);

  const aboutScroll = document.getElementById('aboutScroll');
  if (aboutScroll) {
    aboutScroll.scrollTop = 0;
  }

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
  shadow-lg 
  backdrop-blur-xl
  rounded-3xl
  border
  border-pink-200/20
`;
  
guestBookWindow.style.zIndex = 11;
guestBookWindow.style.top = '50%';
guestBookWindow.style.left = '50%';
guestBookWindow.style.transform =
    'translate(-50%, -50%)';
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
 <p id="welcomeMessage" class="text-blue-glow text-white theme-body text-sm"> /ᐠ > ˕ <マ </p> </div>
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
  themed-scrollbar
  gwterminal
  absolute
  p-4
  w-[300px]
  overflow-y-auto
  border
  border-pink-200/20
  shadow-lg 
  backdrop-blur-xl
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
    const guestWindow =
        document.getElementById(
            'guestBookWindow'
        );

    const commentBox =
        document.getElementById(
            'guestbookComments'
        );

    if (!guestWindow || !commentBox) {
        return;
    }

    const rect =
        guestWindow.getBoundingClientRect();

    const phoneMode =
        getPhoneLayoutMode();

    commentBox.style.position =
        'absolute';

    commentBox.style.boxSizing =
        'border-box';

    commentBox.style.height =
        `${rect.height}px`;

    if (phoneMode === 'portrait') {
        const width = rect.width * 0.96;

commentBox.style.width =
    `${width}px`;

commentBox.style.maxWidth =
    `${width}px`;

commentBox.style.left =
    `${rect.left + ((rect.width - width) / 2)}px`;

const overlap = 10;

commentBox.style.top =
    `${rect.bottom - overlap}px`;

        return;
    }

    if (phoneMode === 'landscape') {
        const viewportWidth =
            window.visualViewport?.width ||
            window.innerWidth;

        const gap = 10;

        const availableWidth =
            viewportWidth -
            rect.right -
            gap -
            8;

        commentBox.style.top =
            `${rect.top}px`;

        commentBox.style.left =
            `${rect.right + gap}px`;

        commentBox.style.width =
            `${Math.max(180, availableWidth)}px`;

        commentBox.style.maxWidth =
            `${Math.max(180, availableWidth)}px`;

        return;
    }

    commentBox.style.top =
        `${rect.top}px`;

    commentBox.style.left =
        `${rect.right + 10}px`;

    commentBox.style.width =
        '300px';

    commentBox.style.maxWidth =
        '300px';
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

    const transform =
        target.style.transform || '';

    const needsPositionNormalising =
        transform.includes('translate(-50%, -50%)') ||
        transform.includes('translate(0, -50%)');

    if (needsPositionNormalising) {
        const rect =
            target.getBoundingClientRect();

        const scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop;

        const scrollLeft =
            window.scrollX ||
            document.documentElement.scrollLeft;

        target.style.top =
            rect.top + scrollTop + 'px';

        target.style.left =
            rect.left + scrollLeft + 'px';

        target.style.transform =
            'translate(0, 0)';

        target.setAttribute('data-x', '0');
        target.setAttribute('data-y', '0');

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
alert("fill in the fields!");
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

const url = `${API}/api/comments`;

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
welcomeMessage.textContent = "ദ്ദി◝ ⩊ ◜.ᐟ";

  setTimeout(() => {
    welcomeMessage.textContent = "/ᐠ > ˕ <マ";
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
  guestbookSocket = new WebSocket(
  "wss://jamicat.ahrly.workers.dev/api/ws"
);
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

  container.innerHTML = '<p class="text-blue-100 text-sm">loading ฅᨐฅ</p>';

  try {

    const response = await fetch(`${API}/api/list`);
    const data = await response.json();

    const comments = data.comments || [];

    container.innerHTML = '';

    comments.forEach(entry => {

      const div = document.createElement('div');

      div.className = 'bg-pink-50 bg-opacity-[0.03] rounded p-3 mb-2 text-sm';

div.innerHTML = `
  <div class="gb-name theme-body text-xs mb-1 font-medium text-white text-blue-glow no-theme-glow break-all">
    ${entry.name || 'Anonymous'}
  </div>

  <div class="gb-comment theme-body text-[0.60rem] mb-1 text-pink-100 break-all">
    ${entry.comment || ''}
  </div>

 <div class="text-blue-100 opacity-80 text-[0.55rem] text-right">
  ${entry.timestamp
    ? `${new Date(entry.timestamp).toLocaleDateString("en-GB")} ${new Date(entry.timestamp).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })}`
    : ""
  }
</div>

  ${
    entry.reply
      ? `
      <div class="border-b border-blue-100/20 my-3 opacity-60"></div>

      <div class="mb-1 flex items-center gap-1 font-medium">
  <span class="gb-name theme-body text-xs text-white text-blue-glow">jamie</span>
</div>

      <div class="gb-comment theme-body text-[0.60rem] mb-1 text-pink-100 break-all">
        ${entry.reply}
      </div>
<div class="text-blue-100 opacity-80 text-[0.55rem] text-right">
  ${
    entry.reply_timestamp
      ? `${new Date(entry.reply_timestamp).toLocaleDateString("en-GB")} ${new Date(entry.reply_timestamp).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        })}`
      : ""
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
    container.innerHTML = '<p class="text-blue-100 text-sm">failed to load.</p>';

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
document.getElementById("formResponse").textContent = " ദ്ദി◝ ⩊ ◜.ᐟ ";
}

function resetTerminal() {

const terminal = document.getElementById('terminal');
terminal.classList.remove('sm:w-[600px]');
terminal.classList.add('sm:w-[480px]');
  
  $('#terminalContent').html(`
  <div id="typed" class="text-pink-300 text-lg mb-4 mt-4 text-center"></div>
  <div id="buttonRow" class="flex justify-center space-x-4 flex-wrap sm:flex-nowrap">
 <button id="aboutButton" class="terminal-button theme-body text-xs" onclick="siteFAQ()">about!</button>
<button class="terminal-button ml-2 theme-body text-xs" onclick="showArt()">art</button>
<button class="terminal-button theme-body text-xs" onclick="showList()">playlist</button>
<button class="terminal-button ml-5 theme-body text-xs" onclick="showGuestBook()">guestbook</button>
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
    savedTheme = 'Stars';
    localStorage.setItem('theme', savedTheme);
  }
  applyTheme(savedTheme);
  initTyped(savedTheme);
});
