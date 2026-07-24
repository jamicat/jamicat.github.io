class ChatWidget {

constructor() {
    this.API = "https://jamicat.ahrly.workers.dev";
    this.titleBar = null;
    this.socket = null;
    this.reconnectTimer = null;

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
	this.emojiButton = null;
this.emojiPickerContainer = null;
this.emojiPicker = null;
this.emojiPickerOpen = false;

this.customEmojiCategories = [];
this.customEmojiLookup = new Map();
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
            🙂
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

    this.messageInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    });
}

async loadHistory() {

    const res = await fetch(`${this.API}/api/chat`);

    const messages = await res.json();

    this.messages.innerHTML = "";

    for (const message of messages)
        this.addMessage(message);

}

addMessage(message) {
    const row = document.createElement("div");

    row.className =
        "chatMessage flex items-center gap-3 py-2";

    const avatar = document.createElement("img");

    avatar.src =
        `/avatars/${message.avatar || "original.gif"}`;

    avatar.alt = "";
    avatar.className =
     "pixel-avatar h-9 w-9 shrink-0 object-contain";

    avatar.addEventListener("error", () => {
        avatar.src = "/avatars/original.gif";
    }, {
        once: true
    });

    const content = document.createElement("div");

    content.className =
        "min-w-0 flex-1 self-center";

    const header = document.createElement("div");

    header.className =
        "flex items-baseline gap-2";

    const name = document.createElement("span");

    name.className =
        "chatMessageName font-bold";

    name.textContent =
        message.name || "Anonymous";

    const time = document.createElement("span");

    time.className =
        "chatTime text-[9px] text-white/35";

    const date = new Date(message.created_at);

    time.textContent = Number.isNaN(date.getTime())
        ? "--:--"
        : date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    const text = document.createElement("div");

    text.className =
        "chatText mt-0.5 break-words leading-relaxed";

    this.renderMessageContent(
    text,
    message.message || ""
);

    header.append(name, time);
    content.append(header, text);
    row.append(avatar, content);

    this.messages.appendChild(row);

    this.messages.scrollTop =
        this.messages.scrollHeight;
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
	

connect() {
    /*
     * Avoid creating a duplicate connection.
     */
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

        if (data.type === "members") {
            this.renderMembers(data.members);
            return;
        }

        if (data.type === "message") {
            this.addMessage(data.message);
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

		if (this.connectionStatus) {
    this.connectionStatus.textContent = "reconnecting";
    this.connectionStatus.classList.remove(
        "text-emerald-300"
    );
    this.connectionStatus.classList.add(
        "text-red-300"
    );
}
		
        this.reconnectTimer = setTimeout(
            () => this.connect(),
            3000
        );
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
                name,
                message,
                avatar: this.avatar
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Chat request failed (${response.status}): ${errorText}`
            );
        }

        this.messageInput.value = "";
        this.messageInput.focus();
    } catch (error) {
        console.error("Could not send chat message:", error);
    } finally {
        this.sendButton.disabled = false;
        this.sendButton.textContent = "Send";
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
                "h-6",
                "w-6",
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

            onEmojiSelect: emoji => {
                this.insertSelectedEmoji(emoji);
            }
        });

    /*
     * Keep the picker narrower than the chat window.
     */
    this.emojiPicker.style.width = "352px";
    this.emojiPicker.style.maxWidth =
        "calc(100vw - 3rem)";

    this.emojiPickerContainer.appendChild(
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

    /*
     * Avoid having both popups open simultaneously.
     */
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
            this.closeAvatarPicker();
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
