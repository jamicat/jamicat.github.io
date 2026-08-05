class ChatWidget {

constructor() {
this.API = "https://jamicat.ahrly.workers.dev";
this.imageUploadConfig = {
    enabled: true,
    apiBase:
        `${this.API}/api/test/images`,
    maximumBytes:
        8 * 1024 * 1024
};
this.imageUploadRows =
    new Map();

this.activeImageUploads =
    new Map();
this.imageUploadCompleteSound =
    new Audio(
        "/socials/audio/upload-complete.wav"
    );
this.imageUploadCompleteSound.preload =
    "auto";

this.imageUploadCompleteSound.volume =
    0.18;
this.titleBar = null;
this.socket = null;
this.reconnectTimer = null;
this.isBanned = false;
this.unreadCount = 0;
this.userHasScrolledUp = false;
this.typingTimer = null;
this.typingUsers = new Map();
this.typingElement = null;
this.notificationSoundEnabled = true;
this.lastNotificationTime = 0;
this.messages = null;
this.watchParty = {
    enabled: false,
    currentVideoId: null,
    currentIndex: 0,
    startedAt: null,
    paused: false,
    pausedAt: null,
    queue: []
};
this.watchPartyTimeTimer = null;
this.watchPartySeeking = false;
this.watchPartySeekBusy = false;
this.watchPartyRainbowStartedAt =
    performance.now();
this.watchPartyResizeMinimum = 420;
this.watchPartyButton = null;
this.watchPartyPanel = null;
this.watchPartyOpen = false;
this.watchPartyAddUrl = "";
this.watchPartyAddPlaylist = false;
this.watchPartyAddMessage = "";
this.watchPartyAddError = false;
this.watchPartyAddBusy = false;
this.watchPartyScrollQueueAfterLength =
    null;
	this.watchPartyNavigationFromVideoId =
    null;
this.watchPartyRenderVersion = 0;
this.window = null;
this.nameInput = null;
this.messageInput = null;
this.sendButton = null;
this.avatarButton = null;
this.avatarPreview = null;
this.avatarPicker = null;
this.avatarGrid = null;
this.membersElement = null;
this.mainElement = null;
this.controlsElement = null;
this.minimizeButton = null;
this.membersToggle = null;
this.chatTitle = null;
this.motdElement = null;
this.motdTextElement = null;
this.currentMotd = "";
this.emojiButton = null;
this.emojiPickerContainer = null;
this.emojiPicker = null;
this.emojiPickerOpen = false;
this.emojiPickerMode = "message";
this.emojiReactionTarget = null;
this.emojiPickerAnchor = null;
this.emojiPickerHomeParent = null;
this.emojiPickerHomeNextSibling = null;
this.reactionEmojiPickerContainer = null;
this.reactionEmojiPicker = null;
this.customEmojiCategories = [];
this.customEmojiLookup = new Map();

this.replyTarget = null;
this.replyComposerPreview = null;
this.activeInlineEdit = null;
this.messageReactions = new Map();
this.reactionPicker = null;
this.reactionRequestBusy = new Set();
this.recentReactionStorageKey =
    "jamicat_recent_reactions";
this.recentReactions =
    this.loadRecentReactions();

this.discordAuthToken =
    localStorage.getItem(
        "chat_discord_session"
    ) || "";

this.discordUser = null;
this.discordAuthButton = null;
this.discordLogoutButton = null;
this.discordUsernameElement = null;

this.isAfk = false;
this.afkTimer = null;
this.lastActivityReset = 0;
	
this.adminKey =
    sessionStorage.getItem(
        "chat_admin_key"
    ) || "";

this.isAdmin = false;
this.moderationMenu = null;
this.banManager = null;
this.banManagerButton = null;
this.partyManager = null;
this.partyManagerButton = null;
this.partyManagerBusy = false;
this.watchPartyVideoMode = "cinematic";
this.WATCH_PARTY_COLOURS = [
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "pink",
    "rainbow",
    "default"
];
this.isMinimized = false;
this.membersPanel = null;
this.membersVisible = true;

this.avatar =
localStorage.getItem("chat_avatar") || "original.gif";

this.clientId =
localStorage.getItem("chat_client_id") ||
crypto.randomUUID();

localStorage.setItem(
"chat_client_id",
this.clientId
);
	
this.createWindow();

	window.addEventListener(
    "site-player-state",
    event => {
        const state =
            event.detail;

        if (
            state?.mode !== "watch-party" ||
            !this.watchParty?.enabled
        ) {
            return;
        }

        const playButton =
            this.watchPartyPanel?.querySelector(
                "button[data-watch-party-play]"
            );

        if (!playButton) {
            return;
        }

        playButton.textContent =
            state.playing === true
                ? "❚❚"
                : "▶";
    }
);
	
this.applyCurrentTheme();
this.restoreSettings();
this.setupDiscordAuthentication();

if (
    window.matchMedia("(max-width:640px)").matches
) {
    this.toggleMinimized();
}

this.setupAdminAuthentication();
this.setupAvatarPicker();
this.setupEmojiPicker();
this.setupMembersToggle();
this.setupNameSaving();
this.setupMemberActivity();
this.setupDragging();
this.setupImageRemixing();
window.addEventListener(
    "resize",
    () => this.keepTitleBarInViewport()
);

window.addEventListener(
    "orientationchange",
    () => this.keepTitleBarInViewport()
);

window.visualViewport?.addEventListener(
    "resize",
    () => this.keepTitleBarInViewport()
);
this.loadMotd();
this.loadWatchParty();
this.loadHistory()
    .then(() => this.loadReactions())
    .catch(error => {
        console.error(
            "Could not load chat history or reactions:",
            error
        );
    })
    .finally(() => {
        this.connect();
    });
}
   createWindow() {
    const windowElement = document.createElement("div");

    windowElement.id = "chatWindow";
    windowElement.className = `
    terminal2
    fixed right-4 bottom-4 sm:right-8 sm:bottom-8 z-[99999]
    flex h-[500px] w-[480px] max-w-[calc(100vw-2rem)]
    flex-col overflow-hidden
    rounded-3xl border border-white/15
    bg-black/20 text-white
    shadow-lg backdrop-blur-xl
transition-[height] duration-200
`;

    windowElement.innerHTML = `
        <div
            id="chatTitleBar"
            class="
                chat-drag-area
                flex min-h-10 items-center justify-between
                border-b border-white/10
                bg-black/10 px-4
                select-none cursor-move
            "
        >
            <span
                id="chatTitle"
                class="
                    theme-heading
                    text-xs font-bold tracking-widest
                    text-white text-blue-glow
                "
            >
                CAT CHAT
            </span>

           <div class="flex items-center gap-3">
    <button
        id="chatMembersToggle"
        type="button"
        class="
            theme-body
            text-[9px] text-white/50
            transition hover:text-white
        "
        aria-controls="chatMembersPanel"
        aria-expanded="true"
    >
        hide members
    </button>

    <div class="flex items-center gap-3">
    <span
        id="chatConnectionStatus"
        class="text-[9px] text-white/40"
        aria-live="polite"
    >
        connecting
    </span>

    <button
        id="chatMinimize"
        type="button"
        class="
            flex h-6 w-6 items-center justify-center
            rounded-md
            text-sm leading-none text-white/55
            transition
            hover:bg-white/10
            hover:text-white
        "
        aria-label="minimize live chat"
        aria-expanded="true"
        title="minimize chat"
    >
        −
    </button>
</div>
</div>
        </div>

		<div
    id="chatMotd"
    class="
        theme-body
        hidden
        shrink-0
        border-b border-white/10
        bg-black/5
        px-3 py-1.5
        text-[9px]
        leading-relaxed
        text-white/65
        select-none
    "
    title="message of the day"
>
    <span class="font-semibold text-white/85">
        message of the day:
    </span>

    <span
        id="chatMotdText"
        class="break-words"
    ></span>
</div>

<div
    id="chatMain"
    class="flex min-h-0 flex-1"
>
    <div
        id="chatMessages"
        class="
            min-h-0 min-w-0 flex-1
            overflow-y-auto
            pl-3 pr-1 py-3
            theme-body text-xs
        "
        aria-live="polite"
    ></div>

  <aside
    id="chatMembersPanel"
    class="
        flex
        flex-col
        w-28
        shrink-0
        border-l border-white/10
        bg-black/5
        px-2 py-3
        min-h-0
    "
>
        <div
            class="
                theme-heading
                mb-3 text-[9px]
                font-bold uppercase tracking-widest
                text-white/50
            "
        >
            members
        </div>

        <div
    id="chatMembers"
    class="
        flex-1
        min-h-0
        overflow-y-auto
        space-y-2
        theme-body
        text-[10px]
        pr-1
    "
>
            <div class="text-white/35">
                loading...
            </div>
        </div>
    </aside>
</div>

<div
    id="chatTyping"
    class="
        hidden
        border-t border-white/5
        px-3 py-1
        theme-body
        text-[9px] text-white/45
    "
></div>

        <div
            id="chatControls"
            class="
                flex flex-col gap-2
                border-t border-white/10
                bg-black/10 p-3
            "
        >

	<div class="flex items-stretch gap-2">
    <div class="relative shrink-0">
        <button
            id="chatAvatarButton"
            type="button"
            class="
                flex h-11 w-11
                items-center justify-center
                rounded-xl
                border border-white/10
                bg-black/20
                transition
                hover:bg-white/5
            "
            aria-label="choose avatar"
            aria-expanded="false"
            aria-controls="chatAvatarPicker"
        >
            <img
                id="chatAvatarPreview"
                src="/avatars/original.gif"
                alt=""
                class="pixel-avatar h-10 w-10 object-contain"
            >
        </button>

       <div
    id="chatAvatarPicker"
    class="
        invisible pointer-events-none opacity-0
        absolute bottom-full left-0 z-20
        mb-2 w-56
        overflow-hidden
        rounded-2xl
        border border-white/10
        bg-[#1f1f1f]
        p-3
        shadow-xl
        transition-opacity
    "
>
            <div
                class="
                    theme-heading
                    mb-3 text-[10px]
                    font-bold uppercase tracking-widest
                    text-white/60
                "
            >
                select avatar
            </div>

            <div
                id="chatAvatarGrid"
                class="grid grid-cols-5 gap-2"
            ></div>

            <button
                id="chatDiscordAuthButton"
                type="button"
                class="
                    theme-body
                    mt-3 w-full rounded-lg
                    border border-white/10
                    bg-white/5 px-2 py-2
                    text-[9px] text-white/65
                    transition
                    hover:bg-white/10
                    hover:text-white
                    disabled:cursor-wait
                    disabled:opacity-50
                "
            >
                log in with discord
            </button>
        </div>
    </div>

    <div class="relative min-w-0 flex-1">
        <input
            id="chatName"
            type="text"
            maxlength="20"
            autocomplete="nickname"
            placeholder="name"
            class="
                theme-body
                h-11 w-full min-w-0 rounded-xl
                border border-white/10
                bg-black/30 px-3 py-2
                text-xs text-white
                placeholder:text-white/35
                outline-none
                focus:border-white/25
            "
        >

        <div
            id="chatDiscordUsername"
            class="
                theme-body
                pointer-events-none
                absolute bottom-1.5 left-3
                hidden max-w-[calc(100%-5.5rem)]
                truncate text-[8px] text-white/40
            "
        ></div>

        <button
            id="chatDiscordLogout"
            type="button"
            class="
                theme-body
                absolute right-2 top-1/2
                hidden -translate-y-1/2
                rounded-lg border border-white/10
                bg-white/5 px-2 py-1
                text-[8px] text-white/60
                transition
                hover:bg-white/10
                hover:text-white
                disabled:cursor-wait
                disabled:opacity-50
            "
        >
            log out
        </button>
    </div>
</div>

            <div class="relative">
			
    <div class="flex items-stretch gap-2">
	<button
    id="chatImageUploadButton"
    type="button"
    class="
        flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-xl
        border border-white/10
        bg-black/20
        text-base leading-none
        transition
        hover:bg-white/5
        active:scale-95
    "
    aria-label="upload image"
    title="upload image"
>
    🖼️
</button>

<input
    id="chatImageUploadInput"
    type="file"
    accept="image/png,image/jpeg,image/gif,image/webp"
    class="hidden"
>

        <input
            id="chatMessage"
            type="text"
            maxlength="250"
            autocomplete="off"
            placeholder="type a message..."
            class="
                theme-body
                min-w-0 flex-1 rounded-xl
                border border-white/10
                bg-black/30 px-3 py-2
                text-xs text-white
                placeholder:text-white/35
                outline-none
                focus:border-white/25
            "
        >
<button
    id="chatWatchPartyButton"
    type="button"
    class="
        flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-xl
        border border-white/10
        bg-black/20
        text-base leading-none
        transition
        hover:bg-white/5
        active:scale-95
    "
	aria-expanded="false"
    aria-controls="chatWatchPartyPanel"
    aria-label="watch party"
    title="watch party"
>
    📺
</button>

        <button
            id="chatEmojiButton"
            type="button"
            class="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl
                border border-white/10
                bg-black/20
                text-base leading-none
                transition
                hover:bg-white/5
                active:scale-95
            "
            aria-label="choose emoji"
            aria-expanded="false"
            aria-controls="chatEmojiPicker"
            title="choose emoji"
        >
            🐱
        </button>

		
    </div>

<div
    id="chatWatchPartyPanel"
    class="
        terminal2
        invisible pointer-events-none opacity-0
        fixed z-[100002]
        flex flex-col
        w-72
        min-h-[420px]
        overflow-hidden
        rounded-2xl
        border border-white/15
        bg-black/95
        px-3 pt-3 pb-5
        text-white
        shadow-xl
        backdrop-blur-xl
        transition-opacity duration-150
    "
></div>

    <div
        id="chatEmojiPicker"
        class="
            invisible pointer-events-none opacity-0
            absolute bottom-full right-0 z-30
            mb-2
			isolate
            transform-gpu
            transition-opacity duration-150
        "
    ></div>
</div>

            <button
                id="chatSend"
                type="button"
                class="
                    theme-body
                    w-full rounded-xl
                    border border-white/10
                    bg-white/5 px-3 py-2
                    text-xs text-white
                    transition
                    hover:bg-white/10
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                "
            >
                send
            </button>
        </div>

    `;

    document.body.appendChild(windowElement);


    this.window = windowElement;
    this.messages = this.window.querySelector("#chatMessages");
	this.typingElement =
    this.window.querySelector("#chatTyping");
	this.chatTitle =
    this.window.querySelector("#chatTitle");
	this.motdElement =
    this.window.querySelector("#chatMotd");
    this.motdTextElement =
    this.window.querySelector("#chatMotdText");
    this.nameInput = this.window.querySelector("#chatName");
    this.messageInput = this.window.querySelector("#chatMessage");
    this.sendButton = this.window.querySelector("#chatSend");
	this.imageUploadButton =
    this.window.querySelector(
        "#chatImageUploadButton"
    );
this.imageUploadInput =
    this.window.querySelector(
        "#chatImageUploadInput"
    );
	this.watchPartyButton =
    this.window.querySelector(
        "#chatWatchPartyButton"
    );
if (this.watchPartyButton) {
    this.watchPartyButton.classList.add(
        "hidden"
    );
}
	this.watchPartyPanel =
    this.window.querySelector(
        "#chatWatchPartyPanel"
    );
	   if (this.watchPartyPanel) {
    document.body.appendChild(
        this.watchPartyPanel
    );
}
	   if (this.watchPartyPanel) {
    const savedHeight =
    parseFloat(
        localStorage.getItem(
            "watch_party_height"
        )
    );

this.watchPartyPanel.dataset.x =
    "0";

this.watchPartyPanel.dataset.y =
    "0";

this.watchPartyPanel.style.transform =
    "translate(0px, 0px)";

   const defaultWatchPartyHeight =
    Math.max(
        this.watchPartyResizeMinimum,
        Math.min(
            560,
            window.innerHeight - 24
        )
    );

const initialWatchPartyHeight =
    Number.isFinite(savedHeight) &&
    savedHeight >=
        this.watchPartyResizeMinimum
        ? savedHeight
        : defaultWatchPartyHeight;

this.watchPartyPanel.style.height =
    `${initialWatchPartyHeight}px`;

		   const storedTheme =
    localStorage.getItem(
        "watch_party_theme"
    );

const savedTheme =
    storedTheme === "white" ||
    storedTheme === "black"
        ? "default"
        : storedTheme || "default";

this.watchPartyPanel.dataset.theme =
    this.WATCH_PARTY_COLOURS.includes(
        savedTheme
    )
        ? savedTheme
        : "default";

localStorage.setItem(
    "watch_party_theme",
    this.watchPartyPanel.dataset.theme
);
}
	this.emojiButton =
    this.window.querySelector("#chatEmojiButton");

this.emojiPickerContainer =
    this.window.querySelector("#chatEmojiPicker");

this.emojiPickerHomeParent =
    this.emojiPickerContainer?.parentNode || null;

this.emojiPickerHomeNextSibling =
    this.emojiPickerContainer?.nextSibling || null;
    this.connectionStatus =
        this.window.querySelector("#chatConnectionStatus");
	   this.avatarButton =
    this.window.querySelector("#chatAvatarButton");
this.titleBar =
    this.window.querySelector("#chatTitleBar");
this.avatarPreview =
    this.window.querySelector("#chatAvatarPreview");

this.avatarPicker =
    this.window.querySelector("#chatAvatarPicker");

this.avatarGrid =
    this.window.querySelector("#chatAvatarGrid");

this.discordAuthButton =
    this.window.querySelector(
        "#chatDiscordAuthButton"
    );

this.discordLogoutButton =
    this.window.querySelector(
        "#chatDiscordLogout"
    );

this.discordUsernameElement =
    this.window.querySelector(
        "#chatDiscordUsername"
    );

this.membersElement =
    this.window.querySelector("#chatMembers");

	   this.membersPanel =
    this.window.querySelector("#chatMembersPanel");

this.membersToggle =
    this.window.querySelector("#chatMembersToggle");
	   this.mainElement =
    this.window.querySelector("#chatMain");

this.controlsElement =
    this.window.querySelector("#chatControls");

this.minimizeButton =
    this.window.querySelector("#chatMinimize");


this.createReplyComposerPreview();

	   this.motdElement.addEventListener(
    "contextmenu",
    event => {
        if (!this.isAdmin) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this.editMotd();
    }
);

	   if (
    this.imageUploadButton &&
    this.imageUploadInput
) {
    this.imageUploadButton
        .addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                this.imageUploadInput
                    .click();
            }
        );

    this.imageUploadInput
        .addEventListener(
            "change",
            () => {
                const file =
                    this.imageUploadInput
                        .files?.[0];

                this.imageUploadInput
                    .value = "";

                if (!file) {
                    return;
                }

               this.uploadTestImage(
    file
).catch(error => {
    console.error(
        "Unexpected image upload error:",
        error
    );

    window.alert(
        `Image upload failed: ${error.message}`
    );
});
            }
        );
}
	   
  this.sendButton.addEventListener(
    "click",
    () => this.sendMessage()
);

	   this.minimizeButton.addEventListener(
    "click",
    event => {
        event.stopPropagation();
        this.toggleMinimized();
    }
);
	   
	  if (this.watchPartyButton) {
    this.watchPartyButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.toggleWatchParty();
        }
    );
}
	   
	   this.messages.addEventListener(
    "scroll",
    () => {
        this.userHasScrolledUp =
            !this.isMessagesNearBottom();

        if (!this.userHasScrolledUp) {
            this.clearUnreadCount();
        }
    }
);
window.addEventListener(
    "resize",
    () => {
        if (this.watchPartyOpen) {
            this.positionWatchPartyPanel({
                forceClamp: true
            });
        }
    }
);
	   
	   this.messageInput.addEventListener(
    "input",
    () => {
        this.sendTypingState(true);

        clearTimeout(this.typingTimer);

        this.typingTimer = setTimeout(
            () => {
                this.sendTypingState(false);
            },
            1200
        );
    }
);
	   
	   
    this.messageInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
    }
});
document.addEventListener(
    "click",
    event => {
        if (
            this.moderationMenu &&
            !this.moderationMenu.contains(
                event.target
            )
        ) {
            this.closeModerationMenu();
        }

        if (
            this.banManager &&
            !this.banManager.contains(
                event.target
            ) &&
            event.target !==
                this.banManagerButton
        ) {
            this.closeBanManager();
        }

        if (
            this.partyManager &&
            !this.partyManager.contains(
                event.target
            ) &&
            event.target !==
                this.partyManagerButton
        ) {
            this.closePartyManager();
        }
    }
);

	   
	
}
setupAdminAuthentication() {
    const title =
        this.window.querySelector(
            "#chatTitle"
        );

    if (!title) {
        return;
    }

    title.addEventListener(
        "dblclick",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.promptForAdminLogin();
        }
    );

    if (this.adminKey) {
        this.verifyAdminKey(
            this.adminKey
        ).then(isValid => {
            if (isValid) {
                this.enableAdminMode(
                    this.adminKey
                );
                return;
            }

            this.disableAdminMode();
        });
    }
}
	async promptForAdminLogin() {
    const key = window.prompt(
        "enter the chat admin key:"
    );

    if (key === null) {
        return;
    }

    const cleanedKey =
        key.trim();

    if (!cleanedKey) {
        window.alert(
            "admin key cannot be empty"
        );
        return;
    }

    const isValid =
        await this.verifyAdminKey(
            cleanedKey
        );

    if (!isValid) {
        window.alert(
            "incorrect admin key"
        );
        return;
    }

    this.enableAdminMode(cleanedKey);

    window.alert(
        "chat moderation enabled"
    );
}
	async verifyAdminKey(key) {
    try {
        const response = await fetch(
            `${this.API}/api/admin/login`,
            {
                method: "POST",
                headers: {
                    "Authorization":
                        `Bearer ${key}`
                }
            }
        );

        return response.ok;
    } catch (error) {
        console.error(
            "could not verify admin key:",
            error
        );

        return false;
    }
}
	enableAdminMode(key) {
    this.adminKey = key;
    this.isAdmin = true;

    sessionStorage.setItem(
        "chat_admin_key",
        key
    );

    this.loadHistory();
		this.createBanManagerButton();
		this.createPartyManagerButton();
		this.renderWatchParty();
}

	

	disableAdminMode() {
    this.adminKey = "";
    this.isAdmin = false;

    sessionStorage.removeItem(
        "chat_admin_key"
    );

    this.closeModerationMenu();
	this.closeBanManager();
this.removeBanManagerButton();
		this.closePartyManager();
    this.removePartyManagerButton();
    this.partyManagerBusy = false;
    this.loadHistory();
	this.renderWatchParty();
}

	logoutAdmin() {
    this.disableAdminMode();

    window.alert(
        "chat moderation disabled"
    );
}

createBanManagerButton() {
    if (
        this.banManagerButton ||
        !this.membersToggle
    ) {
        return;
    }

    const button =
        document.createElement("button");

    button.type = "button";
    button.textContent = "bans";

    button.className = [
        "theme-body",
        "text-[9px]",
        "text-white/50",
        "transition",
        "hover:text-white"
    ].join(" ");

    button.title =
        "manage banned users";

    button.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            if (this.banManager) {
                this.closeBanManager();
            } else {
                this.openBanManager();
            }
        }
    );

    this.membersToggle.insertAdjacentElement(
        "beforebegin",
        button
    );

    this.banManagerButton = button;
}

	removeBanManagerButton() {
    if (!this.banManagerButton) {
        return;
    }

    this.banManagerButton.remove();
    this.banManagerButton = null;
}

	createPartyManagerButton() {
    if (
        this.partyManagerButton ||
        !this.membersToggle
    ) {
        return;
    }

    const button =
        document.createElement("button");

    button.type = "button";
    button.textContent = "party";

    button.className = [
        "theme-body",
        "text-[9px]",
        "text-white/50",
        "transition",
        "hover:text-white"
    ].join(" ");

    button.title =
        "manage watch party";

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    button.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            if (this.partyManager) {
                this.closePartyManager();
            } else {
                this.openPartyManager();
            }
        }
    );

    this.membersToggle.insertAdjacentElement(
        "beforebegin",
        button
    );

    this.partyManagerButton = button;
}

	removePartyManagerButton() {
    if (!this.partyManagerButton) {
        return;
    }

    this.partyManagerButton.remove();
    this.partyManagerButton = null;
}

	openPartyManager() {
    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        return;
    }

    this.closeAdminManagers();

    const panel =
        document.createElement("div");

    panel.className = [
        "fixed",
        "z-[100001]",
        "w-72",
        "max-w-[calc(100vw-2rem)]",
        "overflow-hidden",
        "rounded-2xl",
        "border",
        "border-white/15",
        "bg-black/95",
        "text-white",
        "shadow-xl",
        "backdrop-blur-xl"
    ].join(" ");

    const chatRect =
        this.window.getBoundingClientRect();

    panel.style.right =
        `${Math.max(
            16,
            window.innerWidth -
            chatRect.right
        )}px`;

    panel.style.bottom =
        `${Math.max(
            16,
            window.innerHeight -
            chatRect.top +
            8
        )}px`;

    document.body.appendChild(panel);

    this.partyManager = panel;

    if (this.partyManagerButton) {
        this.partyManagerButton.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    this.renderPartyManager();
}

	renderPartyManager() {
    if (!this.partyManager) {
        return;
    }

    const enabled =
        this.watchParty?.enabled === true;

    const busy =
        this.partyManagerBusy === true;

    this.partyManager.innerHTML = `
        <div
            class="
                flex items-center justify-between
                border-b border-white/10
                px-4 py-3
            "
        >
            <div>
                <div
                    class="
                        theme-heading
                        text-[10px]
                        font-bold uppercase
                        tracking-widest
                    "
                >
                    watch party
                </div>

                <div
                    class="
                        mt-1
                        theme-body
                        text-[9px]
                        ${
                            enabled
                                ? "text-emerald-300"
                                : "text-white/40"
                        }
                    "
                    data-party-status
                >
                    ${
                        enabled
                            ? "currently enabled"
                            : "currently disabled"
                    }
                </div>
            </div>

            <button
                type="button"
                data-close-party-manager
                class="
                    rounded px-2 py-1
                    text-white/50
                    transition
                    hover:bg-white/10
                    hover:text-white
                "
                aria-label="close watch party manager"
            >
                ×
            </button>
        </div>

        <div
            class="
                space-y-2
                p-3
                theme-body
                text-[11px]
            "
        >
            <button
                type="button"
                data-party-action="enable"
                class="
                    w-full
                    rounded-xl
                    border
                    px-3 py-2.5
                    text-left
                    transition
                    ${
                        enabled
                            ? `
                                cursor-default
                                border-emerald-300/20
                                bg-emerald-500/10
                                text-emerald-200/60
                            `
                            : `
                                border-white/10
                                bg-white/5
                                text-white/85
                                hover:border-emerald-300/30
                                hover:bg-emerald-500/10
                                hover:text-emerald-200
                            `
                    }
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
                ${
                    enabled || busy
                        ? "disabled"
                        : ""
                }
            >
                <span class="font-bold">
                    enable watch party
                </span>
            </button>

            <button
                type="button"
                data-party-action="disable"
                class="
                    w-full
                    rounded-xl
                    border
                    px-3 py-2.5
                    text-left
                    transition
                    ${
                        !enabled
                            ? `
                                cursor-default
                                border-white/10
                                bg-white/5
                                text-white/30
                            `
                            : `
                                border-red-300/20
                                bg-red-500/10
                                text-red-200
                                hover:border-red-300/40
                                hover:bg-red-500/20
                            `
                    }
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
                ${
                    !enabled || busy
                        ? "disabled"
                        : ""
                }
            >
                <span class="font-bold">
                    disable watch party
                </span>
            </button>

            <div
                class="
                    my-3
                    border-t border-white/10
                "
            ></div>

        <button
    type="button"
    data-party-action="clear"
    class="
        w-full
        rounded-xl
        border border-amber-300/20
        bg-amber-500/10
        px-3 py-2.5
        text-left
        text-amber-100
        transition
        hover:border-amber-300/40
        hover:bg-amber-500/20
        disabled:cursor-not-allowed
        disabled:opacity-50
    "
    ${busy ? "disabled" : ""}
>
    <span class="font-bold">
        clear queue
    </span>
</button>

            <div
                data-party-message
                class="
                    hidden
                    rounded-xl
                    border border-white/10
                    bg-white/5
                    px-3 py-2
                    text-[9px]
                    text-white/60
                "
                aria-live="polite"
            ></div>
        </div>
    `;

    const closeButton =
        this.partyManager.querySelector(
            "[data-close-party-manager]"
        );

		
    if (closeButton) {
        closeButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                this.closePartyManager();
            }
        );
    }

    const enableButton =
        this.partyManager.querySelector(
            '[data-party-action="enable"]'
        );

    if (enableButton) {
        enableButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                this.setWatchPartyEnabled(
                    true
                );
            }
        );
    }

    const disableButton =
        this.partyManager.querySelector(
            '[data-party-action="disable"]'
        );

    if (disableButton) {
        disableButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                this.setWatchPartyEnabled(
                    false
                );
            }
        );
    }

		const clearButton =
    this.partyManager.querySelector(
        '[data-party-action="clear"]'
    );

