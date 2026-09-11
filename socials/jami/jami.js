(() => {
    "use strict";

    const API = "https://jamicat.ahrly.workers.dev";
    const WS = "wss://jamicat.ahrly.workers.dev/api/test/jami/socket";

    class JamiOS {
        constructor() {
            this.root = null;
            this.socket = null;
            this.reconnectTimer = null;
            this.pingTimer = null;
            this.pingSentAt = null;
            this.latencyMs = null;
            this.networkCreatedAt = null;
            this.users = [];
            this.isOpen = false;
            this.booted = false;
            this.zCounter = 20;
            this.history = [];
            this.historyIndex = 0;
            this.windowPositions = new Map();

            this.clientId =
                localStorage.getItem("chat_client_id") ||
                localStorage.getItem("jami_client_id") ||
                crypto.randomUUID();

            localStorage.setItem("jami_client_id", this.clientId);

            this.sessionId =
                sessionStorage.getItem("jami_session_id") ||
                crypto.randomUUID();

            sessionStorage.setItem("jami_session_id", this.sessionId);

            this.name =
                localStorage.getItem("chat_guest_name") ||
                localStorage.getItem("jami_guest_name") ||
                `guest-${this.clientId.slice(0, 5)}`;

            localStorage.setItem("jami_guest_name", this.name);

            this.currentPath = "/";
            this.currentApp = "desktop";

            this.mount();
        }

        mount() {
            this.root = document.createElement("div");
            this.root.id = "jamiRoot";
            this.root.setAttribute("aria-hidden", "true");

            this.root.innerHTML = `
                <div class="jami-shell">
                    <div class="jami-boot" data-jami-boot hidden>
                        <pre data-jami-boot-text></pre>
                    </div>

                    <div class="jami-desktop" data-jami-desktop>
                        <div class="jami-icons">
                            <button class="jami-icon" type="button" data-jami-open="explorer">
                                <span class="jami-icon-glyph">📁</span>
                                <span class="jami-icon-label">files</span>
                            </button>
                            <button class="jami-icon" type="button" data-jami-open="terminal">
                                <span class="jami-icon-glyph">▣</span>
                                <span class="jami-icon-label">terminal</span>
                            </button>
                            <button class="jami-icon" type="button" data-jami-placeholder="radio">
                                <span class="jami-icon-glyph">📻</span>
                                <span class="jami-icon-label">radio</span>
                            </button>
                            <button class="jami-icon" type="button" data-jami-placeholder="trash">
                                <span class="jami-icon-glyph">🗑</span>
                                <span class="jami-icon-label">trash</span>
                            </button>
                        </div>

                        ${this.windowMarkup("terminal", "terminal", `
                            <div class="jami-terminal jami-window-body">
                                <div class="jami-terminal-output" data-jami-terminal-output></div>
                                <form class="jami-terminal-form" data-jami-terminal-form>
                                    <span class="jami-terminal-prompt" data-jami-terminal-prompt></span>
                                    <input
                                        class="jami-terminal-input"
                                        data-jami-terminal-input
                                        autocomplete="off"
                                        autocapitalize="off"
                                        spellcheck="false"
                                        aria-label="Jami terminal command"
                                    >
                                </form>
                            </div>
                        `, "jami-terminal-window")}

                        ${this.windowMarkup("explorer", "files // /", `
                            <div class="jami-window-body">
                                <div class="jami-explorer-toolbar">/ &nbsp; read-only bootstrap view — shared filesystem arrives in pass 2</div>
                                <div class="jami-explorer-grid">
                                    <div class="jami-file-card">📁 public<small>communal files</small></div>
                                    <div class="jami-file-card">📁 system<small>owner: jami</small></div>
                                    <div class="jami-file-card">📁 programs<small>installed software</small></div>
                                    <div class="jami-file-card">📁 trash<small>recoverable items</small></div>
                                    <div class="jami-file-card">📄 motd.txt<small>owner: jami</small></div>
                                </div>
                            </div>
                        `, "jami-explorer-window")}
                    </div>

                    <div class="jami-taskbar">
                        <button class="jami-task-button" type="button" data-jami-open="terminal">terminal</button>
                        <button class="jami-task-button" type="button" data-jami-open="explorer">files</button>
                        <div class="jami-task-spacer"></div>
                        <span class="jami-network-status" data-jami-network>offline</span>
                        <span class="jami-clock" data-jami-clock>--:--</span>
                        <button class="jami-task-button" type="button" data-jami-exit>exit jami</button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.root);

            this.output = this.root.querySelector("[data-jami-terminal-output]");
            this.input = this.root.querySelector("[data-jami-terminal-input]");
            this.prompt = this.root.querySelector("[data-jami-terminal-prompt]");
            this.networkLabel = this.root.querySelector("[data-jami-network]");
            this.clockLabel = this.root.querySelector("[data-jami-clock]");

            document
                .getElementById("jamiLauncher")
                ?.addEventListener("click", () => this.open());

            this.root.querySelectorAll("[data-jami-open]").forEach(button => {
                button.addEventListener("dblclick", () => {
                    this.openWindow(button.dataset.jamiOpen);
                });

                button.addEventListener("click", () => {
                    if (button.classList.contains("jami-task-button")) {
                        this.openWindow(button.dataset.jamiOpen);
                    }
                });
            });

            this.root.querySelectorAll("[data-jami-placeholder]").forEach(button => {
                button.addEventListener("dblclick", () => {
                    const app = button.dataset.jamiPlaceholder;
                    this.openWindow("terminal");
                    this.write(`${app}: application package not installed yet`, "warn");
                });
            });

            this.root.querySelectorAll("[data-jami-close]").forEach(button => {
                button.addEventListener("click", () => {
                    this.closeWindow(button.dataset.jamiClose);
                });
            });

            this.root
                .querySelector("[data-jami-exit]")
                ?.addEventListener("click", () => this.close());

            this.root
                .querySelector("[data-jami-terminal-form]")
                ?.addEventListener("submit", event => {
                    event.preventDefault();
                    this.runCommand(this.input.value);
                    this.input.value = "";
                });

            this.input?.addEventListener("keydown", event => {
                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    this.navigateHistory(-1);
                } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    this.navigateHistory(1);
                }
            });

            this.setupDragging();
            this.updatePrompt();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);

            window.addEventListener("beforeunload", () => {
                this.socket?.close(1000, "page closing");
            });

            window.jami = {
                open: () => this.open(),
                close: () => this.close(),
                terminal: () => {
                    this.open();
                    this.openWindow("terminal");
                }
            };
        }

        windowMarkup(id, title, body, extraClass = "") {
            return `
                <section class="jami-window ${extraClass}" data-jami-window="${id}" hidden>
                    <div class="jami-window-titlebar" data-jami-drag-handle>
                        <span class="jami-window-title">${title}</span>
                        <button class="jami-window-close" type="button" data-jami-close="${id}" aria-label="Close ${title}">×</button>
                    </div>
                    ${body}
                </section>
            `;
        }

        async open() {
            this.root.classList.add("jami-open");
            this.root.setAttribute("aria-hidden", "false");
            this.isOpen = true;

            if (!this.booted) {
                await this.boot();
                this.booted = true;
            }

            this.connect();
            this.openWindow("terminal");
        }

        close() {
            this.isOpen = false;
            this.root.classList.remove("jami-open");
            this.root.setAttribute("aria-hidden", "true");
            this.setActivity("/", "desktop");
        }

        async boot() {
            const boot = this.root.querySelector("[data-jami-boot]");
            const text = this.root.querySelector("[data-jami-boot-text]");
            boot.hidden = false;

            const lines = [
                "JAMI NETWORK SYSTEM",
                "",
                "memory test ........ ok",
                "display ............ ok",
                "session ............ " + this.sessionId.slice(0, 8),
                "network ............ connecting",
                "mounting /public ... deferred",
                "",
                `welcome, ${this.name}.`
            ];

            text.textContent = "";

            for (const line of lines) {
                text.textContent += `${line}\n`;
                await new Promise(resolve => setTimeout(resolve, 85));
            }

            await new Promise(resolve => setTimeout(resolve, 260));
            boot.hidden = true;

            this.write("Jami 0.1 // test network", "ok");
            this.write("type 'help' for available commands", "muted");
            this.write("");
        }

        connect() {
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
            this.setNetworkLabel("connecting…");
            this.socket = new WebSocket(WS);

            this.socket.addEventListener("open", () => {
                this.setNetworkLabel("online");
                this.sendIdentify();
                this.startPings();
            });

            this.socket.addEventListener("message", event => {
                let packet;

                try {
                    packet = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (packet.type === "jami-connected") {
                    this.networkCreatedAt = Number(packet.networkCreatedAt) || null;
                    return;
                }

                if (packet.type === "jami-presence") {
                    this.users = Array.isArray(packet.users) ? packet.users : [];
                    this.networkCreatedAt = Number(packet.networkCreatedAt) || this.networkCreatedAt;
                    this.setNetworkLabel(`${this.users.length} connected`);
                    return;
                }

                if (packet.type === "pong") {
                    if (Number.isFinite(Number(packet.sentAt))) {
                        this.latencyMs = Math.max(0, Date.now() - Number(packet.sentAt));
                        this.setNetworkLabel(
                            `${this.users.length} connected // ${this.latencyMs}ms`
                        );
                    }
                }
            });

            this.socket.addEventListener("close", () => {
                this.stopPings();
                this.setNetworkLabel("offline");

                if (this.isOpen) {
                    this.reconnectTimer = setTimeout(() => this.connect(), 1800);
                }
            });

            this.socket.addEventListener("error", () => {
                this.setNetworkLabel("network error");
            });
        }

        sendIdentify() {
            this.send({
                type: "jami-identify",
                clientId: this.clientId,
                sessionId: this.sessionId,
                name: this.name,
                path: this.currentPath,
                app: this.currentApp
            });
        }

        setActivity(path, app) {
            this.currentPath = path || "/";
            this.currentApp = app || "desktop";

            this.send({
                type: "jami-activity",
                path: this.currentPath,
                app: this.currentApp
            });
        }

        send(packet) {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(packet));
            }
        }

        startPings() {
            this.stopPings();
            this.pingTimer = setInterval(() => {
                const sentAt = Date.now();
                this.pingSentAt = sentAt;
                this.send({ type: "ping", sentAt });
            }, 5000);
        }

        stopPings() {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }

        setNetworkLabel(text) {
            if (this.networkLabel) {
                this.networkLabel.textContent = text;
            }
        }

        updateClock() {
            if (!this.clockLabel) {
                return;
            }

            this.clockLabel.textContent = new Intl.DateTimeFormat(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }).format(new Date());
        }

        openWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);

            if (!win) {
                return;
            }

            win.hidden = false;
            win.style.zIndex = String(++this.zCounter);

            if (id === "terminal") {
                this.setActivity(this.currentPath, "terminal");
                setTimeout(() => this.input?.focus(), 0);
            } else if (id === "explorer") {
                this.setActivity("/", "explorer");
            }
        }

        closeWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (win) {
                win.hidden = true;
            }
            this.setActivity("/", "desktop");
        }

        setupDragging() {
            this.root.querySelectorAll("[data-jami-window]").forEach(win => {
                const handle = win.querySelector("[data-jami-drag-handle]");
                if (!handle) return;

                let dragging = false;
                let pointerId = null;
                let startX = 0;
                let startY = 0;
                let startLeft = 0;
                let startTop = 0;

                handle.addEventListener("pointerdown", event => {
                    if (window.matchMedia("(max-width: 640px)").matches) {
                        return;
                    }

                    dragging = true;
                    pointerId = event.pointerId;
                    handle.setPointerCapture(pointerId);

                    const rect = win.getBoundingClientRect();
                    startX = event.clientX;
                    startY = event.clientY;
                    startLeft = rect.left;
                    startTop = rect.top;

                    win.style.transform = "none";
                    win.style.left = `${rect.left}px`;
                    win.style.top = `${rect.top}px`;
                    win.style.zIndex = String(++this.zCounter);
                });

                handle.addEventListener("pointermove", event => {
                    if (!dragging || event.pointerId !== pointerId) return;

                    const maxLeft = Math.max(0, window.innerWidth - 120);
                    const maxTop = Math.max(0, window.innerHeight - 70);
                    const left = Math.min(
                        maxLeft,
                        Math.max(0, startLeft + event.clientX - startX)
                    );
                    const top = Math.min(
                        maxTop,
                        Math.max(0, startTop + event.clientY - startY)
                    );

                    win.style.left = `${left}px`;
                    win.style.top = `${top}px`;
                });

                const stop = event => {
                    if (event.pointerId === pointerId) {
                        dragging = false;
                        pointerId = null;
                    }
                };

                handle.addEventListener("pointerup", stop);
                handle.addEventListener("pointercancel", stop);
            });
        }

        updatePrompt() {
            if (this.prompt) {
                this.prompt.textContent = `${this.name}@jami:${this.currentPath}$`;
            }
        }

        write(text = "", type = "") {
            if (!this.output) return;

            const line = document.createElement("div");
            if (type) {
                line.className = `jami-terminal-line-${type}`;
            }
            line.textContent = text;
            this.output.appendChild(line);
            this.output.scrollTop = this.output.scrollHeight;
        }

        navigateHistory(direction) {
            if (this.history.length === 0) return;

            this.historyIndex = Math.min(
                this.history.length,
                Math.max(0, this.historyIndex + direction)
            );

            this.input.value =
                this.historyIndex >= this.history.length
                    ? ""
                    : this.history[this.historyIndex];
        }

        async runCommand(raw) {
            const commandLine = String(raw || "").trim();
            if (!commandLine) return;

            this.write(`${this.name}@jami:${this.currentPath}$ ${commandLine}`);
            this.history.push(commandLine);
            this.history = this.history.slice(-80);
            this.historyIndex = this.history.length;

            const [commandRaw, ...args] = commandLine.split(/\s+/);
            const command = commandRaw.toLowerCase();

            switch (command) {
                case "help":
                    this.write("help clear who users uptime date ps netstat nowplaying open ls ls -a pwd jami exit");
                    this.write("filesystem mutation commands arrive in pass 2", "muted");
                    break;

                case "clear":
                    this.output.textContent = "";
                    break;

                case "who":
                case "users":
                    this.commandWho();
                    break;

                case "uptime":
                    this.commandUptime();
                    break;

                case "date":
                    this.write(new Date().toString());
                    break;

                case "ps":
                    await this.commandPs();
                    break;

                case "netstat":
                    this.commandNetstat();
                    break;

                case "nowplaying":
                    await this.commandNowPlaying();
                    break;

                case "open":
                    this.commandOpen(args[0]);
                    break;

                case "ls":
                    this.commandLs(args);
                    break;

                case "pwd":
                    this.write(this.currentPath);
                    break;

                case "jami":
                    this.write("jami 0.1-test");
                    this.write("networked personal operating environment");
                    this.write(`session ${this.sessionId}`);
                    break;

                case "exit":
                case "logout":
                    this.close();
                    break;

                case "chat":
                    this.write("chat: package reserved for pass 5", "warn");
                    break;

                case "radio":
                    this.write("radio: no signal (application arrives later)", "warn");
                    break;

                default:
                    this.write(`${command}: command not found`, "warn");
            }
        }

        commandWho() {
            if (this.users.length === 0) {
                this.write("no identified jami sessions");
                return;
            }

            this.write(`${this.users.length} user${this.users.length === 1 ? "" : "s"} connected`, "ok");
            this.write("");

            for (const user of this.users) {
                const you = user.sessionId === this.sessionId ? " (you)" : "";
                this.write(
                    `${String(user.name).padEnd(18)} ${String(user.path || "/").padEnd(18)} ${user.app || "desktop"}${you}`
                );
            }
        }

        commandUptime() {
            if (!this.networkCreatedAt) {
                this.write("network epoch unavailable", "warn");
                return;
            }

            const elapsed = Math.max(0, Date.now() - this.networkCreatedAt);
            const days = Math.floor(elapsed / 86400000);
            const hours = Math.floor((elapsed % 86400000) / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);

            this.write(`jami network: ${days}d ${hours}h ${minutes}m`);
        }

        async commandPs() {
            let watch = null;
            try {
                const response = await fetch(`${API}/api/watchparty`);
                const data = await response.json();
                watch = data?.state || null;
            } catch {}

            this.write("PID   PROCESS          STATE");
            this.write("001   jami.kernel      running");
            this.write("014   jami.network     connected");
            this.write(`027   jami.sessions    ${this.users.length} online`);
            this.write(`031   watch-party      ${watch?.enabled ? "running" : "sleeping"}`);
            this.write("044   radio            not installed");
        }

        commandNetstat() {
            const state =
                this.socket?.readyState === WebSocket.OPEN
                    ? "ESTABLISHED"
                    : "CLOSED";

            this.write("PROTO  ENDPOINT                              STATE");
            this.write(`wss    /api/test/jami/socket                 ${state}`);
            this.write(`rtt    ${this.latencyMs == null ? "unknown" : `${this.latencyMs} ms`}`);
            this.write(`peers  ${this.users.length}`);
        }

        async commandNowPlaying() {
            this.write("querying watch party…", "muted");

            try {
                const response = await fetch(`${API}/api/watchparty`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                const state = data?.state || {};
                const queue = Array.isArray(data?.queue) ? data.queue : [];
                const item = queue[state.currentIndex] ||
                    queue.find(entry => entry.videoId === state.currentVideoId);

                if (!state.enabled || !state.currentVideoId) {
                    this.write("watch party: inactive");
                    return;
                }

                this.write("WATCH PARTY", "ok");
                this.write(`title       ${item?.title || state.currentVideoId}`);
                this.write(`requested   ${item?.requestedByName || "unknown"}`);
                this.write(`state       ${state.paused ? "paused" : "playing"}`);

                if (state.startedAt) {
                    const seconds = state.paused && state.pausedAt
                        ? Math.max(0, (Number(state.pausedAt) - Number(state.startedAt)) / 1000)
                        : Math.max(0, (Date.now() - Number(state.startedAt)) / 1000);
                    this.write(`position    ${this.formatTime(seconds)}`);
                }
            } catch (error) {
                this.write(`watch party query failed: ${error.message}`, "warn");
            }
        }

        commandOpen(target) {
            const value = String(target || "").toLowerCase();

            if (["terminal", "term"].includes(value)) {
                this.openWindow("terminal");
            } else if (["files", "explorer", "/"].includes(value)) {
                this.openWindow("explorer");
            } else if (!value) {
                this.write("usage: open <terminal|files>");
            } else {
                this.write(`${target}: application or file not found`, "warn");
            }
        }

        commandLs(args) {
            const all = args.includes("-a");
            const visible = ["public/", "system/", "programs/", "trash/", "motd.txt"];
            const hidden = [".cache/", ".lost/"];

            this.write((all ? ["./", "../", ...hidden, ...visible] : visible).join("  "));
            if (all) {
                this.write("note: bootstrap entries are read-only until pass 2", "muted");
            }
        }

        formatTime(seconds) {
            const total = Math.max(0, Math.floor(Number(seconds) || 0));
            const minutes = Math.floor(total / 60);
            const remainder = total % 60;
            return `${minutes}:${String(remainder).padStart(2, "0")}`;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => new JamiOS(), { once: true });
    } else {
        new JamiOS();
    }
})();
