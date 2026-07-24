class ChatWidget {

 constructor() {

    console.log("Constructor");

    this.API = "https://jamicat.ahrly.workers.dev";

  this.socket = null;
this.reconnectTimer = null;

    this.messages = null;

    this.window = null;

    this.nameInput = null;

    this.messageInput = null;

    this.sendButton = null;

    this.avatar = "default";

    this.createWindow();

    console.log("Window created");

    this.restoreSettings();

    this.setupNameSaving();

    this.setupDragging();

    this.loadHistory();

    console.log("Calling connect");

    this.connect();

}

    createWindow() {

        const windowElement = document.createElement("div");

        windowElement.id = "chatWindow";

        windowElement.innerHTML = `

            <div id="chatTitleBar">

                <span id="chatTitle">
                    LIVE CHAT
                </span>

            </div>

            <div id="chatMessages">

            </div>

            <div id="chatControls">

                <input
                    id="chatName"
                    maxlength="20"
                    placeholder="Name">

                <input
                    id="chatMessage"
                    maxlength="250"
                    placeholder="Type a message...">

                <button id="chatSend">
                    Send
                </button>

            </div>

        `;

        document.body.appendChild(windowElement);

        this.window = windowElement;

       this.messages =
    this.window.querySelector("#chatMessages");

this.nameInput =
    this.window.querySelector("#chatName");

this.messageInput =
    this.window.querySelector("#chatMessage");

this.sendButton =
    this.window.querySelector("#chatSend");
		
		this.sendButton.addEventListener(
    "click",
    () => this.sendMessage()
);

this.messageInput.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter")
            this.sendMessage();

    }
);

    }

async loadHistory() {

    const res = await fetch(`${this.API}/api/chat`);

    const messages = await res.json();

    this.messages.innerHTML = "";

    for (const message of messages)
        this.addMessage(message);

}

addMessage(message) {

    const div = document.createElement("div");

    div.className = "chatMessage";

    div.innerHTML = `
        <div class="chatMessageHeader">
            <strong>${message.name}</strong>

            <span class="chatTime">
                ${new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            </span>
        </div>

        <div class="chatText">
            ${message.message}
        </div>
    `;

    this.messages.appendChild(div);

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

    const name =
        this.nameInput.value.trim();

    const message =
        this.messageInput.value.trim();

    if (!name || !message)
        return;

    this.sendButton.disabled = true;

    try {

        await fetch(`${this.API}/api/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                name,

                message

            })

        });

        this.messageInput.value = "";

        this.messageInput.focus();

    }

    finally {

        this.sendButton.disabled = false;

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

        allowFrom: "#chatTitleBar",

        listeners: {

            move(event) {

                const target = event.target;

                let x = parseFloat(target.dataset.x) || 0;
                let y = parseFloat(target.dataset.y) || 0;

                x += event.dx;
                y += event.dy;

                target.style.transform =
                    `translate(${x}px, ${y}px)`;

                target.dataset.x = x;
                target.dataset.y = y;

            },

            end(event) {

                localStorage.setItem(
                    "chat_x",
                    event.target.dataset.x || 0
                );

                localStorage.setItem(
                    "chat_y",
                    event.target.dataset.y || 0
                );

            }

        }

    });

}
}

window.addEventListener("DOMContentLoaded", () => {

    window.chat = new ChatWidget();

});