if (clearButton) {
    clearButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.clearWatchPartyQueue();
        }
    );
}
}

	setPartyManagerMessage(
    message,
    isError = false
) {
    if (!this.partyManager) {
        return;
    }

    const messageElement =
        this.partyManager.querySelector(
            "[data-party-message]"
        );

    if (!messageElement) {
        return;
    }

    const cleanedMessage =
        typeof message === "string"
            ? message.trim()
            : "";

    messageElement.textContent =
        cleanedMessage;

    messageElement.classList.toggle(
        "hidden",
        !cleanedMessage
    );

    messageElement.classList.toggle(
        "text-red-300",
        Boolean(
            cleanedMessage &&
            isError
        )
    );

    messageElement.classList.toggle(
        "text-emerald-300",
        Boolean(
            cleanedMessage &&
            !isError
        )
    );
}

	async setWatchPartyEnabled(enabled) {
    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        return;
    }

    if (this.partyManagerBusy) {
        return;
    }

    const shouldEnable =
        enabled === true;

    if (
        !shouldEnable &&
        this.watchParty?.enabled === true
    ) {
        const confirmed =
            window.confirm(
                "disable watch party?\n\n" +
                "this will end the party and clear " +
                "the watch party queue."
            );

        if (!confirmed) {
            return;
        }
    }

    this.partyManagerBusy = true;
    this.renderPartyManager();

    this.setPartyManagerMessage(
        shouldEnable
            ? "enabling watch party..."
            : "disabling watch party..."
    );

    try {
        const endpoint =
            shouldEnable
                ? "enable"
                : "disable";

        const response = await fetch(
            `${this.API}/api/admin/watchparty/${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Authorization":
                        `Bearer ${this.adminKey}`
                }
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch {
            // The error handling below covers
            // non-JSON responses.
        }

        if (
            response.status === 401 &&
            this.isAdmin
        ) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `could not ${
                    shouldEnable
                        ? "enable"
                        : "disable"
                } watch party (${response.status})`
            );
        }

        this.watchParty.enabled =
            shouldEnable;

	window.setTerminalMinimized?.(
    shouldEnable
);
        if (!shouldEnable) {
            this.watchParty.currentVideoId =
                null;

            this.watchParty.currentIndex = 0;
            this.watchParty.startedAt = null;
            this.watchParty.paused = false;
            this.watchParty.pausedAt = null;
            this.watchParty.queue = [];
            this.watchPartyOpen = false;
        }

        this.renderWatchParty();

        this.partyManagerBusy = false;
        this.renderPartyManager();

        this.setPartyManagerMessage(
            shouldEnable
                ? "watch party enabled."
                : "watch party disabled."
        );
    } catch (error) {
        console.error(
            "could not update watch party:",
            error
        );

        this.partyManagerBusy = false;
        this.renderPartyManager();

        this.setPartyManagerMessage(
            error.message,
            true
        );
    }
}

	async clearWatchPartyQueue() {
    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        return;
    }

    if (this.partyManagerBusy) {
        return;
    }

    const queue =
        Array.isArray(this.watchParty?.queue)
            ? this.watchParty.queue
            : [];

    if (queue.length === 0) {
        this.setPartyManagerMessage(
            "the watch party queue is already empty."
        );

        return;
    }

    const confirmed =
        window.confirm(
            "clear the entire watch party queue?\n\n" +
            "every queued video will be removed. " +
            "the watch party will remain enabled.\n\n" +
            "this cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    this.partyManagerBusy = true;
    this.renderPartyManager();

    this.setPartyManagerMessage(
        "clearing Watch Party queue..."
    );

    try {
        const response = await fetch(
            `${this.API}/api/admin/watchparty/clear`,
            {
                method: "POST",
                headers: {
                    "Authorization":
                        `Bearer ${this.adminKey}`
                }
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch {
            // The general error below handles
            // a non-JSON response.
        }

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `could not clear watch party queue (${response.status})`
            );
        }

        this.partyManagerBusy = false;
        this.renderPartyManager();

        this.setPartyManagerMessage(
            "watch party queue cleared."
        );
    } catch (error) {
        console.error(
            "could not clear watch party queue:",
            error
        );

        this.partyManagerBusy = false;
        this.renderPartyManager();

        this.setPartyManagerMessage(
            error.message,
            true
        );
    }
}

	closePartyManager() {
    if (!this.partyManager) {
        if (this.partyManagerButton) {
            this.partyManagerButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        return;
    }

    this.partyManager.remove();
    this.partyManager = null;

    if (this.partyManagerButton) {
        this.partyManagerButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}

	closeAdminManagers() {
    this.closeBanManager();
    this.closePartyManager();
}

	async openBanManager() {
    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        return;
    }

    this.closeAdminManagers();

    const panel =
        document.createElement("div");

    panel.className = [
        "fixed",
        "z-[100001]",
        "w-72",
        "max-w-[calc(100vw-2rem)]",
        "overflow-hidden",
        "rounded-2xl",
        "border",
        "border-white/15",
        "bg-black/95",
        "text-white",
        "shadow-xl",
        "backdrop-blur-xl"
    ].join(" ");

    const chatRect =
        this.window.getBoundingClientRect();

    panel.style.right =
        `${Math.max(
            16,
            window.innerWidth -
            chatRect.right
        )}px`;

    panel.style.bottom =
        `${Math.max(
            16,
            window.innerHeight -
            chatRect.top +
            8
        )}px`;

    panel.innerHTML = `
        <div
            class="
                flex items-center justify-between
                border-b border-white/10
                px-4 py-3
            "
        >
            <div
                class="
                    theme-heading
                    text-[10px]
                    font-bold uppercase tracking-widest
                "
            >
                banned users
            </div>

            <button
                type="button"
                data-close-ban-manager
                class="
                    rounded px-2 py-1
                    text-white/50
                    transition
                    hover:bg-white/10
                    hover:text-white
                "
                aria-label="close banned users panel"
            >
                ×
            </button>
        </div>

        <div
            data-ban-list
            class="
                max-h-80 overflow-y-auto
                p-3
                theme-body text-[11px]
            "
        >
            <div class="text-white/40">
                loading...
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    this.banManager = panel;

    panel
        .querySelector(
            "[data-close-ban-manager]"
        )
        .addEventListener(
            "click",
            () => this.closeBanManager()
        );

    await this.loadBannedUsers();
}

	closeBanManager() {
    if (!this.banManager) {
        return;
    }

    this.banManager.remove();
    this.banManager = null;
}

	async loadBannedUsers() {
    if (!this.banManager) {
        return;
    }

    const list =
        this.banManager.querySelector(
            "[data-ban-list]"
        );

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="text-white/40">
            loading...
        </div>
    `;

    try {
        const response = await fetch(
            `${this.API}/api/admin/chat/bans`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${this.adminKey}`
                }
            }
        );

        const result =
            await response.json();

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `could not load bans (${response.status})`
            );
        }

        this.renderBannedUsers(
            result.bans || []
        );
    } catch (error) {
        console.error(
            "could not load banned users:",
            error
        );

        list.innerHTML = "";

        const message =
            document.createElement("div");

        message.className =
            "text-red-300";

        message.textContent =
            error.message;

        list.appendChild(message);
    }
}

	renderBannedUsers(bans) {
    if (!this.banManager) {
        return;
    }

    const list =
        this.banManager.querySelector(
            "[data-ban-list]"
        );

    if (!list) {
        return;
    }

    list.replaceChildren();

    if (
        !Array.isArray(bans) ||
        bans.length === 0
    ) {
        const empty =
            document.createElement("div");

        empty.className =
            "text-white/40";

        empty.textContent =
            "nobody is banned";

        list.appendChild(empty);
        return;
    }

    for (const ban of bans) {
        const row =
            document.createElement("div");

  row.className = [
    "mb-2",
    "rounded-xl",
    "border",
    "border-white/10",
    "bg-white/5",
    "p-3",
    "last:mb-0"
].join(" ");

        const name =
            document.createElement("div");

        name.className =
            "font-bold text-white";

        name.textContent =
            ban.name || "unknown user";

        const reason =
            document.createElement("div");

        reason.className =
            "mt-1 break-words text-white/60";

        reason.textContent =
            `Reason: ${
                ban.reason ||
                "no reason provided"
            }`;

       const clientId =
    document.createElement("div");

clientId.className =
    "mt-1 break-all text-[9px] text-white/30";

clientId.textContent =
    `Client ID: ${ban.client_id || "not available"}`;

const ipAddress =
    document.createElement("div");

ipAddress.className =
    "mt-1 break-all text-[9px] text-white/40";

const cleanedIpAddress =
    typeof ban.ip_address === "string"
        ? ban.ip_address.trim()
        : "";

ipAddress.textContent =
    `IP: ${
        cleanedIpAddress || "not captured"
    }`;

		const copyIpButton =
    document.createElement("button");

copyIpButton.type = "button";
copyIpButton.textContent =
    cleanedIpAddress
        ? "copy IP"
        : "no IP";

copyIpButton.disabled =
    !cleanedIpAddress;

copyIpButton.className = [
    "mt-2",
    "rounded-md",
    "border",
    "border-white/10",
    "bg-white/5",
    "px-2",
    "py-1",
    "text-[9px]",
    "text-white/60",
    "transition",
    "hover:bg-white/10",
    "hover:text-white",
    "disabled:cursor-not-allowed",
    "disabled:opacity-40"
].join(" ");

copyIpButton.addEventListener(
    "click",
    async () => {
        if (!cleanedIpAddress) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                cleanedIpAddress
            );

            copyIpButton.textContent =
                "copied";

            setTimeout(() => {
                copyIpButton.textContent =
                    "copy IP";
            }, 1200);
        } catch (error) {
            console.error(
                "could not copy IP address:",
                error
            );

            window.alert(
                "could not copy the IP address"
            );
        }
    }
);
		
const unbanButton =
    document.createElement("button");

        unbanButton.type = "button";
        unbanButton.textContent = "unban";

        unbanButton.className = [
            "mt-3",
            "w-full",
            "rounded-lg",
            "border",
            "border-white/10",
            "bg-white/5",
            "px-3",
            "py-2",
            "text-[10px]",
            "transition",
            "hover:bg-white/10",
            "disabled:cursor-not-allowed",
            "disabled:opacity-40"
        ].join(" ");

        unbanButton.addEventListener(
            "click",
            () => {
                this.unbanClient(
                    ban.client_id,
                    ban.name,
                    unbanButton
                );
            }
        );

        row.append(
            name,
            reason,
            clientId,
			ipAddress,
			copyIpButton,
            unbanButton
        );

        list.appendChild(row);
    }
}

	async unbanClient(
    clientId,
    name,
    button
) {
    const confirmed =
        window.confirm(
            `unban ${
                name || "this user"
            }?`
        );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "unbanning...";

    try {
        const response = await fetch(
            `${this.API}/api/admin/chat/unban`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${this.adminKey}`
                },
                body: JSON.stringify({
                    clientId
                })
            }
        );

        const result =
            await response.json();

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `unban failed (${response.status})`
            );
        }

        if (!result.removed) {
            window.alert(
                "that client was not currently banned"
            );
        } else {
            window.alert(
                `${
                    name || "User"
                } has been unbanned`
            );
        }

        await this.loadBannedUsers();
    } catch (error) {
        console.error(
            "could not unban client:",
            error
        );

        window.alert(
            `could not unban user: ${
                error.message
            }`
        );

        button.disabled = false;
        button.textContent = "unban";
    }
}

setMotd(message) {
    if (
        !this.motdElement ||
        !this.motdTextElement
    ) {
        return;
    }

    const cleanedMessage =
        typeof message === "string"
            ? message.trim()
            : "";

    this.currentMotd = cleanedMessage;
    this.motdTextElement.textContent =
        cleanedMessage;

const wasAtBottom = this.isMessagesNearBottom();

if (cleanedMessage) {
    this.motdElement.classList.remove("hidden");
} else {
    this.motdElement.classList.add("hidden");
}

if (wasAtBottom) {
    requestAnimationFrame(() => {
        this.scrollMessagesToBottom();
    });
}
	
}
	async loadMotd() {
    try {
        const response = await fetch(
            `${this.API}/api/chat/motd`
        );

        if (!response.ok) {
            throw new Error(
                `could not load MOTD (${response.status})`
            );
        }

        const result =
            await response.json();

        this.setMotd(
            result.message || ""
        );
    } catch (error) {
        console.error(
            "could not load chat MOTD:",
            error
        );

        this.setMotd("");
    }
}

async loadWatchParty() {
    try {
        const response = await fetch(
            `${this.API}/api/watchparty`
        );

        if (!response.ok) {
            throw new Error(
                `could not load watch party (${response.status})`
            );
        }

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(
                result.error ||
                "watch party request failed"
            );
        }
		
        this.watchParty = {
            enabled:
                result.state?.enabled === true,

            currentVideoId:
                result.state?.currentVideoId || null,

            currentIndex:
                Number.isInteger(
                    result.state?.currentIndex
                )
                    ? result.state.currentIndex
                    : 0,

            startedAt:
                result.state?.startedAt || null,

            paused:
                result.state?.paused === true,

            pausedAt:
                result.state?.pausedAt || null,

            queue:
                Array.isArray(result.queue)
                    ? result.queue
                    : []
        };

		window.watchPartyPlayer?.applyState(
    this.watchParty
);
		
        this.renderWatchParty();
		
    } catch (error) {
        console.error(
            "could not load watch party:",
            error
        );

        this.watchParty = {
            enabled: false,
            currentVideoId: null,
            currentIndex: 0,
            startedAt: null,
            paused: false,
            pausedAt: null,
            queue: []
        };

        this.renderWatchParty();
    }
}


	startWatchPartyTime() {
    const timeLabel =
        this.watchPartyPanel?.querySelector(
            "#watchPartyTime"
        );

    const progressInput =
        this.watchPartyPanel?.querySelector(
            "[data-watch-party-progress]"
        );

    const progressFill =
        this.watchPartyPanel?.querySelector(
            "[data-watch-party-progress-fill]"
        );

    const currentTooltip =
    this.watchPartyPanel?.querySelector(
        "[data-watch-party-progress-current-tooltip]"
    );

    if (!timeLabel) {
        return;
    }

    clearInterval(
        this.watchPartyTimeTimer
    );

    const updateTime = () => {
        const player =
            window.watchPartyPlayer;

        if (!player?.getState) {
            timeLabel.textContent =
                "0:00 / 0:00";

            return;
        }

        const state =
            player.getState();

        if (!state) {
            return;
        }

        const currentTime =
            Number.isFinite(state.currentTime)
                ? Math.max(0, state.currentTime)
                : 0;

        const duration =
            Number.isFinite(state.duration)
                ? Math.max(0, state.duration)
                : 0;

        timeLabel.textContent =
            `${this.formatDuration(
                currentTime
            )} / ${this.formatDuration(
                duration
            )}`;

        if (
            !progressInput ||
            this.watchPartySeeking
        ) {
            return;
        }

        progressInput.max =
            String(
                duration > 0
                    ? duration
                    : 1
            );

        progressInput.value =
            String(
                Math.min(
                    currentTime,
                    duration > 0
                        ? duration
                        : 1
                )
            );

        const percentage =
            duration > 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        (
                            currentTime /
                            duration
                        ) * 100
                    )
                )
                : 0;

        if (progressFill) {
            progressFill.style.width =
                `${percentage}%`;
        }

        if (currentTooltip) {
    currentTooltip.textContent =
        this.formatDuration(
            currentTime
        );

    currentTooltip.style.left =
        `${percentage}%`;
}
    };

    updateTime();

    this.watchPartyTimeTimer =
        setInterval(updateTime, 250);
}
	
renderWatchParty() {
    const renderVersion =
        ++this.watchPartyRenderVersion;

    const previousQueueList =
        this.watchPartyPanel?.querySelector(
            "[data-watch-party-queue-list]"
        );

    const previousQueueScrollTop =
        previousQueueList
            ? previousQueueList.scrollTop
            : 0;

    const previousQueueWasNearBottom =
        previousQueueList
            ? (
                previousQueueList.scrollHeight -
                previousQueueList.scrollTop -
                previousQueueList.clientHeight
            ) <= 12
            : false;

	const hadAddInputFocus =
    document.activeElement?.matches?.(
        "[data-watch-party-add-input]"
    ) === true;

const addInputSelectionStart =
    hadAddInputFocus &&
    Number.isInteger(
        document.activeElement
            ?.selectionStart
    )
        ? document.activeElement
            .selectionStart
        : null;

    if (
        !this.watchPartyButton ||
        !this.watchPartyPanel
    ) {
        return;
    }

    const isEnabled =
        this.watchParty.enabled === true;

	this.watchPartyVideoMode =
    localStorage.getItem(
        "watch_party_video_mode"
    ) || "cinematic";
	
this.watchPartyButton.classList.toggle(
    "hidden",
    !isEnabled
);

window.setTerminalPlaybackControlsVisible?.(
    !isEnabled
);

window.setDiscordStatusVisible?.(
    !isEnabled
);

   if (!isEnabled) {
    this.watchPartyOpen = false;
    this.watchPartyAddUrl = "";
    this.watchPartyAddMessage = "";
    this.watchPartyAddError = false;
    this.watchPartyAddBusy = false;
}

    this.watchPartyButton.setAttribute(
        "aria-expanded",
        this.watchPartyOpen
            ? "true"
            : "false"
    );

    this.watchPartyPanel.classList.toggle(
        "invisible",
        !this.watchPartyOpen
    );

    this.watchPartyPanel.classList.toggle(
        "pointer-events-none",
        !this.watchPartyOpen
    );

    this.watchPartyPanel.classList.toggle(
        "opacity-0",
        !this.watchPartyOpen
    );

	this.positionWatchPartyPanel();

    if (!this.watchPartyOpen) {
        return;
    }

    const queue =
        Array.isArray(this.watchParty.queue)
            ? this.watchParty.queue
            : [];

    const currentVideo =
        queue.find(item => {
            return (
                item.videoId ===
                this.watchParty.currentVideoId
            );
        }) || null;

    const queueItems =
        queue.length > 0
            ? queue.map((item, index) => {
                const isCurrent =
                    item.videoId ===
                    this.watchParty.currentVideoId;

                const queueId =
                    Number(item.id);

                const ownsItem =
                    item.requestedByClientId ===
                    this.clientId;

                const canRemove =
                    Number.isInteger(queueId) &&
                    queueId > 0 &&
                    (
                        this.isAdmin ||
                        ownsItem
                    );

                const removeButton =
                    canRemove
                        ? `
                            <button
                                type="button"
                                data-watch-party-remove="${queueId}"
                                class="
                                    shrink-0
                                    rounded-lg
                                    border border-red-300/20
                                    bg-red-500/10
                                    px-2 py-1
                                    text-[8px]
                                    font-bold uppercase
                                    tracking-wide
                                    text-red-200
                                    transition
                                    hover:border-red-300/40
                                    hover:bg-red-500/20
                                    hover:text-red-100
                                    disabled:cursor-wait
                                    disabled:opacity-50
                                "
                                aria-label="Remove ${
                                    this.escapeHtml(
                                        item.title ||
                                        "queued video"
                                    )
                                }"
                                title="${
                                    isCurrent
                                        ? "Remove and skip to the next video"
                                        : "Remove from queue"
                                }"
                            >
                                remove
                            </button>
                        `
                        : "";

              return `
    <div
        data-watch-party-play="${queueId}"
        class="
            flex items-start gap-2
            rounded-xl
            border border-white/10
            bg-white/5
            px-3 py-2
            transition
            hover:bg-white/10
        cursor-pointer
        "
    >
                        <div
                            class="
                                shrink-0
                                text-[9px]
                                text-white/35
                            "
                        >
                            ${index + 1}
                        </div>

                        <div class="min-w-0 flex-1">
                            <div
                                class="
                                    truncate
                                    text-[10px]
                                    ${
                                        isCurrent
                                            ? "font-bold text-emerald-300"
                                            : "text-white/80"
                                    }
                                "
                                title="${this.escapeHtml(
                                    item.title ||
                                    "Untitled video"
                                )}"
                            >
                                ${this.escapeHtml(
                                    item.title ||
                                    "Untitled video"
                                )}
                            </div>

                            <div
                                class="
                                    mt-1 truncate
                                    text-[8px]
                                    text-white/35
                                "
                            >
                                <span data-watch-party-added-label>
    added by
	 ${this.escapeHtml(
                                    item.requestedByName ||
                                    "anonymous"
                                )}
</span>
                               
                            </div>
                        </div>

                        ${removeButton}
                    </div>
                `;
            }).join("")
            : `
                <div
				    data-watch-party-empty
                    class="
                        rounded-xl
                        border border-white/10
                        bg-white/5
                        px-3 py-4
                        text-center
                        text-[10px]
                        text-white/40
                    "
                >
                    <span data-watch-party-empty-text>
    the queue is empty
</span>
                </div>
            `;
const playerState =
    window.watchPartyPlayer?.getState?.();

const playerIsCurrentlyPlaying =
    playerState?.mode === "watch-party" &&
    playerState?.playing === true;

const englishSubtitlesEnabled =
    playerState?.englishSubtitlesEnabled ===
        true;

const hasWatchPartyVideo =
    Boolean(
        this.watchParty.currentVideoId
    );
	
    this.watchPartyPanel.innerHTML = `
        <div
    class="
        watch-party-drag-area
        flex items-center justify-between
        border-b border-white/10
        pb-3
        select-none cursor-move
    "
>
            <div
    data-watch-party-heading
    class="
        theme-heading
        text-[10px]
        font-bold uppercase tracking-widest
    "
>
    watch party
</div>

<div class="relative flex items-center gap-2">
    <div
    id="watchPartyColourPicker"
    class="
        hidden
        absolute
        right-0 top-full
        z-50
        mt-2
        grid
        grid-cols-2
        gap-1
        w-max
        rounded-xl
        border border-white/10
        bg-black/95
        p-2
        shadow-xl
        backdrop-blur-xl
    "
></div>


    <button
        type="button"
        data-watch-party-colour
        class="
            no-drag
            flex h-7 w-7
            items-center justify-center
            rounded-md
            text-base leading-none
            text-white/70
            transition
            hover:bg-white/10
            hover:text-white
        "
        aria-label="change watch party colour"
        aria-expanded="false"
        title="change watch party colour"
    >
        ${this.getColourEmoji(
            localStorage.getItem(
                "watch_party_theme"
            ) || "default"
        )}
    </button>

	<button
    type="button"
    data-watch-party-video-mode
    class="
        no-drag
        flex h-7 w-7
        items-center justify-center
        rounded-md
        text-base leading-none
        text-white/70
        transition
        hover:bg-white/10
        hover:text-white
    "
    aria-label="toggle fit video"
    title="${
        this.watchPartyVideoMode === "fit"
            ? "toggle cinematic cover"
            : "toggle fit cover"
}"
>
    ${this.getWatchPartyVideoModeEmoji(
        this.watchPartyVideoMode
    )}
</button>

    <button
        type="button"
        data-close-watch-party
        class="
            no-drag
            rounded-md
            px-2 py-1
            text-sm
            text-white/50
            transition
            hover:bg-white/10
            hover:text-white
        "
        aria-label="close watch party"
    >
        ×
    </button>
</div>
</div>

    <form
        data-watch-party-add-form
        class="
            mt-3
            border-b border-white/10
            pb-4
        "
    >
        <label
            for="chatWatchPartyUrl"
			data-watch-party-add-heading
            class="
                theme-heading
                block
                text-[9px]
                uppercase tracking-widest
                text-white/40
            "
        >
            add youtube video or playlist
        </label>

        <div
            class="
                mt-2
                flex gap-2
            "
        >
            <input
                id="chatWatchPartyUrl"
                type="url"
                inputmode="url"
                autocomplete="off"
                spellcheck="false"
                data-watch-party-add-input
                value="${this.escapeHtml(
                    this.watchPartyAddUrl
                )}"
                placeholder="paste a youtube url or playlist url"
				data-watch-party-url
                class="
                    min-w-0
                    flex-1
                    rounded-xl
                    border border-white/10
                    bg-black/20
                    px-3 py-2
                    text-[10px]
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/25
                    focus:border-white/25
                    focus:bg-black/30
                    disabled:cursor-wait
                    disabled:opacity-50
                "
                ${
                    this.watchPartyAddBusy
                        ? "disabled"
                        : ""
                }
            >

            <button
                type="submit"
                data-watch-party-add-button
                class="
                    shrink-0
                    rounded-xl
                    border border-emerald-300/20
                    bg-emerald-500/10
                    px-3 py-2
                    text-[9px]
                    font-bold uppercase
                    tracking-wide
                    text-emerald-200
                    transition
                    hover:border-emerald-300/40
                    hover:bg-emerald-500/20
                    hover:text-emerald-100
                    disabled:cursor-wait
                    disabled:opacity-50
                "
                ${
                    this.watchPartyAddBusy
                        ? "disabled"
                        : ""
                }
            >
                ${
                    this.watchPartyAddBusy
                        ? "adding..."
                        : "add"
                }
              </button>
        </div>

        <label
            class="
                theme-body
                mt-2
				watch-party-playlist-label
                flex items-center gap-2
                text-[9px]
                text-white/55
                select-none
                cursor-pointer
            "
        >
            <input
                type="checkbox"
                data-watch-party-add-playlist
                class="
				    watch-party-playlist-checkbox
                    h-3 w-3
                    accent-current
                    disabled:cursor-wait
                    disabled:opacity-50
                "
                ${
                    this.watchPartyAddPlaylist
                        ? "checked"
                        : ""
                }
                ${
                    this.watchPartyAddBusy
                        ? "disabled"
                        : ""
                }
            >
            <span
			data-watch-party-playlist-text
			>
                add playlist
            </span>
        </label>

        <div
            data-watch-party-add-message
            class="
                mt-2
                min-h-[14px]
                text-[9px]
                ${
                    this.watchPartyAddError
                        ? "text-red-300"
                        : "text-emerald-300"
                }
            "
            role="${
                this.watchPartyAddError
                    ? "alert"
                    : "status"
            }"
        >
            ${this.escapeHtml(
                this.watchPartyAddMessage
            )}
        </div>
    </form>
<div class="mt-3">
    <div
        class="
            flex
            items-center
            gap-2
            theme-heading
            text-[9px]
            uppercase
            tracking-widest
            text-white/40
        "
    >
        <span
		data-watch-party-now-playing-heading
		>now playing</span>

        <span
            id="watchPartyTime"
			data-watch-party-time
            class="
			    watch-party-time
                normal-case
                tracking-normal
                tabular-nums
                text-white/80
            "
        >
            0:00 / 0:00
        </span>
    </div>

            <div
    data-watch-party-now-playing
    class="
        mt-2
        rounded-xl
        border border-white/10
        bg-white/5
        px-3 py-3
    "
>
                <div
				    data-watch-party-now-playing-title
                    class="
                        text-[11px]
                        font-bold
                        text-white/85
                    "
                >
                    ${
                        currentVideo
                            ? this.escapeHtml(
                                currentVideo.title
                            )
                            : "nothing playing yet"
                    }
                </div>

               ${
    currentVideo
        ? `
           <div
    class="
        mt-1
        flex
        w-full
        flex-col
        gap-0
        text-[8px]
        text-white/35
    "
>
    <a
        data-watch-party-video-link
        href="https://www.youtube.com/watch?v=${encodeURIComponent(
            currentVideo.videoId
        )}"
        target="_blank"
        rel="noopener noreferrer"
        title="Open this video on YouTube"
        class="
            inline-flex
            w-fit
            items-center
            gap-1
            leading-none
            underline
            underline-offset-2
            transition
        "
    >
        <span>watch on youtube</span>
        <span aria-hidden="true">↗</span>
    </a>

    <div
        class="
            flex
            w-full
            min-w-0
            items-center
            justify-between
            gap-2
            leading-none
        "
    >
        <span
            data-watch-party-requested-label
            class="
                min-w-0
                truncate
                leading-none
            "
        >
            requested by
            ${this.escapeHtml(
                currentVideo.requestedByName ||
                "anonymous"
            )}
        </span>

        <button
            type="button"
            data-watch-party-subtitles
            aria-pressed="${
                englishSubtitlesEnabled
                    ? "true"
                    : "false"
            }"
            title="${
                englishSubtitlesEnabled
                    ? "use automatic subtitle behaviour"
                    : "prefer english subtitles"
            }"
            class="
                watch-party-subtitles
                inline-flex
                h-4
                shrink-0
                items-center
                justify-center
                gap-1
                rounded
                border
                px-1
                py-0
                text-[7px]
                leading-none
                transition
            "
        >
            <span
                data-watch-party-subtitles-badge
                class="
                    inline-flex
                    h-2.5
                    min-w-[15px]
                    items-center
                    justify-center
                    rounded-sm
                    border
                    px-0.5
                    text-[6px]
                    font-bold
                    leading-none
                "
            >
                CC
            </span>

            <span
                data-watch-party-subtitles-text
                class="leading-none"
            >
                subtitles
            </span>

            <span
                data-watch-party-subtitles-status
                class="
                    leading-none
                    opacity-60
                "
            >
                ${
                    englishSubtitlesEnabled
                        ? "on"
                        : "off"
                }
            </span>
        </button>
    </div>
</div>
</div>
        `
        : ""
}

