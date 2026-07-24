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
    this.connect();
}

   createWindow() {
    const windowElement = document.createElement("div");

    windowElement.id = "chatWindow";

    /*
     * terminal2 allows your existing applyTheme() function
     * to theme the chat automatically.
     */
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
        aria-label="Minimize live chat"
        aria-expanded="true"
        title="Minimize chat"
    >
        −
    </button>
</div>
</div>
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
            px-3 py-3
            theme-body text-xs
        "
        aria-live="polite"
    ></div>

   <aside
    id="chatMembersPanel"
    class="
        w-28 shrink-0
        border-l border-white/10
        bg-black/5
        px-2 py-3
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
            class="space-y-2 theme-body text-[10px]"
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
            aria-label="Choose avatar"
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
    this.nameInput = this.window.querySelector("#chatName");
    this.messageInput = this.window.querySelector("#chatMessage");
    this.sendButton = this.window.querySelector("#chatSend");
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

  this.sendButton.addEventListener(
    "click",
    () => this.sendMessage()
);

	   this.minimizeButton.addEventListener(
    "click",
    event => {
        /*
         * Prevent clicking the button from also beginning
         * a title-bar drag.
         */
        event.stopPropagation();

        this.toggleMinimized();
    }
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
        "Enter the chat admin key:"
    );

    if (key === null) {
        return;
    }

    const cleanedKey =
        key.trim();

    if (!cleanedKey) {
        window.alert(
            "Admin key cannot be empty."
        );
        return;
    }

    const isValid =
        await this.verifyAdminKey(
            cleanedKey
        );

    if (!isValid) {
        window.alert(
            "Incorrect admin key."
        );
        return;
    }

    this.enableAdminMode(cleanedKey);

    window.alert(
        "Chat moderation enabled."
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
            "Could not verify admin key:",
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

    /*
     * Re-render existing messages so their
     * moderation buttons appear.
     */
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

    /*
     * Re-render messages without moderation
     * controls.
     */
    this.loadHistory();
}

	logoutAdmin() {
    this.disableAdminMode();

    window.alert(
        "Chat moderation disabled."
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
        "Manage banned users";

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
            "Admin authentication is required."
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
                Banned users
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
                aria-label="Close banned users panel"
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
                Loading...
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
            Loading...
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
                "Your admin session is no longer valid."
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Could not load bans (${response.status})`
            );
        }

        this.renderBannedUsers(
            result.bans || []
        );
    } catch (error) {
        console.error(
            "Could not load banned users:",
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
            "Nobody is banned.";

        list.appendChild(empty);
        return;
    }

    for (const ban of bans) {
        const row =
            document.createElement("div");

       row.className = [
    "chatMessage",
    "group",
    "relative",
    "flex",
    "items-start",
    isContinuation
        ? "py-0.5"
        : "gap-3 py-2"
].join(" ");

        const name =
            document.createElement("div");

        name.className =
            "font-bold text-white";

        name.textContent =
            ban.name || "Unknown user";

        const reason =
            document.createElement("div");

        reason.className =
            "mt-1 break-words text-white/60";

        reason.textContent =
            `Reason: ${
                ban.reason ||
                "No reason provided"
            }`;

        const clientId =
            document.createElement("div");

        clientId.className =
            "mt-1 break-all text-[9px] text-white/30";

        clientId.textContent =
            ban.client_id;

        const unbanButton =
            document.createElement("button");

        unbanButton.type = "button";
        unbanButton.textContent = "Unban";

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
            `Unban ${
                name || "this user"
            }?`
        );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Unbanning...";

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
                "Your admin session is no longer valid."
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Unban failed (${response.status})`
            );
        }

        if (!result.removed) {
            window.alert(
                "That client was not currently banned."
            );
        } else {
            window.alert(
                `${
                    name || "User"
                } has been unbanned.`
            );
        }

        await this.loadBannedUsers();
    } catch (error) {
        console.error(
            "Could not unban client:",
            error
        );

        window.alert(
            `Could not unban user: ${
                error.message
            }`
        );

        button.disabled = false;
        button.textContent = "Unban";
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
        isContinuation
    ? "items-start gap-3 py-0.5"
    : "items-start gap-3 py-2"
    ].join(" ");

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

    const date =
        new Date(message.created_at);

    const formattedTime =
        Number.isNaN(date.getTime())
            ? "--:--"
            : date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
	.replace(/\s/g, "");

    const fullTimestamp =
        Number.isNaN(date.getTime())
            ? "Unknown time"
            : date.toLocaleString([], {
                dateStyle: "full",
                timeStyle: "medium"
            });

   if (isContinuation) {
    const compactContent =
        document.createElement("div");

    compactContent.className =
         "min-w-0 flex-1 pl-12 pr-24";

    const text =
        document.createElement("div");

    text.className =
        "chatText break-words leading-relaxed";

    this.renderMessageContent(
        text,
        message.message || ""
    );

    const compactTime =
        document.createElement("span");

    compactTime.className = [
    "absolute",
    "right-10",
    "top-1",
    "z-10",
    "whitespace-nowrap",
    "text-[8px]",
    "text-white/0",
    "transition",
    "group-hover:text-white/45"
].join(" ");

    compactTime.textContent =
        formattedTime;

    compactTime.title =
        fullTimestamp;

    compactContent.appendChild(text);

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
            "pixel-avatar h-9 w-9 shrink-0 object-contain";

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
           "min-w-0 flex-1 pr-24";

        const header =
            document.createElement("div");

        header.className =
    "flex min-w-0 items-baseline gap-2";

        const name =
            document.createElement("span");

        name.className =
            "chatMessageName font-bold";

        name.textContent =
            message.name || "Anonymous";

        const time =
            document.createElement("span");

        time.className =
    "chatTime shrink-0 whitespace-nowrap text-[9px] text-white/35";

        time.textContent =
            formattedTime;

        time.title =
            fullTimestamp;

       header.append(
    name,
    time
);

const text =
    document.createElement("div");

        text.className =
            "chatText mt-0.5 break-words leading-relaxed";

        this.renderMessageContent(
            text,
            message.message || ""
        );

        content.append(
            header,
            text
        );

        row.append(
            avatar,
            content
        );
    }
