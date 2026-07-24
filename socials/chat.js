class ChatWidget {

 constructor() {

    console.log("Constructor");

    this.API = "https://jamicat.ahrly.workers.dev";

    this.events = null;

    ...

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

            <span>

                ${new Date(message.created_at)
                    .toLocaleTimeString([], {
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

    this.messages.scrollTop =
        this.messages.scrollHeight;

}

connect() {

     console.log("connect() called");

    this.events = new EventSource(
        `${this.API}/api/chat/events`
    );

    console.log("EventSource created");

    this.events.onopen = () => {
        console.log("SSE OPEN");
    };



    this.events.onmessage = event => {

        console.log("SSE MESSAGE:", event.data);

        try {

            const message = JSON.parse(event.data);

            console.log("Parsed:", message);

            this.addMessage(message);

        } catch (err) {

            console.error("Parse error:", err);

        }

    };

    this.events.onerror = event => {

        console.log("SSE ERROR", event);

        this.events.close();

        setTimeout(() => this.connect(), 3000);

    };

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
