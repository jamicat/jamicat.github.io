class ChatWidget {

constructor() {
    this.API = "https://jamicat.ahrly.workers.dev";

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
	this.setupMembersToggle();
    this.setupNameSaving();
    this.setupDragging();
	window.addEventListener("resize", () => {
    this.keepInViewport();
});
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
                LIVE CHAT
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

            <input
                id="chatMessage"
                type="text"
                maxlength="250"
                autocomplete="off"
                placeholder="type a message..."
                class="
                    theme-body
                    w-full rounded-xl
                    border border-white/10
                    bg-black/30 px-3 py-2
                    text-xs text-white
                    placeholder:text-white/35
                    outline-none
                    focus:border-white/25
                "
            >

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
    this.connectionStatus =
        this.window.querySelector("#chatConnectionStatus");
	   this.avatarButton =
    this.window.querySelector("#chatAvatarButton");

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

    text.textContent =
        message.message || "";

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
        restriction: {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight
        },
        elementRect: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 1
        },
        endOnly: false
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

                target.dataset.x = x;
                target.dataset.y = y;
            },

            end: (event) => {
                localStorage.setItem(
                    "chat_x",
                    event.target.dataset.x || "0"
                );

                localStorage.setItem(
                    "chat_y",
                    event.target.dataset.y || "0"
                );

				this.keepInViewport();
            }
        }
    });
}

	
toggleMinimized() {
    this.setMinimized(!this.isMinimized);
}

setMinimized(minimized) {
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
    }
	requestAnimationFrame(() => {
    this.keepInViewport();
});

	setTimeout(() => {
    this.keepInViewport();
}, 220);
}

keepInViewport() {
    const margin = 8;
    const rect = this.window.getBoundingClientRect();

    const availableWidth =
        window.innerWidth - margin * 2;

    const availableHeight =
        window.innerHeight - margin * 2;

    let correctionX = 0;
    let correctionY = 0;

    /*
     * If the chat is wider than the viewport, prioritize
     * keeping its left edge visible.
     */
    if (rect.width > availableWidth) {
        correctionX = margin - rect.left;
    } else if (rect.left < margin) {
        correctionX = margin - rect.left;
    } else if (rect.right > window.innerWidth - margin) {
        correctionX =
            window.innerWidth - margin - rect.right;
    }

    /*
     * If the chat is taller than the viewport, prioritize
     * keeping the title bar visible. The bottom may overflow,
     * but the user will always be able to drag or minimize it.
     */
    if (rect.height > availableHeight) {
        correctionY = margin - rect.top;
    } else if (rect.top < margin) {
        correctionY = margin - rect.top;
    } else if (rect.bottom > window.innerHeight - margin) {
        correctionY =
            window.innerHeight - margin - rect.bottom;
    }

    if (correctionX === 0 && correctionY === 0) {
        return;
    }

    const currentX =
        parseFloat(this.window.dataset.x) || 0;

    const currentY =
        parseFloat(this.window.dataset.y) || 0;

    const nextX = currentX + correctionX;
    const nextY = currentY + correctionY;

    this.window.dataset.x = String(nextX);
    this.window.dataset.y = String(nextY);

    this.window.style.transform =
        `translate(${nextX}px, ${nextY}px)`;

    localStorage.setItem("chat_x", String(nextX));
    localStorage.setItem("chat_y", String(nextY));
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