if (
    this.isAdmin &&
    row.dataset.messageId
) {
    const adminButton =
        document.createElement("button");

    adminButton.type = "button";

    adminButton.className = [
        "chatAdminButton",
        "absolute",
        "right-2",
        "top-1",
        "-translate-y-1/2",
        "hidden",
        "group-hover:flex",
        "h-6",
        "w-6",
        "items-center",
        "justify-center",
        "rounded",
        "text-white/40",
        "hover:bg-white/10",
        "hover:text-white"
    ].join(" ");

    adminButton.textContent = "⋮";

    adminButton.title =
        "Moderate message";

    adminButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            this.openModerationMenu(
                adminButton,
                message
            );
        }
    );

    row.appendChild(adminButton);
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

openModerationMenu(button, message) {
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

    const buttonRect =
        button.getBoundingClientRect();

    menu.style.left =
        `${buttonRect.right - 176}px`;

    menu.style.top =
        `${buttonRect.bottom + 4}px`;

 const deleteButton =
    this.createModerationMenuButton(
        "Delete message",
        () => {
            this.closeModerationMenu();

            this.deleteMessage(
                message.id
            );
        }
    );

   const banButton =
    this.createModerationMenuButton(
        `Ban ${message.name || "user"}`,
        async () => {
            this.closeModerationMenu();

            await this.banClient(
                message.client_id,
                message.name
            );
        }
    );

    const copyButton =
        this.createModerationMenuButton(
            "Copy message ID",
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
                        "Could not copy message ID:",
                        error
                    );
                }

                this.closeModerationMenu();
            }
        );

    menu.append(
        deleteButton,
        banButton,
        copyButton
    );

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
            "Cannot delete invalid message ID:",
            messageId
        );

        return;
    }

    const confirmed =
        window.confirm(
            `Delete message #${id}?`
        );

    if (!confirmed) {
        return;
    }

    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "Admin authentication is required."
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
            // The response may not contain JSON.
        }

        if (response.status === 401) {
            this.disableAdminMode();

            window.alert(
                "Your admin session is no longer valid."
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Delete failed (${response.status})`
            );
        }

        /*
         * Do not remove it here.
         *
         * The Durable Object will broadcast the
         * deletion to every client, including this one.
         */
        console.log(
            "Deleted message",
            id
        );
    } catch (error) {
        console.error(
            "Could not delete message:",
            error
        );

        window.alert(
            `Could not delete message: ${error.message}`
        );
    }
}

	async banClient(clientId, name) {
    if (!clientId) {
        window.alert(
            "This message has no client ID and cannot be banned."
        );

        return;
    }

    if (
        !this.isAdmin ||
        !this.adminKey
    ) {
        window.alert(
            "Admin authentication is required."
        );

        this.disableAdminMode();
        return;
    }

    const reasonInput =
        window.prompt(
            `Reason for banning ${name || "this user"}:`,
            "Spam"
        );

    if (reasonInput === null) {
        return;
    }

    const reason =
        reasonInput.trim() ||
        "No reason provided";

    const confirmed =
        window.confirm(
            `Permanently ban ${name || "this user"}?\n\nReason: ${reason}`
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
                "Your admin session is no longer valid."
            );

            return;
        }

        if (!response.ok) {
            throw new Error(
                result?.error ||
                `Ban failed (${response.status})`
            );
        }

        window.alert(
            `${name || "User"} has been permanently banned.`
        );
    } catch (error) {
        console.error(
            "Could not ban client:",
            error
        );

        window.alert(
            `Could not ban user: ${error.message}`
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
            member.name || "Anonymous";

        row.append(avatar, name);
        this.membersElement.appendChild(row);
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
        this.nameInput.value.trim() || "Anonymous";

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
                "Anonymous",
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
    /*
     * Avoid creating a duplicate connection.
     */

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

    console.log("Connecting chat WebSocket...");

    this.socket = new WebSocket(socketUrl);

    this.socket.addEventListener("open", () => {
    console.log("Chat WebSocket connected");

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
    /*
     * Ignore optional ping/pong traffic.
     */
    if (event.data === "pong") {
        return;
    }

    try {
        const data = JSON.parse(event.data);

        console.log("Chat WebSocket data:", data);

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
            data.name || "Anonymous"
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
        "No reason provided";

    const durationText =
        data.expires_at
            ? `Ban expires: ${
                new Date(
                    data.expires_at
                ).toLocaleString()
            }`
            : "This ban is permanent.";

    window.alert(
        `You have been banned.\n\n` +
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
            "Could not parse chat WebSocket message:",
            error,
            event.data
        );
    }
});

    this.socket.addEventListener("close", event => {
        console.log(
            "Chat WebSocket closed:",
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
        console.error("Chat WebSocket error:", error);

        /*
         * Closing causes the close handler above to schedule
         * the reconnect in one place.
         */
        try {
            this.socket.close();
        } catch {
            // The socket may already be closed.
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
    this.sendButton.textContent = "Sending...";

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
    result.error === "Banned"
) {
    this.isBanned = true;

    const durationText =
        result.expires_at
            ? `Ban expires: ${
                new Date(
                    result.expires_at
                ).toLocaleString()
            }`
            : "This ban is permanent.";

    window.alert(
        `You have been banned.\n\n` +
        `Reason: ${
            result.reason ||
            "No reason provided"
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
            "Banned"
        );
    }

    return;
}

