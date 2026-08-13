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

const toggleBtn =
  document.getElementById(
    "videoToggle"
  );
  
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
  
  if (
    el.closest?.('#chatWindow') ||
    el.id?.startsWith('chat')
  ) {
    return;
  }

  el.classList.remove('text-blue-glow', 'text-pink-glow', 'text-red-glow', 'text-aquag-glow', 'text-cyan-glow', 'text-darkblue-glow');
  el.classList.add(theme.glowPrimary);
});
  localStorage.setItem('theme', themeName);

  window.dispatchEvent(
    new CustomEvent(
      'site-theme-change',
      {
        detail: {
          themeName
        }
      }
    )
  );

  document.querySelectorAll('.terminal2').forEach(el => {
  const chatOwned =
    el.id?.startsWith('chat') ||
    el.closest?.('#chatWindow') ||
    el.classList.contains('jami-message-hover-actions') ||
    el.classList.contains('jami-chat-context-menu') ||
    el.classList.contains('jami-admin-glass-panel') ||
    el.classList.contains('jami-saved-remix-manager') ||
    el.classList.contains('jami-name-history-manager') ||
    el.classList.contains('watch-party-visualizer-window') ||
    el.classList.contains('jami-remix-overlay') ||
    el.classList.contains('jami-image-remixer');

  const chatTheme =
    document.documentElement.getAttribute('data-chat-theme') ||
    document.getElementById('chatWindow')?.dataset.chatTheme ||
    'original';

  /*
   * Chat-owned terminal2 UI follows the website terminal theme only
   * while the chat itself is using Original. Stars / Animal Crossing
   * remain completely isolated from the terminal selector.
   */
  if (chatOwned && chatTheme !== 'original') {
    Object.values(themes).forEach(t => {
      el.classList.remove(t.terminal2Bg);
    });
    el.style.removeProperty('border-color');
    return;
  }

  Object.values(themes).forEach(t => {
    el.classList.remove(t.terminal2Bg);
  });
  el.classList.add(theme.terminal2Bg);

  if (chatOwned && chatTheme === 'original') {
    if (el.id === 'chatWindow') {
      el.style.borderColor = theme.borderColor;
    } else {
      /*
       * Detached chat panels own their border colours through
       * data-theme (blue, purple, rainbow, etc.). Do not replace
       * those accent borders with the terminal theme border.
       */
      el.style.removeProperty('border-color');
    }
  }
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


const mainTerminal =
  document.getElementById(
    "terminal"
  );

mainTerminal?.setAttribute(
  "data-x",
  "0"
);

mainTerminal?.setAttribute(
  "data-y",
  "0"
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
    move(event) {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
           
      target.style.transform =
  `translate(
    calc(-50% + ${x}px),
    calc(-50% + ${y}px)
  )`;
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
let watchPartyAutomaticNextPending =
    false;
let watchPartyEnglishSubtitles =
    localStorage.getItem(
        "watch_party_english_subtitles"
    ) === "true";

let playerEnglishSubtitlesActive = null;
let pendingPlayerRebuildState = null;

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

const normalProgressWrap =
  document.getElementById(
    "normalProgressWrap"
  );

const normalProgressSlider =
  document.getElementById(
    "normalProgressSlider"
  );

const normalProgressCurrentTooltip =
  document.getElementById(
    "normalProgressCurrentTooltip"
  );

const normalProgressTooltip =
  document.getElementById(
    "normalProgressTooltip"
  );

let normalProgressSeeking = false;

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

function formatNormalProgressTime(seconds) {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
      )
    );

  const hours =
    Math.floor(
      safeSeconds / 3600
    );

  const minutes =
    Math.floor(
      (
        safeSeconds % 3600
      ) / 60
    );

  const remainingSeconds =
    safeSeconds % 60;

  if (hours > 0) {
    return (
      `${hours}:` +
      minutes
        .toString()
        .padStart(2, "0") +
      ":" +
      remainingSeconds
        .toString()
        .padStart(2, "0")
    );
  }

  return (
    `${minutes}:` +
    remainingSeconds
      .toString()
      .padStart(2, "0")
  );
}

function parseProgressTimeText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const parts =
    value
      .trim()
      .split(":")
      .map(part =>
        Number(part)
      );

  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some(part =>
      !Number.isFinite(part) ||
      part < 0
    )
  ) {
    return null;
  }

  if (parts.length === 2) {
    return (
      parts[0] * 60 +
      parts[1]
    );
  }

  return (
    parts[0] * 3600 +
    parts[1] * 60 +
    parts[2]
  );
}

function getNormalProgressDuration() {
  if (
    !player ||
    !playerReady ||
    typeof player.getDuration !==
      "function"
  ) {
    return 0;
  }

  const duration =
    Number(
      player.getDuration()
    );

  return (
    Number.isFinite(duration) &&
    duration > 0
  )
    ? duration
    : 0;
}

function updateNormalProgressVisibility() {
  if (!normalProgressWrap) {
    return;
  }

  const duration =
    getNormalProgressDuration();

  const shouldShow =
    playbackMode === "normal" &&
    isPlaying === true &&
    Boolean(loadedVideoId) &&
    duration > 0;

  normalProgressWrap.classList.toggle(
    "hidden",
    !shouldShow
  );

  normalProgressWrap.setAttribute(
    "aria-hidden",
    shouldShow
      ? "false"
      : "true"
  );

  if (!shouldShow) {
  normalProgressCurrentTooltip
    ?.classList.remove(
      "visible"
    );

  normalProgressTooltip
    ?.classList.remove(
      "visible"
    );
}
}