<div class="mt-4">
    <div
        class="
            relative
            mb-4
            flex
            h-5
            items-center
            group
        "
        data-watch-party-progress-container
    >
        <div
            class="
                pointer-events-none
                absolute
                left-0 right-0
                h-1.5
                overflow-hidden
                rounded-full
                bg-white/10
            "
        >
            <div
                data-watch-party-progress-fill
                class="
                    h-full
                    rounded-full
                    bg-white/70
                "
                style="width: 0%"
            ></div>
        </div>

        <input
            type="range"
            data-watch-party-progress
            min="0"
            max="1"
            step="0.1"
            value="0"
			step="0.1"
            ${hasWatchPartyVideo ? "" : "disabled"}
            class="
                watch-party-progress
                relative
                z-10
                h-5
                w-full
                cursor-pointer
                appearance-none
                bg-transparent
                disabled:cursor-not-allowed
                disabled:opacity-35
            "
            aria-label="Watch Party playback position"
        >

       <div
    data-watch-party-progress-current-tooltip
    class="
        pointer-events-none
        absolute
        bottom-full
        z-20
        mb-1
        -translate-x-1/2
        whitespace-nowrap
        rounded-md
        border border-white/10
        bg-black/95
        px-2 py-1
        text-[9px]
        tabular-nums
        text-white/80
        opacity-0
        transition-opacity
    "
    style="left: 0%"
>
    0:00
</div>

<div
    data-watch-party-progress-hover-tooltip
    class="
        pointer-events-none
        absolute
        bottom-full
        z-20
        mb-1
        -translate-x-1/2
        whitespace-nowrap
        rounded-md
        border border-white/10
        bg-black/95
        px-2 py-1
        text-[9px]
        tabular-nums
        text-white/80
        opacity-0
        transition-opacity
    "
    style="left: 0%"
>
    0:00
</div>
    </div>

    <div
        class="
            flex
            items-center
            justify-center
            gap-3
        "
    >
        <button
            type="button"
            data-watch-party-previous
            class="
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2
                text-white/80
                transition
                hover:bg-white/10
                disabled:cursor-not-allowed
                disabled:opacity-35
            "
            ${hasWatchPartyVideo ? "" : "disabled"}
            aria-label="Previous video"
            title="Previous video"
        >
            ⏮
        </button>

        <button
            type="button"
            data-watch-party-play
            class="
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2
                text-white/80
                transition
                hover:bg-white/10
                disabled:cursor-not-allowed
                disabled:opacity-35
            "
            ${hasWatchPartyVideo ? "" : "disabled"}
            aria-label="Play or pause"
        >
            ${
                playerIsCurrentlyPlaying
                    ? "❚❚"
                    : "▶"
            }
        </button>

        <button
            type="button"
            data-watch-party-next
            class="
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2
                text-white/80
                transition
                hover:bg-white/10
                disabled:cursor-not-allowed
                disabled:opacity-35
            "
            ${hasWatchPartyVideo ? "" : "disabled"}
            aria-label="Next video"
            title="Next video"
        >
            ⏭
        </button>
    </div>
</div>
            </div>
        </div>

       <div
    class="
        mt-4
        flex
        min-h-0
        flex-1
        flex-col
    "
>
   <div
    data-watch-party-queue-heading
    class="
        theme-heading
        mb-2
        shrink-0
        text-[9px]
        uppercase tracking-widest
        text-white/40
    "
>
    queue (${queue.length})
</div>

   <div
    data-watch-party-queue-list
style="overflow-anchor: none;"
class="
    min-h-0
        flex-1
        space-y-2
        overflow-y-auto
        overscroll-contain
        pr-1
    "
>
    ${queueItems}
</div>
</div>

<div
    data-watch-party-resize-handle
    class="
        absolute
        bottom-0 left-0 right-0
        z-30
        flex h-4
        cursor-ns-resize
        touch-none
        items-end
        justify-center
        select-none
    "
    aria-hidden="true"
>
    <div
    data-watch-party-resize-grip
    class="
        mb-1
        h-0.5 w-10
        rounded-full
        bg-white/20
        transition
        hover:bg-white/40
    "
></div>
</div>
    `;

	this.startWatchPartyTime();
	this.syncWatchPartyRainbowAnimations();

	const colourButton =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-colour]"
    );

const videoModeButton =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-video-mode]"
    );

const colourPicker =
    this.watchPartyPanel.querySelector(
        "#watchPartyColourPicker"
    );

this.renderWatchPartyColours();

if (
    colourButton &&
    colourPicker
) {
    colourButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            const willOpen =
                colourPicker.classList.contains(
                    "hidden"
                );

            colourPicker.classList.toggle(
                "hidden"
            );

            colourButton.setAttribute(
                "aria-expanded",
                String(willOpen)
            );
        }
    );

    colourPicker
        .querySelectorAll(
            "[data-watch-party-theme]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    const colour =
                        button.dataset
                            .watchPartyTheme;

                    this.setWatchPartyTheme(
                        colour
                    );

                    colourPicker.classList.add(
                        "hidden"
                    );

                    colourButton.setAttribute(
    "aria-expanded",
    "false"
);

colourPicker
    .querySelectorAll(
        "[data-watch-party-theme]"
    )
    .forEach(themeButton => {
        const isSelected =
            themeButton.dataset
                .watchPartyTheme === colour;

        themeButton.classList.toggle(
            "bg-white/15",
            isSelected
        );

        themeButton.classList.toggle(
            "ring-1",
            isSelected
        );

        themeButton.classList.toggle(
            "ring-white/40",
            isSelected
        );
    });
                }
            );
        });
}

if (videoModeButton) {
    videoModeButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.setWatchPartyVideoMode(
                this.watchPartyVideoMode === "fit"
                    ? "cinematic"
                    : "fit"
            );
        }
    );
}
	
    const closeButton =
        this.watchPartyPanel.querySelector(
            "[data-close-watch-party]"
        );

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                this.watchPartyOpen = false;
                this.renderWatchParty();
            }
        );
    }

	const addForm =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-add-form]"
    );

const addInput =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-add-input]"
    );

if (addInput) {
    addInput.addEventListener(
        "input",
        event => {
            this.watchPartyAddUrl =
                event.target.value;

            if (this.watchPartyAddMessage) {
                this.watchPartyAddMessage = "";
                this.watchPartyAddError = false;

                const messageElement =
                    this.watchPartyPanel.querySelector(
                        "[data-watch-party-add-message]"
                    );

                if (messageElement) {
                    messageElement.textContent = "";
                    messageElement.classList.remove(
                        "text-red-300"
                    );
                    messageElement.classList.add(
                        "text-emerald-300"
                    );
                }
            }
        }
    );
}

	const addPlaylistCheckbox =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-add-playlist]"
    );

if (addPlaylistCheckbox) {
    addPlaylistCheckbox.addEventListener(
        "change",
        event => {
            this.watchPartyAddPlaylist =
                event.target.checked === true;

            if (this.watchPartyAddMessage) {
                this.watchPartyAddMessage = "";
                this.watchPartyAddError = false;

                const messageElement =
                    this.watchPartyPanel.querySelector(
                        "[data-watch-party-add-message]"
                    );

                if (messageElement) {
                    messageElement.textContent = "";
                    messageElement.classList.remove(
                        "text-red-300"
                    );
                    messageElement.classList.add(
                        "text-emerald-300"
                    );
                }
            }
        }
    );
}
	

if (addForm) {
    addForm.addEventListener(
        "submit",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.addWatchPartyVideo();
        }
    );
}

const subtitlesButton =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-subtitles]"
    );

if (subtitlesButton) {
    subtitlesButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            const currentState =
                window.watchPartyPlayer
                    ?.getState?.();

            const currentlyEnabled =
                currentState
                    ?.englishSubtitlesEnabled ===
                        true;

            window.watchPartyPlayer
                ?.setEnglishSubtitles?.(
                    !currentlyEnabled
                );

            this.renderWatchParty();
        }
    );
}
	
const playButton =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-play]"
    );

if (playButton) {
    playButton.addEventListener(
        "click",
        async event => {
            event.stopPropagation();

            if (!this.watchParty.currentVideoId) {
                return;
            }

            const playerState =
                window.watchPartyPlayer?.getState?.();

            const endpoint =
                playerState?.playing
                    ? "pause"
                    : "play";

            const body = {
                clientId: this.clientId
            };

            if (
                Number.isFinite(
                    playerState?.currentTime
                )
            ) {
                body.currentTime =
                    playerState.currentTime;
            }

            try {
                const response =
                    await fetch(
                        `${this.API}/api/watchparty/${endpoint}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify(body)
                        }
                    );

                let result = null;

                try {
                    result =
                        await response.json();
                } catch {}

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        `Playback request failed (${response.status})`
                    );
                }
            } catch (error) {
                console.error(
                    "watch party playback failed:",
                    error
                );

                window.alert(
                    `watch party playback failed: ${error.message}`
                );
            }
        }
    );
}

const previousButton =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-previous]"
    );

if (previousButton) {
    previousButton.addEventListener(
        "click",
        async event => {
            event.preventDefault();
            event.stopPropagation();

            if (
                !this.watchParty.currentVideoId
            ) {
                return;
            }

          previousButton.disabled = true;

this.watchPartyNavigationFromVideoId =
    this.watchParty.currentVideoId;

try {
                const response =
                    await fetch(
                        `${this.API}/api/watchparty/previous`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                clientId:
                                    this.clientId
                            })
                        }
                    );

                let result = null;

                try {
                    result =
                        await response.json();
                } catch {}

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        `Previous request failed (${response.status})`
                    );
                }
            } catch (error) {
    previousButton.disabled = false;

    this.watchPartyNavigationFromVideoId =
    null;

    console.error(
                    "watch party previous failed:",
                    error
                );

                window.alert(
                    `watch party previous failed: ${error.message}`
                );
            }
        }
    );
}



const nextButton =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-next]"
    );

if (nextButton) {
    nextButton.addEventListener(
        "click",
        async event => {
            event.preventDefault();
            event.stopPropagation();

            if (
                !this.watchParty
                    .currentVideoId
            ) {
                return;
            }

            if (nextButton.disabled) {
                return;
            }

            nextButton.disabled = true;

            const expectedVideoId =
                this.watchParty
                    .currentVideoId;

            const expectedIndex =
                this.watchParty
                    .currentIndex;

            this.watchPartyNavigationFromVideoId =
                expectedVideoId;

            try {
                const response =
                    await fetch(
                        `${this.API}/api/watchparty/next`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    clientId:
                                        this.clientId,

                                    expectedVideoId,

                                    expectedIndex
                                })
                        }
                    );

                let result = null;

                try {
                    result =
                        await response.json();
                } catch {}

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        `Next request failed (${response.status})`
                    );
                }

                if (
                    result?.stale === true
                ) {
                    this.watchPartyNavigationFromVideoId =
                        null;
                }
            } catch (error) {
                this.watchPartyNavigationFromVideoId =
                    null;

                console.error(
                    "watch party next failed:",
                    error
                );

                window.alert(
                    `watch party next failed: ${error.message}`
                );
            } finally {
                nextButton.disabled =
                    false;
            }
        }
    );
}

const progressInput =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-progress]"
    );

const progressFill =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-progress-fill]"
    );

const progressCurrentTooltip =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-progress-current-tooltip]"
    );

const progressHoverTooltip =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-progress-hover-tooltip]"
    );

if (progressInput) {
    const updateSeekPreview = () => {
        const value =
            Number(progressInput.value);

        const maximum =
            Number(progressInput.max);

        const safeValue =
            Number.isFinite(value)
                ? Math.max(0, value)
                : 0;

        const safeMaximum =
            Number.isFinite(maximum) &&
            maximum > 0
                ? maximum
                : 1;

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (
                        safeValue /
                        safeMaximum
                    ) * 100
                )
            );

        if (progressFill) {
            progressFill.style.width =
                `${percentage}%`;
        }

        if (progressCurrentTooltip) {
            progressCurrentTooltip.textContent =
                this.formatDuration(
                    safeValue
                );

            progressCurrentTooltip.style.left =
                `${percentage}%`;

            progressCurrentTooltip.classList.add(
                "opacity-100"
            );
        }

        const timeLabel =
            this.watchPartyPanel.querySelector(
                "#watchPartyTime"
            );

        if (timeLabel) {
            timeLabel.textContent =
                `${this.formatDuration(
                    safeValue
                )} / ${this.formatDuration(
                    safeMaximum
                )}`;
        }
    };

	const updateHoverPreview = event => {
    if (
        !progressHoverTooltip ||
        !progressInput
    ) {
        return;
    }

    const rect =
        progressInput
            .getBoundingClientRect();

    if (rect.width <= 0) {
        return;
    }

    const maximum =
        Number(progressInput.max);

    const safeMaximum =
        Number.isFinite(maximum) &&
        maximum > 0
            ? maximum
            : 1;

    const ratio =
    this.getRangePointerRatio(
        progressInput,
        event.clientX,
        12
    );

    const hoveredTime =
        ratio *
        safeMaximum;

    progressHoverTooltip.textContent =
        this.formatDuration(
            hoveredTime
        );

    progressHoverTooltip.style.left =
        `${ratio * 100}%`;
};

	const showProgressTooltips = () => {
    progressCurrentTooltip
        ?.classList.add(
            "opacity-100"
        );

    progressHoverTooltip
        ?.classList.add(
            "opacity-100"
        );
};

const hideProgressTooltips = () => {
    if (this.watchPartySeeking) {
        return;
    }

    progressCurrentTooltip
        ?.classList.remove(
            "opacity-100"
        );

    progressHoverTooltip
        ?.classList.remove(
            "opacity-100"
        );
};

   const beginSeeking = event => {
    this.watchPartySeeking = true;

    showProgressTooltips();

    if (
        event &&
        Number.isFinite(
            event.clientX
        )
    ) {
        const maximum =
            Number(
                progressInput.max
            );

        const safeMaximum =
            Number.isFinite(maximum) &&
            maximum > 0
                ? maximum
                : 0;

        const ratio =
            this.getRangePointerRatio(
                progressInput,
                event.clientX,
                12
            );

        if (safeMaximum > 0) {
            progressInput.value =
                String(
                    ratio *
                    safeMaximum
                );

            updateSeekPreview();
        }

        updateHoverPreview(event);
    }
};

    const finishSeeking = async () => {
        if (!this.watchPartySeeking) {
            return;
        }

        this.watchPartySeeking = false;

      progressCurrentTooltip
    ?.classList.remove(
        "opacity-100"
    );

progressHoverTooltip
    ?.classList.remove(
        "opacity-100"
    );

        if (
            this.watchPartySeekBusy ||
            !this.watchParty.currentVideoId
        ) {
            return;
        }

        const displayedTargetTime =
    this.parseDurationText(
        progressHoverTooltip
            ?.textContent || ""
    );

const targetTime =
    Number.isFinite(
        displayedTargetTime
    )
        ? displayedTargetTime
        : Math.max(
            0,
            Number(
                Number(
                    progressInput.value
                ).toFixed(3)
            )
        );

		progressInput.value =
    String(targetTime);

updateSeekPreview();

window.watchPartyPlayer
    ?.seekTo?.(
        targetTime
    );

        if (
            !Number.isFinite(targetTime) ||
            targetTime < 0
        ) {
            return;
        }

		window.watchPartyPlayer?.seekTo?.(
    targetTime
);
		
        this.watchPartySeekBusy = true;
        progressInput.disabled = true;

        try {
            const response =
                await fetch(
                    `${this.API}/api/watchparty/seek`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            clientId:
                                this.clientId,

                            currentTime:
                                targetTime
                        })
                    }
                );

            let result = null;

            try {
                result =
                    await response.json();
            } catch {}

            if (!response.ok) {
                throw new Error(
                    result?.error ||
                    `Seek request failed (${response.status})`
                );
            }
        } catch (error) {
            console.error(
                "watch party seek failed:",
                error
            );

            window.alert(
                `watch party seek failed: ${error.message}`
            );

            progressInput.disabled = false;
        } finally {
            this.watchPartySeekBusy = false;
        }
    };

	progressInput.addEventListener(
    "pointerenter",
    event => {
        showProgressTooltips();
        updateHoverPreview(event);
    }
);

progressInput.addEventListener(
    "pointermove",
    event => {
        updateHoverPreview(event);
    }
);

progressInput.addEventListener(
    "pointerleave",
    () => {
        hideProgressTooltips();
    }
);
	
    progressInput.addEventListener(
        "pointerdown",
        beginSeeking
    );

    progressInput.addEventListener(
        "mousedown",
        beginSeeking
    );

    progressInput.addEventListener(
        "touchstart",
        beginSeeking,
        {
            passive: true
        }
    );

    progressInput.addEventListener(
        "input",
        () => {
            this.watchPartySeeking = true;
            updateSeekPreview();
        }
    );

    progressInput.addEventListener(
        "change",
        finishSeeking
    );

    progressInput.addEventListener(
        "pointerup",
        finishSeeking
    );

    progressInput.addEventListener(
        "blur",
        () => {
            if (this.watchPartySeeking) {
                finishSeeking();
            }
        }
    );
}

	const playItems =
    this.watchPartyPanel.querySelectorAll(
        "[data-watch-party-play]"
    );

playItems.forEach(item => {
    item.addEventListener(
        "click",
        async event => {

            if (
                event.target.closest(
                    "[data-watch-party-remove]"
                )
            ) {
                return;
            }

            const queueId =
                Number(
                    item.dataset.watchPartyPlay
                );

            if (
                !Number.isInteger(queueId)
            ) {
                return;
            }

            try {
if (
    queueId ===
    this.watchParty.queue[
        this.watchParty.currentIndex
    ]?.id
) {
    return;
}
                await fetch(
                    `${this.API}/api/watchparty/play`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            clientId:
                                this.clientId,
                            queueId
                        })
                    }
                );

            } catch (error) {
                console.error(
                    "could not switch watch party video:",
                    error
                );
            }

        }
    );
});

	
    const removeButtons =
        this.watchPartyPanel.querySelectorAll(
            "[data-watch-party-remove]"
        );

    removeButtons.forEach(button => {
        button.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                const queueId =
                    Number(
                        button.dataset
                            .watchPartyRemove
                    );

                this.removeWatchPartyItem(
                    queueId,
                    button
                );
            }
        );
    });

	if (hadAddInputFocus) {
    requestAnimationFrame(() => {
        const input =
            this.watchPartyPanel?.querySelector(
                "[data-watch-party-add-input]"
            );

        if (!input) {
            return;
        }

        input.focus();

        if (
            Number.isInteger(
                addInputSelectionStart
            )
        ) {
            input.setSelectionRange(
                addInputSelectionStart,
                addInputSelectionStart
            );
        }
    });
}

if (
    renderVersion ===
    this.watchPartyRenderVersion
) {
    const queueList =
        this.watchPartyPanel?.querySelector(
            "[data-watch-party-queue-list]"
        );

    if (queueList) {
  
        queueList.style.overflowAnchor =
            "none";

        const requiredLength =
            this.watchPartyScrollQueueAfterLength;

        const queue =
            Array.isArray(
                this.watchParty?.queue
            )
                ? this.watchParty.queue
                : [];

        const shouldJumpToBottom =
            Number.isInteger(
                requiredLength
            ) &&
            requiredLength >= 1 &&
            queue.length >=
                requiredLength;

        const navigationFromVideoId =
            this.watchPartyNavigationFromVideoId;

        const shouldJumpToCurrent =
            typeof navigationFromVideoId ===
                "string" &&
            navigationFromVideoId.length >
                0 &&
            typeof this.watchParty
                .currentVideoId ===
                "string" &&
            this.watchParty.currentVideoId !==
                navigationFromVideoId;

        if (shouldJumpToBottom) {
            queueList.scrollTop =
                queueList.scrollHeight;

            this.watchPartyScrollQueueAfterLength =
                null;
        } else if (shouldJumpToCurrent) {
            const currentIndex =
                this.watchParty.currentIndex;

            const currentElement =
                Number.isInteger(
                    currentIndex
                ) &&
                currentIndex >= 0
                    ? queueList.children[
                        currentIndex
                    ] || null
                    : null;

            const firstElement =
                queueList.firstElementChild;

            if (
                currentElement &&
                firstElement
            ) {
                const targetScrollTop =
                    currentElement.offsetTop -
                    firstElement.offsetTop;

                queueList.scrollTop =
                    Math.max(
                        0,
                        Math.min(
                            targetScrollTop,
                            queueList
                                .scrollHeight -
                            queueList
                                .clientHeight
                        )
                    );
            }

        
            this.watchPartyNavigationFromVideoId =
                null;
        } else if (
            previousQueueWasNearBottom
        ) {
            queueList.scrollTop =
                queueList.scrollHeight;
        } else {
            queueList.scrollTop =
                Math.min(
                    previousQueueScrollTop,
                    Math.max(
                        0,
                        queueList.scrollHeight -
                            queueList.clientHeight
                    )
                );
        }
    }
}
}

toggleWatchParty() {
    if (!this.watchParty.enabled) {
        return;
    }

    this.watchPartyOpen =
        !this.watchPartyOpen;

    this.renderWatchParty();
}
	
	async addWatchPartyVideo() {
    if (!this.watchParty.enabled) {
        this.watchPartyAddMessage =
            "the watch party is no longer active.";

        this.watchPartyAddError = true;
        this.renderWatchParty();
        return;
    }

    if (this.watchPartyAddBusy) {
        return;
    }

    const url =
        String(
            this.watchPartyAddUrl || ""
        ).trim();

    if (!url) {
        this.watchPartyAddMessage =
            "paste a youtube URL first.";

        this.watchPartyAddError = true;
        this.renderWatchParty();

        requestAnimationFrame(() => {
            this.watchPartyPanel
                ?.querySelector(
                    "[data-watch-party-add-input]"
                )
                ?.focus();
        });

        return;
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch {
        this.watchPartyAddMessage =
            "enter a valid youtube URL.";

        this.watchPartyAddError = true;
        this.renderWatchParty();
        return;
    }

    const hostname =
        parsedUrl.hostname
            .toLowerCase()
            .replace(/^www\./, "");

    const isYouTubeHost =
        hostname === "youtube.com" ||
        hostname === "m.youtube.com" ||
        hostname === "music.youtube.com" ||
        hostname === "youtu.be";

    if (!isYouTubeHost) {
        this.watchPartyAddMessage =
            "only youtube links can be added.";

        this.watchPartyAddError = true;
        this.renderWatchParty();
        return;
    }

    const name =
        this.nameInput?.value.trim() ||
        "anonymous";

		const queueLengthBeforeAdd =
    Array.isArray(this.watchParty?.queue)
        ? this.watchParty.queue.length
        : 0;

    this.watchPartyAddBusy = true;
    this.watchPartyAddMessage =
    this.watchPartyAddPlaylist
        ? "adding video or playlist..."
        : "adding video...";
    this.watchPartyAddError = false;
   this.watchPartyScrollQueueAfterLength =
    queueLengthBeforeAdd + 1;

this.renderWatchParty();

    try {
        const response = await fetch(
            `${this.API}/api/watchparty/add`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
    url,
    clientId:
        this.clientId,
    name,
    addPlaylist:
        this.watchPartyAddPlaylist
})
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch {
            // The error handling below covers
            // a response that is not valid JSON.
        }

        if (!response.ok) {
            let message =
                result?.error ||
                `Could not add video (${response.status})`;

            if (
                result?.code ===
                "INVALID_YOUTUBE_URL"
            ) {
                message =
                    "that youtube URL is not valid.";
            }

            if (
                result?.code ===
                "VIDEO_ALREADY_QUEUED"
            ) {
                message =
                    "that video is already in the queue.";
            }

            if (
                result?.code ===
                "USER_QUEUE_LIMIT"
            ) {
                message =
                    "you already have 5 videos in the queue.";
            }

			if (
    result?.code ===
    "QUEUE_FULL"
) {
    message =
        "the watch party queue is full.";
}

			if (
    result?.code ===
    "VIDEO_LINK_REQUIRED"
) {
    message =
        "that link does not contain an individual video. check the playlist option to import it.";
}
			
if (
    result?.code ===
    "PLAYLIST_API_NOT_CONFIGURED"
) {
    message =
        "playlist imports are not available yet.";
}

if (
    result?.code ===
    "PLAYLIST_FETCH_FAILED"
) {
    message =
        "could not read that playlist. it may be private or unavailable.";
}

if (
    result?.code ===
    "PLAYLIST_HAS_NO_VIDEOS"
) {
    message =
        "that playlist has no available videos.";
}

if (
    result?.code ===
    "PLAYLIST_ALREADY_QUEUED"
) {
    message =
        "all videos from that playlist are already queued.";
}

            if (
                result?.code ===
                "WATCH_PARTY_ENDED"
            ) {
                message =
                    "the watch party has ended.";

                await this.loadWatchParty();
            }

            throw new Error(message);
        }

        this.watchPartyAddUrl = "";
        this.watchPartyAddMessage =
            result?.message ||
            "video added to the queue.";
        this.watchPartyAddError = false;
this.watchPartyAddBusy = false;

this.renderWatchParty();

requestAnimationFrame(() => {
            this.watchPartyPanel
                ?.querySelector(
                    "[data-watch-party-add-input]"
                )
                ?.focus();
        });
    } catch (error) {
        console.error(
            "could not add watch party video:",
            error
        );

        this.watchPartyAddBusy = false;
this.watchPartyScrollQueueAfterLength =
    null;

this.watchPartyAddMessage =
            error.message ||
            "Could not add the video.";
        this.watchPartyAddError = true;

        this.renderWatchParty();

        requestAnimationFrame(() => {
            const input =
                this.watchPartyPanel
                    ?.querySelector(
                        "[data-watch-party-add-input]"
                    );

            if (input) {
                input.focus();
                input.select();
            }
        });
    }
}

async removeWatchPartyItem(
    queueId,
    button
) {
    if (
        !Number.isInteger(queueId) ||
        queueId <= 0
    ) {
        window.alert(
            "invalid watch party queue item"
        );

        return;
    }

    const item =
        Array.isArray(this.watchParty.queue)
            ? this.watchParty.queue.find(
                queueItem =>
                    Number(queueItem.id) ===
                    queueId
            )
            : null;

    if (!item) {
        window.alert(
            "that video is no longer in the queue"
        );

        await this.loadWatchParty();
        return;
    }

    const isCurrent =
        item.videoId ===
        this.watchParty.currentVideoId;

    const confirmed =
        window.confirm(
            isCurrent
                ? `remove "${item.title || "this video"}" and skip to the next video?`
                : `remove "${item.title || "this video"}" from the queue?`
        );

    if (!confirmed) {
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "removing...";
    }

    const headers = {
        "Content-Type":
            "application/json"
    };

    if (
        this.isAdmin &&
        this.adminKey
    ) {
        headers.Authorization =
            `Bearer ${this.adminKey}`;
    }

    try {
        const response = await fetch(
            `${this.API}/api/watchparty/remove`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    queueId,
                    clientId:
                        this.clientId
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch {
            // The general error below handles
            // an invalid JSON response.
        }

        if (response.status === 401) {
            this.disableAdminMode();

            throw new Error(
                "your admin session is no longer valid"
            );
        }

        if (response.status === 403) {
            throw new Error(
                result?.error ||
                "you can only remove videos you added"
            );
        }

        if (response.status === 404) {
            await this.loadWatchParty();

            throw new Error(
                result?.error ||
                "that video is no longer in the queue"
            );
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `could not remove video (${response.status})`
            );
        }

    } catch (error) {
        console.error(
            "could not remove watch party video:",
            error
        );

        window.alert(
            `could not remove video: ${
                error.message
            }`
        );

        if (
            button &&
            button.isConnected
        ) {
            button.disabled = false;
            button.textContent = "remove";
        }
    }
}

escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

	async editMotd() {
    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        return;
    }

    const input =
        window.prompt(
            "message of the day:\n\nleave it empty to hide the bar",
            this.currentMotd
        );

    if (input === null) {
        return;
    }

    const message =
        input.trim();

    if (message.length > 200) {
        window.alert(
            "the message of the day must be 200 characters or fewer"
        );

        return;
    }

    try {
        const response = await fetch(
            `${this.API}/api/admin/chat/motd`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${this.adminKey}`
                },
                body: JSON.stringify({
                    message
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch {
            // The error below will handle
            // an invalid response.
        }

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `could not update MOTD (${response.status})`
            );
        }

        this.setMotd(
            result.message ?? message
        );
    } catch (error) {
        console.error(
            "could not update chat MOTD:",
            error
        );

        window.alert(
            `could not update message of the day: ${error.message}`
        );
    }
}

	
	
async loadHistory() {
    const [
        chatResponse,
        imageResponse
    ] =
        await Promise.all([
            fetch(
                `${this.API}/api/chat`
            ),

            fetch(
                `${this.imageUploadConfig.apiBase}/history`
            )
        ]);

    if (!chatResponse.ok) {
        throw new Error(
            `Could not load chat history (${chatResponse.status})`
        );
    }

    if (!imageResponse.ok) {
        throw new Error(
            `Could not load image history (${imageResponse.status})`
        );
    }

    const messages =
        await chatResponse.json();

    const uploads =
        await imageResponse.json();

    const timeline = [];

    if (Array.isArray(messages)) {
        for (const message of messages) {
            timeline.push({
                type: "message",

                createdAt:
                    message.created_at,

                value:
                    message
            });
        }
    }

    if (Array.isArray(uploads)) {
        for (const upload of uploads) {
            timeline.push({
                type: "image-upload",

                createdAt:
                    upload.createdAt,

                value:
                    upload
            });
        }
    }

    timeline.sort(
        (first, second) => {
            const firstTime =
                new Date(
                    first.createdAt
                ).getTime();

            const secondTime =
                new Date(
                    second.createdAt
                ).getTime();

            const safeFirst =
                Number.isFinite(firstTime)
                    ? firstTime
                    : 0;

            const safeSecond =
                Number.isFinite(secondTime)
                    ? secondTime
                    : 0;

            return (
                safeFirst -
                safeSecond
            );
        }
    );

    this.messages.innerHTML = "";

    this.imageUploadRows.clear();

    for (const item of timeline) {
        if (
            item.type ===
                "image-upload"
        ) {
            this.addImageUpload(
                item.value
            );

            continue;
        }

        this.addMessage(
            item.value
        );
    }

    this.scrollMessagesToBottomAfterLayout({
    force: true
});

window.setTimeout(
    () => {
        this.scrollMessagesToBottomAfterLayout({
            force: true
        });
    },
    250
);

window.setTimeout(
    () => {
        this.scrollMessagesToBottomAfterLayout({
            force: true
        });
    },
    750
);
}


reactionTargetKey(type, id) {
    return `${type}:${String(id)}`;
}

normaliseReactionSnapshot(value) {
    const targetType =
        value?.targetType === "chat" ||
        value?.targetType === "image"
            ? value.targetType
            : null;
    const targetId =
        value?.targetId == null
            ? ""
            : String(value.targetId);

    if (!targetType || !targetId) return null;

    const reactions = (
        Array.isArray(value?.reactions)
            ? value.reactions
            : []
    ).map(item => {
        const kind =
            item?.kind === "custom"
                ? "custom"
                : "unicode";
        const key =
            typeof item?.key === "string"
                ? item.key.slice(0, 160)
                : "";
        const emojiValue =
            typeof item?.value === "string"
                ? item.value.slice(0, 32)
                : "";
        const src =
            kind === "custom" &&
            typeof item?.src === "string" &&
            /^\/emojis\/[a-zA-Z0-9_.-]+$/.test(item.src)
                ? item.src
                : "";
        const clientIds =
            Array.isArray(item?.clientIds)
                ? item.clientIds.filter(id =>
                    typeof id === "string"
                )
                : [];

        if (
            !key ||
            (kind === "custom" && !src) ||
            (kind === "unicode" && !emojiValue)
        ) return null;

        return {
            key,
            kind,
            value: emojiValue,
            src,
            label:
                typeof item?.label === "string"
                    ? item.label.slice(0, 80)
                    : "",
            count: Math.max(
                0,
                Number(item?.count) ||
                clientIds.length
            ),
            clientIds
        };
    }).filter(Boolean);

    return { targetType, targetId, reactions };
}

async loadReactions() {
    const response = await fetch(
        `${this.API}/api/chat/reactions`
    );
    if (!response.ok) {
        throw new Error(
            `could not load reactions (${response.status})`
        );
    }

    const result = await response.json();
    this.messageReactions.clear();

    for (const raw of result?.targets || []) {
        const snapshot =
            this.normaliseReactionSnapshot(raw);
        if (!snapshot) continue;
        this.messageReactions.set(
            this.reactionTargetKey(
                snapshot.targetType,
                snapshot.targetId
            ),
            snapshot.reactions
        );
    }

    this.renderAllReactionRows();
}

loadRecentReactions() {
    const defaults = [
        {
            key: "unicode:😘",
            kind: "unicode",
            value: "😘",
            src: "",
            label: "😘"
        },
        {
            key: "unicode:❤️",
            kind: "unicode",
            value: "❤️",
            src: "",
            label: "❤️"
        },
        {
            key: "unicode:😺",
            kind: "unicode",
            value: "😺",
            src: "",
            label: "😺"
        }
    ];

    try {
        const parsed = JSON.parse(
            localStorage.getItem(
                this.recentReactionStorageKey ||
                "jamicat_recent_reactions"
            ) || "[]"
        );

        const valid =
            Array.isArray(parsed)
                ? parsed
                    .map(item =>
                        this.normaliseRecentReaction(
                            item
                        )
                    )
                    .filter(Boolean)
                : [];

        const merged = [];

        for (const reaction of [
            ...valid,
            ...defaults
        ]) {
            if (
                !merged.some(item =>
                    item.key === reaction.key
                )
            ) {
                merged.push(reaction);
            }
        }

        return merged.slice(0, 3);
    } catch {
        return defaults;
    }
}

normaliseRecentReaction(value) {
    const kind =
        value?.kind === "custom"
            ? "custom"
            : value?.kind === "unicode"
                ? "unicode"
                : null;

    const key =
        typeof value?.key === "string"
            ? value.key.slice(0, 160)
            : "";

    if (!kind || !key) {
        return null;
    }

    if (kind === "custom") {
        const src =
            typeof value?.src === "string"
                ? value.src
                : "";

        if (
            !/^custom:[a-zA-Z0-9_-]{1,80}$/.test(
                key
            ) ||
            !/^\/emojis\/[a-zA-Z0-9_.-]+$/.test(
                src
            )
        ) {
            return null;
        }

        return {
            key,
            kind,
            value:
                typeof value?.value === "string"
                    ? value.value.slice(0, 80)
                    : key.slice(7),
            src,
            label:
                typeof value?.label === "string"
                    ? value.label.slice(0, 80)
                    : key.slice(7)
        };
    }

    const emoji =
        typeof value?.value === "string"
            ? value.value.slice(0, 32)
            : "";

    if (
        !key.startsWith("unicode:") ||
        !emoji
    ) {
        return null;
    }

    return {
        key,
        kind,
        value: emoji,
        src: "",
        label:
            typeof value?.label === "string"
                ? value.label.slice(0, 80)
                : emoji
    };
}

rememberReaction(reaction) {
    const cleaned =
        this.normaliseRecentReaction(
            reaction
        );

    if (!cleaned) {
        return;
    }

    this.recentReactions = [
        cleaned,
        ...this.recentReactions.filter(
            item => item.key !== cleaned.key
        )
    ].slice(0, 3);

    try {
        localStorage.setItem(
            this.recentReactionStorageKey,
            JSON.stringify(
                this.recentReactions
            )
        );
    } catch {}

    this.refreshMessageHoverActions();
}

refreshMessageHoverActions() {
    this.messages
        ?.querySelectorAll(
            ".jami-message-hover-actions"
        )
        .forEach(actions =>
            actions.remove()
        );

    this.messages
        ?.querySelectorAll(
            "[data-reaction-target-type]"
        )
        .forEach(row =>
            this.ensureMessageHoverActions(
                row
            )
        );
}

createReactionVisual(
    reaction,
    className
) {
    if (reaction.kind === "custom") {
        const image =
            document.createElement("img");

        image.src = reaction.src;
        image.alt =
            reaction.label ||
            "custom emoji";
        image.className = className;

        return image;
    }

    const span =
        document.createElement("span");

    span.textContent = reaction.value;
    span.className = className;

    return span;
}

setupReactionRow(row, targetType, targetId) {
    if (
        !(row instanceof HTMLElement) ||
        !["chat", "image"].includes(targetType) ||
        targetId == null
    ) {
        return;
    }

    row.dataset.reactionTargetType = targetType;
    row.dataset.reactionTargetId = String(targetId);

    this.ensureMessageHoverActions(row);
    this.renderReactionRow(row);
}

getReactionTarget(row) {
    const targetType =
        row?.dataset?.reactionTargetType;
    const targetId =
        row?.dataset?.reactionTargetId;

    return (
        ["chat", "image"].includes(targetType) &&
        targetId
    )
        ? { targetType, targetId }
        : null;
}

getReplyMessageForRow(row) {
    if (row?.jamiChatMessage) {
        return row.jamiChatMessage;
    }

    const upload = row?.jamiImageUpload;

    if (!upload) {
        return null;
    }

    return {
        id: upload.uploadId,
        imageUploadId: upload.uploadId,
        imageUpload: upload,
        name: upload.name || "anonymous",
        client_id: upload.clientId || ""
    };
}

ensureMessageHoverActions(row) {
    if (
        !(row instanceof HTMLElement) ||
        row.querySelector(
            ":scope > .jami-message-hover-actions"
        )
    ) {
        return;
    }

    const target = this.getReactionTarget(row);

    if (!target) {
        return;
    }

    const hoverMessage =
        this.getReplyMessageForRow(row);

    const canEditOwnMessage =
        Boolean(
            hoverMessage &&
            !hoverMessage.imageUpload &&
            hoverMessage.id &&
            hoverMessage.client_id ===
                this.clientId
        );

    const actions =
        document.createElement("div");

    actions.className =
        "jami-message-hover-actions terminal2 theme-body";

    const quickReactions =
        this.recentReactions.length > 0
            ? this.recentReactions
            : this.loadRecentReactions();

    for (const reaction of quickReactions) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "jami-message-hover-action jami-message-hover-quick-reaction";
        button.title =
            `react with ${
                reaction.label ||
                reaction.value
            }`;
        button.setAttribute(
            "aria-label",
            button.title
        );

        button.appendChild(
            this.createReactionVisual(
                reaction,
                reaction.kind === "custom"
                    ? "jami-message-hover-custom-emoji"
                    : "jami-message-hover-unicode"
            )
        );

        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();
				event.currentTarget.blur();

                const reactions =
                    this.messageReactions.get(
                        this.reactionTargetKey(
                            target.targetType,
                            target.targetId
                        )
                    ) || [];

                const current =
                    reactions.find(item =>
                        item.key === reaction.key
                    );

                const reacted =
                    current?.clientIds?.includes(
                        this.clientId
                    ) === true;

                if (!reacted) {
                    this.rememberReaction(
                        current || reaction
                    );
                }

                this.setReactionActive(
                    target,
                    current || {
                        ...reaction,
                        count: 0,
                        clientIds: []
                    },
                    !reacted
                );
            }
        );

        actions.appendChild(button);
    }

    const pickerButton =
        document.createElement("button");

    pickerButton.type = "button";
    pickerButton.className =
        "jami-message-hover-action jami-message-hover-custom";
    pickerButton.textContent = "+";
    pickerButton.title = "add reaction";
    pickerButton.setAttribute(
        "aria-label",
        "add reaction"
    );

    pickerButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            const sameReactionPicker =
                this.emojiPickerOpen &&
                this.emojiPickerMode ===
                    "reaction" &&
                this.emojiPickerAnchor ===
                    pickerButton;

            if (sameReactionPicker) {
                this.closeEmojiPicker();
                return;
            }

            this.openEmojiPicker({
                mode: "reaction",
                target,
                anchor: pickerButton
            });
        }
    );

    let editButton = null;

    if (canEditOwnMessage) {
        editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className =
            "jami-message-hover-action jami-message-hover-edit";
        editButton.textContent = "✎";
        editButton.title = "edit";
        editButton.setAttribute(
            "aria-label",
            "edit"
        );

        editButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                this.beginInlineEdit(
                    hoverMessage
                );
            }
        );
    }

    const replyButton =
        document.createElement("button");

    replyButton.type = "button";
    replyButton.className =
        "jami-message-hover-action jami-message-hover-reply";
    replyButton.textContent = "↩";
    replyButton.title = "reply";
    replyButton.setAttribute(
        "aria-label",
        "reply"
    );

    replyButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            if (hoverMessage) {
                this.setReplyTarget(
                    hoverMessage
                );
            }
        }
    );

    actions.append(
        pickerButton
    );

    if (editButton) {
        actions.append(
            editButton
        );
    }

    actions.append(
        replyButton
    );

    row.appendChild(actions);
}

renderAllReactionRows() {
    this.messages?.querySelectorAll(
        "[data-reaction-target-type]"
    ).forEach(row => {
        this.ensureMessageHoverActions(row);
        this.renderReactionRow(row);
    });
}

renderReactionRow(
    row,
    animatedReactionKeys = null
) {
    const target = this.getReactionTarget(row);

    if (!target) {
        return;
    }

    const reactions =
        (
            this.messageReactions.get(
                this.reactionTargetKey(
                    target.targetType,
                    target.targetId
                )
            ) || []
        ).filter(reaction =>
            reaction?.count > 0
        );

    let container =
        row.querySelector(
            ".jami-message-reactions"
        );

    if (reactions.length === 0) {
        container?.remove();
        return;
    }

    if (!container) {
        container =
            document.createElement("div");

        container.className =
            "jami-message-reactions theme-body";

        const column =
            row.children[
                row.dataset.continuation === "true"
                    ? 0
                    : 1
            ];

        (column || row).appendChild(container);
    }

    container.replaceChildren();

    for (const reaction of reactions) {
        const reacted =
            reaction.clientIds.includes(
                this.clientId
            );

        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            animatedReactionKeys?.has(
                reaction.key
            )
                ? "jami-reaction-pill jami-reaction-pill-pop"
                : "jami-reaction-pill";
        button.dataset.reacted =
            reacted ? "true" : "false";
        button.setAttribute(
            "aria-pressed",
            String(reacted)
        );
		
        button.removeAttribute("title");

        if (reaction.kind === "custom") {
            const image =
                document.createElement("img");

            image.src = reaction.src;
            image.alt =
                reaction.label || "custom emoji";
            image.className =
                "jami-reaction-custom-emoji";

            button.appendChild(image);
        } else {
            const emoji =
                document.createElement("span");

            emoji.className =
                "jami-reaction-unicode";
            emoji.textContent =
                reaction.value;

            button.appendChild(emoji);
        }

        if (reaction.count > 1) {
            const count =
                document.createElement("span");

            count.className =
                "jami-reaction-count theme-heading";
            count.textContent =
                String(reaction.count);

            button.appendChild(count);
        }

        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                this.setReactionActive(
                    target,
                    reaction,
                    !reacted
                );
            }
        );

        container.appendChild(button);
    }
}

closeReactionPicker() {
    if (
        this.emojiPickerMode === "reaction"
    ) {
        this.closeEmojiPicker();
    }
}

openReactionPicker(
    target,
    anchor
) {
    this.openEmojiPicker({
        mode: "reaction",
        target,
        anchor
    });
}

async setReactionActive(
    target,
    reaction,
    active
) {
    const busyKey = [
        target.targetType,
        target.targetId,
        reaction.key
    ].join(":");

    if (
        this.reactionRequestBusy.has(busyKey)
    ) return;

    this.reactionRequestBusy.add(busyKey);

    try {
        const response = await fetch(
            `${this.API}/api/chat/reactions/toggle`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    targetType:
                        target.targetType,
                    targetId:
                        target.targetId,
                    clientId:
                        this.clientId,
                    active: active === true,
                    reaction: {
                        key: reaction.key,
                        kind: reaction.kind,
                        value:
                            reaction.value || "",
                        src: reaction.src || "",
                        label:
                            reaction.label || ""
                    }
                })
            }
        );

        let result = null;
        try {
            result = await response.json();
        } catch {}

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `reaction update failed (${response.status})`
            );
        }

        if (result?.snapshot) {
            this.applyReactionSnapshot(
                result.snapshot
            );
        }
    } catch (error) {
        console.error(
            "could not update reaction:",
            error
        );
        window.alert(
            error.message ||
            "could not update reaction"
        );
    } finally {
        this.reactionRequestBusy.delete(
            busyKey
        );
    }
}

applyReactionSnapshot(value) {
    const wasAtBottom =
        this.isMessagesNearBottom();

    const snapshot =
        this.normaliseReactionSnapshot(value);
    if (!snapshot) return;

    const key =
        this.reactionTargetKey(
            snapshot.targetType,
            snapshot.targetId
        );

    const previousReactions =
        this.messageReactions.get(key) || [];

    const previousByKey =
        new Map(
            previousReactions.map(
                reaction => [
                    reaction.key,
                    reaction
                ]
            )
        );

    const changedReactionKeys =
        new Set();

    for (
        const reaction
        of snapshot.reactions
    ) {
        const previous =
            previousByKey.get(
                reaction.key
            );

        const previousClients =
            Array.isArray(
                previous?.clientIds
            )
                ? [...previous.clientIds]
                    .sort()
                    .join("\u0000")
                : "";

        const nextClients =
            Array.isArray(
                reaction.clientIds
            )
                ? [...reaction.clientIds]
                    .sort()
                    .join("\u0000")
                : "";

        if (
            !previous ||
            previous.count !==
                reaction.count ||
            previousClients !==
                nextClients
        ) {
            changedReactionKeys.add(
                reaction.key
            );
        }
    }

    if (snapshot.reactions.length) {
        this.messageReactions.set(
            key,
            snapshot.reactions
        );
    } else {
        this.messageReactions.delete(key);
    }

    this.messages?.querySelectorAll(
        `[data-reaction-target-type="${snapshot.targetType}"]`
    ).forEach(row => {
        if (
            row.dataset.reactionTargetId ===
            snapshot.targetId
        ) {
            this.renderReactionRow(
                row,
                changedReactionKeys
            );
        }
    });

    if (wasAtBottom) {
        requestAnimationFrame(() => {
            this.scrollMessagesToBottom();
        });
    }
}


applyDeletedUserContent(data) {
    const messageIds =
        new Set(
            Array.isArray(data.messageIds)
                ? data.messageIds.map(
                    value => String(value)
                )
                : []
        );

    const imageUploadIds =
        new Set(
            Array.isArray(data.imageUploadIds)
                ? data.imageUploadIds.map(
                    value => String(value)
                )
                : []
        );

    for (const messageId of messageIds) {
        this.findMessageElement(
            messageId
        )?.remove();

        this.messageReactions.delete(
            this.reactionTargetKey(
                "chat",
                messageId
            )
        );
    }

    for (const uploadId of imageUploadIds) {
        const active =
            this.activeImageUploads.get(
                uploadId
            );

        if (active) {
            active.cancelled = true;

            try {
                active.xhr?.abort();
            } catch {}
        }

        this.activeImageUploads.delete(
            uploadId
        );

        this.imageUploadRows
            .get(uploadId)
            ?.remove();

        this.imageUploadRows.delete(
            uploadId
        );

        this.messageReactions.delete(
            this.reactionTargetKey(
                "image",
                uploadId
            )
        );
    }

    for (
        const reference
        of this.messages.querySelectorAll(
            ".jami-chat-reply-reference"
        )
    ) {
        const targetType =
            reference.dataset
                .replyTargetType;

        const targetId =
            reference.dataset
                .replyTargetId;

        const targetWasDeleted =
            (
                targetType === "chat" &&
                messageIds.has(targetId)
            ) ||
            (
                targetType === "image" &&
                imageUploadIds.has(targetId)
            );

        if (!targetWasDeleted) {
            continue;
        }

        const preview =
            reference.querySelector(
                ".jami-chat-reply-reference-preview"
            );

        if (preview) {
            preview.textContent =
                "original message unavailable";
        }

        reference.disabled = true;
    }

    if (
        this.replyTarget &&
        (
            (
                this.replyTarget.type ===
                    "chat" &&
                messageIds.has(
                    String(
                        this.replyTarget.id
                    )
                )
            ) ||
            (
                this.replyTarget.type ===
                    "image" &&
                imageUploadIds.has(
                    String(
                        this.replyTarget.id
                    )
                )
            )
        )
    ) {
        this.clearReplyTarget();
    }

    this.closeModerationMenu();
}


addMessage(message) {
    const previousRow =
        this.messages.lastElementChild;

    const currentTime =
        new Date(message.created_at).getTime();

    const previousTime =
        Number(
            previousRow?.dataset.timestamp || 0
        );

    const previousMessage =
        previousRow?.jamiChatMessage ||
        null;

    const sameAuthor =
        Boolean(previousRow) &&
        Boolean(message.client_id) &&
        previousRow.dataset.clientId ===
            message.client_id;

    const sameIdentity =
        Boolean(previousMessage) &&
        previousMessage.name ===
            message.name &&
        previousMessage.avatar ===
            message.avatar &&
        (
            previousMessage
                .discord_server_tag ||
            ""
        ) ===
            (
                message
                    .discord_server_tag ||
                ""
            ) &&
        (
            previousMessage
                .discord_server_badge_url ||
            ""
        ) ===
            (
                message
                    .discord_server_badge_url ||
                ""
            );

    const closeInTime =
        Number.isFinite(currentTime) &&
        previousTime > 0 &&
        currentTime - previousTime <
            5 * 60 * 1000;

    const isContinuation =
        sameAuthor &&
        sameIdentity &&
        closeInTime;

    const row =
        document.createElement("div");

   row.className = [
    "chatMessage",
    "group",
    "relative",
    "flex",
    "items-start",
    isContinuation
        ? ""
        : "mt-2 gap-2"
].join(" ");
	
	row.dataset.continuation =
    isContinuation ? "true" : "false";

    const messageId =
        Number(message.id);

    if (
        Number.isInteger(messageId) &&
        messageId > 0
    ) {
        row.dataset.messageId =
            String(messageId);
    }

    row.dataset.clientId =
        message.client_id || "";

    row.jamiChatMessage = { ...message };

    row.dataset.timestamp =
        String(
            Number.isFinite(currentTime)
                ? currentTime
                : Date.now()
        );


	row.addEventListener("contextmenu", event => {
    event.preventDefault();
    event.stopPropagation();

    this.closeModerationMenu();

    this.openModerationMenu(
        event.clientX,
        event.clientY,
        row.jamiChatMessage || message
    );
});

	
   const date =
    new Date(message.created_at);

const hasValidDate =
    !Number.isNaN(date.getTime());

const formattedTime =
    hasValidDate
        ? date.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
          })
        : "--:--";

const now =
    new Date();

const isPreviousDay =
    hasValidDate &&
    (
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth() ||
        date.getDate() !== now.getDate()
    );

const groupTimestamp =
    !hasValidDate
        ? "--:--"
        : isPreviousDay
            ? `${date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
              })} ${formattedTime}`
            : formattedTime;

const fullTimestamp =
    hasValidDate
        ? date.toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "medium",
              hour12: false
          })
        : "unknown time";

   if (isContinuation) {
    const compactContent =
        document.createElement("div");

    compactContent.className =
         "min-w-0 flex-1 pl-11";

    const messageBody =
    document.createElement("div");

messageBody.className =
    "messageBody";

this.appendReplyReference(messageBody, message);

const text =
    document.createElement("div");

text.className =
    "chatText break-words leading-relaxed";

this.renderMessageContent(
    text,
    message.message || ""
);

messageBody.appendChild(text);
this.appendEditedMarker(messageBody, message);

    const compactTime =
        document.createElement("span");

    compactTime.className = [
    "absolute",
    "left-0",
    message?.reply_target_id
        ? "top-[23px]"
        : "top-[10px]",
    "w-8",
    "text-right",
    "text-[8px]",
    "text-white/0",
    "transition",
    "group-hover:text-white/45"
].join(" ");

    compactTime.textContent =
        formattedTime;

    compactTime.title =
        fullTimestamp;

    compactContent.appendChild(messageBody);

    row.append(
        compactContent,
        compactTime
    );
} else {
        const avatar =
            document.createElement("img");

        avatar.src =
            this.resolveChatAvatarSource(
                message.avatar
            );

        avatar.alt = "";

        avatar.className =
            "h-9 w-9 shrink-0 -mt-[11px]";

        this.applyChatAvatarStyle(
            avatar,
            message.avatar
        );

        avatar.addEventListener(
            "error",
            () => {
                avatar.src =
                    "/avatars/original.gif";
            },
            {
                once: true
            }
        );

        const content =
            document.createElement("div");

        content.className =
             "min-w-0 flex-1";

        const header =
            document.createElement("div");

        header.className =
    "flex min-w-0 items-baseline";

        const name =
            document.createElement("span");

        name.className =
            "chatMessageName font-bold";

        name.textContent =
            message.name || "anonymous";

        const serverTag =
            typeof message
                .discord_server_tag ===
                "string"
                ? message
                    .discord_server_tag
                    .trim()
                : "";

        const serverBadgeUrl =
            typeof message
                .discord_server_badge_url ===
                "string" &&
            /^https:\/\/cdn\.discordapp\.com\/clan-badges\//i
                .test(
                    message
                        .discord_server_badge_url
                )
                ? message
                    .discord_server_badge_url
                : "";

        let serverBadge = null;

        if (serverTag) {
            serverBadge =
                document.createElement(
                    "span"
                );

            serverBadge.className =
                "jami-discord-server-tag";

            if (serverBadgeUrl) {
                const serverBadgeIcon =
                    document.createElement(
                        "img"
                    );

                serverBadgeIcon.src =
                    serverBadgeUrl;

                serverBadgeIcon.alt = "";

                serverBadgeIcon.className =
                    "jami-discord-server-tag-icon";

                serverBadgeIcon.addEventListener(
                    "error",
                    () => {
                        serverBadgeIcon.remove();
                    },
                    {
                        once: true
                    }
                );

                serverBadge.appendChild(
                    serverBadgeIcon
                );
            }

            const serverBadgeText =
                document.createElement(
                    "span"
                );

            serverBadgeText.className =
                "jami-discord-server-tag-text";

            serverBadgeText.textContent =
                serverTag;

            serverBadge.appendChild(
                serverBadgeText
            );
        }

        const time =
            document.createElement("span");

        time.className =
    "chatTime ml-1.5 shrink-0 whitespace-nowrap text-[9px] text-white/35";

       time.textContent =
    groupTimestamp;

time.title =
    fullTimestamp;
const identity =
    document.createElement("span");

identity.className =
    "flex items-center gap-[3px]";

identity.appendChild(
    name
);

if (serverBadge) {
    identity.appendChild(
        serverBadge
    );
}

header.append(
    identity,
    time
);

const messageBody =
    document.createElement("div");

messageBody.className =
    "messageBody";

this.appendReplyReference(messageBody, message);

const text =
    document.createElement("div");

text.className =
    "chatText break-words leading-relaxed";

this.renderMessageContent(
    text,
    message.message || ""
);

messageBody.appendChild(text);
this.appendEditedMarker(messageBody, message);

content.append(
    header,
    messageBody
);

        row.append(
            avatar,
            content
        );
    }
	
    this.messages.appendChild(row);

    if (
        Number.isInteger(messageId) &&
        messageId > 0
    ) {
        this.setupReactionRow(
            row,
            "chat",
            String(messageId)
        );
    }

    if (
        !this.userHasScrolledUp &&
        !this.isMinimized
    ) {
        this.scrollMessagesToBottom();
    }
}

	scrollMessagesToBottomAfterLayout({
    force = false
} = {}) {
    if (
        !this.messages ||
        this.isMinimized
    ) {
        return;
    }

    if (
        !force &&
        this.userHasScrolledUp
    ) {
        return;
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            this.messages.scrollTop =
                this.messages.scrollHeight;

            this.userHasScrolledUp =
                false;
        });
    });
}

	scrollMessagesToBottom() {
    if (!this.messages) {
        return;
    }

    this.messages.scrollTop =
        this.messages.scrollHeight;

    this.userHasScrolledUp = false;
}

isMessagesNearBottom() {
    if (!this.messages) {
        return true;
    }

    const distanceFromBottom =
        this.messages.scrollHeight -
        this.messages.scrollTop -
        this.messages.clientHeight;

    return distanceFromBottom < 60;
}

incrementUnreadCount() {
    this.unreadCount++;

    this.updateUnreadDisplay();
}

clearUnreadCount() {
    this.unreadCount = 0;

    this.updateUnreadDisplay();
}

updateUnreadDisplay() {
    if (!this.chatTitle) {
        return;
    }

    this.chatTitle.textContent =
        this.unreadCount > 0
            ? `CAT CHAT (${this.unreadCount})`
            : "CAT CHAT";
}
	

findMessageElement(messageId) {
    const id = String(messageId);

    return Array
        .from(
            this.messages.querySelectorAll(
                "[data-message-id]"
            )
        )
        .find(element => {
            return element.dataset.messageId === id;
        }) || null;
}


getWatchPartyVideoModeEmoji(mode) {
    return mode === "fit"
        ? "📺"
        : "🎬";
}

setWatchPartyVideoMode(mode) {
    this.watchPartyVideoMode =
        mode === "fit"
            ? "fit"
            : "cinematic";

    localStorage.setItem(
        "watch_party_video_mode",
        this.watchPartyVideoMode
    );

    window.watchPartyPlayer?.setVideoMode?.(
        this.watchPartyVideoMode
    );

    this.renderWatchParty();
}


	
	setWatchPartyTheme(colour) {
    const allowedColours =
        Array.isArray(
            this.WATCH_PARTY_COLOURS
        )
            ? this.WATCH_PARTY_COLOURS
            : [];

    const selectedColour =
        allowedColours.includes(colour)
            ? colour
            : "default";

    this.watchPartyPanel.dataset.theme =
        selectedColour;

    localStorage.setItem(
        "watch_party_theme",
        selectedColour
    );

    const colourButton =
        this.watchPartyPanel.querySelector(
            "[data-watch-party-colour]"
        );

    if (colourButton) {
        colourButton.textContent =
            this.getColourEmoji(
                selectedColour
            );

        colourButton.setAttribute(
            "aria-label",
            `Watch Party colour: ${selectedColour}`
        );

        colourButton.title =
            `Watch Party colour: ${selectedColour}`;
    }

		if (selectedColour === "rainbow") {
    this.syncWatchPartyRainbowAnimations();
}
}

syncWatchPartyRainbowAnimations() {
    if (
        !this.watchPartyPanel ||
        this.watchPartyPanel.dataset.theme !==
            "rainbow"
    ) {
        return;
    }

    const elapsed =
        performance.now() -
        this.watchPartyRainbowStartedAt;

    const animatedElements =
        this.watchPartyPanel.querySelectorAll(
            [
    "[data-watch-party-heading]",
    "[data-watch-party-add-heading]",
    "[data-watch-party-url]",
	"[data-watch-party-add-input]",
    "[data-watch-party-progress-fill]",
    "[data-watch-party-previous]",
    "[data-watch-party-play]",
    "[data-watch-party-next]",
    "[data-watch-party-now-playing]",
    "[data-watch-party-now-playing-title]",
    "[data-watch-party-time]",
    "[data-watch-party-queue-heading]",
    "[data-watch-party-now-playing-heading]",
    "[data-watch-party-empty]",
	"[data-watch-party-empty-text]",
	"[data-watch-party-requested-label]",
	"[data-watch-party-subtitles]",
    "[data-watch-party-subtitles-text]",
    "[data-watch-party-subtitles-status]",
    "[data-watch-party-subtitles-badge]",
    "[data-watch-party-added-label]",
    "[data-watch-party-resize-grip]",
	"[data-watch-party-add-playlist]",
	"[data-watch-party-playlist-text]",
	"[data-watch-party-playlist-label]",
	"[data-watch-party-video-link]"
].join(",")
        );

    animatedElements.forEach(element => {
        element.style.animationDelay =
            `${-elapsed}ms`;
    });

	const urlInput =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-url]"
    );

if (urlInput) {
    urlInput.style.setProperty(
        "--watch-party-rainbow-delay",
        `${-elapsed}ms`
    );
}
}

renderWatchPartyColours() {
    const picker =
        this.watchPartyPanel?.querySelector(
            "#watchPartyColourPicker"
        );

    if (!picker) {
        return;
    }

    const storedColour =
    localStorage.getItem(
        "watch_party_theme"
    );

const selectedColour =
    this.WATCH_PARTY_COLOURS.includes(
        storedColour
    )
        ? storedColour
        : "default";

    picker.innerHTML =
        this.WATCH_PARTY_COLOURS
            .map(colour => {
                const isSelected =
                    colour === selectedColour;

                return `
                    <button
                        type="button"
                        class="
                            inline-flex
                            h-9 w-9
                            items-center justify-center
                            rounded-full
                            text-xl
                            transition
                            hover:scale-110
                            hover:bg-white/10
                            ${
                                isSelected
                                    ? "bg-white/15 ring-1 ring-white/40"
                                    : ""
                            }
                        "
                        data-watch-party-theme="${colour}"
                        aria-label="Use ${colour} Watch Party colour"
                        title="${colour}"
                    >
                        ${this.getColourEmoji(
                            colour
                        )}
                    </button>
                `;
            })
            .join("");
}

getColourEmoji(colour) {

    switch (colour) {

        case "red":
            return "🔴";

        case "orange":
            return "🟠";

        case "yellow":
            return "🟡";

        case "green":
            return "🟢";

        case "cyan":
            return "🔵";

        case "blue":
            return "🔷";

        case "purple":
            return "🟣";

        case "pink":
            return "🩷";

			case "rainbow":
    return "🌈";
			
        case "default":
    return "⚫";

default:
    return "⚫";

    }

}

createReplyComposerPreview() {
    if (!this.controlsElement || this.replyComposerPreview) return;
    const preview = document.createElement("div");
    preview.className = "jami-chat-reply-composer theme-body";
    preview.hidden = true;
    preview.innerHTML = `
        <div class="jami-chat-reply-composer-copy">
            <span class="jami-chat-reply-composer-label theme-heading"></span>
            <span class="jami-chat-reply-composer-text"></span>
        </div>
        <button type="button" class="jami-chat-reply-cancel" aria-label="cancel reply">×</button>
    `;
    preview.querySelector(".jami-chat-reply-cancel").addEventListener("click", () => this.clearReplyTarget());
    this.controlsElement.prepend(preview);
    this.replyComposerPreview = preview;
}

getReplyDescriptor(message) {
    const image = message?.imageUpload;
    if (image) {
        return {
            type: "image",
            id: String(image.uploadId || message.imageUploadId || message.id || ""),
            name: image.name || message.name || "anonymous",
            preview: image.remixChain?.length ? "remixed image" : "image"
        };
    }
    return {
        type: "chat",
        id: String(message?.id || ""),
        name: message?.name || "anonymous",
        preview: String(message?.message || "").replace(/\s+/g, " ").trim().slice(0, 120)
    };
}

setReplyTarget(message) {
    const target = this.getReplyDescriptor(message);
    if (!target.id) return;
    this.replyTarget = target;
    this.createReplyComposerPreview();
    this.replyComposerPreview.hidden = false;
    this.replyComposerPreview.querySelector(".jami-chat-reply-composer-label").textContent = `replying to ${target.name}`;
    this.replyComposerPreview.querySelector(".jami-chat-reply-composer-text").textContent = target.preview || "message";
    this.messageInput.focus();
}

clearReplyTarget() {
    this.replyTarget = null;
    if (this.replyComposerPreview) this.replyComposerPreview.hidden = true;
}

appendReplyReference(container, message) {
    if (!message?.reply_target_id) return;
    const reply = document.createElement("button");
    reply.type = "button";
    reply.className = "jami-chat-reply-reference theme-body";
    reply.dataset.replyTargetType =
        String(message.reply_target_type || "");
    reply.dataset.replyTargetId =
        String(message.reply_target_id || "");

    const name = document.createElement("span");
    name.className = "jami-chat-reply-reference-name theme-heading";
    name.textContent = message.reply_name || "unknown";
    const preview = document.createElement("span");
    preview.className = "jami-chat-reply-reference-preview";
    preview.textContent = message.reply_preview || "original message unavailable";
    reply.append(name, preview);
    reply.addEventListener("click", () => this.jumpToReplyTarget(message.reply_target_type, message.reply_target_id));
    container.appendChild(reply);
}

jumpToReplyTarget(type, id) {
    const selector = type === "image"
        ? `[data-image-upload-id="${CSS.escape(String(id))}"]`
        : `[data-message-id="${CSS.escape(String(id))}"]`;
    const target =
        this.messages.querySelector(selector);

    if (!target) {
        const references =
            this.messages.querySelectorAll(
                ".jami-chat-reply-reference"
            );

        for (const reference of references) {
            const preview =
                reference.querySelector(
                    ".jami-chat-reply-reference-preview"
                );

            if (
                reference.dataset.replyTargetType ===
                    String(type) &&
                reference.dataset.replyTargetId ===
                    String(id) &&
                preview
            ) {
                preview.textContent =
                    "original message unavailable";

                reference.disabled = true;
            }
        }

        return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("jami-chat-message-highlight");
    void target.offsetWidth;
    target.classList.add("jami-chat-message-highlight");
    window.setTimeout(() => target.classList.remove("jami-chat-message-highlight"), 1400);
}

appendEditedMarker(container, message) {
    if (!message?.edited_at) return;
    const marker = document.createElement("span");
    marker.className = "jami-chat-edited-marker";
    marker.textContent = "edited";
    marker.title = new Date(message.edited_at).toLocaleString();
    container.appendChild(marker);
}

beginInlineEdit(message) {
    const row = this.findMessageElement(message.id);
    if (!row || this.activeInlineEdit) return;
    const currentMessage =
        row.jamiChatMessage ||
        message;

    const text = row.querySelector(".chatText");
    if (!text) return;
    const original = String(currentMessage.message || "");
    const editor = document.createElement("textarea");
    editor.className = "jami-chat-inline-editor theme-body";
    editor.value = original;
    editor.rows = Math.min(6, Math.max(1, original.split("\n").length));
    text.hidden = true;
    text.after(editor);
    this.activeInlineEdit = {
        row,
        text,
        editor,
        message: currentMessage
    };
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
    const cancel = () => this.cancelInlineEdit();
    editor.addEventListener("keydown", async event => {
        if (event.key === "Escape") { event.preventDefault(); cancel(); return; }
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await this.saveInlineEdit();
        }
    });
}

cancelInlineEdit() {
    const active = this.activeInlineEdit;
    if (!active) return;
    active.editor.remove();
    active.text.hidden = false;
    this.activeInlineEdit = null;
}

async saveInlineEdit() {
    const active = this.activeInlineEdit;
    if (!active) return;
    const message = active.editor.value.trim();
    if (!message || message === active.message.message) { this.cancelInlineEdit(); return; }
    active.editor.disabled = true;
    try {
        const headers = { "Content-Type": "application/json" };
        if (this.isAdmin && this.adminKey) headers.Authorization = `Bearer ${this.adminKey}`;
        const response = await fetch(`${this.API}/api/chat/edit`, {
            method: "POST", headers,
            body: JSON.stringify({
                id: Number(active.message.id),
                clientId: this.clientId,
                message,
                expectedVersion: Number(active.message.edit_version || 1)
            })
        });
        const result = await response.json();
        if (response.status === 409) throw new Error("this message changed before your edit was saved. reload and try again.");
        if (!response.ok) throw new Error(result?.error || `edit failed (${response.status})`);

        if (result?.message) {
            this.applyEditedMessage(
                result.message
            );
        } else {
            Object.assign(
                active.message,
                {
                    message,
                    edited_at:
                        new Date().toISOString(),
                    edit_version:
                        Number(
                            active.message.edit_version ||
                            1
                        ) + 1
                }
            );

            active.row.jamiChatMessage =
                active.message;

            this.cancelInlineEdit();
        }
    } catch (error) {
        active.editor.disabled = false;
        window.alert(error.message);
    }
}

applyEditedMessage(message) {
    const row = this.findMessageElement(message.id);
    if (!row) return;
    const stored = row.jamiChatMessage || {};
    Object.assign(stored, message);
    row.jamiChatMessage = stored;
    const text = row.querySelector(".chatText");
    if (text) this.renderMessageContent(text, stored.message || "");
    row.querySelector(".jami-chat-edited-marker")?.remove();
    const body = row.querySelector(".messageBody");
    if (body) this.appendEditedMarker(body, stored);
    if (this.activeInlineEdit?.row === row) this.cancelInlineEdit();
}

closeModerationMenu() {
    if (!this.moderationMenu) {
        return;
    }

    this.moderationMenu.remove();
    this.moderationMenu = null;
}

openModerationMenu(x, y, message) {
    this.closeModerationMenu();

    const menu = document.createElement("div");
    menu.className = [
        "fixed", "z-[100000]", "w-44", "overflow-hidden",
        "rounded-xl", "border", "border-white/15", "bg-black/90",
        "py-1", "text-[11px]", "text-white", "shadow-xl", "backdrop-blur-xl",
        "theme-body"
    ].join(" ");

    const isImage = Boolean(message.imageUpload);
    const ownsMessage = Boolean(
        message.client_id && message.client_id === this.clientId
    );
    const canEdit = !isImage && Boolean(message.id) && (ownsMessage || this.isAdmin);
    const canDelete = ownsMessage || this.isAdmin;

    const buttons = [];

    if (canEdit) {
        buttons.push(this.createModerationMenuButton("edit", () => {
            this.closeModerationMenu();
            this.beginInlineEdit(message);
        }));
    }

    buttons.push(this.createModerationMenuButton("reply", () => {
        this.closeModerationMenu();
        this.setReplyTarget(message);
    }));

    if (canDelete) {
        const divider = document.createElement("div");
        divider.className = "my-1 border-t border-white/10";
        buttons.push(divider);

        buttons.push(this.createModerationMenuButton("delete message", () => {
            this.closeModerationMenu();
            if (message.imageUploadId) {
                this.deleteImageUpload(message.imageUploadId);
            } else {
                this.deleteMessage(message.id);
            }
        }));
    }

    if (this.isAdmin) {
        buttons.push(this.createModerationMenuButton(`ban ${message.name || "user"}`, async () => {
            this.closeModerationMenu();
            await this.banClient(message.client_id, message.name);
        }));

        buttons.push(this.createModerationMenuButton("delete user's messages", async () => {
            this.closeModerationMenu();
            await this.deleteUserContent(
                message.client_id,
                message.name
            );
        }));

        buttons.push(this.createModerationMenuButton("edit message of the day", () => {
            this.closeModerationMenu();
            this.editMotd();
        }));

        buttons.push(this.createModerationMenuButton("copy message ID", async () => {
            const identifier = message.imageUploadId || message.id;
            try { await navigator.clipboard.writeText(String(identifier)); }
            catch (error) { console.error("could not copy message ID:", error); }
            this.closeModerationMenu();
        }));

        const divider2 = document.createElement("div");
        divider2.className = "my-1 border-t border-white/10";
        buttons.push(divider2);
        buttons.push(this.createModerationMenuButton("clear chat", () => {
            this.closeModerationMenu();
            this.clearEntireChat();
        }));
    }

    menu.append(...buttons);
    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    const padding = 8;
    menu.style.left = `${Math.max(padding, Math.min(x, window.innerWidth - rect.width - padding))}px`;
    menu.style.top = `${Math.max(padding, Math.min(y, window.innerHeight - rect.height - padding))}px`;
    this.moderationMenu = menu;
}

openMemberModerationMenu(x, y, member) {
    const menu = document.createElement("div");

    menu.className =
        "fixed z-[100000] w-44 rounded-xl border border-white/15 bg-black/90 py-1 text-[11px] text-white shadow-xl backdrop-blur-xl";

    const menuWidth = 176;
const menuHeight = 60;
const viewportPadding = 8;

const left = Math.min(
    x,
    window.innerWidth -
        menuWidth -
        viewportPadding
);

const top = Math.min(
    y,
    window.innerHeight -
        menuHeight -
        viewportPadding
);

menu.style.left =
    `${Math.max(viewportPadding, left)}px`;

menu.style.top =
    `${Math.max(viewportPadding, top)}px`;

    const banButton = this.createModerationMenuButton(
        `ban ${member.name}`,
        async () => {
            this.closeModerationMenu();
            await this.banClient(member.clientId, member.name);
        }
    );

    menu.appendChild(banButton);

    document.body.appendChild(menu);
    this.moderationMenu = menu;
}

	createModerationMenuButton(
    label,
    onClick
) {
    const button =
        document.createElement("button");

    button.type = "button";

    button.className = [
        "block",
        "w-full",
        "px-3",
        "py-2",
        "text-left",
        "transition",
        "hover:bg-white/10"
    ].join(" ");

    button.textContent = label;

    button.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            onClick();
        }
    );

    return button;
}

	async deleteMessage(messageId) {
    const id =
        Number(messageId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        console.error(
            "cannot delete invalid message ID:",
            messageId
        );

        return;
    }

   const confirmed =
    window.confirm(
        this.isAdmin
            ? `delete message #${id}?`
            : "delete message?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const headers = {
            "Content-Type":
                "application/json",

            "X-Chat-Client-Id":
                this.clientId
        };

        if (
            this.isAdmin &&
            this.adminKey
        ) {
            headers.Authorization =
                `Bearer ${this.adminKey}`;
        }

        const response = await fetch(
            `${this.API}/api/admin/chat/delete`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    id
                })
            }
        );

        let result = null;

        try {
            result =
                await response.json();
        } catch {
            
        }

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `delete failed (${response.status})`
            );
        }

        console.log(
            "deleted message",
            id
        );
    } catch (error) {
        console.error(
            "could not delete message:",
            error
        );

        window.alert(
            `could not delete message: ${error.message}`
        );
    }
}

	async deleteUserContent(
    clientId,
    name
) {
    if (!clientId) {
        window.alert(
            "this message has no client id"
        );

        return;
    }

    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        this.disableAdminMode();
        return;
    }

    const displayName =
        name || "this user";

    const confirmed =
        window.confirm(
            `delete all messages, replies and uploaded images from ${displayName}?\n\n` +
            "this cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `${this.API}/api/admin/chat/delete-user-content`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${this.adminKey}`
                    },

                    body:
                        JSON.stringify({
                            clientId
                        })
                }
            );

        let result = null;

        try {
            result =
                await response.json();
        } catch {}

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `delete failed (${response.status})`
            );
        }

        window.alert(
            `deleted ${result.deletedMessages || 0} messages and ` +
            `${result.deletedImages || 0} images from ${displayName}`
        );
    } catch (error) {
        console.error(
            "could not delete user content:",
            error
        );

        window.alert(
            `could not delete user's messages: ${error.message}`
        );
    }
}

	async banClient(clientId, name) {
    if (!clientId) {
        window.alert(
            "this message has no client ID and cannot be banned"
        );

        return;
    }

    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "admin authentication is required"
        );

        this.disableAdminMode();
        return;
    }

    const reasonInput =
        window.prompt(
            `reason for banning ${name || "this user"}:`,
            ""
        );

    if (reasonInput === null) {
        return;
    }

    const reason =
        reasonInput.trim() ||
        "no reason provided";

    const confirmed =
        window.confirm(
            `permanently ban ${name || "this user"}?\n\nreason: ${reason}`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${this.API}/api/admin/chat/ban`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${this.adminKey}`
                },
                body: JSON.stringify({
                    clientId,
                    name,
                    reason
                })
            }
        );

        const result =
            await response.json();

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "your admin session is no longer valid"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `ban failed (${response.status})`
            );
        }

        window.alert(
            `${name || "user"} has been permanently banned`
        );
    } catch (error) {
        console.error(
            "could not ban client:",
            error
        );

        window.alert(
            `could not ban user: ${error.message}`
        );
    }
}


