class ChatWidget {

constructor() {
this.API = "https://jamicat.ahrly.workers.dev";
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
	this.watchPartyScrollToCurrentAfterNavigation =
    false;
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
this.customEmojiCategories = [];
this.customEmojiLookup = new Map();
	
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
this.setupDragging();
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
this.loadHistory();
this.loadMotd();
this.loadWatchParty();
this.connect();
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
                terminal2
                invisible pointer-events-none opacity-0
                absolute bottom-full left-0 z-20
                mb-2 w-56
                rounded-2xl
                border border-white/15
                p-3
                shadow-lg
                backdrop-blur-xl
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
        </div>
    </div>

    <input
        id="chatName"
        type="text"
        maxlength="20"
        autocomplete="nickname"
        placeholder="name"
        class="
            theme-body
            h-11 min-w-0 flex-1 rounded-xl
            border border-white/10
            bg-black/30 px-3 py-2
            text-xs text-white
            placeholder:text-white/35
            outline-none
            focus:border-white/25
        "
    >
</div>

            <div class="relative">
    <div class="flex items-stretch gap-2">
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

    if (
        Number.isFinite(savedHeight) &&
        savedHeight >=
            this.watchPartyResizeMinimum
    ) {
        this.watchPartyPanel.style.height =
            `${savedHeight}px`;
    }

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
            this.positionWatchPartyPanel();
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

    /*title.title =
    "double-click for admin login";*/

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

    /*
     * Keep only one admin manager open.
     */
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
                `could not ${
                    shouldEnable
                        ? "enable"
                        : "disable"
                } watch party (${response.status})`
            );
        }

        /*
         * Update immediately for this browser.
         *
         * The authoritative WebSocket broadcast will
         * follow and replace the full state.
         */
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

        /*
         * Do not manually clear this.watchParty.queue.
         *
         * The Worker broadcasts the authoritative
         * Watch Party state to every connected client.
         */
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

    const tooltip =
        this.watchPartyPanel?.querySelector(
            "[data-watch-party-progress-tooltip]"
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

        if (tooltip) {
            tooltip.textContent =
                this.formatDuration(
                    currentTime
                );

            tooltip.style.left =
                `${percentage}%`;
        }
    };

    updateTime();

    this.watchPartyTimeTimer =
        setInterval(updateTime, 250);
}
	