function updateNormalProgress() {
  updateNormalProgressVisibility();

  if (
    !normalProgressSlider ||
    normalProgressSeeking ||
    playbackMode !== "normal" ||
    !player ||
    !playerReady
  ) {
    return;
  }

  const duration =
    getNormalProgressDuration();

  const currentTime =
    typeof player.getCurrentTime ===
      "function"
      ? Number(
          player.getCurrentTime()
        )
      : 0;

  if (
    duration <= 0 ||
    !Number.isFinite(currentTime)
  ) {
    return;
  }

  const ratio =
    Math.max(
      0,
      Math.min(
        1,
        currentTime / duration
      )
    );

 normalProgressSlider.value =
  String(
    Math.round(
      ratio * 100000
    )
  );

  normalProgressSlider.style
  .setProperty(
    "--normal-progress",
    `${ratio * 100}%`
  );

if (
  normalProgressCurrentTooltip &&
  normalProgressWrap
) {
  const sliderRect =
    normalProgressSlider
      .getBoundingClientRect();

  const wrapRect =
    normalProgressWrap
      .getBoundingClientRect();

  const currentLeft =
  sliderRect.left -
  wrapRect.left +
  5 +
  (
    sliderRect.width - 10
  ) * ratio;

  normalProgressCurrentTooltip.textContent =
    formatNormalProgressTime(
      currentTime
    );

  normalProgressCurrentTooltip.style.left =
    `${currentLeft}px`;
}
}

function getRangePointerRatio(
  rangeInput,
  clientX,
  thumbWidth = 10
) {
  const rect =
    rangeInput.getBoundingClientRect();

  if (rect.width <= 0) {
    return 0;
  }

  const halfThumb =
    thumbWidth / 2;

  const usableWidth =
    Math.max(
      1,
      rect.width - thumbWidth
    );

  const usableLeft =
    rect.left + halfThumb;

  const pointerPosition =
    Math.max(
      0,
      Math.min(
        usableWidth,
        clientX - usableLeft
      )
    );

  return (
    pointerPosition /
    usableWidth
  );
}

function updateNormalProgressTooltip(
  event
) {
  if (
    !normalProgressSlider ||
    !normalProgressTooltip
  ) {
    return;
  }

  const duration =
    getNormalProgressDuration();

  if (duration <= 0) {
    return;
  }

  const sliderRect =
    normalProgressSlider
      .getBoundingClientRect();

  if (sliderRect.width <= 0) {
    return;
  }

  const pointerX =
    Number.isFinite(event.clientX)
      ? event.clientX
      : sliderRect.left;

 const ratio =
  getRangePointerRatio(
    normalProgressSlider,
    pointerX,
    10
  );

const relativeX =
  ratio *
  sliderRect.width;

  const hoveredTime =
    ratio * duration;

  normalProgressTooltip.textContent =
    formatNormalProgressTime(
      hoveredTime
    );

  const wrapRect =
    normalProgressWrap
      .getBoundingClientRect();

  const tooltipLeft =
    sliderRect.left -
    wrapRect.left +
    relativeX;

  normalProgressTooltip.style.left =
    `${tooltipLeft}px`;

  normalProgressTooltip.classList.add(
    "visible"
  );
}

function showNormalProgressTooltips() {
  normalProgressCurrentTooltip
    ?.classList.add(
      "visible"
    );

  normalProgressTooltip
    ?.classList.add(
      "visible"
    );
}

function hideNormalProgressTooltips() {
  if (normalProgressSeeking) {
    return;
  }

  normalProgressCurrentTooltip
    ?.classList.remove(
      "visible"
    );

  normalProgressTooltip
    ?.classList.remove(
      "visible"
    );
}

let preciseSeekCorrectionTimer =
  null;