resolveChatAvatarSource(avatar) {
    if (
        typeof avatar === "string" &&
        /^https:\/\/cdn\.discordapp\.com\//i.test(
            avatar
        )
    ) {
        return avatar;
    }

    return `/avatars/${
        avatar || "original.gif"
    }`;
}

applyChatAvatarStyle(
    image,
    avatar
) {
    const discordAvatar =
        typeof avatar === "string" &&
        /^https:\/\/cdn\.discordapp\.com\//i.test(
            avatar
        );

    image.classList.toggle(
        "pixel-avatar",
        !discordAvatar
    );
    image.classList.toggle(
        "object-contain",
        !discordAvatar
    );
    image.classList.toggle(
        "rounded-full",
        discordAvatar
    );
    image.classList.toggle(
        "object-cover",
        discordAvatar
    );
    image.classList.toggle(
        "discord-chat-avatar",
        discordAvatar
    );
}

setupMemberActivity() {
    const markActive = () => {
        const now = Date.now();

        if (
            now - this.lastActivityReset <
                750 &&
            !this.isAfk
        ) {
            return;
        }

        this.lastActivityReset = now;

        window.clearTimeout(
            this.afkTimer
        );

        if (this.isAfk) {
            this.isAfk = false;
            this.sendPresence();
        }

        this.afkTimer =
            window.setTimeout(
                () => {
                    this.isAfk = true;
                    this.sendPresence();
                },
                5 * 60 * 1000
            );
    };

    [
        "pointerdown",
        "pointermove",
        "keydown",
        "touchstart",
        "scroll"
    ].forEach(eventName => {
        document.addEventListener(
            eventName,
            markActive,
            {
                passive: true,
                capture: true
            }
        );
    });

    document.addEventListener(
        "visibilitychange",
        () => {
            if (
                document.visibilityState ===
                    "visible"
            ) {
                markActive();
            }
        }
    );

    markActive();
}

	renderMembers(members) {
    this.membersElement.replaceChildren();

    if (!Array.isArray(members) || members.length === 0) {
        const empty = document.createElement("div");

        empty.className = "text-white/35";
        empty.textContent = "nobody online";

        this.membersElement.appendChild(empty);
        return;
    }

    for (const member of members) {
        const row = document.createElement("div");

        row.className =
            "flex min-w-0 items-center gap-2";

        const avatar = document.createElement("img");

        avatar.src =
            this.resolveChatAvatarSource(
                member.avatar
            );

        avatar.alt = "";
        avatar.className =
            "h-7 w-7 shrink-0";

        this.applyChatAvatarStyle(
            avatar,
            member.avatar
        );

        avatar.addEventListener(
            "error",
            () => {
                avatar.src = "/avatars/original.gif";
            },
            { once: true }
        );

        const name = document.createElement("span");

        name.className =
            member.afk === true
                ? "min-w-0 truncate jami-member-afk"
                : "min-w-0 truncate text-white/75";

        name.textContent =
            member.name || "anonymous";

		name.title =
    member.name || "anonymous";

        row.append(avatar, name);
        this.membersElement.appendChild(row);

		
		row.addEventListener("contextmenu", event => {
    if (!this.isAdmin) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.closeModerationMenu();

    this.openMemberModerationMenu(
        event.clientX,
        event.clientY,
        member
    );
});
    }
}

	sendPresence() {
    if (
        !this.socket ||
        this.socket.readyState !== WebSocket.OPEN
    ) {
        return;
    }

    const name =
        this.discordUser?.displayName ||
        this.nameInput.value.trim() ||
        "anonymous";

    const avatar =
        this.discordUser?.avatarUrl ||
        this.avatar;

    this.socket.send(JSON.stringify({
        type: "presence",
        clientId: this.clientId,
        name,
        avatar,
        afk:
            this.isAfk === true,
        discordToken:
            this.discordAuthToken || ""
    }));
}

	sendTypingState(isTyping) {
    if (
        !this.socket ||
        this.socket.readyState !== WebSocket.OPEN ||
        this.isBanned
    ) {
        return;
    }

    this.socket.send(
        JSON.stringify({
            type: "typing",
            clientId: this.clientId,
            name:
                this.discordUser?.displayName ||
                this.nameInput.value.trim() ||
                "anonymous",
            isTyping
        })
    );
}

renderTypingUsers() {
    if (!this.typingElement) {
        return;
    }

    const names =
        Array.from(
            this.typingUsers.values()
        );

    if (names.length === 0) {
        this.typingElement.textContent = "";

        this.typingElement.classList.add(
            "hidden"
        );

        return;
    }

    this.typingElement.classList.remove(
        "hidden"
    );
if (names.length === 1) {
    this.typingElement.textContent =
        `${names[0]} is typing...`;

    return;
}

if (names.length === 2) {
    this.typingElement.textContent =
        `${names[0]} and ${names[1]} are typing...`;

    return;
}

const remainingCount =
    names.length - 2;

this.typingElement.textContent =
    `${names[0]}, ${names[1]} and ` +
    `${remainingCount} ` +
    `${remainingCount === 1 ? "other" : "others"} ` +
    `are typing...`;
}

	