if (!response.ok) {
    throw new Error(
        result?.error ||
        `Chat request failed (${response.status})`
    );
}
clearTimeout(this.typingTimer);
this.sendTypingState(false);

this.messageInput.value = "";
this.messageInput.focus();
    } catch (error) {
        console.error("Could not send chat message:", error);
    } finally {
    this.sendButton.disabled =
        this.isBanned;

    this.sendButton.textContent =
        this.isBanned
            ? "Banned"
            : "Send";
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

    /*
     * Match shortcode-style custom emojis.
     *
     * Examples:
     * :jamicat:
     * :partycat:
     * :heartpixel:
     */
    const pattern =
        /:([a-z0-9_+-]+):/gi;

    let lastIndex = 0;
    let match;

    while (
        (match = pattern.exec(value)) !== null
    ) {
        /*
         * Preserve ordinary text before the emoji.
         */
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
    "h-8",
    "w-8",
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
            /*
             * Unknown shortcodes stay visible as text.
             */
            container.appendChild(
                document.createTextNode(
                    match[0]
                )
            );
        }

        lastIndex =
            pattern.lastIndex;
    }

    /*
     * Preserve any remaining text after the final match.
     */
    if (lastIndex < value.length) {
        container.appendChild(
            document.createTextNode(
                value.slice(lastIndex)
            )
        );
    }
}
	