function seekYouTubePrecisely(
  targetTime
) {
  if (
    !player ||
    !playerReady ||
    typeof player.seekTo !==
      "function"
  ) {
    return;
  }

  player.seekTo(
    Math.max(
      0,
      Number(targetTime) || 0
    ),
    true
  );
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
updateNormalProgressVisibility();

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

function shouldUseWatchPartyEnglishSubtitles() {
    return (
        playbackMode === "watch-party" &&
        watchPartyState.enabled === true &&
        watchPartyEnglishSubtitles === true
    );
}

function rebuildYouTubePlayer({
    preservePlayback = false
} = {}) {
    if (!player) {
        maybeInitPlayer();
        return;
    }

    let iframe = null;

    try {
        iframe =
            typeof player.getIframe === "function"
                ? player.getIframe()
                : null;
    } catch {
        iframe = null;
    }

    if (
        !iframe ||
        !iframe.parentNode
    ) {
        console.warn(
            "could not rebuild youtube player: iframe unavailable"
        );

        return;
    }

    let currentTime = 0;
    let wasPlaying = false;
    let videoId = loadedVideoId;

    if (
        preservePlayback &&
        playbackMode === "watch-party" &&
        watchPartyState.enabled === true
    ) {
        try {
            const capturedTime =
                typeof player.getCurrentTime ===
                    "function"
                    ? player.getCurrentTime()
                    : 0;

            if (Number.isFinite(capturedTime)) {
                currentTime =
                    Math.max(0, capturedTime);
            }
        } catch {
            currentTime = 0;
        }

        try {
            const playerState =
                typeof player.getPlayerState ===
                    "function"
                    ? player.getPlayerState()
                    : null;

            wasPlaying =
                playerState ===
                    YT.PlayerState.PLAYING;
        } catch {
            wasPlaying =
                isPlaying === true;
        }

        if (!videoId) {
            videoId =
                watchPartyState.currentVideoId ||
                null;
        }

        pendingPlayerRebuildState = {
            videoId,
            currentTime,
            wasPlaying
        };
    } else {
        pendingPlayerRebuildState = null;
    }

    const parent =
        iframe.parentNode;

    const marker =
        document.createComment(
            "youtube-player-position"
        );

    parent.insertBefore(
        marker,
        iframe
    );

    suppressPlayerEvents = true;

    try {
        player.destroy();
    } catch (error) {
        console.warn(
            "could not destroy youtube player:",
            error
        );
    } finally {
        suppressPlayerEvents = false;
    }

    player = null;
    playerReady = false;
    loadedVideoId = null;
    isPlaying = false;

    updatePlaybackIcons(false);

    const replacement =
        document.createElement("div");

    replacement.id =
        "background-video-iframe";

    parent.insertBefore(
        replacement,
        marker
    );

    marker.remove();
    maybeInitPlayer();
}

function loadActiveVideo({
  autoplay = false,
  force = false
} = {}) {
  if (!player || !playerReady) {
    return;
  }

  if (playbackMode === "watch-party") {
    const savedVideoMode =
        localStorage.getItem(
            "watch_party_video_mode"
        ) || "cinematic";

    window.watchPartyPlayer?.setVideoMode?.(
        savedVideoMode
    );
} else {
    window.watchPartyPlayer?.setVideoMode?.(
        "cinematic"
    );
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

const requiredEnglishSubtitles =
    shouldUseWatchPartyEnglishSubtitles();

window.setTerminalPlaybackControlsVisible?.(
    !watchPartyState.enabled
);

 window.setTerminalMinimized?.(
  watchPartyState.enabled
);

  if (!player || !playerReady) {
    return;
}

if (
    playerEnglishSubtitlesActive !==
        requiredEnglishSubtitles
) {
    rebuildYouTubePlayer({
    preservePlayback: false
});
    return;
}

  if (watchPartyState.enabled) {
    window.watchPartyPlayer?.setVideoMode?.(
        localStorage.getItem(
            "watch_party_video_mode"
        ) || "cinematic"
    );
}

  if (!watchPartyState.enabled) {
    const leavingWatchParty =
        previousEnabled === true;

    window.watchPartyPlayer?.setVideoMode?.(
        "cinematic"
    );

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
        player.playVideo();
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
    1000
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

const useEnglishSubtitles =
    shouldUseWatchPartyEnglishSubtitles();

playerEnglishSubtitlesActive =
    useEnglishSubtitles;

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
    iv_load_policy: 3,
    ...(
    useEnglishSubtitles
        ? {
            cc_load_policy: 1,
            cc_lang_pref: "en"
        }
        : {}
)
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

    const rebuildState =
        pendingPlayerRebuildState;

    pendingPlayerRebuildState = null;

    if (
        rebuildState &&
        playbackMode === "watch-party" &&
        watchPartyState.enabled === true &&
        rebuildState.videoId
    ) {
        loadedVideoId =
            rebuildState.videoId;

        setPoster(
            rebuildState.videoId
        );

        window.watchPartyPlayer?.setVideoMode?.(
            localStorage.getItem(
                "watch_party_video_mode"
            ) || "cinematic"
        );

        if (rebuildState.wasPlaying) {
            player.loadVideoById({
                videoId:
                    rebuildState.videoId,

                startSeconds:
                    rebuildState.currentTime
            });

            player.playVideo();
            updatePlaybackIcons(true);
        } else {
            player.cueVideoById({
                videoId:
                    rebuildState.videoId,

                startSeconds:
                    rebuildState.currentTime
            });

            updatePlaybackIcons(false);

            const posterEl =
                document.getElementById(
                    "videoPoster"
                );

            const iframeEl =
                document.getElementById(
                    "background-video-iframe"
                );

            if (posterEl) {
                posterEl.style.opacity =
                    "1";
            }

            if (iframeEl) {
                iframeEl.style.opacity =
                    "0";
            }
        }

        return;
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
    if (
        watchPartyAutomaticNextPending
    ) {
        return;
    }

    watchPartyAutomaticNextPending =
        true;

    const endedVideoId =
        watchPartyState
            .currentVideoId;

    const endedIndex =
        watchPartyState
            .currentIndex;

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
                    window.chat
                        ?.clientId ||
                    null,

                expectedVideoId:
                    endedVideoId,

                expectedIndex:
                    endedIndex
            })
        }
    )
        .then(
            async response => {
                let result = null;

                try {
                    result =
                        await response.json();
                } catch {}

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        `automatic next failed (${response.status})`
                    );
                }

            }
        )
        .catch(error => {
            console.error(
                "Watch Party automatic next failed:",
                error
            );
        })
        .finally(() => {
            watchPartyAutomaticNextPending =
                false;
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

const watchPartyVisualizers = (() => {
  const MAX_PANELS = 5;
  const DEFAULT_MODE = "bars";
  const MODES = new Set([
    "wave",
    "bars",
    "decay",
    "line",
    "peaks",
    "mountain"
  ]);
  const STORAGE_KEY = "watch_party_visualizer_panels";
  const HYPER_STORAGE_KEY = "watch_party_visualizer_hyper_mode";
  const NORMAL_SMOOTHING = 0.82;
  const HYPER_SMOOTHING = 0.55;

  let captureStream = null;
  let audioContext = null;
  let sourceNode = null;
  let analyser = null;
  let frequencyData = null;
  let timeData = null;
  let nextPanelId = 1;
  let topZ = 100004;
  let restoring = false;
  let watchPartyEnabled = false;
  let hyperMode =
    localStorage.getItem(HYPER_STORAGE_KEY) === "true";

  const panels = new Map();

  function normaliseMode(mode) {
    return MODES.has(mode) ? mode : DEFAULT_MODE;
  }

  function isSupported() {
    return Boolean(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function" &&
      (window.AudioContext || window.webkitAudioContext)
    );
  }

  function emitState(message = "") {
    window.dispatchEvent(
      new CustomEvent("watch-party-visualizer-state", {
        detail: {
          supported: isSupported(),
          active: Boolean(captureStream && analyser),
          panelCount: panels.size,
          maxPanels: MAX_PANELS,
          watchPartyEnabled,
          hyperMode,
          message
        }
      })
    );
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function savePanels() {
    if (restoring) return;

    const saved = [...panels.values()].map(panel => ({
      mode: panel.mode,
      left: parseFloat(panel.element.style.left) || 24,
      top: parseFloat(panel.element.style.top) || 24,
      width: panel.element.offsetWidth,
      height: panel.element.offsetHeight
    }));

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(saved)
    );
  }

  function loadSavedPanels() {
    const value = safeJsonParse(
      localStorage.getItem(STORAGE_KEY) || "[]",
      []
    );

    return Array.isArray(value)
      ? value.slice(0, MAX_PANELS)
      : [];
  }

  function getWatchPartyTheme() {
    return (
      document.getElementById("chatWatchPartyPanel")
        ?.dataset.theme ||
      localStorage.getItem("watch_party_theme") ||
      "default"
    );
  }

  function bringToFront(panel) {
    topZ += 1;
    panel.element.style.zIndex = String(topZ);
  }

  function clampPanel(panel) {
    const element = panel.element;
    const edge = 8;
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const maxLeft = Math.max(edge, window.innerWidth - width - edge);
    const maxTop = Math.max(edge, window.innerHeight - height - edge);

    let left = parseFloat(element.style.left) || edge;
    let top = parseFloat(element.style.top) || edge;

    left = Math.min(Math.max(edge, left), maxLeft);
    top = Math.min(Math.max(edge, top), maxTop);

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  function setPanelMode(panel, mode) {
    panel.mode = normaliseMode(mode);
    panel.element.dataset.visualizerMode = panel.mode;

    panel.element
      .querySelectorAll("[data-visualizer-panel-mode]")
      .forEach(button => {
        button.classList.toggle(
          "is-selected",
          button.dataset.visualizerPanelMode === panel.mode
        );
      });

    const label = panel.element.querySelector(
      "[data-visualizer-mode-label]"
    );

    if (label) {
      const labels = {
        wave: "waveform",
        bars: "equalizer",
        decay: "spectrum",
        line: "frequency line",
        peaks: "peaks",
        mountain: "filled spectrum"
      };
      label.textContent = labels[panel.mode] || "equalizer";
    }

    savePanels();
  }

  function getPanelModeButtons() {
    return `
      <button type="button" data-visualizer-panel-mode="wave" title="waveform" aria-label="waveform"></button>
      <button type="button" data-visualizer-panel-mode="bars" title="equalizer" aria-label="equalizer"></button>
      <button type="button" data-visualizer-panel-mode="decay" title="spectrum" aria-label="spectrum"></button>
      <button type="button" data-visualizer-panel-mode="line" title="frequency line" aria-label="frequency line"></button>
      <button type="button" data-visualizer-panel-mode="peaks" title="peaks" aria-label="peaks"></button>
      <button type="button" data-visualizer-panel-mode="mountain" title="filled spectrum" aria-label="filled spectrum"></button>
    `;
  }

  function attachNativeWindowControls(panel) {
    const element = panel.element;
    const dragHandle = element.querySelector(
      "[data-visualizer-drag-handle]"
    );
    const resizeHandle = element.querySelector(
      "[data-visualizer-resize-handle]"
    );

    dragHandle?.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest("button")) return;
      event.preventDefault();
      bringToFront(panel);

      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = parseFloat(element.style.left) || 0;
      const startTop = parseFloat(element.style.top) || 0;

      dragHandle.setPointerCapture?.(pointerId);
      document.body.style.userSelect = "none";

      const move = moveEvent => {
        if (moveEvent.pointerId !== pointerId) return;
        moveEvent.preventDefault();
        element.style.left = `${startLeft + moveEvent.clientX - startX}px`;
        element.style.top = `${startTop + moveEvent.clientY - startY}px`;
        clampPanel(panel);
      };

      const finish = finishEvent => {
        if (
          finishEvent.pointerId !== undefined &&
          finishEvent.pointerId !== pointerId
        ) return;
        window.removeEventListener("pointermove", move, true);
        window.removeEventListener("pointerup", finish, true);
        window.removeEventListener("pointercancel", finish, true);
        document.body.style.userSelect = "";
        try {
          if (dragHandle.hasPointerCapture?.(pointerId)) {
            dragHandle.releasePointerCapture(pointerId);
          }
        } catch {}
        clampPanel(panel);
        savePanels();
      };

      window.addEventListener("pointermove", move, { capture: true, passive: false });
      window.addEventListener("pointerup", finish, true);
      window.addEventListener("pointercancel", finish, true);
    });

    resizeHandle?.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      bringToFront(panel);

      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = element.offsetWidth;
      const startHeight = element.offsetHeight;

      resizeHandle.setPointerCapture?.(pointerId);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "nwse-resize";

      const move = moveEvent => {
        if (moveEvent.pointerId !== pointerId) return;
        moveEvent.preventDefault();

        const maxWidth = Math.max(220, window.innerWidth - (parseFloat(element.style.left) || 0) - 8);
        const maxHeight = Math.max(150, window.innerHeight - (parseFloat(element.style.top) || 0) - 8);

        const width = Math.min(
          maxWidth,
          Math.max(220, startWidth + moveEvent.clientX - startX)
        );
        const height = Math.min(
          maxHeight,
          Math.max(150, startHeight + moveEvent.clientY - startY)
        );

        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      };

      const finish = finishEvent => {
        if (
          finishEvent.pointerId !== undefined &&
          finishEvent.pointerId !== pointerId
        ) return;
        window.removeEventListener("pointermove", move, true);
        window.removeEventListener("pointerup", finish, true);
        window.removeEventListener("pointercancel", finish, true);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        try {
          if (resizeHandle.hasPointerCapture?.(pointerId)) {
            resizeHandle.releasePointerCapture(pointerId);
          }
        } catch {}
        clampPanel(panel);
        savePanels();
      };

      window.addEventListener("pointermove", move, { capture: true, passive: false });
      window.addEventListener("pointerup", finish, true);
      window.addEventListener("pointercancel", finish, true);
    });
  }

  function createPanel(mode = DEFAULT_MODE, geometry = null) {
    if (panels.size >= MAX_PANELS) {
      emitState("maximum of 5 visualizers reached");
      return null;
    }

    const id = nextPanelId++;
    const element = document.createElement("section");
    element.className = "watch-party-visualizer-window terminal2";
    element.dataset.visualizerId = String(id);
    element.dataset.theme = getWatchPartyTheme();
    element.innerHTML = `
      <div class="watch-party-visualizer-titlebar" data-visualizer-drag-handle>
        <div class="min-w-0">
          <div class="watch-party-visualizer-title theme-heading text-blue-glow">visualizer</div>
          <div class="watch-party-visualizer-mode-label theme-body" data-visualizer-mode-label></div>
        </div>
        <div class="watch-party-visualizer-title-actions">
          <button type="button" data-visualizer-modes-toggle aria-label="choose visualizer mode" title="choose visualizer mode">⋮</button>
          <button type="button" data-visualizer-close aria-label="close visualizer" title="close visualizer">×</button>
        </div>
      </div>
      <div class="watch-party-visualizer-mode-picker" data-visualizer-mode-picker hidden>
        ${getPanelModeButtons()}
      </div>
      <div class="watch-party-visualizer-canvas-wrap">
        <canvas data-visualizer-canvas></canvas>
        <div class="watch-party-visualizer-inactive theme-body" data-visualizer-inactive hidden>audio capture stopped</div>
      </div>
      <div class="watch-party-visualizer-resize" data-visualizer-resize-handle aria-hidden="true"></div>
    `;

    const defaultOffset = 26 * panels.size;
    const left = Number.isFinite(Number(geometry?.left))
      ? Number(geometry.left)
      : Math.max(12, Math.round((window.innerWidth - 330) / 2) + defaultOffset);
    const top = Number.isFinite(Number(geometry?.top))
      ? Number(geometry.top)
      : Math.max(12, Math.round((window.innerHeight - 210) / 2) + defaultOffset);
    const width = Number.isFinite(Number(geometry?.width))
      ? Math.max(220, Number(geometry.width))
      : 330;
    const height = Number.isFinite(Number(geometry?.height))
      ? Math.max(150, Number(geometry.height))
      : 210;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.zIndex = String(++topZ);

    document.body.appendChild(element);

    const canvas = element.querySelector("[data-visualizer-canvas]");
    const panel = {
      id,
      element,
      canvas,
      context: canvas.getContext("2d"),
      mode: normaliseMode(mode),
      animationFrame: 0
    };

    panels.set(id, panel);
    attachNativeWindowControls(panel);
    setPanelMode(panel, panel.mode);
    clampPanel(panel);

    element.addEventListener("pointerdown", () => bringToFront(panel));

    element.querySelector("[data-visualizer-close]")?.addEventListener("click", event => {
      event.stopPropagation();
      removePanel(id);
    });

    const picker = element.querySelector("[data-visualizer-mode-picker]");
    element.querySelector("[data-visualizer-modes-toggle]")?.addEventListener("click", event => {
      event.stopPropagation();
      picker.hidden = !picker.hidden;
    });

    picker?.querySelectorAll("[data-visualizer-panel-mode]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        setPanelMode(panel, button.dataset.visualizerPanelMode);
        picker.hidden = true;
      });
    });

    window.chat?.applyCurrentTheme?.();
    startPanelLoop(panel);
    savePanels();
    emitState();
    return panel;
  }

  function removePanel(id) {
    const panel = panels.get(Number(id));
    if (!panel) return;
    cancelAnimationFrame(panel.animationFrame);
    panel.element.remove();
    panels.delete(panel.id);
    savePanels();
    emitState();
  }

  function resizeCanvas(panel) {
    const canvas = panel.canvas;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    panel.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { width: rect.width, height: rect.height };
  }

  function getAccent(panel) {
    const style = getComputedStyle(panel.element);
    return style.getPropertyValue("--visualizer-accent").trim() ||
      style.getPropertyValue("--watch-party-accent").trim() ||
      "#60a5fa";
  }

  function makeGradient(ctx, width, height, accent, vertical = false) {
    const gradient = vertical
      ? ctx.createLinearGradient(0, 0, 0, height)
      : ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, accent);
    gradient.addColorStop(0.38, "#86efac");
    gradient.addColorStop(0.7, "#60a5fa");
    gradient.addColorStop(1, "#f472b6");
    return gradient;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function getLogSpectrum(data, count, panel = null) {
    const safeCount = Math.max(2, Math.min(count, data.length));
    const sampleRate = audioContext?.sampleRate || 48000;
    const fftSize = analyser?.fftSize || data.length * 2;
    const nyquist = sampleRate / 2;
    const minFrequency = 40;
    const maxFrequency = Math.min(16000, nyquist * 0.92);
    const frequencyRange = maxFrequency / minFrequency;
    const values = new Float32Array(safeCount);
    const peakValues = hyperMode
      ? new Float32Array(safeCount)
      : null;

    for (let i = 0; i < safeCount; i++) {
      const lowFrequency =
        minFrequency * Math.pow(frequencyRange, i / safeCount);
      const highFrequency =
        minFrequency * Math.pow(frequencyRange, (i + 1) / safeCount);

      const lowBin = Math.max(
        1,
        Math.floor(lowFrequency * fftSize / sampleRate)
      );
      const highBin = Math.min(
        data.length - 1,
        Math.max(
          lowBin,
          Math.ceil(highFrequency * fftSize / sampleRate)
        )
      );

      let total = 0;
      let peak = 0;
      let samples = 0;

      for (let bin = lowBin; bin <= highBin; bin++) {
        const sample = data[bin];
        total += sample;
        peak = Math.max(peak, sample);
        samples++;
      }

      const average = samples > 0 ? total / samples : 0;
      const normalized = average / 255;
      const perceptualBoost = Math.pow(normalized, 0.65);
      const highFrequencyLift =
        1 + 0.45 * (i / Math.max(1, safeCount - 1));

      values[i] = Math.min(
        1,
        perceptualBoost * highFrequencyLift
      );

      if (peakValues) {
        const normalizedPeak = peak / 255;
        peakValues[i] = Math.min(
          1,
          Math.pow(normalizedPeak, 0.55) *
            highFrequencyLift
        );
      }
    }

    if (!hyperMode || !panel || !peakValues) {
      return values;
    }

    if (!(panel.hyperSpectrum instanceof Map)) {
      panel.hyperSpectrum = new Map();
    }

    let displayed = panel.hyperSpectrum.get(safeCount);
    if (!(displayed instanceof Float32Array) || displayed.length !== safeCount) {
      displayed = new Float32Array(safeCount);
      panel.hyperSpectrum.set(safeCount, displayed);
    }

    const output = new Float32Array(safeCount);

    for (let i = 0; i < safeCount; i++) {
      const combined = Math.min(
        1,
        values[i] * 0.72 + peakValues[i] * 0.38
      );
      const target = Math.min(
        1,
        Math.pow(combined, 0.72)
      );
      const previous = displayed[i];
      const response = target > previous ? 0.72 : 0.14;
      const next = previous + (target - previous) * response;

      displayed[i] = next;
      output[i] = next;
    }

    return output;
  }

  function drawBars(ctx, width, height, data, accent, centred = false, panel = null) {
    const values = getLogSpectrum(data, 38, panel);
    const count = values.length;
    const gap = 2;
    const barWidth = Math.max(2, (width - gap * (count - 1)) / count);
    const gradient = makeGradient(ctx, width, height, accent, false);
    ctx.fillStyle = gradient;

    for (let i = 0; i < count; i++) {
      const value = values[i];
      const barHeight = Math.max(
        2,
        value * (centred ? height * 0.44 : height * 0.84)
      );
      const x = i * (barWidth + gap);
      const y = centred ? height / 2 - barHeight : height - barHeight;

      roundedRect(
        ctx,
        x,
        y,
        barWidth,
        centred ? barHeight * 2 : barHeight,
        Math.min(3, barWidth / 2)
      );
      ctx.fill();
    }
  }

  function drawDecay(ctx, width, height, data, accent, panel = null) {
    const values = getLogSpectrum(data, 34, panel);
    const count = values.length;
    const gap = 2;
    const barWidth = Math.max(2, (width - gap * (count - 1)) / count);
    ctx.fillStyle = accent;

    for (let i = 0; i < count; i++) {
      const barHeight = Math.max(2, values[i] * height * 0.9);
      roundedRect(
        ctx,
        i * (barWidth + gap),
        height - barHeight,
        barWidth,
        barHeight,
        2
      );
      ctx.fill();
    }
  }

  function drawLine(ctx, width, height, data, accent, filled = false, low = false, panel = null) {
    const values = getLogSpectrum(data, 64, panel);
    const points = values.length;
    const gradient = makeGradient(ctx, width, height, accent, false);
    const baseline = low ? height * 0.82 : height * 0.72;

    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const value = values[i];
      const x = (i / Math.max(1, points - 1)) * width;
      const y = baseline - value * (low ? height * 0.45 : height * 0.64);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = low ? 1.7 : 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    if (filled) {
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const fill = makeGradient(ctx, width, height, accent, false);
      ctx.globalAlpha = low ? 0.72 : 0.42;
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawWave(ctx, width, height, data, accent) {
    const gradient = makeGradient(ctx, width, height, accent, false);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    const slice = width / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128;
      const y = v * height / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += slice;
    }
    ctx.stroke();

    ctx.fillStyle = gradient;
    const dotCount = 18;
    for (let i = 0; i < dotCount; i++) {
      const index = Math.floor((i / dotCount) * data.length);
      const y = (data[index] / 128) * height / 2;
      const xPos = (i / Math.max(1, dotCount - 1)) * width;
      ctx.beginPath();
      ctx.arc(xPos, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPanel(panel) {
    const ctx = panel.context;
    const { width, height } = resizeCanvas(panel);
    ctx.clearRect(0, 0, width, height);

    if (!analyser || !frequencyData || !timeData) {
      panel.element.querySelector("[data-visualizer-inactive]")?.removeAttribute("hidden");
      return;
    }

    panel.element.querySelector("[data-visualizer-inactive]")?.setAttribute("hidden", "");
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    const accent = getAccent(panel);

    switch (panel.mode) {
      case "wave":
        drawWave(ctx, width, height, timeData, accent);
        break;
      case "decay":
        drawDecay(ctx, width, height, frequencyData, accent, panel);
        break;
      case "line":
        drawLine(ctx, width, height, frequencyData, accent, true, false, panel);
        break;
      case "peaks":
        drawLine(ctx, width, height, frequencyData, accent, false, true, panel);
        break;
      case "mountain":
        drawLine(ctx, width, height, frequencyData, accent, true, true, panel);
        break;
      case "bars":
      default:
        drawBars(ctx, width, height, frequencyData, accent, false, panel);
        break;
    }
  }

  function startPanelLoop(panel) {
    cancelAnimationFrame(panel.animationFrame);
    const loop = () => {
      if (!panels.has(panel.id)) return;
      drawPanel(panel);
      panel.animationFrame = requestAnimationFrame(loop);
    };
    panel.animationFrame = requestAnimationFrame(loop);
  }

  function stopAudioGraph() {
    try { sourceNode?.disconnect(); } catch {}
    sourceNode = null;
    analyser = null;
    frequencyData = null;
    timeData = null;

    if (audioContext) {
      const context = audioContext;
      audioContext = null;
      context.close().catch(() => {});
    }

    if (captureStream) {
      const stream = captureStream;
      captureStream = null;
      stream.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
    }
  }

  function markCaptureStopped(message = "audio capture stopped") {
    stopAudioGraph();
    panels.forEach(panel => {
      panel.element
        .querySelector("[data-visualizer-inactive]")
        ?.removeAttribute("hidden");
    });
    emitState(message);
  }

  async function start(defaultMode = DEFAULT_MODE) {
    if (!watchPartyEnabled) {
      const error = new Error(
        "visualizers are available while watch party is enabled"
      );
      emitState(error.message);
      throw error;
    }

    if (!isSupported()) {
      const error = new Error(
        "tab-audio capture is not available in this browser"
      );
      emitState(error.message);
      throw error;
    }

    if (captureStream && analyser) {
      if (panels.size === 0) createPanel(defaultMode);
      emitState();
      return getState();
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser"
        },
        audio: {
          suppressLocalAudioPlayback: false
        },
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
        systemAudio: "include"
      });
    } catch (error) {
      emitState("tab audio capture was cancelled");
      throw error;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      stream.getTracks().forEach(track => track.stop());
      const error = new Error(
        "tab audio is unavailable in this browser"
      );
      emitState(error.message);
      throw error;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    await context.resume();

    const source = context.createMediaStreamSource(stream);
    const nextAnalyser = context.createAnalyser();
    nextAnalyser.fftSize = 2048;
    nextAnalyser.smoothingTimeConstant =
      hyperMode ? HYPER_SMOOTHING : NORMAL_SMOOTHING;
    nextAnalyser.minDecibels = -90;
    nextAnalyser.maxDecibels = -10;
    source.connect(nextAnalyser);

    captureStream = stream;
    audioContext = context;
    sourceNode = source;
    analyser = nextAnalyser;
    frequencyData = new Uint8Array(nextAnalyser.frequencyBinCount);
    timeData = new Uint8Array(nextAnalyser.fftSize);

    const endHandler = () => {
      if (captureStream === stream) {
        markCaptureStopped("tab audio sharing ended");
      }
    };
    stream.getTracks().forEach(track => track.addEventListener("ended", endHandler, { once: true }));

    if (panels.size === 0) {
      const saved = loadSavedPanels();
      if (saved.length > 0) {
        restoring = true;
        saved.forEach(item => createPanel(normaliseMode(item.mode), item));
        restoring = false;
        savePanels();
      } else {
        createPanel(defaultMode);
      }
    }

    emitState("visualizers enabled");
    return getState();
  }

  function stop({ removePanels = true, message = "visualizers disabled", emit = true } = {}) {
    stopAudioGraph();
    if (removePanels) {
      const saved = [...panels.values()].map(panel => ({
        mode: panel.mode,
        left: parseFloat(panel.element.style.left) || 24,
        top: parseFloat(panel.element.style.top) || 24,
        width: panel.element.offsetWidth,
        height: panel.element.offsetHeight
      }));
      if (saved.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
      panels.forEach(panel => {
        cancelAnimationFrame(panel.animationFrame);
        panel.element.remove();
      });
      panels.clear();
    }
    if (emit) {
      emitState(message);
    }
  }

  function setWatchPartyEnabled(enabled) {
    watchPartyEnabled = enabled === true;

    if (!watchPartyEnabled) {
      const hadVisualizerState = Boolean(
        captureStream || analyser || panels.size > 0
      );

      if (hadVisualizerState) {
        stop({
          removePanels: true,
          message: "visualizers paused while watch party is disabled",
          emit: false
        });
      }

      return;
    }

  }

  function addPanel(mode = DEFAULT_MODE) {
    return createPanel(normaliseMode(mode));
  }

  function syncTheme(theme = getWatchPartyTheme()) {
    panels.forEach(panel => {
      panel.element.dataset.theme = theme || "default";
    });
  }

  function setHyperMode(enabled) {
    hyperMode = enabled === true;
    localStorage.setItem(
      HYPER_STORAGE_KEY,
      hyperMode ? "true" : "false"
    );

    if (analyser) {
      analyser.smoothingTimeConstant =
        hyperMode ? HYPER_SMOOTHING : NORMAL_SMOOTHING;
    }

    panels.forEach(panel => {
      panel.hyperSpectrum?.clear?.();
    });

    emitState(
      hyperMode ? "hyper mode enabled" : "hyper mode disabled"
    );
    return getState();
  }

  function getState() {
    return {
      supported: isSupported(),
      active: Boolean(captureStream && analyser),
      panelCount: panels.size,
      maxPanels: MAX_PANELS,
      watchPartyEnabled,
      hyperMode
    };
  }

  window.addEventListener("resize", () => {
    panels.forEach(clampPanel);
  });

  return {
    MAX_PANELS,
    DEFAULT_MODE,
    isSupported,
    start,
    stop,
    setWatchPartyEnabled,
    addPanel,
    removePanel,
    syncTheme,
    setHyperMode,
    getState
  };
})();

window.watchPartyVisualizers = watchPartyVisualizers;

window.watchPartyPlayer = {
 applyState(state) {
  currentWatchPartyState = state;
  applyWatchPartyState(state);
},

  seekTo(targetTime) {
    if (
        !player ||
        !playerReady ||
        typeof player.seekTo !==
            "function"
    ) {
        return;
    }

    player.seekTo(
        Math.max(
            0,
            Number(targetTime) || 0
        ),
        true
    );
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
    duration,
    englishSubtitlesEnabled:
        watchPartyEnglishSubtitles,
    englishSubtitlesActive:
        playerEnglishSubtitlesActive === true
};
},

  setEnglishSubtitles(enabled) {
    watchPartyEnglishSubtitles =
        enabled === true;

    localStorage.setItem(
        "watch_party_english_subtitles",
        String(
            watchPartyEnglishSubtitles
        )
    );

    if (
        playbackMode !== "watch-party" ||
        watchPartyState.enabled !== true
    ) {
        return {
            enabled:
                watchPartyEnglishSubtitles,
            active: false
        };
    }

    const requiredEnglishSubtitles =
        shouldUseWatchPartyEnglishSubtitles();

    if (
        playerEnglishSubtitlesActive !==
            requiredEnglishSubtitles
    ) {
        rebuildYouTubePlayer({
    preservePlayback: true
});
    }

    return {
        enabled:
            watchPartyEnglishSubtitles,
        active:
            requiredEnglishSubtitles
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
},

seek(seconds) {
    if (
        !player ||
        !playerReady ||
        typeof player.seekTo !==
            "function"
    ) {
        return;
    }

    const targetTime =
        Number(seconds);

    if (
        !Number.isFinite(targetTime) ||
        targetTime < 0
    ) {
        return;
    }

    player.seekTo(
        targetTime,
        true
    );
},
  
  setVideoMode(mode) {
    const background =
        document.getElementById("bgndVideo");

    const poster =
        document.getElementById("videoPoster");

    if (!background) {
        return;
    }

    const activeMode =
        mode === "fit"
            ? "fit"
            : "cinematic";

    background.classList.remove(
        "watch-party-cinematic",
        "watch-party-fit"
    );

    background.classList.add(
        activeMode === "fit"
            ? "watch-party-fit"
            : "watch-party-cinematic"
    );

    if (poster) {
        poster.style.backgroundSize =
            activeMode === "fit"
                ? "contain"
                : "cover";

        poster.style.backgroundPosition =
            "center";

        poster.style.backgroundRepeat =
            "no-repeat";
    }
},
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

    if (!visible) {
      normalProgressWrap?.classList.add(
        "hidden"
      );

      normalProgressWrap?.setAttribute(
        "aria-hidden",
        "true"
      );

      normalProgressCurrentTooltip
    ?.classList.remove(
        "visible"
    );

normalProgressTooltip
    ?.classList.remove(
        "visible"
    );
      
    } else {
      updateNormalProgressVisibility();
    }
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

function setNormalProgressFromPointer(
  event
) {
  if (
    !normalProgressSlider ||
    !Number.isFinite(
      event?.clientX
    )
  ) {
    return null;
  }

  const duration =
    getNormalProgressDuration();

  if (duration <= 0) {
    return null;
  }

  const ratio =
    getRangePointerRatio(
      normalProgressSlider,
      event.clientX,
      10
    );

  const sliderMaximum =
    Number(
      normalProgressSlider.max
    ) || 100000;

  const sliderValue =
    Math.round(
      ratio *
      sliderMaximum
    );

  const targetTime =
    ratio *
    duration;

  normalProgressSlider.value =
    String(sliderValue);

  normalProgressSlider.style
    .setProperty(
      "--normal-progress",
      `${ratio * 100}%`
    );

  normalProgressTooltip.textContent =
    formatNormalProgressTime(
      targetTime
    );

  if (
    normalProgressCurrentTooltip &&
    normalProgressWrap
  ) {
    const sliderRect =
      normalProgressSlider
        .getBoundingClientRect();

    const wrapRect =
      normalProgressWrap
        .getBoundingClientRect();

    const thumbCentreLeft =
      sliderRect.left -
      wrapRect.left +
      5 +
      (
        sliderRect.width - 10
      ) * ratio;

    normalProgressCurrentTooltip
      .textContent =
        formatNormalProgressTime(
          targetTime
        );

    normalProgressCurrentTooltip
      .style.left =
        `${thumbCentreLeft}px`;
  }

  return targetTime;
}

if (normalProgressSlider) {
  let normalProgressPendingTime =
    null;

  const updateNormalDragPosition =
    event => {
      const targetTime =
        setNormalProgressFromPointer(
          event
        );

      if (
        Number.isFinite(targetTime)
      ) {
        normalProgressPendingTime =
          targetTime;
      }

      updateNormalProgressTooltip(
        event
      );
    };

  const finishNormalProgressSeeking =
    event => {
      if (!normalProgressSeeking) {
        return;
      }

     const displayedTargetTime =
  parseProgressTimeText(
    normalProgressTooltip
      ?.textContent || ""
  );

const finalTargetTime =
  Number.isFinite(
    displayedTargetTime
  )
    ? displayedTargetTime
    : normalProgressPendingTime;

if (
  Number.isFinite(
    finalTargetTime
  )
) {
  normalProgressSlider.value =
    String(
      Math.round(
        (
          finalTargetTime /
          getNormalProgressDuration()
        ) * 100000
      )
    );

  seekYouTubePrecisely(
    finalTargetTime
  );
}

      normalProgressSeeking = false;

      if (
        event?.pointerId !==
          undefined
      ) {
        normalProgressSlider
          .releasePointerCapture?.(
            event.pointerId
          );
      }

      if (
        Number.isFinite(
          normalProgressPendingTime
        )
      ) {
        seekYouTubePrecisely(
          normalProgressPendingTime
        );
      }

      normalProgressPendingTime =
        null;

      normalProgressCurrentTooltip
        ?.classList.remove(
          "visible"
        );

      normalProgressTooltip
        ?.classList.remove(
          "visible"
        );

      updateNormalProgress();
    };

  normalProgressSlider.addEventListener(
    "pointerenter",
    event => {
      showNormalProgressTooltips();

      updateNormalProgress();
      updateNormalProgressTooltip(
        event
      );
    }
  );

  normalProgressSlider.addEventListener(
    "pointerleave",
    () => {
      hideNormalProgressTooltips();
    }
  );

  normalProgressSlider.addEventListener(
    "pointerdown",
    event => {
      if (
        playbackMode !== "normal" ||
        !player ||
        !playerReady
      ) {
        return;
      }

      event.preventDefault();

      normalProgressSeeking = true;

      showNormalProgressTooltips();

      normalProgressSlider
        .setPointerCapture?.(
          event.pointerId
        );

      updateNormalDragPosition(
        event
      );
    }
  );

  normalProgressSlider.addEventListener(
    "pointermove",
    event => {
      if (normalProgressSeeking) {
        event.preventDefault();

        updateNormalDragPosition(
          event
        );

        return;
      }

      updateNormalProgressTooltip(
        event
      );
    }
  );

  normalProgressSlider.addEventListener(
    "pointerup",
    finishNormalProgressSeeking
  );

  normalProgressSlider.addEventListener(
    "pointercancel",
    finishNormalProgressSeeking
  );

  normalProgressSlider.addEventListener(
    "blur",
    () => {
      if (normalProgressSeeking) {
        finishNormalProgressSeeking();
      }
    }
  );
}

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

window.setInterval(
  updateNormalProgress,
  250
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
  <div id="artGallery" class="grid grid-cols-3 gap-4">
   <a href="party.jpg" class="block rounded overflow-hidden">
    <img src="party_thumb.jpg" alt="yaaaypartypopper" class="rounded hover:scale-105 transition transform duration-200" />
      </a>
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
    max-h-[44vh]
    sm:max-h-[44vh]
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
  
const phoneMode = getPhoneLayoutMode();

if (phoneMode === 'portrait') {
    guestBookWindow.style.left = '50%';
    guestBookWindow.style.top = '28%';
} else {
    guestBookWindow.style.left = '50%';
    guestBookWindow.style.top = '50%';
}
  
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

  guestBookWindow.setAttribute(
  "data-x",
  "0"
);

guestBookWindow.setAttribute(
  "data-y",
  "0"
);

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

const guestWindow =
  document.getElementById(
    "guestBookWindow"
  );

const commentBox =
  document.getElementById(
    "guestbookComments"
  );


requestAnimationFrame(() => {
  updateCommentBoxPosition();
});

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
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform =
  `translate(
    calc(-50% + ${x}px),
    calc(-50% + ${y}px)
  )`;
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


/* Keep terminal-theme effects scoped to Original chat mode. */
window.addEventListener('chat-theme-change', () => {
  const activeSiteTheme =
    localStorage.getItem('theme') ||
    document.documentElement.getAttribute('data-theme') ||
    'Default';

  if (themes[activeSiteTheme]) {
    applyTheme(activeSiteTheme);
  }
});