connect() {
	 if (this.isBanned) {
        return;
    }
	
    if (
        this.socket &&
        (
            this.socket.readyState === WebSocket.OPEN ||
            this.socket.readyState === WebSocket.CONNECTING
        )
    ) {
        return;
    }

    clearTimeout(this.reconnectTimer);

    const socketUrl =
        "wss://jamicat.ahrly.workers.dev/api/chat/socket";

    console.log("connecting chat websocket...");

    this.socket = new WebSocket(socketUrl);

    this.socket.addEventListener("open", () => {
    console.log("chat websocket connected");

    if (this.connectionStatus) {
        this.connectionStatus.textContent = "online";
		this.sendPresence();
        this.connectionStatus.classList.remove(
            "text-white/40",
            "text-red-300"
        );
        this.connectionStatus.classList.add(
            "text-emerald-300"
        );
    }
		this.sendPresence();
});

    this.socket.addEventListener("message", event => {
    if (event.data === "pong") {
        return;
    }

    try {
        const data = JSON.parse(event.data);

        console.log("chat websocket data:", data);

		

	if (data.type === "typing") {
    if (
        data.clientId ===
        this.clientId
    ) {
        return;
    }

    if (data.isTyping) {
        this.typingUsers.set(
            data.clientId,
            data.name || "anonymous"
        );
    } else {
        this.typingUsers.delete(
            data.clientId
        );
    }

    this.renderTypingUsers();

    return;
}

      if (data.type === "ban") {
    this.isBanned = true;

    clearTimeout(this.reconnectTimer);

    const reason =
        data.reason ||
        "no reason provided";

    const durationText =
        data.expires_at
            ? `Ban expires: ${
                new Date(
                    data.expires_at
                ).toLocaleString()
            }`
            : "this ban is permanent";

    window.alert(
        `you have been banned\n\n` +
        `Reason: ${reason}\n\n` +
        durationText
    );

    this.messageInput.disabled = true;
    this.sendButton.disabled = true;

    if (this.connectionStatus) {
        this.connectionStatus.textContent =
            "banned";

        this.connectionStatus.classList.remove(
            "text-emerald-300",
            "text-white/40"
        );

        this.connectionStatus.classList.add(
            "text-red-300"
        );
    }

    return;
}

if (data.type === "members") {
    this.renderMembers(data.members);
    return;
}

if (data.type === "motd") {
    this.setMotd(
        data.message || ""
    );

    return;
}

if (data.type === "watchparty-state") {
    this.watchParty = {
        enabled:
            data.state?.enabled === true,

        currentVideoId:
            data.state?.currentVideoId || null,

        currentIndex:
            Number.isInteger(
                data.state?.currentIndex
            )
                ? data.state.currentIndex
                : 0,

        startedAt:
            data.state?.startedAt || null,

        paused:
            data.state?.paused === true,

        pausedAt:
            data.state?.pausedAt || null,

        queue:
            Array.isArray(data.queue)
                ? data.queue
                : []
    };

    window.watchPartyPlayer?.applyState(
    this.watchParty
);
	

this.renderWatchParty();

if (this.partyManager) {
    this.partyManagerBusy = false;
    this.renderPartyManager();
}

    return;
}


        if (
    data.type ===
        "image-remix-created"
) {
    this.addImageUpload(
        data.upload
    );

    this.scrollMessagesToBottomAfterLayout({
        force: true
    });

    return;
}

		if (
    data.type ===
        "image-upload-created"
) {
    this.addImageUpload(
        data.upload
    );

    return;
}

if (
    data.type ===
        "image-upload-progress"
) {
    this.applyImageUploadState({
        uploadId:
            data.uploadId,

        status:
            "uploading",

        progress:
            data.progress,

        statusText:
            data.statusText,

        version:
            data.version
    });

    return;
}

if (
    data.type ===
        "image-upload-complete"
) {
    this.activeImageUploads.delete(
        data.uploadId
    );

    this.applyImageUploadState({
        uploadId:
            data.uploadId,

        status:
            "complete",

        progress: 100,

        statusText:
            data.statusText ||
            "Complete",

        imageUrl:
            data.imageUrl,

        completedAt:
            data.completedAt,

        version:
            data.version,

		showCompletionDialog:
        true
	
    });

    return;
}

		if (
    data.type ===
        "image-upload-deleted"
) {
    const active =
        this.activeImageUploads.get(
            data.uploadId
        );

    if (active) {
        active.cancelled =
            true;

        try {
            active.xhr?.abort();
        } catch {}
    }

    this.activeImageUploads.delete(
        data.uploadId
    );

    const row =
        this.imageUploadRows.get(
            data.uploadId
        );

    row?.remove();

    this.imageUploadRows.delete(
        data.uploadId
    );

    return;
}
		
if (
    data.type ===
        "image-upload-cancelled"
) {
    const active =
        this.activeImageUploads.get(
            data.uploadId
        );

    active?.xhr?.abort();

    this.activeImageUploads.delete(
        data.uploadId
    );

    const row =
        this.imageUploadRows.get(
            data.uploadId
        );

    row?.remove();

    this.imageUploadRows.delete(
        data.uploadId
    );

    return;
}

if (
    data.type ===
        "image-upload-failed"
) {
    this.activeImageUploads.delete(
        data.uploadId
    );

    this.applyImageUploadState({
        uploadId:
            data.uploadId,

        status:
            "failed",

        statusText:
            data.statusText ||
            "Transfer failed"
    });

    return;
}

	if (
    data.type ===
        "chat-cleared"
) {
    if (data.cutoff) {
        this.clearChatThrough(
            data.cutoff
        );
    } else {
        this.clearChatInterface();
    }

    return;
}
		

if (
    data.type ===
        "user-content-deleted"
) {
    this.applyDeletedUserContent(
        data
    );

    return;
}

if (data.type === "delete") {
    const messageElement =
        this.findMessageElement(data.id);

    if (messageElement) {
        messageElement.remove();
    }

    if (this.replyTarget?.type === "chat" && String(this.replyTarget.id) === String(data.id)) {
        this.clearReplyTarget();
    }
    this.closeModerationMenu();
    return;
}

if (
    data.type === "reaction-updated" &&
    data.snapshot
) {
    this.applyReactionSnapshot(
        data.snapshot
    );
    return;
}

if (data.type === "message-edited") {
    this.applyEditedMessage(data.message);
    return;
}

if (data.type === "message") {
    const shouldCountUnread =
        this.isMinimized ||
        this.userHasScrolledUp;

    this.addMessage(data.message);

    if (shouldCountUnread) {
        this.incrementUnreadCount();
    }

    this.playNotificationSound(
        data.message
    );

    return;
}

if (data.name && data.message) {
    this.addMessage(data);
}
	} catch (error) {
        console.error(
            "could not parse chat WebSocket message:",
            error,
            event.data
        );
    }
});

    this.socket.addEventListener("close", event => {
        console.log(
            "chat websocket closed:",
            event.code,
            event.reason
        );

        this.socket = null;
		this.typingUsers.clear();
this.renderTypingUsers();

		if (this.connectionStatus) {
    this.connectionStatus.textContent =
        this.isBanned
            ? "banned"
            : "reconnecting";

    this.connectionStatus.classList.remove(
        "text-emerald-300"
    );

    this.connectionStatus.classList.add(
        "text-red-300"
    );
}

if (!this.isBanned) {
    this.reconnectTimer = setTimeout(
        () => this.connect(),
        3000
    );
}
    });

    this.socket.addEventListener("error", error => {
        console.error("chat websocket error:", error);

        try {
            this.socket.close();
        } catch {
            
        }
    });
}

	createImageTransferElement(
    upload
) {
    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "jami-transfer-message";

    wrapper.dataset.uploadId =
        upload.uploadId || "";

    wrapper.dataset.uploadVersion =
        String(
            Number(upload.version) || 0
        );

    wrapper.innerHTML = `
        <div
            class="jami-transfer-window"
            data-jami-transfer-window
        >
            <div
                class="jami-transfer-titlebar"
            >
                <button
                    type="button"
                    class="
                        jami-transfer-caption-button
                        jami-transfer-minimize
                    "
                    tabindex="-1"
                    aria-hidden="true"
                >
                    <span></span>
                </button>

                <div
                    class="jami-transfer-title"
                >
                    UPLOAD
                </div>

                <button
                    type="button"
                    class="
                        jami-transfer-caption-button
                        jami-transfer-arrow-down
                    "
                    tabindex="-1"
                    aria-hidden="true"
                >
                    <span></span>
                </button>

                <button
                    type="button"
                    class="
                        jami-transfer-caption-button
                        jami-transfer-arrow-up
                    "
                    tabindex="-1"
                    aria-hidden="true"
                >
                    <span></span>
                </button>
            </div>

            <div
                class="jami-transfer-body"
            >
                <div
                    class="jami-transfer-progress-frame"
                >
                    <div
                        class="jami-transfer-progress"
                    >
                        <div
                            class="jami-transfer-progress-fill"
                            data-jami-transfer-fill
                        ></div>
                    </div>
                </div>

                <div
                    class="jami-transfer-bottom"
                >
                    <div
                        class="jami-transfer-copy"
                    >
                        <div
                            class="jami-transfer-file"
                        ></div>

                        <div
                            class="jami-transfer-status"
                        >
                            <span
                                class="jami-transfer-status-label"
                            >
                                Transfer Status:
                            </span>

                            <span
                                data-jami-transfer-status
                            >
                                Working
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="jami-transfer-cancel"
                        data-jami-transfer-cancel
                        disabled
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    const fileLabel =
        wrapper.querySelector(
            ".jami-transfer-file"
        );

    if (fileLabel) {
        fileLabel.textContent =
            upload.originalName ||
            "image";
    }

    const cancelButton =
        wrapper.querySelector(
            "[data-jami-transfer-cancel]"
        );

    cancelButton?.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.cancelImageUpload(
                upload.uploadId
            );
        }
    );

    return wrapper;
}


setupImageRemixing() {
    window.addEventListener(
        "jami-remix-ready",
        event => {
            this.uploadImageRemix(
                event.detail
            );
        }
    );
}

startImageRemix(upload) {
    if (
        !upload?.uploadId ||
        !upload?.imageUrl ||
        upload.status !== "complete"
    ) {
        return;
    }

    const editor =
        window.jamiImageRemixEditor;

    if (!editor) {
        window.alert(
            "the remix editor is unavailable"
        );

        return;
    }

    editor.open({
        ...upload,
        parentUploadId:
            upload.uploadId
    });
}

async uploadImageRemix(detail) {
    const blob = detail?.blob;
    const source = detail?.source;

    if (
        !(blob instanceof Blob) ||
        !source?.uploadId
    ) {
        return;
    }

    const formData =
        new FormData();

    formData.append(
        "image",
        blob,
        detail.filename ||
            `jamicat-remix-${Date.now()}.png`
    );

    formData.append(
        "parentUploadId",
        source.uploadId
    );

    formData.append(
        "clientId",
        this.clientId
    );

    formData.append(
        "name",
        this.discordUser
            ?.displayName ||
        this.nameInput
            ?.value
            ?.trim() ||
        "anonymous"
    );

    formData.append(
        "avatar",
        this.discordUser
            ?.avatarUrl ||
        this.avatar ||
        "original.gif"
    );

    try {
        const request =
            await fetch(
                `${this.imageUploadConfig.apiBase}/remix`,
                {
                    method: "POST",
                    headers:
                        this.discordAuthToken
                            ? {
                                "Authorization":
                                    `Bearer ${this.discordAuthToken}`
                            }
                            : {},
                    body: formData
                }
            );

        let result = null;

        try {
            result =
                await request.json();
        } catch {}

        if (!request.ok) {
            throw new Error(
                result?.error ||
                `could not upload remix (${request.status})`
            );
        }

        window.jamiImageRemixEditor?.close();
    } catch (error) {
        console.error(
            "Could not upload image remix:",
            error
        );

        window.alert(
            `could not upload remix: ${error.message}`
        );
    }
}

createCompletedImageElement(
    upload
) {
    const shell =
        document.createElement(
            "div"
        );

    shell.className =
        "jami-chat-image-shell";

    const image =
        document.createElement(
            "img"
        );

    image.src =
        upload.imageUrl;

    image.alt =
        upload.originalName ||
        "uploaded image";

    image.className =
        "jami-transfer-image";

    const remixButton =
        document.createElement(
            "button"
        );

    remixButton.type =
        "button";

    remixButton.className = [
        "jami-image-remix-trigger",
        "theme-body"
    ].join(" ");

    remixButton.textContent =
        "remix image";

    remixButton.addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();

            this.startImageRemix(
                upload
            );
        }
    );

    shell.append(
        image,
        remixButton
    );

    const remixChain =
        Array.isArray(upload.remixChain)
            ? upload.remixChain
                .filter(name =>
                    typeof name === "string" &&
                    name.trim()
                )
            : [];

    if (remixChain.length > 0) {
        const attribution =
            document.createElement(
                "div"
            );

        attribution.className =
            "jami-remix-attribution theme-body";

        attribution.textContent =
            `remixed by ${remixChain.join(" by ")}`;

        shell.appendChild(
            attribution
        );
    }

    return shell;
}

    playImageUploadCompleteSound() {
    const soundUrl =
        "/socials/audio/upload-complete.wav";

    if (!this.imageUploadCompleteSound) {
        const audio =
            new Audio(soundUrl);

        audio.preload =
            "auto";

        audio.volume =
            0.18;

        this.imageUploadCompleteSound =
            audio;
    }

    const audio =
        this.imageUploadCompleteSound;
    audio.pause();
    audio.currentTime = 0;

    const playResult =
        audio.play();

    if (
        playResult &&
        typeof playResult.catch ===
            "function"
    ) {
        playResult.catch(error => {
            
            console.warn(
                "upload-complete sound was blocked:",
                error
            );
        });
    }
}
	
	createImageUploadCompleteDialog(
    onDismiss
) {
    const dialog =
        document.createElement(
            "div"
        );

    dialog.className = [
    "jami-program-message",
    "jami-program-message-opening"
].join(" ");

	this.playImageUploadCompleteSound();

    dialog.setAttribute(
        "role",
        "status"
    );

    dialog.setAttribute(
        "aria-label",
        "Upload complete"
    );

    dialog.innerHTML = `
        <div
            class="jami-program-message-titlebar"
        >
            <div
                class="
                    jami-program-message-caption-button
                    jami-program-message-minimize
                "
                aria-hidden="true"
            >
                <span></span>
            </div>

            <div
                class="jami-program-message-title"
            >
                Program Message
            </div>
        </div>

        <div
            class="jami-program-message-body"
        >
            <div
                class="jami-program-message-main"
            >
                <div
                    class="jami-program-message-icon"
                    aria-hidden="true"
                >
                    <span
                        class="jami-program-message-exclamation"
                    >
                        !
                    </span>

                    <span
                        class="jami-program-message-symbol"
                    >
                        ✦
                    </span>
                </div>

                <div
                    class="jami-program-message-text"
                >
                    Upload Complete
                </div>
            </div>

            <div
                class="jami-program-message-actions"
            >
                <button
                    type="button"
                    class="jami-program-message-ok"
                    data-jami-program-message-ok
                >
                    OK
                </button>
            </div>
        </div>
    `;

    const dismiss = () => {
        if (
            dialog.dataset.dismissed ===
                "true"
        ) {
            return;
        }

        dialog.dataset.dismissed =
            "true";

        dialog.classList.add(
            "jami-program-message-closing"
        );

        window.setTimeout(
            () => {
                onDismiss?.();
            },
            90
        );
    };

    dialog
        .querySelector(
            "[data-jami-program-message-ok]"
        )
        ?.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                dismiss();
            }
        );

		requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        dialog.classList.remove(
            "jami-program-message-opening"
        );
    });
});
		
    return {
        dialog,
        dismiss
    };
}

showCompletedImage(
    upload,
    body
) {
    if (
        !upload?.imageUrl ||
        !body
    ) {
        return;
    }

    const imageShell =
        this.createCompletedImageElement(
            upload
        );

    const image =
        imageShell.querySelector(
            ".jami-transfer-image"
        );

    body.classList.remove(
        "jami-transfer-completion-host"
    );

    body.replaceChildren(
        imageShell
    );

    image?.addEventListener(
        "load",
        () => {
            this.scrollMessagesToBottomAfterLayout({
                force: true
            });
        },
        {
            once: true
        }
    );

    image?.addEventListener(
        "error",
        () => {
            const failure =
                document.createElement(
                    "div"
                );

            failure.className =
                "jami-transfer-message";

            failure.textContent =
                "Image retrieval failed";

            body.replaceChildren(
                failure
            );
        },
        {
            once: true
        }
    );
}

	addImageUpload(upload) {
    if (
        !upload?.uploadId
    ) {
        return null;
    }

    const existing =
        this.imageUploadRows.get(
            upload.uploadId
        );

    if (existing?.isConnected) {
        this.applyImageUploadState(
            upload
        );

        return existing;
    }

    const row =
        document.createElement(
            "div"
        );

    row.className = [
        "chatMessage",
        "group",
        "relative",
        "flex",
        "items-start",
        "mt-2",
        "gap-2"
    ].join(" ");

    row.dataset.imageUploadId =
        upload.uploadId;

    row.jamiImageUpload = {
        ...upload
    };

    row.dataset.clientId =
        upload.clientId || "";

    const createdTime =
        new Date(
            upload.createdAt
        ).getTime();

    row.dataset.timestamp =
        String(
            Number.isFinite(createdTime)
                ? createdTime
                : Date.now()
        );

    row.addEventListener(
        "contextmenu",
        event => {
            const currentUpload =
                row.jamiImageUpload ||
                upload;

            const ownsUpload =
                Boolean(
                    currentUpload.clientId
                ) &&
                currentUpload.clientId ===
                    this.clientId;

            if (
                !ownsUpload &&
                !this.isAdmin
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            this.closeModerationMenu();

            this.openModerationMenu(
                event.clientX,
                event.clientY,
                {
                    id:
                        currentUpload.uploadId,

                    imageUploadId:
                        currentUpload.uploadId,

                    imageUpload:
                        currentUpload,

                    name:
                        currentUpload.name ||
                        "anonymous",

                    client_id:
                        currentUpload.clientId ||
                        ""
                }
            );
        }
    );

    const avatar =
        document.createElement(
            "img"
        );

    avatar.src =
        this.resolveChatAvatarSource(
            upload.avatar
        );

    avatar.alt = "";

    avatar.className =
        "h-9 w-9 shrink-0 -mt-[11px]";

    this.applyChatAvatarStyle(
        avatar,
        upload.avatar
    );

    avatar.addEventListener(
        "error",
        () => {
            avatar.src =
                "/avatars/original.gif";
        },
        {
            once: true
        }
    );

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "min-w-0 flex-1";

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "flex min-w-0 items-baseline gap-2";

    const name =
        document.createElement(
            "span"
        );

    name.className =
        "chatMessageName font-bold";

    name.textContent =
        upload.name ||
        "anonymous";

    const time =
        document.createElement(
            "span"
        );

    time.className =
        "chatTime shrink-0 whitespace-nowrap text-[9px] text-white/35";

    const createdDate =
        new Date(
            upload.createdAt
        );

    time.textContent =
        Number.isNaN(
            createdDate.getTime()
        )
            ? "--:--"
            : createdDate
                .toLocaleTimeString(
                    undefined,
                    {
                        hour:
                            "2-digit",
                        minute:
                            "2-digit",
                        hour12:
                            false
                    }
                );

    const body =
        document.createElement(
            "div"
        );

    body.className =
        "messageBody";

    body.dataset.imageUploadBody =
        "true";

    header.append(
        name,
        time
    );

    content.append(
        header,
        body
    );

    row.append(
        avatar,
        content
    );

    this.messages.appendChild(
        row
    );

    this.imageUploadRows.set(
        upload.uploadId,
        row
    );

    this.setupReactionRow(
        row,
        "image",
        upload.uploadId
    );

    this.applyImageUploadState(
        upload
    );

	if (!this.isMinimized) {
    this.scrollMessagesToBottomAfterLayout({
        force: true
    });
}
    return row;
	}
	
applyImageUploadState(upload) {
    if (
        !upload?.uploadId
    ) {
        return;
    }

    let row =
        this.imageUploadRows.get(
            upload.uploadId
        );

    if (!row?.isConnected) {
        row =
            this.addImageUpload(
                upload
            );

        if (!row) {
            return;
        }
    }

    const body =
        row.querySelector(
            "[data-image-upload-body]"
        );

    if (!body) {
        return;
    }

    row.jamiImageUpload = {
        ...(row.jamiImageUpload || {}),
        ...upload
    };

    const currentVersion =
        Number(
            row.dataset
                .imageUploadVersion ||
            0
        );

    const incomingVersion =
        Number(
            upload.version
        ) || 0;

    if (
        incomingVersion > 0 &&
        currentVersion > 0 &&
        incomingVersion <
            currentVersion
    ) {
        return;
    }

    if (incomingVersion > 0) {
        row.dataset.imageUploadVersion =
            String(incomingVersion);
    }

    row.dataset.imageUploadStatus =
        upload.status ||
        "uploading";

   if (
    upload.status ===
        "complete" &&
    upload.imageUrl
) {
    const existingImage =
        body.querySelector(
            ".jami-transfer-image"
        );

    const resolvedImageUrl =
        new URL(
            upload.imageUrl,
            window.location.href
        ).href;

    if (
        existingImage &&
        existingImage.src ===
            resolvedImageUrl
    ) {
        return;
    }

    if (
        upload.showCompletionDialog !==
            true
    ) {
        this.showCompletedImage(
            upload,
            body
        );

        return;
    }

    if (
        row.dataset
            .completionDialogShown ===
            "true"
    ) {
        return;
    }

    row.dataset
        .completionDialogShown =
        "true";

    let transfer =
        body.querySelector(
            ".jami-transfer-message"
        );

    if (!transfer) {
        transfer =
            this.createImageTransferElement(
                upload
            );

        body.replaceChildren(
            transfer
        );
    }

    const fill =
        transfer.querySelector(
            "[data-jami-transfer-fill]"
        );

    const status =
        transfer.querySelector(
            "[data-jami-transfer-status]"
        );

    const cancelButton =
        transfer.querySelector(
            "[data-jami-transfer-cancel]"
        );

    if (fill) {
        fill.style.width =
            "100%";
    }

    if (status) {
        status.textContent =
            "Complete";
    }

    if (cancelButton) {
        cancelButton.disabled =
            true;
    }

    body.classList.add(
        "jami-transfer-completion-host"
    );

    const finishCompletion =
        () => {
            this.showCompletedImage(
                upload,
                body
            );
        };

    const {
        dialog,
        dismiss
    } =
        this.createImageUploadCompleteDialog(
            finishCompletion
        );

    body.appendChild(
        dialog
    );

    this.scrollMessagesToBottomAfterLayout({
        force: true
    });

    return;
}

    let transfer =
        body.querySelector(
            ".jami-transfer-message"
        );

    if (!transfer) {
        transfer =
            this.createImageTransferElement(
                upload
            );

        body.replaceChildren(
            transfer
        );
    }

    transfer.dataset.uploadId =
        upload.uploadId;

    transfer.dataset.uploadVersion =
        String(incomingVersion);

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                Math.floor(
                    Number(
                        upload.progress
                    ) || 0
                )
            )
        );

    const fill =
        transfer.querySelector(
            "[data-jami-transfer-fill]"
        );

    const status =
        transfer.querySelector(
            "[data-jami-transfer-status]"
        );

    const cancelButton =
        transfer.querySelector(
            "[data-jami-transfer-cancel]"
        );

    if (fill) {
        fill.style.width =
            `${progress}%`;
    }

   if (status) {
    if (
        upload.status ===
            "uploading"
    ) {
        status.textContent =
            "Working";
    } else {
        status.textContent =
            upload.statusText ||
            "Failed";
    }
}

    if (cancelButton) {
        cancelButton.disabled =
            !this.activeImageUploads.has(
                upload.uploadId
            ) ||
            upload.status !==
                "uploading";
    }
}

	getImageUploadStatusText(
    progress
) {
    return "Working";
}

queueImageProgressReport(
    activeUpload,
    progress,
    statusText
) {
    if (
        !activeUpload ||
        activeUpload.cancelled
    ) {
        return;
    }

    const now =
        performance.now();

    const progressDifference =
        progress -
        activeUpload
            .lastReportedProgress;

    const timeDifference =
        now -
        activeUpload
            .lastReportedAt;

    const shouldSendNow =
        activeUpload
            .lastReportedProgress < 0 ||
        progressDifference >= 3 ||
        timeDifference >= 350 ||
        progress >= 99;

    activeUpload.queuedReport = {
        progress,
        statusText
    };

    if (
        activeUpload.reporting ||
        !shouldSendNow
    ) {
        return;
    }

    this.flushImageProgressReport(
        activeUpload
    );
}

async flushImageProgressReport(
    activeUpload
) {
    if (
        !activeUpload ||
        activeUpload.reporting ||
        activeUpload.cancelled ||
        !activeUpload.queuedReport
    ) {
        return;
    }

    const report =
        activeUpload.queuedReport;

    activeUpload.queuedReport =
        null;

    activeUpload.reporting =
        true;

    try {
        const response =
            await fetch(
                `${this.imageUploadConfig.apiBase}/progress`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            uploadId:
                                activeUpload
                                    .uploadId,

                            clientId:
                                this.clientId,

                            uploadToken:
                                activeUpload
                                    .uploadToken,

                            progress:
                                report.progress,

                            statusText:
                                report.statusText
                        })
                }
            );

        let result = null;

        try {
            result =
                await response.json();
        } catch {}

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Progress update failed (${response.status})`
            );
        }

        if (
            result?.updated === true
        ) {
            activeUpload
                .lastReportedProgress =
                report.progress;

            activeUpload
                .lastReportedAt =
                performance.now();
        }
    } catch (error) {
        console.error(
            "Could not report image progress:",
            error
        );
    } finally {
        activeUpload.reporting =
            false;

        if (
            activeUpload.queuedReport &&
            !activeUpload.cancelled
        ) {
            this.flushImageProgressReport(
                activeUpload
            );
        }
    }
}	
	
async uploadTestImage(file) {
    const allowedTypes =
        new Set([
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp"
        ]);

    if (
        !allowedTypes.has(
            file.type
        )
    ) {
        window.alert(
            "choose a PNG, JPEG, GIF or WebP."
        );

        return;
    }

    if (
        file.size <= 0 ||
        file.size >
            this.imageUploadConfig
                .maximumBytes
    ) {
        window.alert(
            "images must be less than 8 MB."
        );

        return;
    }

    let session;

    try {
        const startResponse =
            await fetch(
                `${this.imageUploadConfig.apiBase}/start`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                        ...(this.discordAuthToken
                            ? {
                                "Authorization":
                                    `Bearer ${this.discordAuthToken}`
                            }
                            : {})
                    },

                    body:
                        JSON.stringify({
                            clientId:
                                this.clientId,

                            name:
                                this.discordUser
                                    ?.displayName ||
                                this.nameInput
                                    ?.value
                                    ?.trim() ||
                                "anonymous",

                            avatar:
                                this.discordUser
                                    ?.avatarUrl ||
                                this.avatar ||
                                "original.gif",

                            originalName:
                                file.name,

                            contentType:
                                file.type,

                            size:
                                file.size
                        })
                }
            );

        try {
            session =
                await startResponse.json();
        } catch {
            session = null;
        }

        if (
            !startResponse.ok ||
            session?.success !== true ||
            !session?.upload?.uploadId ||
            !session?.uploadToken ||
            !session?.uploadUrl
        ) {
            throw new Error(
                session?.error ||
                `Could not start upload (${startResponse.status})`
            );
        }
    } catch (error) {
        console.error(
            "Could not start image upload:",
            error
        );

        window.alert(
            `Could not start image upload: ${error.message}`
        );

        return;
    }

    const upload =
        session.upload;

    this.addImageUpload(
        upload
    );

    const xhr =
        new XMLHttpRequest();

    const activeUpload = {
        uploadId:
            upload.uploadId,

        uploadToken:
            session.uploadToken,

        xhr,

        lastReportedProgress:
            -1,

        lastReportedAt:
            0,

        reporting:
            false,

        queuedReport:
            null,

        cancelled:
            false
    };

    this.activeImageUploads.set(
        upload.uploadId,
        activeUpload
    );

    this.applyImageUploadState(
        upload
    );

    xhr.open(
        "POST",
        session.uploadUrl,
        true
    );

    xhr.setRequestHeader(
        "Content-Type",
        file.type
    );

    xhr.setRequestHeader(
        "X-Chat-Client-Id",
        this.clientId
    );

    xhr.setRequestHeader(
        "X-Image-Upload-Token",
        session.uploadToken
    );

    xhr.upload.addEventListener(
        "progress",
        event => {
            if (
                !event.lengthComputable ||
                activeUpload.cancelled
            ) {
                return;
            }

            const progress =
                Math.max(
                    0,
                    Math.min(
                        99,
                        Math.floor(
                            (
                                event.loaded /
                                event.total
                            ) * 100
                        )
                    )
                );

            const statusText =
                this.getImageUploadStatusText(
                    progress
                );

            this.applyImageUploadState({
                uploadId:
                    upload.uploadId,

                status:
                    "uploading",

                progress,

                statusText,

                version:
                    Number(
                        upload.version
                    ) || 1
            });

            this.queueImageProgressReport(
                activeUpload,
                progress,
                statusText
            );
        }
    );

    xhr.addEventListener(
        "load",
        () => {
            let result = null;

            try {
                result =
                    JSON.parse(
                        xhr.responseText
                    );
            } catch {}

            if (
                xhr.status >= 200 &&
                xhr.status < 300 &&
                result?.success === true
            ) {
                this.activeImageUploads
                    .delete(
                        upload.uploadId
                    );

                this.applyImageUploadState({
                    uploadId:
                        upload.uploadId,

                    status:
                        "complete",

                    progress: 100,

                    statusText:
                        result.statusText ||
                        "Complete",

                    imageUrl:
                        result.imageUrl,

                    completedAt:
                        result.completedAt,

                    version:
                        result.version,

					showCompletionDialog:
                     true
				
                });

                return;
            }

            if (
                result?.code ===
                    "UPLOAD_CANCELLED"
            ) {
                return;
            }

            this.activeImageUploads
                .delete(
                    upload.uploadId
                );

            this.applyImageUploadState({
                uploadId:
                    upload.uploadId,

                status:
                    "failed",

                statusText:
                    result?.error ||
                    "Transfer failed"
            });
        }
    );

    xhr.addEventListener(
        "error",
        () => {
            if (
                activeUpload.cancelled
            ) {
                return;
            }

            this.activeImageUploads
                .delete(
                    upload.uploadId
                );

            this.applyImageUploadState({
                uploadId:
                    upload.uploadId,

                status:
                    "failed",

                statusText:
                    "Network transfer failed"
            });
        }
    );

    xhr.addEventListener(
        "abort",
        () => {
        }
    );

    xhr.send(file);
}

	async clearEntireChat() {
    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        return;
    }

    const todayExample =
    new Date()
        .toISOString()
        .slice(0, 10);