setupEmojiPicker() {
    /*
     * Custom categories appear alongside Emoji Mart's
     * standard Unicode categories.
     */
    this.customEmojiCategories = [
    {
        id: "custom",
        name: "Custom",
        emojis: [
            {
                id: "blueblob",
                name: "blue wobble",
                keywords: ["blue", "blob"],
                skins: [
                    {
                        src: "/emojis/blueblob.gif"
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
                id: "pinkblob",
                name: "pink wobble",
                keywords: ["pink", "blob"],
                skins: [
                    {
                        src: "/emojis/pinkblob.gif"
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
                keywords: ["tongue", "silly", "tease"],
                skins: [
                    {
                        src: "/emojis/tongue.gif"
                    }
                ]
            },
            {
                id: "yellowblob",
                name: "yellow wobble",
                keywords: ["yellow", "blob"],
                skins: [
                    {
                        src: "/emojis/yellowblob.gif"
                    }
                ]
            }
        ]
    }
];

    /*
     * Build a trusted lookup used when rendering messages.
     */
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
            "Emoji Mart did not load."
        );

        this.emojiButton.disabled = true;
        this.emojiButton.title =
            "Emoji picker unavailable";

        return;
    }

 /*
 * Custom emojis shown permanently above the Unicode picker.
 */
const customSection =
    document.createElement("div");

customSection.className = [
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
    "Custom";

customTitle.className = [
    "mb-1",
    "text-xs",
    "text-white/70"
].join(" ");

const customTray =
    document.createElement("div");

customTray.className = [
    "grid",
    "grid-cols-7",
    "gap-1"
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
            "h-11",
            "w-full",
            "items-center",
            "justify-center",
            "rounded-lg",
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
            "h-8",
            "w-8",
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

/*
 * Normal Unicode Emoji Mart picker.
 */
this.emojiPicker =
    new window.EmojiMart.Picker({
        data: async () => {
            const response = await fetch(
                "https://cdn.jsdelivr.net/npm/@emoji-mart/data@1.2.1"
            );

            if (!response.ok) {
                throw new Error(
                    `Emoji data failed (${response.status})`
                );
            }

            return response.json();
        },

        custom: this.customEmojiCategories,

emojiSize: 30,
emojiButtonSize: 40,
perLine: 8,

onEmojiSelect: emoji => {
            this.insertSelectedEmoji(emoji);
        }
    });

this.emojiPickerContainer.style.width =
    "352px";

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

/*
 * Emoji Mart's normal picker is tall enough to push
 * the custom tray outside the chat window. Reducing its
 * height leaves room for the tray above it.
 */
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

    /*
     * A document click closes the picker. Clicks originating
     * inside Emoji Mart's Shadow DOM are handled through
     * composedPath().
     */
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

    /*
     * Standard Unicode emoji.
     */
    if (typeof emoji.native === "string") {
        this.insertIntoMessageInput(
            emoji.native
        );

        return;
    }

    /*
     * Custom Emoji Mart emoji.
     *
     * Store it as a plain-text shortcode so it can pass
     * safely through D1, HTTP, and WebSockets.
     */
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

    /*
     * Preserve your existing maxlength="250" rule.
     */
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

    /*
     * Notify any other input listeners.
     */
    input.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );
}
	
	setupAvatarPicker() {
    /*
     * Replace these names with the exact GIF and PNG filenames
     * you place inside /avatars/.
     *
     * Store filenames including their extensions so the picker
     * can support both GIF and PNG files.
     */
    this.avatars = [
        "original.gif"
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

    /*
     * Your height transition lasts 200ms.
     */
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

    /*
     * This control has no purpose while the entire
     * chat body is hidden.
     */
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

	

    /*
     * The normal window has h-[500px].
     * Remove it while minimized so only the title bar remains.
     */
    this.window.classList.toggle(
        "h-[500px]",
        !minimized
    );

    this.window.classList.toggle(
        "h-10",
        minimized
    );

    /*
     * Remove the bottom rounding while expanded only if your
     * existing design requires it. The normal rounded-3xl class
     * works fine for both states.
     */
    this.minimizeButton.textContent =
        minimized ? "+" : "−";

    this.minimizeButton.setAttribute(
        "aria-expanded",
        String(!minimized)
    );

    this.minimizeButton.setAttribute(
        "aria-label",
        minimized
            ? "Restore live chat"
            : "Minimize live chat"
    );

    this.minimizeButton.title =
        minimized
            ? "Restore chat"
            : "Minimize chat";

    /*
     * Close the avatar popup if the chat is minimized
     * while that popup is open.
     */
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

    /*
     * Keep the full title bar horizontally visible.
     */
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

    /*
     * Only constrain the title bar vertically.
     * The chat body may extend below the viewport.
     */
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