renderWatchParty() {

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
                        ? "preferred"
                        : "auto"
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
            data-watch-party-progress-tooltip
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
                group-hover:opacity-100
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

this.watchPartyScrollToCurrentAfterNavigation =
    true;

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

    this.watchPartyScrollToCurrentAfterNavigation =
        false;

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
            event.stopPropagation();

           if (!this.watchParty.currentVideoId) {
    return;
}

this.watchPartyScrollToCurrentAfterNavigation =
    true;

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
                        `Next request failed (${response.status})`
                    );
                }
           } catch (error) {
    this.watchPartyScrollToCurrentAfterNavigation =
        false;

    console.error(
        "watch party next failed:",
                    error
                );

                window.alert(
                    `watch party next failed: ${error.message}`
                );
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

const progressTooltip =
    this.watchPartyPanel.querySelector(
        "[data-watch-party-progress-tooltip]"
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

        if (progressTooltip) {
            progressTooltip.textContent =
                this.formatDuration(
                    safeValue
                );

            progressTooltip.style.left =
                `${percentage}%`;

            progressTooltip.classList.add(
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

    const beginSeeking = () => {
        this.watchPartySeeking = true;

        if (progressTooltip) {
            progressTooltip.classList.add(
                "opacity-100"
            );
        }
    };

    const finishSeeking = async () => {
        if (!this.watchPartySeeking) {
            return;
        }

        this.watchPartySeeking = false;

        if (progressTooltip) {
            progressTooltip.classList.remove(
                "opacity-100"
            );
        }

        if (
            this.watchPartySeekBusy ||
            !this.watchParty.currentVideoId
        ) {
            return;
        }

        const targetTime =
            Number(progressInput.value);

        if (
            !Number.isFinite(targetTime) ||
            targetTime < 0
        ) {
            return;
        }

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
            this.watchPartyPanel.querySelector(
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

/*
 * Replacing innerHTML creates a brand-new queue
 * element, so explicitly restore its scroll position.
 */
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        const queueList =
            this.watchPartyPanel?.querySelector(
                "[data-watch-party-queue-list]"
            );

        if (!queueList) {
            return;
        }

        const requiredLength =
            this.watchPartyScrollQueueAfterLength;

        const queue =
            Array.isArray(
                this.watchParty?.queue
            )
                ? this.watchParty.queue
                : [];

        const shouldJumpToBottom =
            Number.isInteger(requiredLength) &&
            requiredLength >= 1 &&
            queue.length >= requiredLength;

        if (
            shouldJumpToBottom ||
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

        if (shouldJumpToBottom) {
            this.watchPartyScrollQueueAfterLength =
                null;
        }
    });
});
}

toggleWatchParty() {
    if (!this.watchParty.enabled) {
        return;
    }

    this.watchPartyOpen =
        !this.watchPartyOpen;

    this.renderWatchParty();
}

	scrollWatchPartyQueueToCurrentItem() {
    if (
        !this
            .watchPartyScrollToCurrentAfterNavigation
    ) {
        return;
    }

    const queue =
        Array.isArray(this.watchParty?.queue)
            ? this.watchParty.queue
            : [];

    const currentItem =
        queue.find(item => {
            return (
                item.videoId ===
                this.watchParty.currentVideoId
            );
        });

    const queueId =
        Number(currentItem?.id);

    if (
        !Number.isInteger(queueId) ||
        queueId <= 0
    ) {
        return;
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const queueList =
                this.watchPartyPanel?.querySelector(
                    "[data-watch-party-queue-list]"
                );

            const queueItem =
                queueList?.querySelector(
                    `[data-watch-party-play="${queueId}"]`
                );

            if (!queueList || !queueItem) {
                return;
            }

            const targetScrollTop =
                queueItem.offsetTop -
                queueList.offsetTop -
                (
                    queueList.clientHeight -
                    queueItem.offsetHeight
                ) / 2;

            queueList.scrollTo({
                top: Math.max(
                    0,
                    targetScrollTop
                ),
                behavior: "smooth"
            });

            this
                .watchPartyScrollToCurrentAfterNavigation =
                false;
        });
    });
}
	

	scrollWatchPartyQueueToPendingItem() {
    const requiredLength =
        this.watchPartyScrollQueueAfterLength;

    if (
        !Number.isInteger(requiredLength) ||
        requiredLength < 1
    ) {
        return;
    }

    const queue =
        Array.isArray(this.watchParty?.queue)
            ? this.watchParty.queue
            : [];

    /*
     * Wait for the authoritative WebSocket queue
     * to contain the newly added item.
     */
    if (queue.length < requiredLength) {
        return;
    }

    const scrollToBottom = () => {
        const queueList =
            this.watchPartyPanel?.querySelector(
                "[data-watch-party-queue-list]"
            );

        if (!queueList) {
            return;
        }

        queueList.scrollTop =
            queueList.scrollHeight;

        if (!this.watchPartyAddBusy) {
            this.watchPartyScrollQueueAfterLength =
                null;
        }
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(
            scrollToBottom
        );
    });
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
this.scrollWatchPartyQueueToPendingItem();
this.scrollWatchPartyQueueToCurrentItem();

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

        /*
         * Do not manually edit this.watchParty.queue here.
         *
         * The Worker broadcasts the authoritative queue
         * through the existing watchparty-state WebSocket.
         */
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

    const res = await fetch(`${this.API}/api/chat`);

    const messages = await res.json();

    this.messages.innerHTML = "";

    for (const message of messages) {
    this.addMessage(message);
}