const cutoffInput =
    window.prompt(
        "enter a date and time to clear chat from that point onward:\n" +
        "format: yyyy-mm-dd hh:mm\n" +
        `example: ${todayExample} 13:30\n\n` +
        "leave empty to clear the full chat.",
        ""
    );

    if (cutoffInput === null) {
        return;
    }

    const cleanedCutoff =
        cutoffInput.trim();

    let cutoff = null;
    let cutoffLabel =
        "the entire chat";

    if (cleanedCutoff) {
        const match =
            cleanedCutoff.match(
                /^(\d{4})-(\d{2})-(\d{2})[ t](\d{2}):(\d{2})$/
            );

        if (!match) {
            window.alert(
                "invalid date and time.\n\n" +
                "use: yyyy-mm-dd hh:mm"
            );
            return;
        }

        const [
            ,
            yearText,
            monthText,
            dayText,
            hourText,
            minuteText
        ] = match;

        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);
        const hour = Number(hourText);
        const minute = Number(minuteText);

        const localDate =
            new Date(
                year,
                month - 1,
                day,
                hour,
                minute,
                0,
                0
            );

        const valid =
            localDate.getFullYear() === year &&
            localDate.getMonth() === month - 1 &&
            localDate.getDate() === day &&
            localDate.getHours() === hour &&
            localDate.getMinutes() === minute;

        if (!valid) {
            window.alert(
                "invalid date and time.\n\n" +
                "use: yyyy-mm-dd hh:mm"
            );
            return;
        }

        cutoff =
            localDate.toISOString();

        cutoffLabel =
            `chat from ${cleanedCutoff} onward`;
    }

    const confirmed =
        window.confirm(
            `clear ${cutoffLabel}?`
        );

    if (!confirmed) {
        return;
    }

    const finalConfirmation =
        window.confirm(
            "final confirmation:\n\n" +
            `delete ${cutoffLabel}?`
        );

    if (!finalConfirmation) {
        return;
    }

    try {
        const request =
            await fetch(
                `${this.API}/api/admin/chat/clear`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${this.adminKey}`
                    },

                    body:
                        JSON.stringify({
                            cutoff
                        })
                }
            );

        let result = null;

        try {
            result =
                await request.json();
        } catch {}

        if (
            request.status === 401
        ) {
            this.disableAdminMode();

            throw new Error(
                "admin authentication is no longer valid"
            );
        }

        if (!request.ok) {
            if (
                result?.chatCleared ===
                    true
            ) {
                if (result?.cutoff) {
                    this.clearChatThrough(
                        result.cutoff
                    );
                } else {
                    this.clearChatInterface();
                }
            }

            throw new Error(
                result?.error ||
                `could not clear chat (${request.status})`
            );
        }

        if (result?.cutoff) {
            this.clearChatThrough(
                result.cutoff
            );
        } else {
            this.clearChatInterface();
        }

        console.log(
            "chat cleared:",
            {
                cutoff:
                    result?.cutoff ||
                    null,

                messages:
                    result?.deletedMessages ||
                    0,

                imageRows:
                    result?.deletedImageRows ||
                    0,

                reactions:
                    result?.deletedReactions ||
                    0,

                r2Objects:
                    result?.deletedR2Objects ||
                    0
            }
        );
    } catch (error) {
        console.error(
            "could not clear chat:",
            error
        );

        window.alert(
            `could not clear chat: ${error.message}`
        );
    }
}

clearChatThrough(cutoff) {
    const cutoffTime =
        new Date(cutoff).getTime();

    if (!Number.isFinite(cutoffTime)) {
        return;
    }

    for (
        const row
        of this.messages.querySelectorAll(
            ".chatMessage"
        )
    ) {
        const timestamp =
            Number(
                row.dataset.timestamp
            );

        if (
            Number.isFinite(timestamp) &&
            timestamp >= cutoffTime
        ) {
            const uploadId =
                row.dataset.imageUploadId;

            if (uploadId) {
                this.imageUploadRows.delete(
                    uploadId
                );

                this.activeImageUploads.delete(
                    uploadId
                );
            }

            row.remove();
        }
    }

    this.closeModerationMenu();

    if (
        this.replyTarget?.createdAt &&
        new Date(
            this.replyTarget.createdAt
        ).getTime() >= cutoffTime
    ) {
        this.clearReplyTarget();
    }
}

clearChatInterface() {
    for (
        const activeUpload
        of this.activeImageUploads
            .values()
    ) {
        activeUpload.cancelled =
            true;

        try {
            activeUpload.xhr?.abort();
        } catch {}
    }

    this.activeImageUploads.clear();
    this.imageUploadRows.clear();

    this.messages.replaceChildren();

    this.userHasScrolledUp =
        false;

    this.clearUnreadCount();
}

	
	async deleteImageUpload(
    uploadId
) {
    if (!uploadId) {
        return;
    }

    try {
        const headers = {
            "Content-Type":
                "application/json",

            "X-Chat-Client-Id":
                this.clientId
        };

        if (
            this.isAdmin &&
            this.adminKey
        ) {
            headers.Authorization =
                `Bearer ${this.adminKey}`;
        }

        const response =
            await fetch(
                `${this.imageUploadConfig.apiBase}/delete`,
                {
                    method:
                        "POST",

                    headers,

                    body:
                        JSON.stringify({
                            uploadId
                        })
                }
            );

        let result = null;

        try {
            result =
                await response.json();
        } catch {}

        if (
            response.status === 401
        ) {
            throw new Error(
                "Admin authentication is no longer valid"
            );
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Could not delete image (${response.status})`
            );
        }

        if (
            result?.deleted === true ||
            result?.stale === true
        ) {
            const row =
                this.imageUploadRows.get(
                    uploadId
                );

            row?.remove();

            this.imageUploadRows.delete(
                uploadId
            );

            this.activeImageUploads.delete(
                uploadId
            );
        }
    } catch (error) {
        console.error(
            "Could not delete uploaded image:",
            error
        );

        window.alert(
            `Could not delete image: ${error.message}`
        );
    }
}

	
	async cancelImageUpload(
    uploadId
) {
    const activeUpload =
        this.activeImageUploads.get(
            uploadId
        );

    if (
        !activeUpload ||
        activeUpload.cancelled
    ) {
        return;
    }

    activeUpload.cancelled =
        true;

    try {
        activeUpload.xhr?.abort();
    } catch {}

    try {
        const response =
            await fetch(
                `${this.imageUploadConfig.apiBase}/cancel`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            uploadId,

                            clientId:
                                this.clientId,

                            uploadToken:
                                activeUpload
                                    .uploadToken
                        })
                }
            );

        let result = null;

        try {
            result =
                await response.json();
        } catch {}

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Cancellation failed (${response.status})`
            );
        }

        this.activeImageUploads.delete(
            uploadId
        );

        if (
            result?.cancelled === true
        ) {
            const row =
                this.imageUploadRows.get(
                    uploadId
                );

            row?.remove();

            this.imageUploadRows.delete(
                uploadId
            );
        }
    } catch (error) {
        activeUpload.cancelled =
            false;

        console.error(
            "Could not cancel image upload:",
            error
        );

        window.alert(
            `Could not cancel image upload: ${error.message}`
        );

        this.applyImageUploadState({
            uploadId,

            status:
                "uploading",

            statusText:
                "Transmitting image..."
        });
    }
}
	
async sendMessage() {
    const name =
        this.discordUser?.displayName ||
        this.nameInput.value.trim();

    const avatar =
        this.discordUser?.avatarUrl ||
        this.avatar;

    const message = this.messageInput.value.trim();

    if (!name || !message || this.sendButton.disabled) {
        return;
    }

    this.sendButton.disabled = true;
    this.sendButton.textContent = "sending...";

    try {
        const response = await fetch(`${this.API}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(this.discordAuthToken
                    ? {
                        "Authorization":
                            `Bearer ${this.discordAuthToken}`
                    }
                    : {})
            },
           body: JSON.stringify({
    clientId: this.clientId,
    name,
    message,
    avatar,
    replyTargetType: this.replyTarget?.type || null,
    replyTargetId: this.replyTarget?.id || null
})
        });

  const result =
    await response.json();

if (
    response.status === 403 &&
    result.error === "banned"
) {
    this.isBanned = true;

    const durationText =
        result.expires_at
            ? `Ban expires: ${
                new Date(
                    result.expires_at
                ).toLocaleString()
            }`
            : "this ban is permanent";

    window.alert(
        `you have been banned.\n\n` +
        `reason: ${
            result.reason ||
            "no reason provided"
        }\n\n` +
        durationText
    );

    this.messageInput.disabled = true;
    this.sendButton.disabled = true;

    if (
        this.socket &&
        this.socket.readyState === WebSocket.OPEN
    ) {
        this.socket.close(
            4003,
            "banned"
        );
    }

    return;
}

if (!response.ok) {
    throw new Error(
        result?.error ||
        `chat request failed (${response.status})`
    );
}
clearTimeout(this.typingTimer);
this.sendTypingState(false);

this.messageInput.value = "";
this.clearReplyTarget();
this.messageInput.focus();
    } catch (error) {
        console.error("could not send chat message:", error);
    } finally {
    this.sendButton.disabled =
        this.isBanned;

    this.sendButton.textContent =
        this.isBanned
            ? "banned"
            : "send";
}
}

restoreSettings() {
    const savedName =
        localStorage.getItem("chat_name");

    if (savedName) {
        this.nameInput.value = savedName;
    }

    for (const key of [
        "chat_width",
        "chat_height",
        "chat_left",
        "chat_top"
    ]) {
        localStorage.removeItem(key);
    }

    this.window.style.width = "";
    this.window.style.height = "";
    this.window.style.left = "";
    this.window.style.top = "";
    this.window.style.right = "";
    this.window.style.bottom = "";

    const isMobile =
        window.matchMedia(
            "(max-width: 640px)"
        ).matches;

    if (isMobile) {
        this.window.dataset.x = "0";
        this.window.dataset.y = "0";

        this.window.style.transform =
            "translate(0px, 0px)";

        return;
    }

    const x =
        localStorage.getItem("chat_x") || "0";

    const y =
        localStorage.getItem("chat_y") || "0";

    this.window.dataset.x = x;
    this.window.dataset.y = y;

    this.window.style.transform =
        `translate(${x}px, ${y}px)`;
}

	getRangePointerRatio(
    rangeInput,
    clientX,
    thumbWidth = 12
) {
    if (!rangeInput) {
        return 0;
    }

    const rect =
        rangeInput
            .getBoundingClientRect();

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

	parseDurationText(value) {
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

	
formatDuration(seconds) {
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

setupNameSaving() {
    this.nameInput.addEventListener("input", () => {
        if (this.discordUser) {
            return;
        }

        localStorage.setItem(
            "chat_name",
            this.nameInput.value
        );

        this.sendPresence();
    });
}

	renderMessageContent(container, message) {
    container.replaceChildren();

    const value =
        typeof message === "string"
            ? message
            : "";

    const pattern =
        /:([a-z0-9_+-]+):/gi;

    let lastIndex = 0;
    let match;

    while (
        (match = pattern.exec(value)) !== null
    ) {
        if (match.index > lastIndex) {
            container.appendChild(
                document.createTextNode(
                    value.slice(
                        lastIndex,
                        match.index
                    )
                )
            );
        }

        const emojiId =
            match[1].toLowerCase();

        const customEmoji =
            this.customEmojiLookup.get(emojiId);

        if (customEmoji) {
            const image =
                document.createElement("img");

            image.src = customEmoji.src;
            image.alt = `:${customEmoji.id}:`;
            image.title = customEmoji.name;

            image.className = [
    "mx-0.5",
    "inline-block",
    "h-10",
    "w-10",
    "align-middle",
    "object-contain"
].join(" ");

            image.loading = "lazy";
            image.decoding = "async";

            image.addEventListener(
                "error",
                () => {
                    image.replaceWith(
                        document.createTextNode(
                            `:${customEmoji.id}:`
                        )
                    );
                },
                {
                    once: true
                }
            );

            container.appendChild(image);
        } else {
            container.appendChild(
                document.createTextNode(
                    match[0]
                )
            );
        }

        lastIndex =
            pattern.lastIndex;
    }

    if (lastIndex < value.length) {
        container.appendChild(
            document.createTextNode(
                value.slice(lastIndex)
            )
        );
    }
}
	
setupEmojiPicker() {

    this.customEmojiCategories = [
    {
        id: "custom",
        name: "custom",
        emojis: [
            {
                id: "blueblob",
                name: "blue wobble",
                keywords: ["blue", "blob", "cat"],
                skins: [
                    {
                        src: "/emojis/blueblob.gif"
                    }
                ]
            },
            {
                id: "pinkblob",
                name: "pink wobble",
                keywords: ["pink", "blob", "cat"],
                skins: [
                    {
                        src: "/emojis/pinkblob.gif"
                    }
                ]
            },
			{
                id: "yellowblob",
                name: "yellow wobble",
                keywords: ["yellow", "blob", "cat"],
                skins: [
                    {
                        src: "/emojis/yellowblob.gif"
                    }
                ]
            },
			 {
                id: "catcooking",
                name: "cat cooking",
                keywords: ["cat", "cooking", "food"],
                skins: [
                    {
                        src: "/emojis/catcooking.gif"
                    }
                ]
            },
            {
                id: "drooling",
                name: "drooling",
                keywords: ["drool", "hungry", "food"],
                skins: [
                    {
                        src: "/emojis/drooling.gif"
                    }
                ]
            },
            {
                id: "pointandlaugh",
                name: "point and laugh",
                keywords: ["point", "laugh", "funny"],
                skins: [
                    {
                        src: "/emojis/pointandlaugh.png"
                    }
                ]
            },
            {
                id: "tongue",
                name: "tongue",
                keywords: ["tongue", "silly", "tease", "cat"],
                skins: [
                    {
                        src: "/emojis/tongue.gif"
                    }
                ]
            },
			{
                id: "catflip",
                name: "table flip",
                keywords: ["table", "flip", "cat"],
                skins: [
                    {
                        src: "/emojis/catflip.gif"
                    }
                ]
            },
			{
                id: "catdance",
                name: "dancedance",
                keywords: ["dance", "cat"],
                skins: [
                    {
                        src: "/emojis/catdance.gif"
                    }
                ]
            },
			{
    id: "bulbasip",
    name: "bulba sip",
    keywords: ["bulbasaur", "pokemon", "sip", "drink", "tea"],
    skins: [
        {
            src: "/emojis/bulbasip.png"
        }
    ]
},
{
    id: "cantlook",
    name: "can't look",
    keywords: ["eevee", "pokemon", "shy", "embarrassed"],
    skins: [
        {
            src: "/emojis/cantlook.png"
        }
    ]
},
{
    id: "espeonconfetti",
    name: "espeon confetti",
    keywords: ["espeon", "pokemon", "party", "celebrate", "confetti"],
    skins: [
        {
            src: "/emojis/espeonconfetti.gif"
        }
    ]
},
{
    id: "huh",
    name: "huh",
    keywords: ["psyduck", "pokemon", "confused", "huh", "what"],
    skins: [
        {
            src: "/emojis/huh.gif"
        }
    ]
},
{
    id: "pikagrin",
    name: "pika grin",
    keywords: ["pikachu", "pokemon", "grin", "smug"],
    skins: [
        {
            src: "/emojis/pikagrin.png"
        }
    ]
},
{
    id: "pikasideeye",
    name: "pika sideeye",
    keywords: ["pikachu", "pokemon", "side eye", "sus", "judging"],
    skins: [
        {
            src: "/emojis/pikasideeye.png"
        }
    ]
},
{
    id: "pikatea",
    name: "pika tea",
    keywords: ["pikachu", "pokemon", "tea", "drink", "sip"],
    skins: [
        {
            src: "/emojis/pikatea.png"
        }
    ]
},
{
    id: "pikathink",
    name: "pika thinking",
    keywords: ["pikachu", "pokemon", "think", "hmm"],
    skins: [
        {
            src: "/emojis/pikathink.png"
        }
    ]
},
{
    id: "pokecharge",
    name: "charge",
    keywords: ["pokemon", "charge", "energy", "power"],
    skins: [
        {
            src: "/emojis/pokecharge.gif"
        }
    ]
},
{
    id: "wooperyay",
    name: "wooper yay",
    keywords: ["wooper", "pokemon", "yay", "happy", "excited"],
    skins: [
        {
            src: "/emojis/wooperyay.gif"
        }
    ]
},
			{
    id: "sharkgirl",
    name: "shark girl",
    keywords: ["shark", "girl"],
    skins: [
        {
            src: "/emojis/sharkgirl.png"
        }
    ]
},
			{
    id: "pikagiggle",
    name: "pika giggle",
    keywords: [
        "pikachu",
        "giggle",
        "pokemon"
    ],
    skins: [
        {
            src: "/emojis/pikagiggle.png"
        }
    ]
},
{
    id: "duckdance",
    name: "duck dance",
    keywords: [
        "duck",
        "dance",
        "bird"
    ],
    skins: [
        {
            src: "/emojis/duckdance.gif"
        }
    ]
},
{
    id: "duckbop",
    name: "duck bop",
    keywords: [
        "duck",
        "bop",
        "bird"
    ],
    skins: [
        {
            src: "/emojis/duckbop.gif"
        }
    ]
},
{
    id: "clefable",
    name: "clefable",
    keywords: [
        "clefable",
        "pokemon",
        "fairy"
    ],
    skins: [
        {
            src: "/emojis/clefable.gif"
        }
    ]
},
{
    id: "duckjump",
    name: "duck jump",
    keywords: [
        "duck",
        "jump",
        "bird"
    ],
    skins: [
        {
            src: "/emojis/duckjump.gif"
        }
    ]
},
{
    id: "sprigdance",
    name: "sprig dance",
    keywords: [
        "sprigatito",
        "pokemon",
        "dance"
    ],
    skins: [
        {
            src: "/emojis/sprigdance.gif"
        }
    ]
},
{
    id: "meowhappy",
    name: "meowth happy",
    keywords: [
        "cat",
        "happy",
        "smile"
    ],
    skins: [
        {
            src: "/emojis/meowhappy.gif"
        }
    ]
},
{
    id: "widevapo",
    name: "wide vaporeon",
    keywords: [
        "vaporeon",
        "pokemon",
        "wide"
    ],
    skins: [
        {
            src: "/emojis/widevapo.png"
        }
    ]
},
{
    id: "shubadance",
    name: "shuba dance",
    keywords: [
        "duck",
        "shuba",
        "dance"
    ],
    skins: [
        {
            src: "/emojis/shubadance.gif"
        }
    ]
},
{
    id: "pikasway",
    name: "pika sway",
    keywords: [
        "pikachu",
        "pokemon",
        "dance"
    ],
    skins: [
        {
            src: "/emojis/pikasway.gif"
        }
    ]
},
{
    id: "floatpuff",
    name: "float puff",
    keywords: [
        "jigglypuff",
        "pokemon",
        "float"
    ],
    skins: [
        {
            src: "/emojis/floatpuff.gif"
        }
    ]
},
{
    id: "pikapuff",
    name: "pika puff",
    keywords: [
        "pikachu",
        "jigglypuff",
        "pokemon"
    ],
    skins: [
        {
            src: "/emojis/pikapuff.gif"
        }
    ]
},
{
    id: "catpeace",
    name: "cat peace",
    keywords: [
        "cat",
        "peace",
        "cute"
    ],
    skins: [
        {
            src: "/emojis/catpeace.gif"
        }
    ]
},
{
    id: "catboba",
    name: "cat boba",
    keywords: [
        "cat",
        "boba",
        "tea",
        "cute"
    ],
    skins: [
        {
            src: "/emojis/catboba.gif"
        }
    ]
}
        ]
    }
];

    this.customEmojiLookup.clear();

    for (const category of this.customEmojiCategories) {
        for (const emoji of category.emojis) {
            const source =
                emoji.skins?.[0]?.src;

            if (!emoji.id || !source) {
                continue;
            }

            this.customEmojiLookup.set(
                emoji.id.toLowerCase(),
                {
                    id: emoji.id,
                    name: emoji.name || emoji.id,
                    src: source
                }
            );
        }
    }

    if (
        typeof window.EmojiMart === "undefined" ||
        typeof window.EmojiMart.Picker !== "function"
    ) {
        console.error(
            "emoji mart did not load"
        );

        this.emojiButton.disabled = true;
        this.emojiButton.title =
            "emoji picker unavailable";

        return;
    }

	

const loadEmojiData = async () => {
    const response = await fetch(
        "https://cdn.jsdelivr.net/npm/@emoji-mart/data@1.2.1"
    );

    if (!response.ok) {
        throw new Error(
            `emoji data failed (${response.status})`
        );
    }

    return response.json();
};

const createPicker = onEmojiSelect =>
    new window.EmojiMart.Picker({
        data: loadEmojiData,
        custom: this.customEmojiCategories,
        emojiSize: 16,
        emojiButtonSize: 26,
        perLine: 10,
        onEmojiSelect
    });

this.emojiPicker =
    createPicker(emoji => {
        this.insertSelectedEmoji(emoji);
    });

this.reactionEmojiPicker =
    createPicker(emoji => {
        const reaction =
            this.reactionFromEmojiMartSelection(
                emoji
            );

        this.selectReactionFromSharedPicker(
            reaction
        );
    });

this.emojiPickerContainer.style.width =
    "320px";

this.emojiPickerContainer.style.maxWidth =
    "calc(100vw - 3rem)";

this.emojiPickerContainer.style.display =
    "flex";

this.emojiPickerContainer.style.flexDirection =
    "column";

this.emojiPickerContainer.style.maxHeight =
    "460px";

this.emojiPickerContainer.style.overflow =
    "hidden";

this.emojiPicker.style.width =
    "100%";

this.emojiPicker.style.maxWidth =
    "100%";

this.emojiPicker.style.height =
    "380px";

this.emojiPickerContainer.append(
    this.emojiPicker
);

this.reactionEmojiPickerContainer =
    document.createElement("div");

this.reactionEmojiPickerContainer.className = [
    "jami-reaction-emoji-picker-host",
    "invisible",
    "pointer-events-none",
    "opacity-0"
].join(" ");

Object.assign(
    this.reactionEmojiPickerContainer.style,
    {
        width: "320px",
        maxWidth: "calc(100vw - 16px)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "460px",
        overflow: "hidden"
    }
);

this.reactionEmojiPicker.style.width =
    "100%";

this.reactionEmojiPicker.style.maxWidth =
    "100%";

this.reactionEmojiPicker.style.height =
    "380px";

this.reactionEmojiPickerContainer.append(
    this.reactionEmojiPicker
);

document.body.appendChild(
    this.reactionEmojiPickerContainer
);

const injectComposerCustomSection = () => {
    if (
        this.injectCustomEmojisIntoPicker(
            this.emojiPicker,
            "message"
        )
    ) {
        return;
    }

    requestAnimationFrame(
        injectComposerCustomSection
    );
};

const injectReactionCustomSection = () => {
    if (
        this.injectCustomEmojisIntoPicker(
            this.reactionEmojiPicker,
            "reaction"
        )
    ) {
        return;
    }

    requestAnimationFrame(
        injectReactionCustomSection
    );
};

requestAnimationFrame(
    injectComposerCustomSection
);

requestAnimationFrame(
    injectReactionCustomSection
);

    this.emojiButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            this.toggleEmojiPicker();
        }
    );

   document.addEventListener(
    "pointerdown",
    event => {
        if (!this.emojiPickerOpen) {
            return;
        }

        if (
            this.emojiPickerMode ===
                "message"
        ) {
            const path =
                typeof event.composedPath ===
                    "function"
                    ? event.composedPath()
                    : [];

           const pickerHostIndex =
    path.indexOf(
        this.emojiPicker
    );

const insideVisiblePicker =
    pickerHostIndex > 0 &&
    path
        .slice(
            0,
            pickerHostIndex
        )
        .some(node =>
            node?.getRootNode?.() ===
                this.emojiPicker
                    ?.shadowRoot
        );

const clickedEmojiButton =
    path.includes(
        this.emojiButton
    );

if (
    insideVisiblePicker ||
    clickedEmojiButton
) {
    return;
}

            this.closeEmojiPicker();
            return;
        }

        if (
            this.emojiPickerMode !==
                "reaction"
        ) {
            return;
        }

        const path =
            typeof event.composedPath ===
                "function"
                ? event.composedPath()
                : [];

        const pickerHostIndex =
            path.indexOf(
                this.reactionEmojiPicker
            );

        const insideVisiblePicker =
            pickerHostIndex > 0 &&
            path
                .slice(
                    0,
                    pickerHostIndex
                )
                .some(node =>
                    node?.getRootNode?.() ===
                        this.reactionEmojiPicker
                            ?.shadowRoot
                );

        if (insideVisiblePicker) {
            return;
        }

        if (
            this.emojiPickerAnchor &&
            this.emojiPickerAnchor.contains(
                event.target
            )
        ) {
            return;
        }

        if (
            this.emojiButton &&
            this.emojiButton.contains(
                event.target
            )
        ) {
            return;
        }

        this.closeEmojiPicker();
    },
    true
);

}

	injectCustomEmojisIntoPicker(
    picker,
    mode = "message"
) {

    const shadowRoot =
        picker?.shadowRoot;

    if (!shadowRoot) {
        return false;
    }

    if (
        !shadowRoot.querySelector(
            "style[data-jami-picker-scrollbar]"
        )
    ) {
        const scrollbarStyle =
            document.createElement("style");

        scrollbarStyle.dataset
            .jamiPickerScrollbar = "true";

        scrollbarStyle.textContent = `
            .scroll,
            .scroll.flex-grow.padding-lr {
                scrollbar-width: thin;
                scrollbar-color:
                    rgba(255, 255, 255, 0.22)
                    transparent;
            }

            .scroll::-webkit-scrollbar,
            .scroll.flex-grow.padding-lr::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            .scroll::-webkit-scrollbar-track,
            .scroll.flex-grow.padding-lr::-webkit-scrollbar-track {
                background: transparent;
            }

            .scroll::-webkit-scrollbar-thumb,
            .scroll.flex-grow.padding-lr::-webkit-scrollbar-thumb {
                background:
                    rgba(255, 255, 255, 0.20);
                border-radius: 999px;
            }

            .scroll::-webkit-scrollbar-thumb:hover,
            .scroll.flex-grow.padding-lr::-webkit-scrollbar-thumb:hover {
                background:
                    rgba(255, 255, 255, 0.30);
            }
        `;

        shadowRoot.appendChild(
            scrollbarStyle
        );
    }

    if (
        shadowRoot.querySelector(
            "[data-jami-custom-emojis]"
        )
    ) {
        return true;
    }

    const scrollArea =
        shadowRoot.querySelector(
            ".scroll.flex-grow.padding-lr"
        );

    if (!scrollArea) {
        return false;
    }

    const customSection =
        document.createElement("section");

    customSection.dataset.jamiCustomEmojis =
        "true";

    Object.assign(
        customSection.style,
        {
            padding: "8px 0 10px",
            borderBottom:
                "1px solid rgba(255,255,255,0.08)"
        }
    );

    const heading =
        document.createElement("div");

    heading.textContent =
        "Custom";

    Object.assign(
        heading.style,
        {
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: "600",
            color:
                "rgba(255,255,255,0.75)"
        }
    );

    const grid =
        document.createElement("div");
		
Object.assign(
    grid.style,
    {
        display: "grid",
        gridTemplateColumns:
            "repeat(8, minmax(0, 1fr))",
        gap: "2px"
    }
);

    for (
        const category of
        this.customEmojiCategories
    ) {
        for (const emoji of category.emojis) {
            const source =
                emoji.skins?.[0]?.src;

            if (!emoji.id || !source) {
                continue;
            }

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.title =
                emoji.name || emoji.id;

            button.setAttribute(
                "aria-label",
                emoji.name || emoji.id
            );

            Object.assign(
                button.style,
                {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    padding: "3px",
                    border: "0",
                    borderRadius: "6px",
                    background: "transparent",
                    cursor: "pointer"
                }
            );

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                source;

            image.alt =
                `:${emoji.id}:`;

            Object.assign(
                image.style,
                {
                    width: "22px",
                    height: "22px",
                    objectFit: "contain"
                }
            );

            button.addEventListener(
                "mouseenter",
                () => {
                    button.style.background =
                        "rgba(255,255,255,0.1)";
                }
            );

            button.addEventListener(
                "mouseleave",
                () => {
                    button.style.background =
                        "transparent";
                }
            );

            button.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (mode === "reaction") {
                        this.selectReactionFromSharedPicker({
                            key:
                                `custom:${emoji.id}`,
                            kind: "custom",
                            value: emoji.id,
                            src: source,
                            label:
                                emoji.name ||
                                emoji.id,
                            count: 0,
                            clientIds: []
                        });
                    } else {
                        this.insertIntoMessageInput(
                            `:${emoji.id.toLowerCase()}:`
                        );
                    }
                }
            );

            button.appendChild(image);
            grid.appendChild(button);
        }
    }

    customSection.append(
        heading,
        grid
    );

    scrollArea.prepend(
        customSection
    );

    return true;
}
	
toggleEmojiPicker() {
    if (
        this.emojiPickerOpen &&
        this.emojiPickerMode === "message"
    ) {
        this.closeEmojiPicker();
    } else {
        this.openEmojiPicker({
            mode: "message"
        });
    }
}

positionReactionEmojiPicker(anchor) {
    if (
        !this.reactionEmojiPickerContainer ||
        !(anchor instanceof Element)
    ) {
        return;
    }

    const anchorRect =
        anchor.getBoundingClientRect();

    const pickerRect =
        this.reactionEmojiPickerContainer
            .getBoundingClientRect();

    const width =
        pickerRect.width || 320;

    const height =
        pickerRect.height || 460;

    const left =
        Math.max(
            8,
            Math.min(
                window.innerWidth -
                    width -
                    8,
                anchorRect.right -
                    width
            )
        );

    const belowTop =
        anchorRect.bottom + 6;

    const top =
        belowTop + height + 8 <=
        window.innerHeight
            ? belowTop
            : Math.max(
                8,
                anchorRect.top -
                    height -
                    6
            );

    Object.assign(
        this.reactionEmojiPickerContainer.style,
        {
            left: `${left}px`,
            top: `${top}px`
        }
    );
}

