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
            this.latencyMs = null;
            this.networkCreatedAt = null;
            this.users = [];
            this.isOpen = false;
            this.booted = false;
            this.zCounter = 20;
            this.history = [];
            this.historyIndex = 0;
            this.currentPath = "/";
            this.currentApp = "desktop";
            this.explorerPath = "/";
            this.explorerShowHidden = false;
            this.explorerItems = [];
            this.notepadPath = null;
            this.notepadRevision = null;

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

            this.mount();
        }

        mount() {
            this.root = document.createElement("div");
            this.root.id = "jamiRoot";
            this.root.setAttribute("aria-hidden", "true");
            this.root.innerHTML = `
                <div class="jami-shell">
                    <div class="jami-boot" data-jami-boot hidden><pre data-jami-boot-text></pre></div>

                    <div class="jami-desktop" data-jami-desktop>
                        <div class="jami-icons">
                            <button class="jami-icon" type="button" data-jami-open="explorer"><span class="jami-icon-glyph">📁</span><span class="jami-icon-label">files</span></button>
                            <button class="jami-icon" type="button" data-jami-open="terminal"><span class="jami-icon-glyph">▣</span><span class="jami-icon-label">terminal</span></button>
                            <button class="jami-icon" type="button" data-jami-placeholder="radio"><span class="jami-icon-glyph">📻</span><span class="jami-icon-label">radio</span></button>
                            <button class="jami-icon" type="button" data-jami-open-trash><span class="jami-icon-glyph">🗑</span><span class="jami-icon-label">trash</span></button>
                        </div>

                        ${this.windowMarkup("terminal", "terminal", `
                            <div class="jami-terminal jami-window-body">
                                <div class="jami-terminal-output" data-jami-terminal-output></div>
                                <form class="jami-terminal-form" data-jami-terminal-form>
                                    <span class="jami-terminal-prompt" data-jami-terminal-prompt></span>
                                    <input class="jami-terminal-input" data-jami-terminal-input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Jami terminal command">
                                </form>
                            </div>
                        `, "jami-terminal-window")}

                        ${this.windowMarkup("explorer", "files", `
                            <div class="jami-window-body jami-explorer-body">
                                <div class="jami-explorer-toolbar">
                                    <button type="button" data-jami-explorer-up>↑</button>
                                    <button type="button" data-jami-explorer-refresh>↻</button>
                                    <button type="button" data-jami-new-text>+ txt</button>
                                    <button type="button" data-jami-new-folder>+ folder</button>
                                    <button type="button" data-jami-toggle-hidden>ls -a</button>
                                    <span data-jami-explorer-path>/</span>
                                </div>
                                <div class="jami-quota" data-jami-quota></div>
                                <div class="jami-explorer-grid" data-jami-explorer-grid></div>
                                <div class="jami-explorer-status" data-jami-explorer-status>ready</div>
                            </div>
                        `, "jami-explorer-window")}

                        ${this.windowMarkup("notepad", "notepad", `
                            <div class="jami-window-body jami-notepad-body">
                                <div class="jami-notepad-meta" data-jami-notepad-meta>no file open</div>
                                <textarea class="jami-notepad-editor" data-jami-notepad-editor spellcheck="false"></textarea>
                                <div class="jami-notepad-actions">
                                    <span data-jami-notepad-status></span>
                                    <button type="button" data-jami-notepad-save>save</button>
                                </div>
                            </div>
                        `, "jami-notepad-window")}
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
            this.explorerGrid = this.root.querySelector("[data-jami-explorer-grid]");
            this.explorerPathLabel = this.root.querySelector("[data-jami-explorer-path]");
            this.explorerStatus = this.root.querySelector("[data-jami-explorer-status]");
            this.quotaLabel = this.root.querySelector("[data-jami-quota]");
            this.notepadEditor = this.root.querySelector("[data-jami-notepad-editor]");
            this.notepadMeta = this.root.querySelector("[data-jami-notepad-meta]");
            this.notepadStatus = this.root.querySelector("[data-jami-notepad-status]");

            document.getElementById("jamiLauncher")?.addEventListener("click", () => this.open());

            this.root.querySelectorAll("[data-jami-open]").forEach(button => {
                button.addEventListener("dblclick", () => this.openWindow(button.dataset.jamiOpen));
                button.addEventListener("click", () => {
                    if (button.classList.contains("jami-task-button")) this.openWindow(button.dataset.jamiOpen);
                });
            });

            this.root.querySelector("[data-jami-open-trash]")?.addEventListener("dblclick", () => {
                this.openWindow("explorer");
                this.loadExplorer("/trash");
            });

            this.root.querySelectorAll("[data-jami-placeholder]").forEach(button => {
                button.addEventListener("dblclick", () => {
                    this.openWindow("terminal");
                    this.write(`${button.dataset.jamiPlaceholder}: application package not installed yet`, "warn");
                });
            });

            this.root.querySelectorAll("[data-jami-close]").forEach(button => {
                button.addEventListener("click", () => this.closeWindow(button.dataset.jamiClose));
            });

            this.root.querySelector("[data-jami-exit]")?.addEventListener("click", () => this.close());
            this.root.querySelector("[data-jami-terminal-form]")?.addEventListener("submit", event => {
                event.preventDefault();
                this.runCommand(this.input.value);
                this.input.value = "";
            });

            this.input?.addEventListener("keydown", event => {
                if (event.key === "ArrowUp") { event.preventDefault(); this.navigateHistory(-1); }
                if (event.key === "ArrowDown") { event.preventDefault(); this.navigateHistory(1); }
            });

            this.root.querySelector("[data-jami-explorer-up]")?.addEventListener("click", () => this.loadExplorer(this.parentPath(this.explorerPath)));
            this.root.querySelector("[data-jami-explorer-refresh]")?.addEventListener("click", () => this.loadExplorer(this.explorerPath));
            this.root.querySelector("[data-jami-toggle-hidden]")?.addEventListener("click", () => {
                this.explorerShowHidden = !this.explorerShowHidden;
                this.loadExplorer(this.explorerPath);
            });
            this.root.querySelector("[data-jami-new-text]")?.addEventListener("click", () => this.promptCreate("text"));
            this.root.querySelector("[data-jami-new-folder]")?.addEventListener("click", () => this.promptCreate("folder"));
            this.root.querySelector("[data-jami-notepad-save]")?.addEventListener("click", () => this.saveNotepad());

            this.setupDragging();
            this.updatePrompt();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);

            window.addEventListener("beforeunload", () => this.socket?.close(1000, "page closing"));
            window.jami = { open: () => this.open(), close: () => this.close(), terminal: () => { this.open(); this.openWindow("terminal"); } };
        }

        windowMarkup(id, title, body, extraClass = "") {
            return `<section class="jami-window ${extraClass}" data-jami-window="${id}" hidden><div class="jami-window-titlebar" data-jami-drag-handle><span class="jami-window-title" data-jami-title="${id}">${title}</span><button class="jami-window-close" type="button" data-jami-close="${id}" aria-label="Close ${title}">×</button></div>${body}</section>`;
        }

        async open() {
            this.root.classList.add("jami-open");
            this.root.setAttribute("aria-hidden", "false");
            this.isOpen = true;
            if (!this.booted) { await this.boot(); this.booted = true; }
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
                "JAMI NETWORK SYSTEM", "", "memory test ........ ok", "display ............ ok",
                `session ............ ${this.sessionId.slice(0, 8)}`,
                "network ............ connecting", "mounting /public ... ok", "filesystem ......... shared", "",
                `welcome, ${this.name}.`
            ];
            text.textContent = "";
            for (const line of lines) { text.textContent += `${line}\n`; await new Promise(resolve => setTimeout(resolve, 75)); }
            await new Promise(resolve => setTimeout(resolve, 200));
            boot.hidden = true;
            this.write("Jami 0.2 // shared filesystem online", "ok");
            this.write("type 'help' for available commands", "muted");
            this.write("");
        }

        connect() {
            if (this.socket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.socket.readyState)) return;
            clearTimeout(this.reconnectTimer);
            this.setNetworkLabel("connecting…");
            this.socket = new WebSocket(WS);

            this.socket.addEventListener("open", () => { this.setNetworkLabel("online"); this.sendIdentify(); this.startPings(); });
            this.socket.addEventListener("message", event => {
                let packet;
                try { packet = JSON.parse(event.data); } catch { return; }
                if (packet.type === "jami-connected") { this.networkCreatedAt = Number(packet.networkCreatedAt) || null; return; }
                if (packet.type === "jami-presence") {
                    this.users = Array.isArray(packet.users) ? packet.users : [];
                    this.networkCreatedAt = Number(packet.networkCreatedAt) || this.networkCreatedAt;
                    this.setNetworkLabel(`${this.users.length} connected`);
                    return;
                }
                if (packet.type === "pong") {
                    if (Number.isFinite(Number(packet.sentAt))) {
                        this.latencyMs = Math.max(0, Date.now() - Number(packet.sentAt));
                        this.setNetworkLabel(`${this.users.length} connected // ${this.latencyMs}ms`);
                    }
                    return;
                }
                if (packet.type === "jami-filesystem-changed") {
                    if (this.isWindowOpen("explorer")) this.loadExplorer(this.explorerPath, false);
                    if (this.notepadPath && packet.node?.path === this.notepadPath && packet.action === "write") {
                        this.notepadStatus.textContent = "changed by another visitor — reopen before saving";
                        this.notepadStatus.classList.add("jami-warning");
                    }
                }
            });

            this.socket.addEventListener("close", () => {
                this.stopPings(); this.setNetworkLabel("offline");
                if (this.isOpen) this.reconnectTimer = setTimeout(() => this.connect(), 1800);
            });
            this.socket.addEventListener("error", () => this.setNetworkLabel("network error"));
        }

        sendIdentify() { this.send({ type: "jami-identify", clientId: this.clientId, sessionId: this.sessionId, name: this.name, path: this.currentPath, app: this.currentApp }); }
        setActivity(path, app) { this.currentPath = path || "/"; this.currentApp = app || "desktop"; this.updatePrompt(); this.send({ type: "jami-activity", path: this.currentPath, app: this.currentApp }); }
        send(packet) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(packet)); }
        startPings() { this.stopPings(); this.pingTimer = setInterval(() => { const sentAt = Date.now(); this.send({ type: "ping", sentAt }); }, 5000); }
        stopPings() { clearInterval(this.pingTimer); this.pingTimer = null; }
        setNetworkLabel(text) { if (this.networkLabel) this.networkLabel.textContent = text; }
        updateClock() { if (this.clockLabel) this.clockLabel.textContent = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()); }
        isWindowOpen(id) { return !this.root.querySelector(`[data-jami-window="${id}"]`)?.hidden; }

        openWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (!win) return;
            win.hidden = false;
            win.style.zIndex = String(++this.zCounter);
            if (id === "terminal") { this.setActivity(this.currentPath, "terminal"); setTimeout(() => this.input?.focus(), 0); }
            if (id === "explorer") { this.setActivity(this.explorerPath, "explorer"); this.loadExplorer(this.explorerPath); }
            if (id === "notepad") this.setActivity(this.notepadPath || this.currentPath, "notepad");
        }

        closeWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (win) win.hidden = true;
            this.setActivity("/", "desktop");
        }

        setupDragging() {
            this.root.querySelectorAll("[data-jami-window]").forEach(win => {
                const handle = win.querySelector("[data-jami-drag-handle]");
                if (!handle) return;
                let dragging = false, pointerId = null, startX = 0, startY = 0, startLeft = 0, startTop = 0;
                handle.addEventListener("pointerdown", event => {
                    if (window.matchMedia("(max-width: 640px)").matches) return;
                    dragging = true; pointerId = event.pointerId; handle.setPointerCapture(pointerId);
                    const rect = win.getBoundingClientRect();
                    startX = event.clientX; startY = event.clientY; startLeft = rect.left; startTop = rect.top;
                    win.style.transform = "none"; win.style.left = `${rect.left}px`; win.style.top = `${rect.top}px`; win.style.zIndex = String(++this.zCounter);
                });
                handle.addEventListener("pointermove", event => {
                    if (!dragging || event.pointerId !== pointerId) return;
                    const left = Math.min(Math.max(0, window.innerWidth - 120), Math.max(0, startLeft + event.clientX - startX));
                    const top = Math.min(Math.max(0, window.innerHeight - 70), Math.max(0, startTop + event.clientY - startY));
                    win.style.left = `${left}px`; win.style.top = `${top}px`;
                });
                const stop = event => { if (event.pointerId === pointerId) { dragging = false; pointerId = null; } };
                handle.addEventListener("pointerup", stop); handle.addEventListener("pointercancel", stop);
            });
        }

        updatePrompt() { if (this.prompt) this.prompt.textContent = `${this.name}@jami:${this.currentPath}$`; }
        write(text = "", type = "") { if (!this.output) return; const line = document.createElement("div"); if (type) line.className = `jami-terminal-line-${type}`; line.textContent = text; this.output.appendChild(line); this.output.scrollTop = this.output.scrollHeight; }
        navigateHistory(direction) { if (!this.history.length) return; this.historyIndex = Math.min(this.history.length, Math.max(0, this.historyIndex + direction)); this.input.value = this.historyIndex >= this.history.length ? "" : this.history[this.historyIndex]; }

        async api(path, options = {}) {
            const response = await fetch(`${API}${path}`, options);
            let data = null;
            try { data = await response.json(); } catch {}
            if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
            return data;
        }

        resolveClientPath(raw = ".", base = this.currentPath) {
            const source = String(raw || ".");
            const combined = source.startsWith("/") ? source : `${base === "/" ? "" : base}/${source}`;
            const parts = [];
            for (const part of combined.split("/")) {
                if (!part || part === ".") continue;
                if (part === "..") parts.pop(); else parts.push(part);
            }
            return `/${parts.join("/")}` || "/";
        }
        parentPath(path) { const clean = this.resolveClientPath(path, "/"); if (clean === "/") return "/"; const parts = clean.split("/").filter(Boolean); parts.pop(); return `/${parts.join("/")}` || "/"; }
        baseName(path) { return this.resolveClientPath(path, "/").split("/").filter(Boolean).pop() || "/"; }

        async loadExplorer(path = this.explorerPath, announce = true) {
            const resolved = this.resolveClientPath(path, "/");
            if (announce && this.explorerStatus) this.explorerStatus.textContent = "reading directory…";
            try {
                const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(resolved)}&all=${this.explorerShowHidden ? "1" : "0"}`);
                this.explorerPath = data.path;
                this.explorerItems = data.items || [];
                this.explorerPathLabel.textContent = this.explorerPath;
                this.root.querySelector('[data-jami-title="explorer"]').textContent = `files // ${this.explorerPath}`;
                this.renderExplorer();
                await this.loadQuota();
                if (this.explorerStatus) this.explorerStatus.textContent = `${this.explorerItems.length} item${this.explorerItems.length === 1 ? "" : "s"}`;
                this.setActivity(this.explorerPath, "explorer");
            } catch (error) {
                if (this.explorerStatus) this.explorerStatus.textContent = error.message;
            }
        }

        renderExplorer() {
            this.explorerGrid.textContent = "";
            if (!this.explorerItems.length) {
                const empty = document.createElement("div"); empty.className = "jami-empty-folder"; empty.textContent = "this folder is empty"; this.explorerGrid.appendChild(empty); return;
            }

            for (const item of this.explorerItems) {
                const card = document.createElement("button");
                card.type = "button";
                card.className = "jami-file-card";
                card.dataset.id = item.id;
                const glyph = item.kind === "folder" ? (item.path === "/trash" ? "🗑" : "📁") : "📄";
                card.innerHTML = `<span class="jami-file-glyph">${glyph}</span><span class="jami-file-name"></span><small></small>`;
                card.querySelector(".jami-file-name").textContent = item.name;
                card.querySelector("small").textContent = item.system ? "owner: jami" : `${item.size || 0} bytes · r${item.revision}`;
                if (item.hidden) card.classList.add("jami-hidden-file");
                if (item.system) card.classList.add("jami-system-file");

                card.addEventListener("dblclick", () => {
                    if (this.explorerPath === "/trash" && item.trashed) {
                        this.restoreById(item.id);
                    } else if (item.kind === "folder") {
                        this.loadExplorer(item.path);
                    } else {
                        this.openTextFile(item.path);
                    }
                });

                card.addEventListener("contextmenu", event => {
                    event.preventDefault();
                    this.fileContextAction(item);
                });

                this.explorerGrid.appendChild(card);
            }
        }

        async loadQuota() {
            try {
                const data = await this.api(`/api/test/jami/fs/quota?sessionId=${encodeURIComponent(this.sessionId)}`);
                const q = data.quota;
                this.quotaLabel.textContent = `visit allowance: txt ${q.files}/${q.limits.files} · folders ${q.folders}/${q.limits.folders} · ${q.storageBytes}/${q.limits.storageBytes} bytes`;
            } catch { this.quotaLabel.textContent = "visit allowance unavailable"; }
        }

        async promptCreate(kind) {
            if (!this.explorerPath.startsWith("/public")) {
                this.explorerStatus.textContent = "permission denied: create inside /public";
                return;
            }
            const suggested = kind === "folder" ? "new-folder" : "note.txt";
            const nodeName = window.prompt(`Create ${kind} in ${this.explorerPath}:`, suggested);
            if (!nodeName) return;
            try {
                await this.api("/api/test/jami/fs/create", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: this.sessionId, name: this.name, parentPath: this.explorerPath, nodeName, kind })
                });
                await this.loadExplorer(this.explorerPath);
            } catch (error) { this.explorerStatus.textContent = error.message; }
        }

        async fileContextAction(item) {
            if (item.system) { this.explorerStatus.textContent = "permission denied: owner is jami"; return; }
            const action = window.prompt(`Action for ${item.name}: rename / move / trash`, "rename");
            if (!action) return;
            try {
                if (action.toLowerCase() === "trash") {
                    await this.trashPath(item.path);
                } else if (action.toLowerCase() === "rename") {
                    const newName = window.prompt("New name:", item.name);
                    if (!newName) return;
                    await this.movePath(item.path, this.explorerPath, newName);
                } else if (action.toLowerCase() === "move") {
                    const destinationPath = window.prompt("Destination folder:", "/public");
                    if (!destinationPath) return;
                    await this.movePath(item.path, destinationPath, item.name);
                }
            } catch (error) { this.explorerStatus.textContent = error.message; }
        }

        async openTextFile(path) {
            try {
                const data = await this.api(`/api/test/jami/fs/read?path=${encodeURIComponent(path)}`);
                this.notepadPath = data.node.path;
                this.notepadRevision = data.node.revision;
                this.notepadEditor.value = data.content || "";
                this.notepadEditor.readOnly = data.node.system === true;
                this.notepadMeta.textContent = `${data.node.path} · owner ${data.node.owner} · revision ${data.node.revision} · ${data.node.size} bytes${data.node.system ? " · read-only" : ""}`;
                this.notepadStatus.textContent = data.node.system ? "system file" : "ready";
                this.notepadStatus.classList.remove("jami-warning");
                this.root.querySelector('[data-jami-title="notepad"]').textContent = `notepad // ${data.node.name}`;
                this.openWindow("notepad");
            } catch (error) { this.write(`${path}: ${error.message}`, "warn"); }
        }

        async saveNotepad() {
            if (!this.notepadPath || this.notepadEditor.readOnly) { this.notepadStatus.textContent = "permission denied"; return; }
            this.notepadStatus.textContent = "saving…";
            try {
                const data = await this.api("/api/test/jami/fs/write", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: this.sessionId, name: this.name, path: this.notepadPath, content: this.notepadEditor.value, expectedRevision: this.notepadRevision })
                });
                this.notepadRevision = data.node.revision;
                this.notepadMeta.textContent = `${data.node.path} · owner ${data.node.owner} · revision ${data.node.revision} · ${data.node.size} bytes`;
                this.notepadStatus.textContent = "saved";
                this.notepadStatus.classList.remove("jami-warning");
            } catch (error) { this.notepadStatus.textContent = error.message; this.notepadStatus.classList.add("jami-warning"); }
        }

        async movePath(sourcePath, destinationPath, newName) {
            const data = await this.api("/api/test/jami/fs/move", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: this.sessionId, name: this.name, sourcePath, destinationPath, newName })
            });
            if (this.isWindowOpen("explorer")) await this.loadExplorer(this.explorerPath);
            return data;
        }

        async trashPath(path) {
            const data = await this.api("/api/test/jami/fs/trash", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: this.sessionId, name: this.name, path })
            });
            if (this.isWindowOpen("explorer")) await this.loadExplorer(this.explorerPath);
            return data;
        }

        async restoreById(id) {
            try {
                await this.api("/api/test/jami/fs/restore", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: this.sessionId, name: this.name, id })
                });
                await this.loadExplorer("/trash");
            } catch (error) { this.explorerStatus.textContent = error.message; }
        }

        async runCommand(raw) {
            const commandLine = String(raw || "").trim(); if (!commandLine) return;
            this.write(`${this.name}@jami:${this.currentPath}$ ${commandLine}`);
            this.history.push(commandLine); this.history = this.history.slice(-80); this.historyIndex = this.history.length;
            const [commandRaw, ...args] = commandLine.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(value => value.replace(/^"|"$/g, "")) || [];
            const command = String(commandRaw || "").toLowerCase();

            try {
                switch (command) {
                    case "help":
                        this.write("help clear who users uptime date ps netstat nowplaying open pwd cd ls ls -a cat stat tree touch mkdir mv rename trash restore quota edit jami exit");
                        this.write("tip: right-click a visitor file in Explorer for rename / move / trash", "muted"); break;
                    case "clear": this.output.textContent = ""; break;
                    case "who": case "users": this.commandWho(); break;
                    case "uptime": this.commandUptime(); break;
                    case "date": this.write(new Date().toString()); break;
                    case "ps": await this.commandPs(); break;
                    case "netstat": this.commandNetstat(); break;
                    case "nowplaying": await this.commandNowPlaying(); break;
                    case "open": await this.commandOpen(args[0]); break;
                    case "pwd": this.write(this.currentPath); break;
                    case "cd": await this.commandCd(args[0] || "/"); break;
                    case "ls": await this.commandLs(args); break;
                    case "cat": await this.commandCat(args[0]); break;
                    case "stat": await this.commandStat(args[0] || "."); break;
                    case "tree": await this.commandTree(args[0] || "."); break;
                    case "touch": await this.commandCreate("text", args[0]); break;
                    case "mkdir": await this.commandCreate("folder", args[0]); break;
                    case "mv": await this.commandMv(args[0], args[1]); break;
                    case "rename": await this.commandRename(args[0], args.slice(1).join(" ")); break;
                    case "trash": await this.commandTrash(args[0]); break;
                    case "restore": await this.commandRestore(args[0]); break;
                    case "quota": await this.commandQuota(); break;
                    case "edit": if (!args[0]) this.write("usage: edit <file>", "warn"); else await this.openTextFile(this.resolveClientPath(args[0])); break;
                    case "jami": this.write("jami 0.2-test"); this.write("shared filesystem protocol 1"); this.write(`session ${this.sessionId}`); break;
                    case "exit": case "logout": this.close(); break;
                    case "chat": this.write("chat: package reserved for a later pass", "warn"); break;
                    case "radio": this.write("radio: no signal (application arrives later)", "warn"); break;
                    default: this.write(`${command}: command not found`, "warn");
                }
            } catch (error) { this.write(error.message, "warn"); }
        }

        commandWho() {
            if (!this.users.length) { this.write("no identified jami sessions"); return; }
            this.write(`${this.users.length} user${this.users.length === 1 ? "" : "s"} connected`, "ok"); this.write("");
            for (const user of this.users) { const you = user.sessionId === this.sessionId ? " (you)" : ""; this.write(`${String(user.name).padEnd(18)} ${String(user.path || "/").padEnd(22)} ${user.app || "desktop"}${you}`); }
        }
        commandUptime() { if (!this.networkCreatedAt) { this.write("network epoch unavailable", "warn"); return; } const elapsed = Math.max(0, Date.now() - this.networkCreatedAt); const days = Math.floor(elapsed / 86400000); const hours = Math.floor((elapsed % 86400000) / 3600000); const minutes = Math.floor((elapsed % 3600000) / 60000); this.write(`jami network: ${days}d ${hours}h ${minutes}m`); }
        async commandPs() { let watch = null, status = null; try { watch = (await (await fetch(`${API}/api/watchparty`)).json())?.state; } catch {} try { status = await this.api("/api/test/jami/status"); } catch {} this.write("PID   PROCESS          STATE"); this.write("001   jami.kernel      running"); this.write("014   jami.network     connected"); this.write(`027   jami.sessions    ${this.users.length} online`); this.write(`031   watch-party      ${watch?.enabled ? "running" : "sleeping"}`); this.write(`038   filesystem       ${status?.filesystem?.nodes ?? "?"} nodes`); this.write("044   radio            not installed"); }
        commandNetstat() { const state = this.socket?.readyState === WebSocket.OPEN ? "ESTABLISHED" : "CLOSED"; this.write("PROTO  ENDPOINT                              STATE"); this.write(`wss    /api/test/jami/socket                 ${state}`); this.write(`rtt    ${this.latencyMs == null ? "unknown" : `${this.latencyMs} ms`}`); this.write(`peers  ${this.users.length}`); }
        async commandNowPlaying() { this.write("querying watch party…", "muted"); const response = await fetch(`${API}/api/watchparty`); if (!response.ok) throw new Error(`HTTP ${response.status}`); const data = await response.json(); const state = data?.state || {}; const queue = Array.isArray(data?.queue) ? data.queue : []; const item = queue[state.currentIndex] || queue.find(entry => entry.videoId === state.currentVideoId); if (!state.enabled || !state.currentVideoId) { this.write("watch party: inactive"); return; } this.write("WATCH PARTY", "ok"); this.write(`title       ${item?.title || state.currentVideoId}`); this.write(`requested   ${item?.requestedByName || "unknown"}`); this.write(`state       ${state.paused ? "paused" : "playing"}`); if (state.startedAt) { const seconds = state.paused && state.pausedAt ? Math.max(0, (Number(state.pausedAt) - Number(state.startedAt)) / 1000) : Math.max(0, (Date.now() - Number(state.startedAt)) / 1000); this.write(`position    ${this.formatTime(seconds)}`); } }

        async commandOpen(target) {
            const value = String(target || "");
            if (["terminal", "term"].includes(value.toLowerCase())) return this.openWindow("terminal");
            if (["files", "explorer"].includes(value.toLowerCase())) return this.openWindow("explorer");
            if (!value) { this.write("usage: open <app|path>"); return; }
            const path = this.resolveClientPath(value);
            try { const data = await this.api(`/api/test/jami/fs/stat?path=${encodeURIComponent(path)}`); if (data.node.kind === "folder") { this.openWindow("explorer"); await this.loadExplorer(path); } else await this.openTextFile(path); } catch { this.write(`${target}: application or file not found`, "warn"); }
        }
        async commandCd(target) { const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/stat?path=${encodeURIComponent(path)}`); if (data.node.kind !== "folder") throw new Error(`${target}: not a directory`); this.setActivity(path, "terminal"); }
        async commandLs(args) { const all = args.includes("-a"); const target = args.find(arg => arg !== "-a") || "."; const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(path)}&all=${all ? "1" : "0"}`); const names = data.items.map(item => `${item.name}${item.kind === "folder" ? "/" : ""}${item.system ? "*" : ""}`); this.write((all ? ["./", "../", ...names] : names).join("  ") || "(empty)"); }
        async commandCat(target) { if (!target) { this.write("usage: cat <file>", "warn"); return; } const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/read?path=${encodeURIComponent(path)}`); data.content.split("\n").forEach(line => this.write(line)); }
        async commandStat(target) { const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/stat?path=${encodeURIComponent(path)}`); const n = data.node; this.write(n.path, "ok"); this.write(`id:          ${n.id}`); this.write(`type:        ${n.kind}`); this.write(`owner:       ${n.owner}${n.system ? " (system)" : ""}`); this.write(`created by:  ${n.createdByName}`); this.write(`created:     ${new Date(n.createdAt).toLocaleString()}`); this.write(`modified:    ${new Date(n.modifiedAt).toLocaleString()}`); this.write(`revision:    ${n.revision} (${data.revisionCount} stored states)`); if (n.kind === "text") this.write(`size:        ${n.size} bytes`); if (Array.isArray(n.previousLocations) && n.previousLocations.length) { this.write("previous locations:"); n.previousLocations.forEach(p => this.write(`  ${p}`)); } }
        async commandTree(target) { const rootPath = this.resolveClientPath(target); const walk = async (path, prefix = "", depth = 0) => { if (depth > 5) return; const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(path)}&all=1`); for (let i = 0; i < data.items.length; i++) { const item = data.items[i], last = i === data.items.length - 1, mark = last ? "└── " : "├── "; this.write(`${prefix}${mark}${item.name}${item.kind === "folder" ? "/" : ""}`); if (item.kind === "folder") await walk(item.path, `${prefix}${last ? "    " : "│   "}`, depth + 1); } }; this.write(rootPath); await walk(rootPath); }
        async commandCreate(kind, target) { if (!target) { this.write(`usage: ${kind === "folder" ? "mkdir" : "touch"} <name>`, "warn"); return; } const full = this.resolveClientPath(target); const parentPath = this.parentPath(full); const nodeName = this.baseName(full); const data = await this.api("/api/test/jami/fs/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: this.sessionId, name: this.name, parentPath, nodeName, kind }) }); this.write(`created ${data.node.path}`, "ok"); }
        async commandMv(source, destination) { if (!source || !destination) { this.write("usage: mv <source> <destination-folder>", "warn"); return; } const sourcePath = this.resolveClientPath(source); const destinationPath = this.resolveClientPath(destination); const data = await this.movePath(sourcePath, destinationPath, this.baseName(sourcePath)); this.write(`moved to ${data.node.path}`, "ok"); }
        async commandRename(source, newName) { if (!source || !newName) { this.write("usage: rename <path> <new-name>", "warn"); return; } const sourcePath = this.resolveClientPath(source); const data = await this.movePath(sourcePath, this.parentPath(sourcePath), newName); this.write(`renamed to ${data.node.path}`, "ok"); }
        async commandTrash(target) { if (!target) { this.write("usage: trash <path>", "warn"); return; } const data = await this.trashPath(this.resolveClientPath(target)); this.write(`${data.node.name} moved to trash`, "ok"); }
        async commandRestore(target) { if (!target) { this.write("usage: restore <name-or-id>", "warn"); return; } const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent("/trash")}&all=1`); const item = data.items.find(entry => entry.id === target || entry.name === target); if (!item) throw new Error("trashed item not found"); const restored = await this.api("/api/test/jami/fs/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: this.sessionId, name: this.name, id: item.id }) }); this.write(`restored ${restored.node.path}`, "ok"); }
        async commandQuota() { const data = await this.api(`/api/test/jami/fs/quota?sessionId=${encodeURIComponent(this.sessionId)}`); const q = data.quota; this.write("SESSION ALLOWANCE", "ok"); this.write(`documents     ${q.files} / ${q.limits.files} created`); this.write(`folders       ${q.folders} / ${q.limits.folders} created`); this.write(`storage       ${q.storageBytes} / ${q.limits.storageBytes} bytes`); this.write("creation allowance resets with a new Jami visit/session", "muted"); }
        formatTime(seconds) { const total = Math.max(0, Math.floor(Number(seconds) || 0)); const minutes = Math.floor(total / 60); const remainder = total % 60; return `${minutes}:${String(remainder).padStart(2, "0")}`; }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => new JamiOS(), { once: true });
    else new JamiOS();
})();
