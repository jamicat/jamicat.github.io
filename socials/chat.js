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
this.applyCurrentTheme();
this.restoreSettings();
this.setupAdminAuthentication();
this.setupAvatarPicker();
this.setupEmojiPicker();
this.setupMembersToggle();
this.setupNameSaving();
this.setupDragging();
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
    title="Message of the day"
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
    aria-label="Watch Party"
    title="Watch Party"
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
            aria-label="Choose emoji"
            aria-expanded="false"
            aria-controls="chatEmojiPicker"
            title="Choose emoji"
        >
            🐱
        </button>

		
    </div>

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
	   
	   this.watchPartyButton.addEventListener(
    "click",
    () => this.toggleWatchParty()
);
	   
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

    title.title =
        "Double-click for admin login";

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
    this.loadHistory();
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

    this.closeBanManager();

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
                `could not load Watch Party (${response.status})`
            );
        }

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(
                result.error ||
                "Watch Party request failed"
            );
        }

this.watchPartyButton = null;
this.watchPartyPanel = null;
this.watchPartyOpen = false;
		
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

        this.renderWatchParty();
    } catch (error) {
        console.error(
            "could not load Watch Party:",
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

renderWatchParty() {

    if (!this.watchPartyButton)
        return;

    if (this.watchParty.enabled) {

        this.watchPartyButton.classList.add(
            "text-emerald-300"
        );

    } else {

        this.watchPartyButton.classList.remove(
            "text-emerald-300"
        );

    }

    console.log(
        this.watchParty
    );

}

	toggleWatchParty() {
    this.watchPartyOpen =
        !this.watchPartyOpen;

    this.renderWatchParty();
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

    this.renderWatchParty();

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

    const savedName = localStorage.getItem("chat_name");

    if (savedName)
        this.nameInput.value = savedName;

    const x = localStorage.getItem("chat_x") || 0;
    const y = localStorage.getItem("chat_y") || 0;

    this.window.dataset.x = x;
    this.window.dataset.y = y;

    this.window.style.transform =
        `translate(${x}px, ${y}px)`;

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
	
setupDragging() {
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