openEmojiPicker({
    mode = "message",
    target = null,
    anchor = null
} = {}) {
    if (
        !this.emojiPickerContainer ||
        !this.emojiPicker ||
        !this.reactionEmojiPickerContainer ||
        !this.reactionEmojiPicker
    ) {
        return;
    }

    this.closeAvatarPicker();

    const reactionMode =
        mode === "reaction";

    this.emojiPickerMode =
        reactionMode
            ? "reaction"
            : "message";

    this.emojiReactionTarget =
        reactionMode
            ? target
            : null;

    const previousAnchor =
        this.emojiPickerAnchor;

    previousAnchor
        ?.closest(".chatMessage")
        ?.removeAttribute(
            "data-reaction-picker-open"
        );

    this.emojiPickerAnchor =
        reactionMode
            ? anchor
            : null;

    this.emojiPickerAnchor
        ?.closest(".chatMessage")
        ?.setAttribute(
            "data-reaction-picker-open",
            "true"
        );

    this.emojiPickerOpen = true;

    if (reactionMode) {
        this.emojiPickerContainer.classList.add(
            "invisible",
            "pointer-events-none",
            "opacity-0"
        );

        this.emojiPickerContainer.classList.remove(
            "opacity-100"
        );

        this.reactionEmojiPickerContainer.classList.remove(
            "invisible",
            "pointer-events-none",
            "opacity-0"
        );

        this.reactionEmojiPickerContainer.classList.add(
            "opacity-100"
        );

        requestAnimationFrame(() => {
            this.positionReactionEmojiPicker(
                this.emojiPickerAnchor
            );
        });
    } else {
        this.reactionEmojiPickerContainer.classList.add(
            "invisible",
            "pointer-events-none",
            "opacity-0"
        );

        this.reactionEmojiPickerContainer.classList.remove(
            "opacity-100"
        );

        this.emojiPickerContainer.classList.remove(
            "invisible",
            "pointer-events-none",
            "opacity-0"
        );

        this.emojiPickerContainer.classList.add(
            "opacity-100"
        );
    }

    this.emojiButton?.setAttribute(
        "aria-expanded",
        reactionMode
            ? "false"
            : "true"
    );
}

closeEmojiPicker() {
    if (
        !this.emojiPickerContainer ||
        !this.reactionEmojiPickerContainer
    ) {
        return;
    }

    this.emojiPickerOpen = false;

    for (const container of [
        this.emojiPickerContainer,
        this.reactionEmojiPickerContainer
    ]) {
        container.classList.add(
            "invisible",
            "pointer-events-none",
            "opacity-0"
        );

        container.classList.remove(
            "opacity-100"
        );
    }

    this.emojiButton?.setAttribute(
        "aria-expanded",
        "false"
    );

    document
        .querySelectorAll(
            "[data-reaction-picker-open]"
        )
        .forEach(message => {
            message.removeAttribute(
                "data-reaction-picker-open"
            );
        });

    this.emojiPickerMode = "message";
    this.emojiReactionTarget = null;
    this.emojiPickerAnchor = null;
}

reactionFromEmojiMartSelection(emoji) {
    if (!emoji) {
        return null;
    }

    if (
        typeof emoji.native === "string" &&
        emoji.native
    ) {
        return {
            key: `unicode:${emoji.native}`,
            kind: "unicode",
            value: emoji.native,
            src: "",
            label:
                emoji.name ||
                emoji.native,
            count: 0,
            clientIds: []
        };
    }

    const id =
        typeof emoji.id === "string"
            ? emoji.id.toLowerCase()
            : "";

    const custom =
        this.customEmojiLookup.get(id);

    if (!custom) {
        return null;
    }

    return {
        key: `custom:${custom.id}`,
        kind: "custom",
        value: custom.id,
        src: custom.src,
        label:
            custom.name ||
            custom.id,
        count: 0,
        clientIds: []
    };
}

handleEmojiPickerSelection(emoji) {
    this.insertSelectedEmoji(emoji);
}

handleCustomEmojiPickerSelection(emoji) {
    if (!emoji?.id || !emoji?.src) {
        return;
    }

    this.insertIntoMessageInput(
        `:${emoji.id.toLowerCase()}:`
    );
}

selectReactionFromSharedPicker(reaction) {
    const target =
        this.emojiReactionTarget;

    if (!reaction || !target) {
        return;
    }

    const current =
        (
            this.messageReactions.get(
                this.reactionTargetKey(
                    target.targetType,
                    target.targetId
                )
            ) || []
        ).find(item =>
            item.key === reaction.key
        );

    const reacted =
        current?.clientIds?.includes(
            this.clientId
        ) === true;

    if (!reacted) {
        this.rememberReaction(
            current || reaction
        );
    }

    requestAnimationFrame(() => {
        this.closeEmojiPicker();
    });

    this.setReactionActive(
        target,
        current || reaction,
        !reacted
    );
}

	insertSelectedEmoji(emoji) {
    if (!emoji) {
        return;
    }

    if (typeof emoji.native === "string") {
        this.insertIntoMessageInput(
            emoji.native
        );

        return;
    }

    if (
        typeof emoji.id === "string" &&
        this.customEmojiLookup.has(
            emoji.id.toLowerCase()
        )
    ) {
        this.insertIntoMessageInput(
            `:${emoji.id.toLowerCase()}:`
        );
    }
}

insertIntoMessageInput(value) {
    const input = this.messageInput;

    if (!input || typeof value !== "string") {
        return;
    }

    const currentValue = input.value;

    const selectionStart =
        input.selectionStart ?? currentValue.length;

    const selectionEnd =
        input.selectionEnd ?? selectionStart;

    const nextValue =
        currentValue.slice(0, selectionStart) +
        value +
        currentValue.slice(selectionEnd);

    if (nextValue.length > input.maxLength) {
        return;
    }

    input.value = nextValue;

    const nextCursor =
        selectionStart + value.length;

    input.focus();

    input.setSelectionRange(
        nextCursor,
        nextCursor
    );

    input.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );
}
	
setupDiscordAuthentication() {
    if (!this.discordAuthButton) {
        return;
    }

    this.discordAuthButton.addEventListener(
        "click",
        () => this.loginWithDiscord()
    );

    this.discordLogoutButton?.addEventListener(
        "click",
        () => this.logoutDiscord()
    );

    window.addEventListener(
        "message",
        event => {
            if (
                event.origin !== this.API ||
                event.data?.type !==
                    "jamicat-discord-auth"
            ) {
                return;
            }

            if (
                typeof event.data.token !==
                    "string" ||
                !event.data.user
            ) {
                this.discordAuthButton.disabled =
                    false;
                this.discordAuthButton.textContent =
                    "log in with discord";
                return;
            }

            localStorage.setItem(
                "chat_discord_session",
                event.data.token
            );

            this.discordAuthToken =
                event.data.token;

            this.applyDiscordIdentity(
                event.data.user
            );
        }
    );

    if (this.discordAuthToken) {
        this.restoreDiscordSession();
    } else {
        this.renderDiscordAuthState();
    }
}

async loginWithDiscord() {
    if (
        this.discordAuthButton?.disabled ||
        this.discordUser
    ) {
        return;
    }

    this.discordAuthButton.disabled = true;
    this.discordAuthButton.textContent =
        "opening discord...";

    const authUrl =
        new URL(
            `${this.API}/api/auth/discord/start`
        );

    authUrl.searchParams.set(
        "origin",
        window.location.origin
    );

    const popup =
        window.open(
            authUrl.toString(),
            "jamicatDiscordLogin",
            [
                "popup=yes",
                "width=520",
                "height=720",
                "resizable=yes",
                "scrollbars=yes"
            ].join(",")
        );

    if (!popup) {
        this.discordAuthButton.disabled =
            false;
        this.discordAuthButton.textContent =
            "log in with discord";
        return;
    }

    popup.focus();

    const popupTimer =
        window.setInterval(
            () => {
                if (!popup.closed) {
                    return;
                }

                window.clearInterval(
                    popupTimer
                );

                if (!this.discordUser) {
                    this.discordAuthButton
                        .disabled = false;
                    this.discordAuthButton
                        .textContent =
                            "log in with discord";
                }
            },
            500
        );
}

async restoreDiscordSession() {
    this.discordAuthButton.disabled = true;
    this.discordAuthButton.textContent =
        "checking discord...";

    try {
        const response = await fetch(
            `${this.API}/api/auth/session`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${
                            this.discordAuthToken
                        }`
                }
            }
        );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result?.user
        ) {
            throw new Error(
                result?.error ||
                "discord session expired"
            );
        }

        this.applyDiscordIdentity(
            result.user
        );
    } catch {
        this.clearDiscordIdentity();
    }
}

applyDiscordIdentity(user) {
    if (
        !user ||
        typeof user.id !== "string" ||
        typeof user.displayName !==
            "string" ||
        typeof user.avatarUrl !==
            "string"
    ) {
        return;
    }

    this.discordUser = {
        id: user.id,
        username:
            typeof user.username ===
                "string"
                ? user.username
                : "",
        displayName:
            user.displayName,
        avatarUrl:
            user.avatarUrl
    };

    this.closeAvatarPicker();

    this.nameInput.value =
        this.discordUser.displayName;
    this.nameInput.disabled = true;
    this.nameInput.setAttribute(
        "aria-disabled",
        "true"
    );
    this.nameInput.classList.add(
        "chat-discord-name-active"
    );

    this.avatarButton.disabled = true;
    this.avatarButton.setAttribute(
        "aria-disabled",
        "true"
    );

    this.avatarPreview.src =
        this.discordUser.avatarUrl;
    this.avatarPreview.classList.remove(
        "pixel-avatar",
        "object-contain"
    );
    this.avatarPreview.classList.add(
        "rounded-full",
        "object-cover"
    );

    this.renderDiscordAuthState();
    this.sendPresence();
}

clearDiscordIdentity() {
    localStorage.removeItem(
        "chat_discord_session"
    );

    this.discordAuthToken = "";
    this.discordUser = null;

    const guestName =
        localStorage.getItem(
            "chat_name"
        ) || "";

    const guestAvatar =
        localStorage.getItem(
            "chat_avatar"
        ) || "original.gif";

    this.avatar = guestAvatar;
    this.nameInput.value = guestName;
    this.nameInput.disabled = false;
    this.nameInput.removeAttribute(
        "aria-disabled"
    );
    this.nameInput.classList.remove(
        "chat-discord-name-active"
    );

    this.avatarButton.disabled = false;
    this.avatarButton.removeAttribute(
        "aria-disabled"
    );

    this.avatarPreview.src =
        `/avatars/${guestAvatar}`;
    this.avatarPreview.classList.add(
        "pixel-avatar",
        "object-contain"
    );
    this.avatarPreview.classList.remove(
        "rounded-full",
        "object-cover"
    );

    this.renderAvatarPicker();
    this.renderDiscordAuthState();
    this.sendPresence();
}

async logoutDiscord() {
    const token =
        this.discordAuthToken;

    if (this.discordLogoutButton) {
        this.discordLogoutButton.disabled =
            true;
        this.discordLogoutButton.textContent =
            "logging out...";
    }

    if (token) {
        try {
            await fetch(
                `${this.API}/api/auth/logout`,
                {
                    method: "POST",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );
        } catch {}
    }

    this.clearDiscordIdentity();
}

renderDiscordAuthState() {
    const loggedIn =
        Boolean(this.discordUser);

    if (this.discordUsernameElement) {
        this.discordUsernameElement.textContent =
            loggedIn
                ? `@${this.discordUser.username}`
                : "";
        this.discordUsernameElement.classList
            .toggle(
                "hidden",
                !loggedIn
            );
    }

    if (this.discordLogoutButton) {
        this.discordLogoutButton.classList
            .toggle(
                "hidden",
                !loggedIn
            );
        this.discordLogoutButton.disabled =
            false;
        this.discordLogoutButton.textContent =
            "log out";
    }

    if (this.discordAuthButton) {
        this.discordAuthButton.classList
            .toggle(
                "hidden",
                loggedIn
            );
        this.discordAuthButton.disabled =
            false;
        this.discordAuthButton.textContent =
            "log in with discord";
    }
}

	setupAvatarPicker() {
    this.avatars = [
        "original.gif",
		"orange.gif",
		"blue.gif",
		"pink.gif",
		"black.gif",
		"shark.gif",
		"duck.gif"
    ];

    this.avatarPreview.src =
        `/avatars/${this.avatar}`;

    this.renderAvatarPicker();

    this.avatarButton.addEventListener("click", event => {
        event.stopPropagation();

        if (this.discordUser) {
            return;
        }

        const isOpen =
            this.avatarPicker.classList.contains("opacity-100");

        if (isOpen) {
            this.closeAvatarPicker();
        } else {
            this.closeEmojiPicker();
    this.openAvatarPicker();
        }
    });

    this.avatarPicker.addEventListener("click", event => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        this.closeAvatarPicker();
    });
}

renderAvatarPicker() {
    this.avatarGrid.replaceChildren();

    for (const filename of this.avatars) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = `
    flex aspect-square items-center justify-center
    rounded-lg
    border border-white/5
    bg-white/5 p-1
    transition
    hover:border-white/15
    hover:bg-white/10
    active:scale-95
`;

        button.dataset.avatar = filename;
        button.setAttribute(
            "aria-label",
            `Select ${filename}`
        );

        const image = document.createElement("img");

        image.src = `/avatars/${filename}`;
        image.alt = "";
        image.className =
                "pixel-avatar h-full w-full object-contain";

        button.appendChild(image);

        if (filename === this.avatar) {
            button.classList.add(
                "ring-1",
                "ring-white/50"
            );
        }

        button.addEventListener("click", () => {
            this.selectAvatar(filename);
        });

        this.avatarGrid.appendChild(button);
    }
}

selectAvatar(filename) {
    if (this.discordUser) {
        return;
    }

    this.avatar = filename;
	

    localStorage.setItem(
        "chat_avatar",
        filename
    );

    this.avatarPreview.src =
        `/avatars/${filename}`;

    this.renderAvatarPicker();
    this.closeAvatarPicker();
	this.sendPresence();
}

openAvatarPicker() {
    if (this.discordUser) {
        return;
    }

    this.avatarPicker.classList.remove(
        "invisible",
        "pointer-events-none",
        "opacity-0"
    );

    this.avatarPicker.classList.add(
        "opacity-100"
    );

    this.avatarButton.setAttribute(
        "aria-expanded",
        "true"
    );
}

closeAvatarPicker() {
    this.avatarPicker.classList.add(
        "invisible",
        "pointer-events-none",
        "opacity-0"
    );

    this.avatarPicker.classList.remove(
        "opacity-100"
    );

    this.avatarButton.setAttribute(
        "aria-expanded",
        "false"
    );
}

	setupMembersToggle() {
    this.membersToggle.addEventListener("click", () => {
        this.membersVisible = !this.membersVisible;

        this.membersPanel.classList.toggle(
            "hidden",
            !this.membersVisible
        );

        this.membersToggle.textContent =
            this.membersVisible
                ? "hide members"
                : "show members";

        this.membersToggle.setAttribute(
            "aria-expanded",
            String(this.membersVisible)
        );
    });
}

	positionWatchPartyPanel({
    forceClamp = false
} = {}) {
    if (
        !this.watchPartyButton ||
        !this.watchPartyPanel
    ) {
        return;
    }

    const panel =
        this.watchPartyPanel;

    if (
        panel.dataset.positioned ===
            "true" &&
        forceClamp !== true
    ) {
        return;
    }

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

    const viewportPadding = 12;
    const gap = 8;

    const minimumLeft =
        viewportLeft +
        viewportPadding;

    const minimumTop =
        viewportTop +
        viewportPadding;

    const maximumRight =
        viewportLeft +
        viewportWidth -
        viewportPadding;

   panel.style.maxHeight =
    "none";

    panel.style.overflow =
        "hidden";

    const currentRect =
        panel.getBoundingClientRect();

    const storedLeft =
        parseFloat(
            localStorage.getItem(
                "watch_party_left"
            )
        );

    const storedTop =
        parseFloat(
            localStorage.getItem(
                "watch_party_top"
            )
        );

    let nextLeft;
    let nextTop;

    if (
        panel.dataset.positioned ===
            "true" &&
        Number.isFinite(
            currentRect.left
        ) &&
        Number.isFinite(
            currentRect.top
        )
    ) {
        nextLeft =
            currentRect.left;

        nextTop =
            currentRect.top;
    } else if (
        Number.isFinite(storedLeft) &&
        Number.isFinite(storedTop)
    ) {
        nextLeft =
            storedLeft;

        nextTop =
            storedTop;
    } else {
  
        const buttonRect =
            this.watchPartyButton
                .getBoundingClientRect();

        const panelWidth =
            panel.offsetWidth || 288;

        const panelHeight =
            panel.offsetHeight ||
            this.watchPartyResizeMinimum;

        nextLeft =
            buttonRect.right -
            panelWidth;

        nextTop =
            buttonRect.top -
            panelHeight -
            gap;
    }

    const panelWidth =
        panel.offsetWidth || 288;

    nextLeft =
        Math.max(
            minimumLeft,
            Math.min(
                nextLeft,
                maximumRight -
                    panelWidth
            )
        );

   nextTop =
    Math.max(
        minimumTop,
        nextTop
    );

    panel.style.right =
        "auto";

    panel.style.bottom =
        "auto";

		const existingLeft =
    parseFloat(
        panel.style.left
    );

const existingTop =
    parseFloat(
        panel.style.top
    );

const positionChanged =
    !Number.isFinite(existingLeft) ||
    !Number.isFinite(existingTop) ||
    Math.abs(
        existingLeft - nextLeft
    ) > 0.5 ||
    Math.abs(
        existingTop - nextTop
    ) > 0.5;

if (
    forceClamp === true &&
    !positionChanged
) {
    return;
}
		
    panel.style.left =
        `${nextLeft}px`;

    panel.style.top =
        `${nextTop}px`;

    panel.style.transform =
        "translate(0px, 0px)";

    panel.dataset.x = "0";
    panel.dataset.y = "0";

    panel.dataset.positioned =
        "true";

    localStorage.setItem(
        "watch_party_left",
        String(nextLeft)
    );

    localStorage.setItem(
        "watch_party_top",
        String(nextTop)
    );
}
	
freezeChatWindowPosition() {
    if (!this.window) {
        return;
    }

    const rect =
        this.window.getBoundingClientRect();

    this.window.style.left =
        `${Math.round(rect.left)}px`;

    this.window.style.top =
        `${Math.round(rect.top)}px`;

    this.window.style.right =
        "auto";

    this.window.style.bottom =
        "auto";

    this.window.style.transform =
        "none";

    this.window.dataset.x = "0";
    this.window.dataset.y = "0";

    localStorage.setItem(
        "chat_left",
        String(
            Math.round(rect.left)
        )
    );

    localStorage.setItem(
        "chat_top",
        String(
            Math.round(rect.top)
        )
    );

    localStorage.removeItem("chat_x");
    localStorage.removeItem("chat_y");
}

setupDragging() {
    const self = this;

    interact(this.window).draggable({
        allowFrom:
            ".chat-drag-area",

        ignoreFrom:
            "button, input, a",

        inertia: true,

        modifiers: [
            interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true
            })
        ],

        listeners: {
            start: () => {
                this.closeEmojiPicker();
            },

            move(event) {
                const target =
                    event.target;

                const x =
                    (
                        parseFloat(
                            target.dataset.x
                        ) || 0
                    ) +
                    event.dx;

                const y =
                    (
                        parseFloat(
                            target.dataset.y
                        ) || 0
                    ) +
                    event.dy;

                target.style.transform =
                    `translate(${x}px, ${y}px)`;

                target.dataset.x =
                    String(x);

                target.dataset.y =
                    String(y);
            },

            end(event) {
                localStorage.setItem(
                    "chat_x",
                    event.target.dataset.x ||
                        "0"
                );

                localStorage.setItem(
                    "chat_y",
                    event.target.dataset.y ||
                        "0"
                );

                self.keepTitleBarInViewport();
            }
        }
    });

interact(
    this.watchPartyPanel
).draggable({
    allowFrom:
        ".watch-party-drag-area",

    ignoreFrom:
        "button, input, a, " +
        "[data-watch-party-resize-handle]",

    inertia: false,

    modifiers: [
        interact.modifiers.restrictRect({
            restriction: "parent",

            endOnly: false
        })
    ],

    listeners: {

        move(event) {
            const target =
                event.target;

            const currentLeft =
                parseFloat(
                    target.style.left
                ) || 0;

            const currentTop =
                parseFloat(
                    target.style.top
                ) || 0;

            target.style.left =
                `${currentLeft + event.dx}px`;

            target.style.top =
                `${currentTop + event.dy}px`;
        },

        end(event) {
            const target =
                event.target;

            const finalLeft =
                parseFloat(
                    target.style.left
                );

            const finalTop =
                parseFloat(
                    target.style.top
                );

            target.style.transform =
                "none";

            target.dataset.x = "0";
            target.dataset.y = "0";

            target.dataset.positioned =
                "true";

            if (
                Number.isFinite(finalLeft)
            ) {
                localStorage.setItem(
                    "watch_party_left",
                    String(finalLeft)
                );
            }

            if (
                Number.isFinite(finalTop)
            ) {
                localStorage.setItem(
                    "watch_party_top",
                    String(finalTop)
                );
            }
        }
    }
});
let watchPartyResizeState =
    null;

const stopWatchPartyResize =
    event => {
        if (!watchPartyResizeState) {
            return;
        }

        const {
            panel,
            handle,
            pointerId
        } =
            watchPartyResizeState;

        if (
            event?.pointerId !== undefined &&
            event.pointerId !== pointerId
        ) {
            return;
        }

        const finalHeight =
            parseFloat(
                panel.style.height
            );

        if (
            Number.isFinite(finalHeight)
        ) {
            localStorage.setItem(
                "watch_party_height",
                String(finalHeight)
            );
        }

    
        watchPartyResizeState =
            null;

        try {
            if (
                handle?.hasPointerCapture?.(
                    pointerId
                )
            ) {
                handle.releasePointerCapture(
                    pointerId
                );
            }
        } catch {
            
        }

        panel.dataset.positioned =
            "true";

        document.body.style.userSelect =
            "";

        document.body.style.cursor =
            "";
    };
	
const moveWatchPartyResize =
    event => {
        if (!watchPartyResizeState) {
            return;
        }

        const {
            panel,
            pointerId,
            startClientY,
            startHeight,
			scaleY
        } =
            watchPartyResizeState;

        if (
            event.pointerId !== pointerId
        ) {
            return;
        }

        event.preventDefault();

       const visualDeltaY =
    event.clientY -
    startClientY;

const layoutDeltaY =
    visualDeltaY /
    scaleY;

const nextHeight =
    Math.max(
        this.watchPartyResizeMinimum,
        startHeight +
            layoutDeltaY
    );

panel.style.height =
    `${nextHeight}px`;
    };

this.watchPartyPanel.addEventListener(
    "pointerdown",
    event => {
        const handle =
            event.target.closest(
                "[data-watch-party-resize-handle]"
            );

        if (
            !handle ||
            !this.watchPartyPanel.contains(
                handle
            )
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const panel =
            this.watchPartyPanel;

        const rect =
    panel.getBoundingClientRect();

const layoutHeight =
    panel.offsetHeight;

const scaleY =
    layoutHeight > 0
        ? rect.height / layoutHeight
        : 1;

watchPartyResizeState = {
    panel,
    handle,

    pointerId:
        event.pointerId,

    startClientY:
        event.clientY,

    startHeight:
        layoutHeight,

    scaleY:
        Number.isFinite(scaleY) &&
        scaleY > 0
            ? scaleY
            : 1
};

        handle.setPointerCapture?.(
    event.pointerId
);

document.body.style.userSelect =
    "none";

document.body.style.cursor =
    "ns-resize";
    }
);

window.addEventListener(
    "pointermove",
    moveWatchPartyResize,
    {
        passive: false
    }
);

window.addEventListener(
    "pointerup",
    stopWatchPartyResize,
    true
);

window.addEventListener(
    "pointercancel",
    stopWatchPartyResize,
    true
);

this.watchPartyPanel.addEventListener(
    "lostpointercapture",
    stopWatchPartyResize,
    true
);
}

	preserveTitleBarDuringResize() {
    const lockedTop =
        this.titleBar.getBoundingClientRect().top;

    const observer = new ResizeObserver(() => {
        const currentTop =
            this.titleBar.getBoundingClientRect().top;

        const correctionY =
            lockedTop - currentTop;

        if (Math.abs(correctionY) < 0.5) {
            return;
        }

        const currentX =
            parseFloat(this.window.dataset.x) || 0;

        const currentY =
            parseFloat(this.window.dataset.y) || 0;

        const nextY =
            currentY + correctionY;

        this.window.dataset.y = String(nextY);

        this.window.style.transform =
            `translate(${currentX}px, ${nextY}px)`;
    });

    observer.observe(this.window);

    setTimeout(() => {
        observer.disconnect();

        localStorage.setItem(
            "chat_x",
            this.window.dataset.x || "0"
        );

        localStorage.setItem(
            "chat_y",
            this.window.dataset.y || "0"
        );
    }, 240);
}
	
toggleMinimized() {
    this.setMinimized(!this.isMinimized);
}

setMinimized(minimized) {
	this.preserveTitleBarDuringResize();
    this.isMinimized = minimized;

	if (!minimized) {
    this.clearUnreadCount();

    requestAnimationFrame(() => {
        this.scrollMessagesToBottom();
    });
}
	

    this.mainElement.classList.toggle(
        "hidden",
        minimized
    );

    this.controlsElement.classList.toggle(
        "hidden",
        minimized
    );

    if (this.membersToggle) {
        this.membersToggle.classList.toggle(
            "hidden",
            minimized
        );
    }

	if (this.banManagerButton) {
    this.banManagerButton.classList.toggle(
        "hidden",
        minimized
    );
}

if (minimized) {
    this.closeBanManager();
}

    this.window.classList.toggle(
        "h-[500px]",
        !minimized
    );

    this.window.classList.toggle(
        "h-10",
        minimized
    );

    this.minimizeButton.textContent =
        minimized ? "+" : "−";

    this.minimizeButton.setAttribute(
        "aria-expanded",
        String(!minimized)
    );

    this.minimizeButton.setAttribute(
        "aria-label",
        minimized
            ? "restore live chat"
            : "minimize live chat"
    );

    this.minimizeButton.title =
        minimized
            ? "restore chat"
            : "minimize chat";

    if (minimized) {
        this.closeAvatarPicker();
		this.closeEmojiPicker();
		this.closeBanManager();
    }
}

keepTitleBarInViewport() {
    if (!this.window || !this.titleBar) {
        return;
    }

    const margin = 8;
    const titleRect =
        this.titleBar.getBoundingClientRect();

    let correctionX = 0;
    let correctionY = 0;

    if (titleRect.left < margin) {
        correctionX =
            margin - titleRect.left;
    } else if (
        titleRect.right >
        window.innerWidth - margin
    ) {
        correctionX =
            window.innerWidth -
            margin -
            titleRect.right;
    }

    if (titleRect.top < margin) {
        correctionY =
            margin - titleRect.top;
    } else if (
        titleRect.bottom >
        window.innerHeight - margin
    ) {
        correctionY =
            window.innerHeight -
            margin -
            titleRect.bottom;
    }

    if (
        correctionX === 0 &&
        correctionY === 0
    ) {
        return;
    }

    const currentX =
        parseFloat(this.window.dataset.x) || 0;

    const currentY =
        parseFloat(this.window.dataset.y) || 0;

    const nextX =
        currentX + correctionX;

    const nextY =
        currentY + correctionY;

    this.window.dataset.x =
        String(nextX);

    this.window.dataset.y =
        String(nextY);

    this.window.style.transform =
        `translate(${nextX}px, ${nextY}px)`;

    localStorage.setItem(
        "chat_x",
        String(nextX)
    );

    localStorage.setItem(
        "chat_y",
        String(nextY)
    );
}
	
	applyCurrentTheme() {
    const themeName =
        localStorage.getItem("theme") || "Default";

    if (typeof window.applyTheme === "function") {
        window.applyTheme(themeName);
    } else if (typeof applyTheme === "function") {
        applyTheme(themeName);
    }
}
}

window.addEventListener("DOMContentLoaded", () => {

    window.chat = new ChatWidget();

});