this.scrollMessagesToBottom();

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

    const sameAuthor =
        Boolean(previousRow) &&
        Boolean(message.client_id) &&
        previousRow.dataset.clientId ===
            message.client_id;

    const closeInTime =
        Number.isFinite(currentTime) &&
        previousTime > 0 &&
        currentTime - previousTime <
            5 * 60 * 1000;

    const isContinuation =
        sameAuthor &&
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
        : "mt-2 gap-3"
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

    row.dataset.timestamp =
        String(
            Number.isFinite(currentTime)
                ? currentTime
                : Date.now()
        );


	row.addEventListener("contextmenu", event => {
    if (!this.isAdmin) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.closeModerationMenu();

    this.openModerationMenu(
        event.clientX,
        event.clientY,
        message
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
         "min-w-0 flex-1 pl-12";

    const messageBody =
    document.createElement("div");

messageBody.className =
    "messageBody";

const text =
    document.createElement("div");

text.className =
    "chatText break-words leading-relaxed";

this.renderMessageContent(
    text,
    message.message || ""
);

messageBody.appendChild(text);

    const compactTime =
        document.createElement("span");

    compactTime.className = [
    "absolute",
    "left-0",
    "top-[10px]",
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
            `/avatars/${
                message.avatar ||
                "original.gif"
            }`;

        avatar.alt = "";

        avatar.className =
            "pixel-avatar h-9 w-9 shrink-0 object-contain -mt-[11px]";

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
    "flex min-w-0 items-baseline gap-2";

        const name =
            document.createElement("span");

        name.className =
            "chatMessageName font-bold";

        name.textContent =
            message.name || "anonymous";

        const time =
            document.createElement("span");

        time.className =
    "chatTime shrink-0 whitespace-nowrap text-[9px] text-white/35";

       time.textContent =
    groupTimestamp;

time.title =
    fullTimestamp;

       header.append(
    name,
    time
);

const messageBody =
    document.createElement("div");

messageBody.className =
    "messageBody";

const text =
    document.createElement("div");

text.className =
    "chatText break-words leading-relaxed";

this.renderMessageContent(
    text,
    message.message || ""
);

messageBody.appendChild(text);

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
        !this.userHasScrolledUp &&
        !this.isMinimized
    ) {
        this.scrollMessagesToBottom();
    }
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

closeModerationMenu() {
    if (!this.moderationMenu) {
        return;
    }

    this.moderationMenu.remove();
    this.moderationMenu = null;
}

openModerationMenu(x, y, message) {
    this.closeModerationMenu();

    const menu =
        document.createElement("div");

    menu.className = [
        "fixed",
        "z-[100000]",
        "w-44",
        "overflow-hidden",
        "rounded-xl",
        "border",
        "border-white/15",
        "bg-black/90",
        "py-1",
        "text-[11px]",
        "text-white",
        "shadow-xl",
        "backdrop-blur-xl"
    ].join(" ");

const menuWidth = 176;
const menuHeight = 165;
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

 const deleteButton =
    this.createModerationMenuButton(
        "delete message",
        () => {
            this.closeModerationMenu();

            this.deleteMessage(
                message.id
            );
        }
    );

   const banButton =
    this.createModerationMenuButton(
        `ban ${message.name || "user"}`,
        async () => {
            this.closeModerationMenu();

            await this.banClient(
                message.client_id,
                message.name
            );
        }
    );

	const motdButton =
    this.createModerationMenuButton(
        "edit message of the day",
        () => {
            this.closeModerationMenu();
            this.editMotd();
        }
    );

    const copyButton =
        this.createModerationMenuButton(
            "copy message ID",
            async () => {
                try {
                    await navigator.clipboard.writeText(
                        String(message.id)
                    );

                    console.log(
                        "Copied message ID",
                        message.id
                    );
                } catch (error) {
                    console.error(
                        "could not copy message ID:",
                        error
                    );
                }

                this.closeModerationMenu();
            }
        );

const divider = document.createElement("div");
divider.className =
    "my-1 border-t border-white/10";
	
    menu.append(
        deleteButton,
        banButton,
		divider,
		motdButton,
        copyButton
    );

    document.body.appendChild(menu);

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
            `delete message #${id}?`
        );

    if (!confirmed) {
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

    try {
        const response = await fetch(
            `${this.API}/api/admin/chat/delete`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${this.adminKey}`
                },
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
            `/avatars/${member.avatar || "original.gif"}`;

        avatar.alt = "";
        avatar.className =
            "pixel-avatar h-7 w-7 shrink-0 object-contain";

        avatar.addEventListener(
            "error",
            () => {
                avatar.src = "/avatars/original.gif";
            },
            { once: true }
        );

        const name = document.createElement("span");

        name.className =
            "min-w-0 truncate text-white/75";

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
        this.nameInput.value.trim() || "anonymous";

    this.socket.send(JSON.stringify({
        type: "presence",
        clientId: this.clientId,
        name,
        avatar: this.avatar
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
this.scrollWatchPartyQueueToPendingItem();

if (this.partyManager) {
    this.partyManagerBusy = false;
    this.renderPartyManager();
}

    return;
}
		
if (data.type === "delete") {
    const messageElement =
        this.findMessageElement(data.id);

    if (messageElement) {
        messageElement.remove();
    }

    this.closeModerationMenu();
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

async sendMessage() {
    const name = this.nameInput.value.trim();
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
                "Content-Type": "application/json"
            },
           body: JSON.stringify({
    clientId: this.clientId,
    name,
    message,
    avatar: this.avatar
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

formatDuration(seconds) {
    seconds = Math.max(
        0,
        Math.floor(seconds || 0)
    );

    const mins =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return `${mins}:${secs
        .toString()
        .padStart(2, "0")}`;
}

setupNameSaving() {
    this.nameInput.addEventListener("input", () => {
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

const customSection =
    document.createElement("div");

customSection.className = [
	"overflow-hidden",
    "rounded-t-xl",
    "border",
    "border-b-0",
    "border-white/10",
    "bg-[#1f1f1f]",
    "p-2"
].join(" ");

const customTitle =
    document.createElement("div");

customTitle.textContent =
    "custom";

customTitle.className = [
    "mb-1",
    "text-xs",
    "text-white/70"
].join(" ");

const customTray =
    document.createElement("div");

customTray.className = [
    "grid",
    "grid-cols-10",
    "gap-0.5"
].join(" ");

customTray.setAttribute(
    "aria-label",
    "Custom emojis"
);

for (const category of this.customEmojiCategories) {
    for (const emoji of category.emojis) {
        const source = emoji.skins?.[0]?.src;

        if (!emoji.id || !source) {
            continue;
        }

        const button = document.createElement("button");

        button.type = "button";

        button.className = [
    "flex",
    "h-[26px]",
    "w-full",
    "items-center",
    "justify-center",
    "rounded-md",
    "transition",
    "hover:bg-white/10",
    "active:scale-95"
].join(" ");

        button.title =
            emoji.name || emoji.id;

        button.setAttribute(
            "aria-label",
            emoji.name || emoji.id
        );

        const image = document.createElement("img");

        image.src = source;
        image.alt = `:${emoji.id}:`;

        image.className = [
    "h-5",
    "w-5",
    "object-contain"
].join(" ");

        button.appendChild(image);

        button.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                this.insertIntoMessageInput(
                    `:${emoji.id.toLowerCase()}:`
                );
            }
        );

        customTray.appendChild(button);
    }
}

	customSection.append(
    customTitle,
    customTray
);

this.emojiPicker =
    new window.EmojiMart.Picker({
        data: async () => {
            const response = await fetch(
                "https://cdn.jsdelivr.net/npm/@emoji-mart/data@1.2.1"
            );

            if (!response.ok) {
                throw new Error(
                    `emoji data failed (${response.status})`
                );
            }

            return response.json();
        },

        custom: this.customEmojiCategories,

emojiSize: 16,
emojiButtonSize: 26,
perLine: 10,

onEmojiSelect: emoji => {
            this.insertSelectedEmoji(emoji);
        }
    });

this.emojiPickerContainer.style.width =
    "260px";

this.emojiPickerContainer.style.maxWidth =
    "calc(100vw - 3rem)";

this.emojiPickerContainer.style.display =
    "flex";

this.emojiPickerContainer.style.flexDirection =
    "column";

this.emojiPickerContainer.style.maxHeight =
    "390px";

this.emojiPickerContainer.style.overflow =
    "hidden";

this.emojiPicker.style.width =
    "100%";

this.emojiPicker.style.maxWidth =
    "100%";

this.emojiPicker.style.height =
    "280px";

this.emojiPickerContainer.append(
    customSection,
    this.emojiPicker
);

    this.emojiButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            this.toggleEmojiPicker();
        }
    );

    document.addEventListener(
        "click",
        event => {
            if (!this.emojiPickerOpen) {
                return;
            }

            const path =
                typeof event.composedPath === "function"
                    ? event.composedPath()
                    : [];

            const clickedPicker =
                path.includes(this.emojiPicker);

            const clickedButton =
                path.includes(this.emojiButton);

            if (!clickedPicker && !clickedButton) {
                this.closeEmojiPicker();
            }
        }
    );
}
toggleEmojiPicker() {
    if (this.emojiPickerOpen) {
        this.closeEmojiPicker();
    } else {
        this.openEmojiPicker();
    }
}

openEmojiPicker() {
    if (
        !this.emojiPickerContainer ||
        !this.emojiPicker
    ) {
        return;
    }

    this.closeAvatarPicker();

    this.emojiPickerOpen = true;

    this.emojiPickerContainer.classList.remove(
        "invisible",
        "pointer-events-none",
        "opacity-0"
    );

    this.emojiPickerContainer.classList.add(
        "opacity-100"
    );

    this.emojiButton.setAttribute(
        "aria-expanded",
        "true"
    );

}

closeEmojiPicker() {
    if (!this.emojiPickerContainer) {
        return;
    }

    this.emojiPickerOpen = false;

    this.emojiPickerContainer.classList.add(
        "invisible",
        "pointer-events-none",
        "opacity-0"
    );

    this.emojiPickerContainer.classList.remove(
        "opacity-100"
    );

    if (this.emojiButton) {
        this.emojiButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
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
	
	setupAvatarPicker() {
    this.avatars = [
        "original.gif",
		"orange.gif",
		"blue.gif",
		"pink.gif",
		"black.gif",
		"shark.gif"
    ];

    this.avatarPreview.src =
        `/avatars/${this.avatar}`;

    this.renderAvatarPicker();

    this.avatarButton.addEventListener("click", event => {
        event.stopPropagation();

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
            rounded-lg bg-black/10 p-1
            transition
            hover:bg-white/10
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

	positionWatchPartyPanel() {
    if (
        !this.watchPartyButton ||
        !this.watchPartyPanel
    ) {
        return;
    }

    const panel =
        this.watchPartyPanel;

    const buttonRect =
        this.watchPartyButton
            .getBoundingClientRect();

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

    /*
     * Establish the normal position beside the
     * Watch Party TV button.
     */
    panel.style.left = "auto";
    panel.style.top = "auto";

    panel.style.right =
        `${Math.max(
            viewportPadding,
            window.innerWidth -
                buttonRect.right
        )}px`;

    panel.style.bottom =
        `${Math.max(
            viewportPadding,
            window.innerHeight -
                buttonRect.top +
                gap
        )}px`;

    const availableHeight =
        Math.max(
            this.watchPartyResizeMinimum,
            viewportHeight -
                viewportPadding * 2
        );

    panel.style.maxHeight =
        `${availableHeight}px`;

    panel.style.overflow =
        "hidden";

    const currentHeight =
        parseFloat(
            panel.style.height
        );

    if (
        Number.isFinite(currentHeight) &&
        currentHeight > availableHeight
    ) {
        panel.style.height =
            `${availableHeight}px`;

        localStorage.setItem(
            "watch_party_height",
            String(availableHeight)
        );
    }

    /*
     * Begin with no translation so we can measure
     * the panel's correct base position.
     */
    panel.dataset.x = "0";
    panel.dataset.y = "0";

    panel.style.transform =
        "translate(0px, 0px)";

    const savedX =
        parseFloat(
            localStorage.getItem(
                "watch_party_x"
            )
        ) || 0;

    const savedY =
        parseFloat(
            localStorage.getItem(
                "watch_party_y"
            )
        ) || 0;

    const baseRect =
        panel.getBoundingClientRect();

    let nextX = savedX;
    let nextY = savedY;

    const minimumLeft =
        viewportLeft +
        viewportPadding;

    const maximumRight =
        viewportLeft +
        viewportWidth -
        viewportPadding;

    const minimumTop =
        viewportTop +
        viewportPadding;

    const maximumBottom =
        viewportTop +
        viewportHeight -
        viewportPadding;

    /*
     * Clamp the saved horizontal position.
     */
    if (
        baseRect.left + nextX <
        minimumLeft
    ) {
        nextX =
            minimumLeft -
            baseRect.left;
    }

    if (
        baseRect.right + nextX >
        maximumRight
    ) {
        nextX =
            maximumRight -
            baseRect.right;
    }

    /*
     * Clamp the saved vertical position.
     */
    if (
        baseRect.top + nextY <
        minimumTop
    ) {
        nextY =
            minimumTop -
            baseRect.top;
    }

    if (
        baseRect.bottom + nextY >
        maximumBottom
    ) {
        nextY =
            maximumBottom -
            baseRect.bottom;
    }

    panel.dataset.x =
        String(nextX);

    panel.dataset.y =
        String(nextY);

    panel.style.transform =
        `translate(${nextX}px, ${nextY}px)`;

    /*
     * Replace any invalid saved position with the
     * corrected, visible position.
     */
    localStorage.setItem(
        "watch_party_x",
        String(nextX)
    );

    localStorage.setItem(
        "watch_party_y",
        String(nextY)
    );
}
	
setupDragging() {

	const self = this;
	
    interact(this.window).draggable({
        allowFrom: ".chat-drag-area",
        ignoreFrom: "button, input, a",

        inertia: true,

        modifiers: [
            interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true
            })
        ],

        listeners: {
            move(event) {
                const target = event.target;

                const x =
                    (parseFloat(target.dataset.x) || 0) +
                    event.dx;

                const y =
                    (parseFloat(target.dataset.y) || 0) +
                    event.dy;

                target.style.transform =
                    `translate(${x}px, ${y}px)`;

                target.dataset.x = String(x);
                target.dataset.y = String(y);
            },

            end(event) {
                localStorage.setItem(
                    "chat_x",
                    event.target.dataset.x || "0"
                );

                localStorage.setItem(
                    "chat_y",
                    event.target.dataset.y || "0"
                );

				self.keepTitleBarInViewport();
            }
        }
    });

	interact(this.watchPartyPanel).draggable({
    allowFrom: ".watch-party-drag-area",
    ignoreFrom:
    "button, input, a, " +
    "[data-watch-party-resize-handle]",

    inertia: true,

    modifiers: [
        interact.modifiers.restrictRect({
            restriction: "parent",
            endOnly: true
        })
    ],

    listeners: {
        move(event) {
            const target = event.target;

            const x =
                (parseFloat(target.dataset.x) || 0) +
                event.dx;

            const y =
                (parseFloat(target.dataset.y) || 0) +
                event.dy;

            target.style.transform =
                `translate(${x}px, ${y}px)`;

            target.dataset.x = String(x);
            target.dataset.y = String(y);
        },

        end(event) {
            localStorage.setItem(
                "watch_party_x",
                event.target.dataset.x || "0"
            );

            localStorage.setItem(
                "watch_party_y",
                event.target.dataset.y || "0"
            );
        }
    }
});
	interact(this.watchPartyPanel).resizable({
    edges: {
        bottom:
            "[data-watch-party-resize-handle]"
    },

    inertia: false,

    modifiers: [
        interact.modifiers.restrictSize({
            min: {
                width: 288,
                height:
                    this.watchPartyResizeMinimum
            }
        })
    ],

    listeners: {
        start(event) {
            const target =
                event.target;

            const rect =
                target.getBoundingClientRect();

            target.dataset.resizeLastHeight =
                String(rect.height);

            target.style.height =
                `${rect.height}px`;
        },

        move(event) {
            const target =
                event.target;

            const viewport =
                window.visualViewport;

            const viewportTop =
                viewport?.offsetTop || 0;

            const viewportHeight =
                viewport?.height ||
                window.innerHeight;

            const viewportBottom =
                viewportTop +
                viewportHeight;

            const viewportPadding = 12;

            const currentRect =
                target.getBoundingClientRect();

            const fixedTop =
                currentRect.top;

            const maximumHeight =
                Math.max(
                    self.watchPartyResizeMinimum,
                    viewportBottom -
                        fixedTop -
                        viewportPadding
                );

            const previousHeight =
                parseFloat(
                    target.dataset
                        .resizeLastHeight
                ) ||
                currentRect.height;

            const requestedHeight =
                event.rect.height;

            const nextHeight =
                Math.min(
                    maximumHeight,
                    Math.max(
                        self
                            .watchPartyResizeMinimum,
                        requestedHeight
                    )
                );

            /*
             * The panel is positioned using bottom.
             *
             * Increasing its height would normally
             * move the top upward. Moving its
             * translation down by the same amount
             * keeps the top edge in place and lets
             * the bottom edge follow the pointer.
             */
            const heightDifference =
                nextHeight -
                previousHeight;

            const x =
                parseFloat(
                    target.dataset.x
                ) || 0;

            const y =
                (
                    parseFloat(
                        target.dataset.y
                    ) || 0
                ) +
                heightDifference;

            target.style.height =
                `${nextHeight}px`;

            target.style.transform =
                `translate(${x}px, ${y}px)`;

            target.dataset.x =
                String(x);

            target.dataset.y =
                String(y);

            target.dataset.resizeLastHeight =
                String(nextHeight);
        },

        end(event) {
            const target =
                event.target;

            const height =
                target.getBoundingClientRect()
                    .height;

            localStorage.setItem(
                "watch_party_height",
                String(height)
            );

            localStorage.setItem(
                "watch_party_x",
                target.dataset.x || "0"
            );

            localStorage.setItem(
                "watch_party_y",
                target.dataset.y || "0"
            );

            delete target.dataset
                .resizeLastHeight;
        }
    }
});
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
