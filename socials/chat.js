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

    this.avatar =
        localStorage.getItem("chat_avatar") || "default";

 this.createWindow();
this.applyCurrentTheme();
this.restoreSettings();
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
    flex h-[450px] w-[360px] max-w-[calc(100vw-1rem)]
    flex-col overflow-hidden
    rounded-3xl border border-white/15
    bg-black/20 text-white
    shadow-lg backdrop-blur-xl
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

            <span
                id="chatConnectionStatus"
                class="text-[9px] text-white/40"
                aria-live="polite"
            >
                connecting
            </span>
        </div>

        <div
            id="chatMessages"
            class="
                min-h-0 flex-1
                overflow-y-auto
                px-3 py-2
                theme-body text-xs
            "
            aria-live="polite"
        ></div>

        <div
            id="chatControls"
            class="
                flex flex-col gap-2
                border-t border-white/10
                bg-black/10 p-3
            "
        >
            <input
                id="chatName"
                type="text"
                maxlength="20"
                autocomplete="nickname"
                placeholder="name"
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

    this.sendButton.addEventListener(
        "click",
        () => this.sendMessage()
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
    row.className = "chatMessage";

    const name = document.createElement("span");
    name.className = "chatMessageName";
    name.textContent = message.name || "Anonymous";

    const time = document.createElement("span");
    time.className = "chatTime";

    const date = new Date(message.created_at);

    time.textContent = Number.isNaN(date.getTime())
        ? "--:--"
        : date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    const separator = document.createElement("span");
    separator.className = "chatSeparator";
    separator.textContent = "•";

    const text = document.createElement("span");
    text.className = "chatText";
    text.textContent = message.message || "";

row.append(time, name, separator, text);

    this.messages.appendChild(row);
    this.messages.scrollTop = this.messages.scrollHeight;
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
        this.connectionStatus.classList.remove(
            "text-white/40",
            "text-red-300"
        );
        this.connectionStatus.classList.add(
            "text-emerald-300"
        );
    }
});

    this.socket.addEventListener("message", event => {
        /*
         * Ignore optional ping/pong traffic.
         */
        if (event.data === "pong") {
            return;
        }

        try {
            const message = JSON.parse(event.data);

            console.log("Chat WebSocket message:", message);

            this.addMessage(message);
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

    });

}

setupDragging() {
    interact(this.window).draggable({
        allowFrom: ".chat-drag-area",

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

                target.dataset.x = x;
                target.dataset.y = y;
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
