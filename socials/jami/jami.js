(() => {
    "use strict";

    const API = "https://jamicat.ahrly.workers.dev";
    const WS = "wss://jamicat.ahrly.workers.dev/api/test/jami/socket";
    const CHAT_WS = "wss://jamicat.ahrly.workers.dev/api/chat/socket";

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
            try {
                this.history = JSON.parse(sessionStorage.getItem("jami_terminal_history") || "[]");
                if (!Array.isArray(this.history)) this.history = [];
            } catch {
                this.history = [];
            }
            this.history = this.history.slice(-100);
            this.historyIndex = this.history.length;
            this.currentPath = "/";
            this.currentApp = "desktop";
            this.explorerPath = "/";
            this.explorerShowHidden = false;
            this.explorerItems = [];
            this.notepadPath = null;
            this.notepadNodeId = null;
            this.notepadRevision = null;
            this.notepadDirty = false;
            this.filePresence = {};
            this.liveEditTimer = null;
            this.iconDragSendAt = 0;
            this.chatMode = false;
            this.chatSocket = null;
            this.chatReconnectTimer = null;
            this.chatSeenMessageIds = new Set();
            this.chatMembers = [];
            this.chatTypingUsers = new Map();
            this.chatTypingTimer = null;
            this.chatReplyTargetId = null;
            this.siteChatElement = null;
            this.siteChatPreviousDisplay = null;
            this.systemEvents = [];
            this.monitorTimer = null;
            this.radioTimer = null;
            this.radioMode = null;
            this.radioWatchParty = null;
            this.radioPlaylist = [];
            this.radioStationIndex = Math.max(0, Number(localStorage.getItem("jami_radio_station_index")) || 0);
            this.radioStationPlaying = true;
            this.radioCurrentVideoId = null;
            this.radioSiteVolume = null;

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

            if (/^whiskers$/i.test(this.name)) {
                this.name = "cat";
            }

            localStorage.setItem("jami_guest_name", this.name);

            this.mount();
        }


        iconSvg(kind, extraClass = "") {
            const icons = {
                files: `<svg viewBox="0 0 64 56" aria-hidden="true"><path class="i-shadow" d="M7 14h18l5-7h20c5 0 8 3 8 8v30c0 5-3 8-8 8H12c-5 0-8-3-8-8V22c0-5 1-8 3-8Z"/><path class="i-main" d="M8 18h18l5-7h18c3 0 5 2 5 5v29c0 3-2 5-5 5H12c-3 0-5-2-5-5V22c0-2 0-3 1-4Z"/><path class="i-accent" d="m13 18 5-8 7 8h14l6-8 6 8Z"/><path class="i-face" d="M20 34h4m16 0h4M28 39c3 2 7 2 10 0"/></svg>`,
                terminal: `<svg viewBox="0 0 64 56" aria-hidden="true"><rect class="i-shadow" x="5" y="7" width="54" height="42" rx="8"/><rect class="i-main" x="7" y="5" width="50" height="40" rx="7"/><path class="i-accent" d="m13 8 7-6 6 6h12l6-6 7 6Z"/><path class="i-face" d="m18 22 7 6-7 6M30 35h15"/><path class="i-detail" d="M7 14h50"/></svg>`,
                chat: `<svg viewBox="0 0 64 56" aria-hidden="true"><path class="i-shadow" d="M7 12c0-5 4-8 9-8h32c5 0 9 3 9 8v25c0 5-4 8-9 8H31L19 54v-9h-3c-5 0-9-3-9-8Z"/><path class="i-main" d="M9 14c0-4 3-7 7-7h32c4 0 7 3 7 7v22c0 4-3 7-7 7H29l-8 7v-7h-5c-4 0-7-3-7-7Z"/><path class="i-accent" d="m15 9 6-7 7 7h9l6-7 6 7Z"/><path class="i-face" d="M20 26h4m16 0h4M27 32c3 3 7 3 10 0"/></svg>`,
                system: `<svg viewBox="0 0 64 56" aria-hidden="true"><rect class="i-shadow" x="7" y="6" width="50" height="44" rx="10"/><rect class="i-main" x="9" y="4" width="46" height="42" rx="9"/><path class="i-accent" d="m15 8 6-6 6 6h10l6-6 6 6Z"/><path class="i-face" d="M17 32h8l4-12 7 19 5-10h8"/><circle class="i-detail-fill" cx="47" cy="17" r="3"/></svg>`,
                radio: `<svg viewBox="0 0 64 56" aria-hidden="true"><path class="i-shadow" d="M7 16h50v34H7z" rx="8"/><rect class="i-main" x="8" y="14" width="48" height="34" rx="8"/><path class="i-accent" d="m14 16 6-9 7 9h10l7-9 6 9Z"/><circle class="i-detail-fill" cx="42" cy="31" r="9"/><circle class="i-cut" cx="42" cy="31" r="4"/><path class="i-face" d="M16 27h15M16 33h11M16 39h8"/><path class="i-detail" d="m23 10 24-7"/></svg>`,
                trash: `<svg viewBox="0 0 64 56" aria-hidden="true"><path class="i-shadow" d="M13 15h38l-4 37H17Z"/><path class="i-main" d="M15 14h34l-4 35H19Z"/><path class="i-accent" d="M12 13h40v7H12zM23 7h18v6H23z"/><path class="i-ear" d="m18 13 5-8 6 8m6 0 6-8 5 8"/><path class="i-face" d="M25 31h3m8 0h3M29 36c2 2 4 2 6 0"/></svg>`,
                text: `<svg viewBox="0 0 56 64" aria-hidden="true"><path class="i-shadow" d="M8 3h28l14 14v41H8Z"/><path class="i-main" d="M6 2h29l13 13v41H6Z"/><path class="i-accent" d="M35 2v14h13Z"/><path class="i-ear" d="m13 15 5-7 6 7m8 0 6-7 5 7"/><path class="i-face" d="M18 27h3m12 0h3M23 32c2 2 5 2 8 0"/><path class="i-detail" d="M14 40h26M14 46h22"/></svg>`
            };
            return `<span class="jami-vector-icon jami-vector-${kind} ${extraClass}" aria-hidden="true">${icons[kind] || icons.text}</span>`;
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
                            <button class="jami-icon jami-app-files" type="button" data-jami-open="explorer">${this.iconSvg("files")}<span class="jami-icon-label">files</span></button>
                            <button class="jami-icon jami-app-terminal" type="button" data-jami-open="terminal">${this.iconSvg("terminal")}<span class="jami-icon-label">terminal</span></button>
                            <button class="jami-icon jami-app-chat" type="button" data-jami-open-chat>${this.iconSvg("chat")}<span class="jami-icon-label">chat</span></button>
                            <button class="jami-icon jami-app-system" type="button" data-jami-open="monitor">${this.iconSvg("system")}<span class="jami-icon-label">system</span></button>
                            <button class="jami-icon jami-app-radio" type="button" data-jami-open="radio">${this.iconSvg("radio")}<span class="jami-icon-label">radio</span></button>
                            <button class="jami-icon jami-app-trash" type="button" data-jami-open-trash>${this.iconSvg("trash")}<span class="jami-icon-label">trash</span></button>
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

                        ${this.windowMarkup("chat", "live chat", `
                            <div class="jami-chat-client jami-window-body">
                                <div class="jami-chat-status" data-jami-chat-status>disconnected</div>
                                <div class="jami-chat-output" data-jami-chat-output></div>
                                <form class="jami-chat-form" data-jami-chat-form>
                                    <span class="jami-chat-prompt">cat@chat&gt;</span>
                                    <input class="jami-chat-input" data-jami-chat-input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Live chat message">
                                </form>
                            </div>
                        `, "jami-chat-window")}

                        ${this.windowMarkup("explorer", "files", `
                            <div class="jami-window-body jami-explorer-body">
                                <div class="jami-explorer-toolbar">
                                    <button type="button" data-jami-explorer-up>↑</button>
                                    <button type="button" data-jami-explorer-refresh>↻</button>
                                    <button type="button" data-jami-new-text>+ txt</button>
                                    <button type="button" data-jami-new-folder>+ folder</button>
                                    <button type="button" data-jami-toggle-hidden>ls -a</button>
                                    <span data-jami-explorer-path>/</span>
                                    <span class="jami-directory-presence" data-jami-directory-presence></span>
                                </div>
                                <div class="jami-quota" data-jami-quota></div>
                                <div class="jami-explorer-grid" data-jami-explorer-grid></div>
                                <div class="jami-explorer-status" data-jami-explorer-status>ready</div>
                            </div>
                        `, "jami-explorer-window")}

                        ${this.windowMarkup("notepad", "notepad", `
                            <div class="jami-window-body jami-notepad-body">
                                <div class="jami-notepad-meta" data-jami-notepad-meta>no file open</div>
                                <div class="jami-notepad-presence" data-jami-notepad-presence>nobody else is reading this file</div>
                                <textarea class="jami-notepad-editor" data-jami-notepad-editor spellcheck="false"></textarea>
                                <div class="jami-notepad-actions">
                                    <span data-jami-notepad-status></span>
                                    <button type="button" data-jami-notepad-history>history</button>
                                    <button type="button" data-jami-notepad-reload>reload</button>
                                    <button type="button" data-jami-notepad-save>save</button>
                                </div>
                                <div class="jami-notepad-history" data-jami-notepad-history-panel hidden></div>
                            </div>
                        `, "jami-notepad-window")}

                        ${this.windowMarkup("radio", "radio", `
                            <div class="jami-window-body jami-radio-body">
                                <div class="jami-radio-modes" role="group" aria-label="Radio source">
                                    <button type="button" data-jami-radio-mode="watchparty"><span>watch party</span><small>shared video</small></button>
                                    <button type="button" data-jami-radio-mode="station"><span>radio station</span><small>playlist</small></button>
                                </div>
                                <div class="jami-radio-state" data-jami-radio-state>checking…</div>
                                <div class="jami-radio-title" data-jami-radio-title>nothing playing</div>
                                <div class="jami-radio-meta" data-jami-radio-meta></div>
                                <div class="jami-radio-player-wrap">
                                    <iframe data-jami-radio-player title="Jami radio player" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe>
                                </div>
                                <div class="jami-radio-actions">
                                    <button type="button" data-jami-radio-play><span aria-hidden="true">▶</span> play</button>
                                    <button type="button" data-jami-radio-pause><span aria-hidden="true">Ⅱ</span> pause</button>
                                    <button type="button" data-jami-radio-next><span aria-hidden="true">»</span> next</button>
                                    <button type="button" data-jami-radio-refresh><span aria-hidden="true">↻</span> refresh</button>
                                </div>
                            </div>
                        `, "jami-radio-window")}

                        ${this.windowMarkup("monitor", "system monitor", `
                            <div class="jami-window-body jami-monitor-body">
                                <div class="jami-monitor-toolbar">
                                    <span>live status</span>
                                    <button type="button" data-jami-monitor-refresh>refresh</button>
                                </div>
                                <div class="jami-monitor-grid">
                                    <section><h3>connection</h3><pre data-jami-monitor-network>loading…</pre></section>
                                    <section><h3>shared files</h3><pre data-jami-monitor-filesystem>loading…</pre></section>
                                    <section><h3>this browser</h3><pre data-jami-monitor-browser>loading…</pre></section>
                                    <section><h3>open things</h3><pre data-jami-monitor-services>loading…</pre></section>
                                </div>
                                <section class="jami-monitor-events"><h3>session journal</h3><div data-jami-monitor-events></div></section>
                            </div>
                        `, "jami-monitor-window")}
                    </div>

                    <div class="jami-context-menu" data-jami-context-menu hidden>
                        <button type="button" data-jami-context-action="rename">rename</button>
                        <button type="button" data-jami-context-action="move">move</button>
                        <button type="button" data-jami-context-action="trash">trash</button>
                        <button type="button" data-jami-context-action="restore" hidden>restore</button>
                        <button type="button" data-jami-context-action="delete" class="jami-danger-action" hidden>delete forever</button>
                    </div>

                    <div class="jami-dialog-backdrop" data-jami-dialog hidden>
                        <form class="jami-dialog" data-jami-dialog-form>
                            <div class="jami-dialog-title" data-jami-dialog-title></div>
                            <div class="jami-dialog-message" data-jami-dialog-message></div>
                            <label class="jami-dialog-field" data-jami-dialog-field>
                                <span data-jami-dialog-label></span>
                                <input data-jami-dialog-input autocomplete="off">
                            </label>
                            <div class="jami-dialog-actions">
                                <button type="button" data-jami-dialog-cancel>cancel</button>
                                <button type="submit" data-jami-dialog-confirm>confirm</button>
                            </div>
                        </form>
                    </div>

                    <div class="jami-taskbar">
                        <button class="jami-task-button" type="button" data-jami-open="terminal">terminal</button>
                        <button class="jami-task-button" type="button" data-jami-open="explorer">files</button>
                        <button class="jami-task-button" type="button" data-jami-open="notepad" data-jami-notepad-task hidden>notepad</button>
                        <button class="jami-task-button" type="button" data-jami-open-chat>chat</button>
                        <button class="jami-task-button" type="button" data-jami-open="radio">radio</button>
                        <button class="jami-task-button" type="button" data-jami-open="monitor">system</button>
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
            this.chatOutput = this.root.querySelector("[data-jami-chat-output]");
            this.chatInput = this.root.querySelector("[data-jami-chat-input]");
            this.chatStatus = this.root.querySelector("[data-jami-chat-status]");
            this.radioState = this.root.querySelector("[data-jami-radio-state]");
            this.radioTitle = this.root.querySelector("[data-jami-radio-title]");
            this.radioMeta = this.root.querySelector("[data-jami-radio-meta]");
            this.radioPlayer = this.root.querySelector("[data-jami-radio-player]");
            this.radioPlayerWrap = this.root.querySelector(".jami-radio-player-wrap");
            this.radioNote = this.root.querySelector("[data-jami-radio-note]");
            this.radioModeButtons = [...this.root.querySelectorAll("[data-jami-radio-mode]")];
            this.radioNextButton = this.root.querySelector("[data-jami-radio-next]");
            this.networkLabel = this.root.querySelector("[data-jami-network]");
            this.clockLabel = this.root.querySelector("[data-jami-clock]");
            this.explorerGrid = this.root.querySelector("[data-jami-explorer-grid]");
            this.explorerPathLabel = this.root.querySelector("[data-jami-explorer-path]");
            this.explorerStatus = this.root.querySelector("[data-jami-explorer-status]");
            this.quotaLabel = this.root.querySelector("[data-jami-quota]");
            this.directoryPresence = this.root.querySelector("[data-jami-directory-presence]");
            this.notepadEditor = this.root.querySelector("[data-jami-notepad-editor]");
            this.notepadPresence = this.root.querySelector("[data-jami-notepad-presence]");
            this.notepadMeta = this.root.querySelector("[data-jami-notepad-meta]");
            this.notepadStatus = this.root.querySelector("[data-jami-notepad-status]");
            this.notepadHistoryPanel = this.root.querySelector("[data-jami-notepad-history-panel]");
            this.contextMenu = this.root.querySelector("[data-jami-context-menu]");
            this.contextMenuItem = null;
            this.dialogBackdrop = this.root.querySelector("[data-jami-dialog]");
            this.dialogForm = this.root.querySelector("[data-jami-dialog-form]");
            this.dialogTitle = this.root.querySelector("[data-jami-dialog-title]");
            this.dialogMessage = this.root.querySelector("[data-jami-dialog-message]");
            this.dialogField = this.root.querySelector("[data-jami-dialog-field]");
            this.dialogLabel = this.root.querySelector("[data-jami-dialog-label]");
            this.dialogInput = this.root.querySelector("[data-jami-dialog-input]");
            this.dialogConfirm = this.root.querySelector("[data-jami-dialog-confirm]");
            this.dialogResolve = null;
            this.monitorNetwork = this.root.querySelector("[data-jami-monitor-network]");
            this.monitorFilesystem = this.root.querySelector("[data-jami-monitor-filesystem]");
            this.monitorBrowser = this.root.querySelector("[data-jami-monitor-browser]");
            this.monitorServices = this.root.querySelector("[data-jami-monitor-services]");
            this.monitorEvents = this.root.querySelector("[data-jami-monitor-events]");

            const launcher = document.getElementById("jamiLauncher");
            if (launcher) {
                launcher.innerHTML = this.iconSvg("chat", "jami-launcher-mark");
                launcher.setAttribute("aria-label", "Open Jami");
                launcher.title = "Jami";
                launcher.addEventListener("click", () => this.open());
            }

            this.root.querySelectorAll("[data-jami-open]").forEach(button => {
                button.addEventListener("dblclick", () => this.openWindow(button.dataset.jamiOpen));
                button.addEventListener("click", () => {
                    if (button.classList.contains("jami-task-button")) this.openWindow(button.dataset.jamiOpen);
                });
            });

            this.root.querySelectorAll("[data-jami-open-chat]").forEach(button => {
                const openChat = () => this.enterChatClient();
                button.addEventListener("dblclick", openChat);
                button.addEventListener("click", () => {
                    if (button.classList.contains("jami-task-button")) openChat();
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
                button.addEventListener("pointerdown", event => event.stopPropagation());
                button.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.closeWindow(button.dataset.jamiClose);
                });
            });
            this.root.querySelectorAll("[data-jami-minimize]").forEach(button => {
                button.addEventListener("pointerdown", event => event.stopPropagation());
                button.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.minimizeWindow(button.dataset.jamiMinimize);
                });
            });
            this.root.querySelectorAll("[data-jami-window]").forEach(win => {
                win.addEventListener("pointerdown", () => this.focusWindow(win.dataset.jamiWindow));
            });
            this.dialogForm?.addEventListener("submit", event => {
                event.preventDefault();
                const value = this.dialogInput?.value || "";
                this.finishDialog({ confirmed: true, value });
            });
            this.root.querySelector("[data-jami-dialog-cancel]")?.addEventListener("click", () => this.finishDialog({ confirmed: false, value: "" }));
            this.dialogBackdrop?.addEventListener("pointerdown", event => {
                if (event.target === this.dialogBackdrop) this.finishDialog({ confirmed: false, value: "" });
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
                if (event.key === "Tab") {
                    event.preventDefault();
                    this.completeInput();
                }
            });

            this.root.querySelector("[data-jami-chat-form]")?.addEventListener("submit", event => {
                event.preventDefault();
                const value = this.chatInput?.value || "";
                if (this.chatInput) this.chatInput.value = "";
                this.handleChatInput(value.trim());
            });
            this.chatInput?.addEventListener("input", () => {
                if (!this.chatMode) return;
                this.sendChatTyping(this.chatInput.value.trim().length > 0);
                clearTimeout(this.chatTypingTimer);
                this.chatTypingTimer = setTimeout(() => this.sendChatTyping(false), 1200);
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
            this.root.querySelector("[data-jami-notepad-history]")?.addEventListener("click", () => this.toggleNotepadHistory());
            this.root.querySelector("[data-jami-notepad-reload]")?.addEventListener("click", async () => {
                if (!this.notepadPath) return;
                if (this.notepadDirty) {
                    const choice = await this.openDialog({
                        title: "reload shared copy",
                        message: "Your unsaved draft will be replaced by the latest saved version.",
                        confirmText: "reload",
                        input: false,
                        danger: true
                    });
                    if (!choice.confirmed) return;
                }
                this.notepadDirty = false;
                await this.reloadOpenFileFromServer(true);
            });
            this.root.querySelector("[data-jami-monitor-refresh]")?.addEventListener("click", () => this.refreshSystemMonitor());
            this.root.querySelector("[data-jami-radio-refresh]")?.addEventListener("click", () => this.refreshRadio(true));
            this.root.querySelector("[data-jami-radio-play]")?.addEventListener("click", () => this.radioPlay());
            this.root.querySelector("[data-jami-radio-pause]")?.addEventListener("click", () => this.radioPause());
            this.root.querySelector("[data-jami-radio-next]")?.addEventListener("click", () => this.radioNext());
            this.radioModeButtons.forEach(button => button.addEventListener("click", () => this.setRadioMode(button.dataset.jamiRadioMode, true)));
            this.root.querySelectorAll("[data-jami-context-action]").forEach(button => {
                button.addEventListener("click", () => this.runContextAction(button.dataset.jamiContextAction));
            });
            this.root.addEventListener("pointerdown", event => {
                if (!event.target.closest("[data-jami-context-menu]")) this.hideContextMenu();
            });

            this.notepadEditor?.addEventListener("input", () => {
                if (!this.notepadNodeId || this.notepadEditor.readOnly) return;
                this.notepadDirty = true;
                this.sendFilePresence("edit");
                this.queueLiveEdit();
            });

            ["keyup", "click", "select"].forEach(type => {
                this.notepadEditor?.addEventListener(type, () => {
                    if (!this.notepadNodeId || this.notepadEditor.readOnly) return;
                    this.sendFilePresence(this.notepadDirty ? "edit" : "read");
                });
            });

            this.setupDragging();
            this.updatePrompt();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);

            window.addEventListener("online", () => { this.addSystemEvent("browser online"); this.refreshSystemMonitor(); });
            window.addEventListener("offline", () => { this.addSystemEvent("browser offline"); this.refreshSystemMonitor(); });
            document.addEventListener("visibilitychange", () => { this.addSystemEvent(`page ${document.visibilityState}`); this.refreshSystemMonitor(); });
            window.addEventListener("beforeunload", () => { this.socket?.close(1000, "page closing"); this.chatSocket?.close(1000, "page closing"); });
            window.jami = { open: () => this.open(), close: () => this.close(), terminal: () => { this.open(); this.openWindow("terminal"); } };
        }

        windowMarkup(id, title, body, extraClass = "") {
            return `<section class="jami-window ${extraClass}" data-jami-window="${id}" hidden><div class="jami-window-titlebar" data-jami-drag-handle><span class="jami-window-title" data-jami-title="${id}">${title}</span><div class="jami-window-controls"><button class="jami-window-minimize" type="button" data-jami-minimize="${id}" aria-label="Minimize ${title}">–</button><button class="jami-window-close" type="button" data-jami-close="${id}" aria-label="Close ${title}">×</button></div></div>${body}</section>`;
        }

        async open() {
            this.root.classList.add("jami-open");
            this.root.setAttribute("aria-hidden", "false");
            this.isOpen = true;
            document.body.classList.add("jami-os-visible");
            this.suppressSiteWatchPartyVisual();
            this.connect();
            if (!this.booted) {
                await this.boot();
                this.booted = true;
            }
        }

        close() {
            this.sendFilePresence("close");
            if (this.chatMode) this.leaveChatClient();
            this.stopSystemMonitor();
            this.stopRadio();
            this.isOpen = false;
            document.body.classList.remove("jami-os-visible");
            this.restoreSiteWatchPartyVisual();
            this.root.classList.remove("jami-open");
            this.root.setAttribute("aria-hidden", "true");
            this.setActivity("/", "desktop");
        }

        async boot() {
            const boot = this.root.querySelector("[data-jami-boot]");
            const text = this.root.querySelector("[data-jami-boot-text]");
            boot.hidden = false;
            text.textContent = "";

            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            const add = async (line = "", delay = 170) => {
                text.textContent += `${line}\n`;
                await sleep(delay);
            };

            const previousVisit = Number(localStorage.getItem("jami_last_visit_at")) || 0;
            const openedAt = Date.now();
            localStorage.setItem("jami_last_visit_at", String(openedAt));

            await add("JAMI", 260);
            await add("", 80);
            await add("connecting…", 240);

            let status = null;
            let watchPartyActive = false;

            try {
                const [statusResponse, watchResponse] = await Promise.all([
                    fetch(`${API}/api/test/jami/status`, { cache: "no-store" }),
                    fetch(`${API}/api/watchparty`, { cache: "no-store" })
                ]);

                if (statusResponse.ok) status = await statusResponse.json();
                if (watchResponse.ok) {
                    const payload = await watchResponse.json();
                    const state = payload?.state || payload;
                    watchPartyActive = state?.enabled === true;
                }
            } catch {
                // The live socket below is the source of truth if these lightweight
                // boot-time requests are temporarily unavailable.
            }

            const connected = Array.isArray(status?.users)
                ? status.users.length
                : null;

            if (connected === 0) {
                await add("shared space found", 150);
                await add("nobody else here", 170);
            } else if (Number.isFinite(connected)) {
                await add("shared space found", 150);
                await add(`${connected} ${connected === 1 ? "person" : "people"} here now`, 170);
            } else {
                await add("shared space found", 170);
            }

            if (watchPartyActive) {
                await add("watch party is active", 170);
            }

            if (previousVisit > 0 && previousVisit < openedAt) {
                await add("", 70);
                await add(`welcome back, ${this.name}`, 150);
                await add(`last here ${this.formatRelativeVisit(openedAt - previousVisit)}`, 190);
            } else {
                await add("", 70);
                await add(`hello, ${this.name}`, 190);
            }

            const waitStarted = Date.now();
            while (
                this.socket &&
                this.socket.readyState === WebSocket.CONNECTING &&
                Date.now() - waitStarted < 1600
            ) {
                await sleep(80);
            }

            if (this.socket?.readyState === WebSocket.OPEN) {
                await add("ready", 260);
            } else {
                await add("opening offline", 260);
            }

            await sleep(180);
            boot.hidden = true;
        }

        formatRelativeVisit(ms) {
            const seconds = Math.max(1, Math.floor(ms / 1000));
            if (seconds < 60) return "less than a minute ago";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
            const days = Math.floor(hours / 24);
            return `${days} ${days === 1 ? "day" : "days"} ago`;
        }

        connect() {
            if (this.socket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.socket.readyState)) return;
            clearTimeout(this.reconnectTimer);
            this.setNetworkLabel("connecting…");
            this.socket = new WebSocket(WS);

            this.socket.addEventListener("open", () => {
                this.addSystemEvent("Jami websocket connected");
                this.setNetworkLabel("online");
                this.sendIdentify();
                if (this.notepadNodeId && this.isWindowOpen("notepad")) {
                    setTimeout(() => this.sendFilePresence(this.notepadDirty ? "edit" : "read"), 0);
                }
                this.startPings();
            });
            this.socket.addEventListener("message", event => {
                let packet;
                try { packet = JSON.parse(event.data); } catch { return; }
                if (packet.type === "jami-connected") { this.networkCreatedAt = Number(packet.networkCreatedAt) || null; return; }
                if (packet.type === "jami-presence") {
                    this.users = Array.isArray(packet.users) ? packet.users : [];
                    this.filePresence = packet.filePresence && typeof packet.filePresence === "object"
                        ? packet.filePresence
                        : {};
                    this.networkCreatedAt = Number(packet.networkCreatedAt) || this.networkCreatedAt;
                    this.setNetworkLabel(`${this.users.length} connected`);
                    this.refreshPresenceDecorations();
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
                    this.addSystemEvent(`filesystem ${packet.action || "changed"}`);
                    if (this.isWindowOpen("explorer")) this.loadExplorer(this.explorerPath, false);
                    if (this.notepadPath && packet.node?.path === this.notepadPath && packet.action === "write") {
                        if (Number(packet.node?.revision) > Number(this.notepadRevision) && this.notepadDirty) {
                            this.notepadStatus.textContent = "another save arrived first · your draft is still here · open history or reload before saving";
                            this.notepadStatus.classList.add("jami-warning");
                        } else if (Number(packet.node?.revision) > Number(this.notepadRevision)) {
                            this.reloadOpenFileFromServer();
                        }
                    }
                    return;
                }
                if (packet.type === "jami-live-edit") {
                    this.receiveLiveEdit(packet);
                    return;
                }
                if (packet.type === "jami-icon-drag") {
                    if (packet.sessionId !== this.sessionId && packet.parentPath === this.explorerPath) {
                        this.applyRemoteIconPosition(packet.id, packet.x, packet.y, true);
                    }
                    return;
                }
            });

            this.socket.addEventListener("close", () => {
                this.stopPings(); this.setNetworkLabel("offline");
                if (this.isOpen) this.reconnectTimer = setTimeout(() => this.connect(), 1800);
            });
            this.socket.addEventListener("error", () => this.setNetworkLabel("network error"));
        }

        currentSharedState() {
            const watch = this.getLiveWatchPartyState?.();
            return {
                watchPartyActive: watch?.enabled === true,
                radioMode: this.isWindowOpen?.("radio") ? this.radioMode || null : null
            };
        }
        sendIdentify() {
            this.send({ type: "jami-identify", clientId: this.clientId, sessionId: this.sessionId, name: this.name, path: this.currentPath, app: this.currentApp, ...this.currentSharedState() });
        }
        setActivity(path, app) {
            this.currentPath = path || "/";
            this.currentApp = app || "desktop";
            this.updatePrompt();
            this.send({ type: "jami-activity", path: this.currentPath, app: this.currentApp, ...this.currentSharedState() });
        }
        send(packet) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(packet)); }
        startPings() { this.stopPings(); this.pingTimer = setInterval(() => { const sentAt = Date.now(); this.send({ type: "ping", sentAt, ...this.currentSharedState() }); }, 5000); }
        stopPings() { clearInterval(this.pingTimer); this.pingTimer = null; }
        setNetworkLabel(text) { if (this.networkLabel) this.networkLabel.textContent = text; }
        updateClock() { if (this.clockLabel) this.clockLabel.textContent = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()); }
        isWindowOpen(id) { return !this.root.querySelector(`[data-jami-window="${id}"]`)?.hidden; }

        focusWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (!win || win.hidden) return;
            win.style.zIndex = String(++this.zCounter);
            this.root.querySelectorAll(".jami-task-button").forEach(button => {
                const target = button.dataset.jamiOpen || (button.hasAttribute("data-jami-open-chat") ? "chat" : "");
                button.classList.toggle("active", target === id);
            });
        }

        minimizeWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (!win || win.hidden) return;
            win.dataset.minimized = "1";
            win.hidden = true;
            this.addSystemEvent(`minimized ${id}`);
            this.root.querySelectorAll(".jami-task-button").forEach(button => {
                const target = button.dataset.jamiOpen || (button.hasAttribute("data-jami-open-chat") ? "chat" : "");
                if (target === id) button.classList.add("minimized");
            });
        }

        openDialog({ title = "", message = "", label = "", value = "", confirmText = "confirm", input = true, danger = false } = {}) {
            if (!this.dialogBackdrop) return Promise.resolve({ confirmed: false, value: "" });
            if (this.dialogResolve) this.finishDialog({ confirmed: false, value: "" });
            this.dialogTitle.textContent = title;
            this.dialogMessage.textContent = message;
            this.dialogMessage.hidden = !message;
            this.dialogField.hidden = !input;
            this.dialogLabel.textContent = label;
            this.dialogInput.value = value;
            this.dialogConfirm.textContent = confirmText;
            this.dialogConfirm.classList.toggle("danger", danger);
            this.dialogBackdrop.hidden = false;
            if (input) setTimeout(() => { this.dialogInput.focus(); this.dialogInput.select(); }, 0);
            else setTimeout(() => this.dialogConfirm.focus(), 0);
            return new Promise(resolve => { this.dialogResolve = resolve; });
        }

        finishDialog(result) {
            if (this.dialogBackdrop) this.dialogBackdrop.hidden = true;
            const resolve = this.dialogResolve;
            this.dialogResolve = null;
            if (resolve) resolve(result);
        }

        openWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (!win) return;
            win.hidden = false;
            win.dataset.minimized = "0";
            this.root.querySelectorAll(".jami-task-button").forEach(button => {
                const target = button.dataset.jamiOpen || (button.hasAttribute("data-jami-open-chat") ? "chat" : "");
                if (target === id) button.classList.remove("minimized");
            });
            this.focusWindow(id);
            this.addSystemEvent(`opened ${id}`);
            if (id === "terminal") { this.setActivity(this.currentPath, "terminal"); setTimeout(() => this.input?.focus(), 0); }
            if (id === "chat") { this.setActivity(this.currentPath, "cat-chat"); setTimeout(() => this.chatInput?.focus(), 0); }
            if (id === "explorer") { this.setActivity(this.explorerPath, "explorer"); this.loadExplorer(this.explorerPath); }
            if (id === "notepad") this.setActivity(this.notepadPath || this.currentPath, "notepad");
            if (id === "monitor") { this.setActivity(this.currentPath, "system-monitor"); this.startSystemMonitor(); }
            if (id === "radio") { this.setActivity(this.currentPath, "radio"); this.startRadio(); }
        }

        closeWindow(id) {
            const win = this.root.querySelector(`[data-jami-window="${id}"]`);
            if (!win || win.hidden) return;
            win.hidden = true;
            win.dataset.minimized = "0";
            this.root.querySelectorAll(".jami-task-button").forEach(button => {
                const target = button.dataset.jamiOpen || (button.hasAttribute("data-jami-open-chat") ? "chat" : "");
                if (target === id) button.classList.remove("minimized", "active");
            });
            this.addSystemEvent(`closed ${id}`);
            if (id === "notepad") {
                this.sendFilePresence("close");
                const notepadTask = this.root.querySelector("[data-jami-notepad-task]");
                if (notepadTask) notepadTask.hidden = true;
            }
            if (id === "chat") this.leaveChatClient(false);
            if (id === "monitor") this.stopSystemMonitor();
            if (id === "radio") this.stopRadio();

            const visible = ["chat", "notepad", "explorer", "terminal", "monitor", "radio"].find(name => this.isWindowOpen(name));
            if (visible === "chat") this.setActivity(this.currentPath, "cat-chat");
            else if (visible === "notepad") this.setActivity(this.notepadPath || this.currentPath, "notepad");
            else if (visible === "explorer") this.setActivity(this.explorerPath, "explorer");
            else if (visible === "terminal") this.setActivity(this.currentPath, "terminal");
            else if (visible === "monitor") this.setActivity(this.currentPath, "system-monitor");
            else if (visible === "radio") this.setActivity(this.currentPath, "radio");
            else this.setActivity("/", "desktop");
        }

        setupDragging() {
            this.root.querySelectorAll("[data-jami-window]").forEach(win => {
                const handle = win.querySelector("[data-jami-drag-handle]");
                if (!handle) return;
                let dragging = false, pointerId = null, startX = 0, startY = 0, startLeft = 0, startTop = 0;
                handle.addEventListener("pointerdown", event => {
                    if (event.target.closest("button, input, textarea, select, a")) return;
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

        addSystemEvent(message) {
            const entry = { at: Date.now(), message: String(message || "event") };
            this.systemEvents.push(entry);
            this.systemEvents = this.systemEvents.slice(-80);
            this.renderSystemEvents();
        }

        renderSystemEvents() {
            if (!this.monitorEvents) return;
            this.monitorEvents.replaceChildren();
            const rows = this.systemEvents.slice(-30).reverse();
            if (!rows.length) {
                const empty = document.createElement("div");
                empty.className = "jami-monitor-event-muted";
                empty.textContent = "no session events recorded yet";
                this.monitorEvents.appendChild(empty);
                return;
            }
            rows.forEach(entry => {
                const row = document.createElement("div");
                row.className = "jami-monitor-event";
                const time = new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                row.textContent = `${time}  ${entry.message}`;
                this.monitorEvents.appendChild(row);
            });
        }

        startSystemMonitor() {
            this.stopSystemMonitor();
            this.refreshSystemMonitor();
            this.monitorTimer = setInterval(() => this.refreshSystemMonitor(), 2000);
        }

        stopSystemMonitor() {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
        }

        async refreshSystemMonitor() {
            if (!this.isWindowOpen("monitor")) return;
            let status = null;
            let watchParty = null;
            try {
                const response = await fetch(`${API}/api/test/jami/status`, { cache: "no-store" });
                if (response.ok) status = await response.json();
            } catch {}
            try {
                const response = await fetch(`${API}/api/watchparty`, { cache: "no-store" });
                if (response.ok) watchParty = await response.json();
            } catch {}

            const socketState = this.socket?.readyState === WebSocket.OPEN ? "connected" : this.socket?.readyState === WebSocket.CONNECTING ? "connecting" : "closed";
            const networkAge = status?.networkCreatedAt ? Math.max(0, Math.floor((Date.now() - status.networkCreatedAt) / 1000)) : null;
            if (this.monitorNetwork) {
                this.monitorNetwork.textContent = [
                    `Jami connection  ${socketState}`,
                    `measured RTT     ${this.latencyMs == null ? "unavailable" : `${this.latencyMs} ms`}`,
                    `people in Jami   ${status?.users?.length ?? this.users.length}`,
                    `shared session   ${networkAge == null ? "unavailable" : this.formatDuration(networkAge)}`,
                    `browser online   ${navigator.onLine ? "yes" : "no"}`
                ].join("\n");
            }
            if (this.monitorFilesystem) {
                const fs = status?.filesystem;
                this.monitorFilesystem.textContent = [
                    `nodes            ${fs?.nodes ?? "unknown"}`,
                    `documents        ${fs?.documents ?? "unknown"}`,
                    `directories      ${fs?.directories ?? "unknown"}`,
                    `revisions        ${fs?.revisions ?? "unknown"}`,
                    `current path     ${this.currentPath}`
                ].join("\n");
            }
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (this.monitorBrowser) {
                this.monitorBrowser.textContent = [
                    `page visibility  ${document.visibilityState}`,
                    `language         ${navigator.language || "unavailable"}`,
                    `connection class ${connection?.effectiveType || "unavailable"}`,
                    `browser RTT est. ${Number.isFinite(connection?.rtt) ? `${connection.rtt} ms` : "unavailable"}`
                ].join("\n");
            }
            const wpState = watchParty?.state || watchParty;
            const wpActive = Boolean(wpState?.enabled || wpState?.active || wpState?.videoId || wpState?.currentVideoId);
            if (this.monitorServices) {
                this.monitorServices.textContent = [
                    `Jami             ${this.isOpen ? "open" : "closed"}`,
                    `files            ${this.isWindowOpen("explorer") ? "open" : "closed"}`,
                    `notepad          ${this.isWindowOpen("notepad") ? "open" : "closed"}`,
                    `live chat        ${this.chatSocket?.readyState === WebSocket.OPEN ? "connected" : this.chatMode ? "connecting" : "idle"}`,
                    `radio            ${this.isWindowOpen("radio") ? this.radioMode || "open" : "closed"}`,
                    `watch party      ${wpActive ? "active" : "inactive"}`
                ].join("\n");
            }
            this.renderSystemEvents();
        }

        formatDuration(seconds) {
            const total = Math.max(0, Math.floor(Number(seconds) || 0));
            const days = Math.floor(total / 86400);
            const hours = Math.floor((total % 86400) / 3600);
            const minutes = Math.floor((total % 3600) / 60);
            const secs = total % 60;
            return [days ? `${days}d` : "", hours || days ? `${hours}h` : "", minutes || hours || days ? `${minutes}m` : "", `${secs}s`].filter(Boolean).join(" ");
        }

        updatePrompt() {
            if (!this.prompt) return;
            this.prompt.textContent = `${this.name}@jami:${this.currentPath}$`;
        }
        write(text = "", type = "") { if (!this.output) return; const line = document.createElement("div"); if (type) line.className = `jami-terminal-line-${type}`; line.textContent = text; this.output.appendChild(line); this.output.scrollTop = this.output.scrollHeight; }
        writeChat(text = "", type = "") { if (!this.chatOutput) return; const line = document.createElement("div"); if (type) line.className = `jami-terminal-line-${type}`; line.textContent = text; this.chatOutput.appendChild(line); this.chatOutput.scrollTop = this.chatOutput.scrollHeight; }
        setChatStatus(text) { if (this.chatStatus) this.chatStatus.textContent = text; }
        navigateHistory(direction) { if (!this.history.length) return; this.historyIndex = Math.min(this.history.length, Math.max(0, this.historyIndex + direction)); this.input.value = this.historyIndex >= this.history.length ? "" : this.history[this.historyIndex]; }

        terminalCommands() {
            return [
                "help", "man", "clear", "history", "who", "users", "uptime", "date",
                "ps", "netstat", "nowplaying", "which", "find", "open", "pwd", "cd",
                "ls", "cat", "stat", "tree", "touch", "mkdir", "mv", "rename", "trash",
                "restore", "delete", "quota", "edit", "jami", "chat", "monitor", "radio", "exit", "logout"
            ];
        }

        parseCommandLine(line) {
            const tokens = [];
            let token = "";
            let quote = null;
            let escaping = false;

            for (const char of String(line || "")) {
                if (escaping) {
                    token += char;
                    escaping = false;
                    continue;
                }

                if (char === "\\") {
                    escaping = true;
                    continue;
                }

                if (quote) {
                    if (char === quote) quote = null;
                    else token += char;
                    continue;
                }

                if (char === "'" || char === '"') {
                    quote = char;
                    continue;
                }

                if (/\s/.test(char)) {
                    if (token) {
                        tokens.push(token);
                        token = "";
                    }
                    continue;
                }

                token += char;
            }

            if (escaping) token += "\\";
            if (token) tokens.push(token);
            return tokens;
        }

        async completeInput() {
            if (!this.input) return;
            const line = this.input.value;
            const cursor = this.input.selectionStart ?? line.length;
            if (cursor !== line.length) return;

            const tokens = this.parseCommandLine(line);
            const endsWithSpace = /\s$/.test(line);

            if (tokens.length <= 1 && !endsWithSpace) {
                const prefix = (tokens[0] || "").toLowerCase();
                const matches = this.terminalCommands().filter(command => command.startsWith(prefix));
                if (matches.length === 1) {
                    this.input.value = `${matches[0]} `;
                } else if (matches.length > 1) {
                    this.write(matches.join("  "), "muted");
                }
                return;
            }

            const fragment = endsWithSpace ? "" : (tokens[tokens.length - 1] || "");
            const full = this.resolveClientPath(fragment || ".", this.currentPath);
            const parent = fragment.endsWith("/") ? full : this.parentPath(full);
            const partial = fragment.endsWith("/") ? "" : this.baseName(full);

            try {
                const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(parent)}&all=1`);
                const matches = (data.items || []).filter(item => item.name.startsWith(partial));
                if (!matches.length) return;

                if (matches.length > 1) {
                    this.write(matches.map(item => `${item.name}${item.kind === "folder" ? "/" : ""}`).join("  "), "muted");
                    return;
                }

                const match = matches[0];
                const before = endsWithSpace ? line : line.slice(0, Math.max(0, line.lastIndexOf(fragment)));
                let completed = fragment.includes("/")
                    ? `${fragment.slice(0, fragment.lastIndexOf("/") + 1)}${match.name}`
                    : match.name;
                if (match.kind === "folder") completed += "/";
                this.input.value = `${before}${completed}`;
                this.input.setSelectionRange(this.input.value.length, this.input.value.length);
            } catch {}
        }

        async api(path, options = {}) {
            const response = await fetch(`${API}${path}`, options);
            let data = null;
            try { data = await response.json(); } catch {}
            if (!response.ok) {
                const message = [data?.error || `HTTP ${response.status}`, data?.detail].filter(Boolean).join("\n");
                throw new Error(message);
            }
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
                const glyph = item.kind === "folder" ? (item.path === "/trash" ? "trash" : "files") : "text";
                card.dataset.kind = glyph;
                card.innerHTML = `${this.iconSvg(glyph, "jami-file-glyph")}<span class="jami-file-name"></span><span class="jami-file-presence"></span><small></small>`;
                card.querySelector(".jami-file-name").textContent = item.name;
                card.querySelector("small").textContent = item.system ? "owner: jami" : `${item.size || 0} bytes · r${item.revision}`;
                const x = Number(item.iconPosition?.x) || 0;
                const y = Number(item.iconPosition?.y) || 0;
                card.dataset.iconX = String(x);
                card.dataset.iconY = String(y);
                card.style.transform = `translate(${x}px, ${y}px)`;
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
                    this.fileContextAction(item, event);
                });

                if (!item.system && item.owner === "public" && this.explorerPath.startsWith("/public")) {
                    this.setupFileCardDragging(card, item);
                }

                this.explorerGrid.appendChild(card);
            }
            this.refreshPresenceDecorations();
        }

        refreshPresenceDecorations() {
            if (this.explorerGrid) {
                for (const card of this.explorerGrid.querySelectorAll(".jami-file-card")) {
                    const presence = this.filePresence[card.dataset.id];
                    const label = card.querySelector(".jami-file-presence");
                    if (!label) continue;
                    const readers = Number(presence?.readerCount) || 0;
                    const editors = Number(presence?.editorCount) || 0;
                    label.textContent = [
                        readers ? `👀 ${readers}` : "",
                        editors ? `✎ ${editors}` : ""
                    ].filter(Boolean).join("  ");
                    card.classList.toggle("jami-file-being-read", readers > 0);
                    card.classList.toggle("jami-file-being-edited", editors > 0);
                }
            }

            if (this.directoryPresence) {
                const here = this.users.filter(user =>
                    user.sessionId !== this.sessionId &&
                    user.app === "explorer" &&
                    user.path === this.explorerPath
                );
                this.directoryPresence.textContent = here.length
                    ? `${here.length} other cat${here.length === 1 ? "" : "s"} here`
                    : "";
            }

            this.updateNotepadPresence();
        }

        updateNotepadPresence() {
            if (!this.notepadPresence || !this.notepadNodeId) return;
            const presence = this.filePresence[this.notepadNodeId];
            const readers = Array.isArray(presence?.readers)
                ? presence.readers.filter(reader => reader.sessionId !== this.sessionId)
                : [];
            const editors = Array.isArray(presence?.editors)
                ? presence.editors.filter(editor => editor.sessionId !== this.sessionId)
                : [];

            if (!readers.length) {
                this.notepadPresence.textContent = "nobody else is reading this file";
                return;
            }

            const readerText = readers.length === 1
                ? `${readers[0].name} is reading this file.`
                : `${readers.length} other cats are reading this file.`;
            const editorText = editors.length
                ? ` ${editors.map(editor => editor.name).join(", ")} ${editors.length === 1 ? "is" : "are"} editing too.`
                : "";
            const cursorText = editors.length === 1 && Number.isFinite(Number(editors[0].cursorStart))
                ? ` · ${editors[0].name}'s cursor is at character ${editors[0].cursorStart}`
                : "";
            const mismatchText = presence?.ambientMismatch ? " · reader count briefly disagrees with the session list" : "";

            this.notepadPresence.textContent = `${readerText}${editorText}${cursorText}${mismatchText}`;
        }

        sendFilePresence(mode = "read") {
            if (!this.notepadNodeId && mode !== "close") return;
            this.send({
                type: "jami-file-presence",
                mode,
                fileId: this.notepadNodeId,
                path: this.notepadPath,
                cursorStart: this.notepadEditor?.selectionStart ?? 0,
                cursorEnd: this.notepadEditor?.selectionEnd ?? 0
            });
        }

        queueLiveEdit() {
            clearTimeout(this.liveEditTimer);
            this.liveEditTimer = setTimeout(() => {
                if (!this.notepadNodeId || this.notepadEditor?.readOnly) return;
                this.send({
                    type: "jami-live-edit",
                    fileId: this.notepadNodeId,
                    path: this.notepadPath,
                    content: this.notepadEditor.value,
                    cursorStart: this.notepadEditor.selectionStart,
                    cursorEnd: this.notepadEditor.selectionEnd
                });
            }, 90);
        }

        receiveLiveEdit(packet) {
            if (!this.notepadNodeId || packet.fileId !== this.notepadNodeId || packet.sessionId === this.sessionId) return;

            const cursor = Number(packet.cursorStart) || 0;
            this.notepadStatus.textContent = `${packet.name || "another cat"} is typing · cursor at character ${cursor}`;
            this.notepadStatus.classList.remove("jami-warning");

            if (!this.notepadDirty && typeof packet.content === "string") {
                const start = this.notepadEditor.selectionStart;
                const end = this.notepadEditor.selectionEnd;
                this.notepadEditor.value = packet.content;
                if (document.activeElement === this.notepadEditor) {
                    this.notepadEditor.setSelectionRange(
                        Math.min(start, packet.content.length),
                        Math.min(end, packet.content.length)
                    );
                }
            }
        }

        async reloadOpenFileFromServer(force = false) {
            if (!this.notepadPath || (this.notepadDirty && !force)) return;
            try {
                const data = await this.api(`/api/test/jami/fs/read?path=${encodeURIComponent(this.notepadPath)}`);
                if (data.node?.id !== this.notepadNodeId) return;
                this.notepadRevision = data.node.revision;
                this.notepadEditor.value = data.content || "";
                this.notepadMeta.textContent = `${data.node.path} · owner ${data.node.owner} · revision ${data.node.revision} · ${data.node.size} bytes${data.node.system ? " · read-only" : ""}`;
                this.notepadStatus.textContent = "updated from shared filesystem";
            } catch {}
        }

        setupFileCardDragging(card, item) {
            let pointerId = null;
            let startClientX = 0;
            let startClientY = 0;
            let startX = Number(item.iconPosition?.x) || 0;
            let startY = Number(item.iconPosition?.y) || 0;
            let moved = false;

            card.addEventListener("pointerdown", event => {
                if (event.button !== 0 || window.matchMedia("(max-width: 640px)").matches) return;
                pointerId = event.pointerId;
                startClientX = event.clientX;
                startClientY = event.clientY;
                startX = Number(card.dataset.iconX) || 0;
                startY = Number(card.dataset.iconY) || 0;
                moved = false;
                card.setPointerCapture(pointerId);
            });

            card.addEventListener("pointermove", event => {
                if (event.pointerId !== pointerId) return;
                const dx = event.clientX - startClientX;
                const dy = event.clientY - startClientY;
                if (!moved && Math.hypot(dx, dy) < 5) return;
                moved = true;
                event.preventDefault();
                const x = Math.max(-120, Math.min(120, Math.round(startX + dx)));
                const y = Math.max(-120, Math.min(120, Math.round(startY + dy)));
                card.dataset.iconX = String(x);
                card.dataset.iconY = String(y);
                card.style.transform = `translate(${x}px, ${y}px)`;
                card.classList.add("jami-file-dragging");

                const time = performance.now();
                if (time - this.iconDragSendAt > 45) {
                    this.iconDragSendAt = time;
                    this.send({ type: "jami-icon-drag", id: item.id, parentPath: this.explorerPath, x, y });
                }
            });

            const stop = async event => {
                if (event.pointerId !== pointerId) return;
                pointerId = null;
                card.classList.remove("jami-file-dragging");
                if (!moved) return;
                event.preventDefault();
                event.stopPropagation();
                try {
                    const snap = value => Math.max(-120, Math.min(120, Math.round((Number(value) || 0) / 16) * 16));
                    const snappedX = snap(card.dataset.iconX);
                    const snappedY = snap(card.dataset.iconY);
                    card.dataset.iconX = String(snappedX);
                    card.dataset.iconY = String(snappedY);
                    card.style.transform = `translate(${snappedX}px, ${snappedY}px)`;
                    const data = await this.api("/api/test/jami/fs/position", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            sessionId: this.sessionId,
                            name: this.name,
                            id: item.id,
                            x: snappedX,
                            y: snappedY
                        })
                    });
                    item.iconPosition = data.node.iconPosition;
                } catch (error) {
                    this.explorerStatus.textContent = error.message;
                }
            };

            card.addEventListener("pointerup", stop);
            card.addEventListener("pointercancel", stop);
        }

        applyRemoteIconPosition(id, x, y, live = false) {
            const card = this.explorerGrid?.querySelector(`.jami-file-card[data-id="${CSS.escape(String(id))}"]`);
            if (!card || card.classList.contains("jami-file-dragging")) return;
            const safeX = Math.max(-120, Math.min(120, Number(x) || 0));
            const safeY = Math.max(-120, Math.min(120, Number(y) || 0));
            card.dataset.iconX = String(safeX);
            card.dataset.iconY = String(safeY);
            card.style.transform = `translate(${safeX}px, ${safeY}px)`;
            card.classList.toggle("jami-file-remote-moving", live);
            if (live) setTimeout(() => card.classList.remove("jami-file-remote-moving"), 120);
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
            const choice = await this.openDialog({
                title: kind === "folder" ? "new folder" : "new text file",
                message: this.explorerPath,
                label: "name",
                value: suggested,
                confirmText: "create"
            });
            if (!choice.confirmed || !choice.value.trim()) return;
            const nodeName = choice.value.trim();
            try {
                await this.api("/api/test/jami/fs/create", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: this.sessionId, name: this.name, parentPath: this.explorerPath, nodeName, kind })
                });
                await this.loadExplorer(this.explorerPath);
            } catch (error) { this.explorerStatus.textContent = error.message; }
        }

        fileContextAction(item, event) {
            if (item.system) {
                this.explorerStatus.textContent = "permission denied: owner is jami";
                this.hideContextMenu();
                return;
            }
            this.contextMenuItem = item;
            if (!this.contextMenu) return;
            const inTrash = this.explorerPath === "/trash" && item.trashed;
            for (const button of this.contextMenu.querySelectorAll("[data-jami-context-action]")) {
                const action = button.dataset.jamiContextAction;
                button.hidden = inTrash
                    ? !["restore", "delete"].includes(action)
                    : ["restore", "delete"].includes(action);
            }
            const shell = this.root.querySelector(".jami-shell")?.getBoundingClientRect();
            const left = Math.max(8, Math.min((shell?.width || innerWidth) - 150, event.clientX - (shell?.left || 0)));
            const top = Math.max(8, Math.min((shell?.height || innerHeight) - 120, event.clientY - (shell?.top || 0)));
            this.contextMenu.style.left = `${left}px`;
            this.contextMenu.style.top = `${top}px`;
            this.contextMenu.hidden = false;
        }

        hideContextMenu() {
            if (this.contextMenu) this.contextMenu.hidden = true;
            this.contextMenuItem = null;
        }

        async runContextAction(action) {
            const item = this.contextMenuItem;
            this.hideContextMenu();
            if (!item) return;
            try {
                if (action === "restore") {
                    await this.restoreById(item.id);
                    return;
                }
                if (action === "delete") {
                    const choice = await this.openDialog({
                        title: "delete forever",
                        message: `${item.path}\n\nThis cannot be undone.`,
                        confirmText: "delete forever",
                        input: false,
                        danger: true
                    });
                    if (choice.confirmed) await this.deleteForeverById(item.id);
                    return;
                }
                if (action === "trash") {
                    const choice = await this.openDialog({
                        title: "move to trash",
                        message: item.path,
                        confirmText: "trash",
                        input: false,
                        danger: true
                    });
                    if (choice.confirmed) await this.trashPath(item.path);
                    return;
                }
                if (action === "rename") {
                    const choice = await this.openDialog({
                        title: "rename",
                        message: item.path,
                        label: "new name",
                        value: item.name,
                        confirmText: "rename"
                    });
                    if (!choice.confirmed || !choice.value.trim()) return;
                    await this.movePath(item.path, this.explorerPath, choice.value.trim());
                    return;
                }
                if (action === "move") {
                    const choice = await this.openDialog({
                        title: "move",
                        message: item.path,
                        label: "destination folder",
                        value: "/public",
                        confirmText: "move"
                    });
                    if (!choice.confirmed || !choice.value.trim()) return;
                    await this.movePath(item.path, choice.value.trim(), item.name);
                }
            } catch (error) {
                this.explorerStatus.textContent = error.message;
            }
        }

        async openTextFile(path) {
            try {
                if (this.notepadNodeId) this.sendFilePresence("close");
                const data = await this.api(`/api/test/jami/fs/read?path=${encodeURIComponent(path)}`);
                this.notepadPath = data.node.path;
                this.notepadNodeId = data.node.id;
                this.notepadRevision = data.node.revision;
                this.notepadDirty = false;
                this.notepadEditor.value = data.content || "";
                this.notepadEditor.readOnly = data.node.system === true;
                this.notepadMeta.textContent = `${data.node.path} · owner ${data.node.owner} · revision ${data.node.revision} · ${data.node.size} bytes${data.node.system ? " · read-only" : ""}`;
                this.notepadStatus.textContent = data.node.system ? "system file" : "ready";
                if (this.notepadHistoryPanel) this.notepadHistoryPanel.hidden = true;
                this.notepadStatus.classList.remove("jami-warning");
                this.root.querySelector('[data-jami-title="notepad"]').textContent = `notepad // ${data.node.name}`;
                const notepadTask = this.root.querySelector("[data-jami-notepad-task]");
                if (notepadTask) notepadTask.hidden = false;
                this.openWindow("notepad");
                this.sendFilePresence("read");
                this.updateNotepadPresence();
            } catch (error) { this.write(`${path}: ${error.message}`, "warn"); }
        }

        async toggleNotepadHistory() {
            if (!this.notepadNodeId || !this.notepadPath || !this.notepadHistoryPanel) return;
            if (!this.notepadHistoryPanel.hidden) {
                this.notepadHistoryPanel.hidden = true;
                return;
            }
            this.notepadHistoryPanel.hidden = false;
            this.notepadHistoryPanel.textContent = "loading history…";
            try {
                const data = await this.api(`/api/test/jami/fs/revisions?path=${encodeURIComponent(this.notepadPath)}`);
                const rows = Array.isArray(data.revisions) ? data.revisions : [];
                this.notepadHistoryPanel.textContent = "";
                if (!rows.length) {
                    this.notepadHistoryPanel.textContent = "no earlier revisions";
                    return;
                }
                const heading = document.createElement("div");
                heading.className = "jami-history-heading";
                heading.textContent = "saved revisions";
                this.notepadHistoryPanel.appendChild(heading);
                rows.slice().reverse().forEach(entry => {
                    const row = document.createElement("button");
                    row.type = "button";
                    row.className = "jami-history-row";
                    const when = Number(entry.modifiedAt) ? new Date(entry.modifiedAt).toLocaleString() : "unknown time";
                    row.textContent = `r${entry.revision} · ${when}${entry.modifiedByName ? ` · ${entry.modifiedByName}` : ""}`;
                    row.addEventListener("click", () => {
                        const preview = document.createElement("pre");
                        preview.className = "jami-history-preview";
                        preview.textContent = entry.content || "";
                        this.notepadHistoryPanel.querySelector(".jami-history-preview")?.remove();
                        this.notepadHistoryPanel.appendChild(preview);
                    });
                    this.notepadHistoryPanel.appendChild(row);
                });
            } catch (error) {
                this.notepadHistoryPanel.textContent = error.message;
            }
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
                this.notepadDirty = false;
                this.notepadMeta.textContent = `${data.node.path} · owner ${data.node.owner} · revision ${data.node.revision} · ${data.node.size} bytes`;
                this.notepadStatus.textContent = "saved";
                this.sendFilePresence("read");
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

        async deleteForeverById(id) {
            try {
                await this.api("/api/test/jami/fs/delete", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: this.sessionId, name: this.name, id })
                });
                await this.loadExplorer("/trash");
            } catch (error) { this.explorerStatus.textContent = error.message; }
        }

        async runCommand(raw) {
            const commandLine = String(raw || "").trim();
            if (!commandLine) return;

            this.write(`${this.name}@jami:${this.currentPath}$ ${commandLine}`);
            this.history.push(commandLine);
            this.history = this.history.slice(-100);
            this.historyIndex = this.history.length;
            sessionStorage.setItem("jami_terminal_history", JSON.stringify(this.history));

            const [commandRaw, ...args] = this.parseCommandLine(commandLine);
            const command = String(commandRaw || "").toLowerCase();

            try {
                switch (command) {
                    case "help":
                        this.commandHelp();
                        break;
                    case "man":
                        this.commandMan(args[0]);
                        break;
                    case "clear":
                        this.output.textContent = "";
                        break;
                    case "history":
                        this.commandHistory(args);
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
                    case "which":
                        this.commandWhich(args[0]);
                        break;
                    case "find":
                        await this.commandFind(args[0] || ".", args[1] || "");
                        break;
                    case "open":
                        await this.commandOpen(args[0]);
                        break;
                    case "pwd":
                        this.write(this.currentPath);
                        break;
                    case "cd":
                        await this.commandCd(args[0] || "/");
                        break;
                    case "ls":
                        await this.commandLs(args);
                        break;
                    case "cat":
                        await this.commandCat(args[0]);
                        break;
                    case "stat":
                        await this.commandStat(args[0] || ".");
                        break;
                    case "tree":
                        await this.commandTree(args[0] || ".");
                        break;
                    case "touch":
                        await this.commandCreate("text", args[0]);
                        break;
                    case "mkdir":
                        await this.commandCreate("folder", args[0]);
                        break;
                    case "mv":
                        await this.commandMv(args[0], args[1]);
                        break;
                    case "rename":
                        await this.commandRename(args[0], args.slice(1).join(" "));
                        break;
                    case "trash":
                        await this.commandTrash(args[0]);
                        break;
                    case "restore":
                        await this.commandRestore(args[0]);
                        break;
                    case "delete":
                        await this.commandDelete(args[0]);
                        break;
                    case "quota":
                        await this.commandQuota();
                        break;
                    case "edit":
                        if (!args[0]) this.write("usage: edit <file>", "warn");
                        else await this.openTextFile(this.resolveClientPath(args[0]));
                        break;
                    case "jami":
                        this.write("Jami", "ok");
                        this.write("shared files · live chat · radio · system");
                        break;
                    case "chat":
                        await this.enterChatClient();
                        break;
                    case "monitor":
                        this.openWindow("monitor");
                        break;
                    case "radio":
                        this.openWindow("radio");
                        break;
                    case "exit":
                    case "logout":
                        this.close();
                        break;
                    default:
                        this.write(`${command}: command not found`, "warn");
                        this.write(`try 'help' or 'man ${command}'`, "muted");
                }
            } catch (error) {
                String(error.message || error).split("\n").forEach((line, index) => this.write(line, index ? "muted" : "warn"));
            }
        }

        commandHelp() {
            this.write("JAMI", "ok");
            this.write("filesystem   pwd cd ls cat stat tree find touch mkdir mv rename trash restore delete quota");
            this.write("programs     open edit chat monitor nowplaying");
            this.write("system       who users ps netstat uptime date which history clear jami");
            this.write("");
            this.write("quotes, relative paths, .. and escaped spaces are supported.", "muted");
            this.write("Tab completes commands and filesystem paths. ↑/↓ browses history.", "muted");
            this.write("use 'man <command>' for command help.", "muted");
        }

        commandMan(command) {
            const docs = {
                ls: "ls [-a] [-l] [path]\n  -a include hidden entries\n  -l show owner/type/revision/size",
                find: "find [path] [name]\n  recursively search up to 8 levels; name is a case-insensitive substring",
                open: "open <app|path>\n  folders open in Files; text files open in Notepad",
                edit: "edit <file>\n  open a text file in Notepad",
                history: "history [-c]\n  show terminal commands from this browser tab; -c clears them",
                mv: "mv <source> <folder>\n  move a visitor-owned object",
                rename: "rename <path> <new name>\n  rename a visitor-owned object; quotes are supported",
                trash: "trash <path>\n  move a visitor-owned object into /trash",
                restore: "restore <name-or-id>\n  restore an object from /trash",
                delete: "delete <name-or-id>\n  permanently delete an object from /trash; this cannot be undone",
                stat: "stat <path>\n  display persistent metadata plus live readers/editors",
                tree: "tree [path]\n  recursively show a directory tree",
                who: "who\n  show live Jami sessions and their current activity",
                netstat: "netstat\n  show Jami transport state, RTT and connected peers",
                nowplaying: "nowplaying\n  query the real Watch Party state",
                chat: "chat\n  open live chat\n  plain text sends a message; /reply replies; /users lists people; /exit closes it",
                monitor: "monitor\n  open the live system monitor\n  values are read from the current browser, JamiRoom status, and existing site services",
                radio: "radio\n  open radio; defaults to Watch Party when active, otherwise the site radio station"
            };
            if (!command) {
                this.write("usage: man <command>", "warn");
                return;
            }
            const text = docs[String(command).toLowerCase()];
            if (!text) {
                this.write(`no manual entry for ${command}`, "warn");
                return;
            }
            text.split("\n").forEach(line => this.write(line));
        }

        commandHistory(args = []) {
            if (args.includes("-c")) {
                this.history = [];
                this.historyIndex = 0;
                sessionStorage.removeItem("jami_terminal_history");
                this.write("history cleared", "ok");
                return;
            }

            this.history.forEach((entry, index) => this.write(`${String(index + 1).padStart(3)}  ${entry}`));
        }

        commandWhich(command) {
            if (!command) {
                this.write("usage: which <command>", "warn");
                return;
            }

            const name = String(command).toLowerCase();
            if (this.terminalCommands().includes(name)) {
                if (name === "chat") this.write("/programs/chat");
                else if (name === "monitor") this.write("built-in: system monitor");
                else if (name === "radio") this.write("built-in: radio");
                else this.write(`${name}: built in to Jami`);
            } else {
                this.write(`${command}: not found`, "warn");
            }
        }

        async commandFind(target, query) {
            const rootPath = this.resolveClientPath(target || ".");
            const needle = String(query || "").toLowerCase();
            let found = 0;

            const walk = async (path, depth = 0) => {
                if (depth > 8) return;
                const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(path)}&all=1`);
                for (const item of data.items || []) {
                    if (!needle || item.name.toLowerCase().includes(needle)) {
                        this.write(item.path);
                        found += 1;
                    }
                    if (item.kind === "folder") {
                        try { await walk(item.path, depth + 1); } catch {}
                    }
                }
            };

            await walk(rootPath);
            if (!found) this.write("no matches", "muted");
        }

        commandWho() {
            if (!this.users.length) { this.write("no identified jami sessions"); return; }
            this.write(`${this.users.length} user${this.users.length === 1 ? "" : "s"} connected`, "ok"); this.write("");
            for (const user of this.users) {
                const you = user.sessionId === this.sessionId ? " (you)" : "";
                const activity = user.editingFilePath
                    ? `editing ${user.editingFilePath}`
                    : user.readingFilePath
                        ? `reading ${user.readingFilePath}`
                        : user.app || "desktop";
                this.write(`${String(user.name).padEnd(18)} ${String(user.path || "/").padEnd(22)} ${activity}${you}`);
            }
        }
        commandUptime() { if (!this.networkCreatedAt) { this.write("network epoch unavailable", "warn"); return; } const elapsed = Math.max(0, Date.now() - this.networkCreatedAt); const days = Math.floor(elapsed / 86400000); const hours = Math.floor((elapsed % 86400000) / 3600000); const minutes = Math.floor((elapsed % 3600000) / 60000); this.write(`jami network: ${days}d ${hours}h ${minutes}m`); }
        async commandPs() {
            let watch = null, status = null;
            try { watch = (await (await fetch(`${API}/api/watchparty`)).json())?.state; } catch {}
            try { status = await this.api("/api/test/jami/status"); } catch {}
            this.write("SERVICE          STATE        SOURCE", "muted");
            this.write(`jami-presence    ${this.socket?.readyState === WebSocket.OPEN ? "connected" : "offline"}    /api/test/jami/socket`);
            this.write(`filesystem       ${status?.filesystem?.nodes ?? "?"} nodes      JamiRoom storage`);
            this.write(`cat-chat         ${this.chatSocket?.readyState === WebSocket.OPEN ? "connected" : "available"}    /api/chat/socket`);
            this.write(`watch-party      ${watch?.enabled ? "active" : "inactive"}      /api/watchparty`);
        }
        commandNetstat() { const state = this.socket?.readyState === WebSocket.OPEN ? "ESTABLISHED" : "CLOSED"; this.write("PROTO  ENDPOINT                              STATE"); this.write(`wss    /api/test/jami/socket                 ${state}`); const chatState = this.chatSocket?.readyState === WebSocket.OPEN ? "ESTABLISHED" : "CLOSED"; this.write(`wss    /api/chat/socket                      ${chatState}`); this.write(`rtt    ${this.latencyMs == null ? "unknown" : `${this.latencyMs} ms`}`); this.write(`peers  ${this.users.length}`); }
        startRadio() {
            this.stopRadio(false);
            this.radioMode = null;
            this.radioWatchParty = null;
            this.radioStationPlaying = true;
            this.radioServerPollAt = 0;
            this.refreshRadio(true);
            this.radioTimer = setInterval(() => this.refreshRadio(false), 500);
        }

        stopRadio(restoreVolume = true) {
            clearInterval(this.radioTimer);
            this.radioTimer = null;
            this.radioCurrentVideoId = null;
            this.radioServerPollAt = 0;
            if (this.radioPlayer) {
                this.radioPlayer.src = "about:blank";
                this.radioPlayer.hidden = false;
            }
            if (this.radioPlayerWrap) this.radioPlayerWrap.hidden = false;
            if (restoreVolume) this.restoreSitePlayerAfterRadio();
        }

        muteSitePlayerForRadio() {
            if (this.radioSiteVolume !== null) return;
            const slider = document.getElementById("volumeSlider");
            if (!slider) return;
            this.radioSiteVolume = slider.value;
            slider.value = "0";
            slider.dispatchEvent(new Event("input", { bubbles: true }));
        }

        restoreSitePlayerAfterRadio() {
            if (this.radioSiteVolume === null) return;
            const slider = document.getElementById("volumeSlider");
            if (slider) {
                slider.value = String(this.radioSiteVolume);
                slider.dispatchEvent(new Event("input", { bubbles: true }));
            }
            this.radioSiteVolume = null;
        }

        suppressSiteWatchPartyVisual() {
            if (!this.siteWatchPartyVisuals) this.siteWatchPartyVisuals = new Map();
            const selectors = [
                "#watchPartyPlayer", "#watchPartyIframe", "#youtubePlayer",
                "[data-watch-party-player]", ".watch-party-player", ".watchparty-player"
            ];
            document.querySelectorAll(selectors.join(",")).forEach(el => {
                if (this.root.contains(el) || this.siteWatchPartyVisuals.has(el)) return;
                this.siteWatchPartyVisuals.set(el, { visibility: el.style.visibility, opacity: el.style.opacity, pointerEvents: el.style.pointerEvents });
                el.style.visibility = "hidden";
                el.style.opacity = "0";
                el.style.pointerEvents = "none";
                const frame = el.tagName === "IFRAME" ? el : el.querySelector?.("iframe");
                frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*");
            });
        }

        restoreSiteWatchPartyVisual() {
            this.siteWatchPartyVisuals?.forEach((old, el) => {
                if (!el?.isConnected) return;
                el.style.visibility = old.visibility;
                el.style.opacity = old.opacity;
                el.style.pointerEvents = old.pointerEvents;
                const frame = el.tagName === "IFRAME" ? el : el.querySelector?.("iframe");
                frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
            });
            this.siteWatchPartyVisuals?.clear();
        }

        radioPostMessage(func, args = []) {
            this.radioPlayer?.contentWindow?.postMessage(JSON.stringify({
                event: "command",
                func,
                args
            }), "*");
        }

        getLiveWatchPartyState() {
            const chatState = window.chat?.watchParty;
            if (chatState && typeof chatState === "object") {
                return {
                    enabled: chatState.enabled === true,
                    currentVideoId: chatState.currentVideoId || null,
                    currentIndex: Number.isInteger(chatState.currentIndex) ? chatState.currentIndex : 0,
                    startedAt: Number.isFinite(Number(chatState.startedAt)) ? Number(chatState.startedAt) : null,
                    paused: chatState.paused === true,
                    pausedAt: Number.isFinite(Number(chatState.pausedAt)) ? Number(chatState.pausedAt) : null,
                    queue: Array.isArray(chatState.queue) ? chatState.queue : []
                };
            }
            return this.radioWatchParty || null;
        }

        async watchPartyAction(endpoint, extraBody = {}) {
            const state = this.getLiveWatchPartyState();
            if (!state?.enabled) return;
            const playerState = window.watchPartyPlayer?.getState?.() || {};
            const body = { clientId: this.clientId, ...extraBody };
            if (Number.isFinite(playerState.currentTime)) body.currentTime = playerState.currentTime;

            const response = await fetch(`${API}/api/watchparty/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            let result = null;
            try { result = await response.json(); } catch {}
            if (!response.ok) throw new Error(result?.error || `Watch Party request failed (${response.status})`);
            return result;
        }

        async radioPlay() {
            if (this.radioMode === "watchparty") {
                try { await this.watchPartyAction("play"); }
                catch (error) { if (this.radioMeta) this.radioMeta.textContent = error.message; }
                return;
            }
            this.radioStationPlaying = true;
            this.radioPostMessage("playVideo");
            this.renderRadioStation(false);
        }

        async radioPause() {
            if (this.radioMode === "watchparty") {
                try { await this.watchPartyAction("pause"); }
                catch (error) { if (this.radioMeta) this.radioMeta.textContent = error.message; }
                return;
            }
            this.radioStationPlaying = false;
            this.radioPostMessage("pauseVideo");
            this.renderRadioStation(false);
        }

        async radioNext() {
            if (this.radioMode === "watchparty") {
                const state = this.getLiveWatchPartyState();
                if (!state?.enabled || !state.currentVideoId) return;
                try {
                    await this.watchPartyAction("next", {
                        expectedVideoId: state.currentVideoId,
                        expectedIndex: state.currentIndex
                    });
                } catch (error) {
                    if (this.radioMeta) this.radioMeta.textContent = error.message;
                }
                return;
            }
            if (!this.radioPlaylist.length) await this.loadRadioPlaylist();
            if (!this.radioPlaylist.length) return;
            this.radioStationIndex = (this.radioStationIndex + 1) % this.radioPlaylist.length;
            localStorage.setItem("jami_radio_station_index", String(this.radioStationIndex));
            this.radioStationPlaying = true;
            this.renderRadioStation(true);
        }

        async setRadioMode(mode, userInitiated = false) {
            const currentWatch = this.getLiveWatchPartyState();
            if (mode === "watchparty" && !currentWatch?.enabled) return;
            if (!["watchparty", "station"].includes(mode)) return;

            this.radioMode = mode;
            this.radioCurrentVideoId = null;

            if (mode === "watchparty") {
                this.restoreSitePlayerAfterRadio();
                if (this.radioPlayerWrap) this.radioPlayerWrap.hidden = false;
                const state = this.getLiveWatchPartyState();
                if (state?.enabled) window.watchPartyPlayer?.applyState?.(state);
                this.renderRadioWatchParty(true);
            } else {
                this.muteSitePlayerForRadio();
                if (this.radioPlayerWrap) this.radioPlayerWrap.hidden = false;
                await this.loadRadioPlaylist();
                this.renderRadioStation(true);
            }

            this.updateRadioModeButtons();
            if (this.isWindowOpen("radio")) this.setActivity(this.currentPath, "radio");
            if (userInitiated) {
                this.addSystemEvent(`radio source: ${mode === "watchparty" ? "watch party" : "radio station"}`);
            }
        }

        updateRadioModeButtons() {
            const watchState = this.getLiveWatchPartyState();
            this.radioModeButtons?.forEach(button => {
                const mode = button.dataset.jamiRadioMode;
                button.classList.toggle("active", mode === this.radioMode);
                if (mode === "watchparty") {
                    button.disabled = !watchState?.enabled;
                    button.title = watchState?.enabled
                        ? "Listen through the site's synchronized Watch Party player"
                        : "Watch Party is not active";
                }
            });
            if (this.radioNextButton) this.radioNextButton.disabled = false;
        }

        radioEmbed(videoId, startSeconds = 0, autoplay = true) {
            if (!this.radioPlayer || !videoId) return;
            const start = Math.max(0, Math.floor(Number(startSeconds) || 0));
            const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?enablejsapi=1&autoplay=${autoplay ? 1 : 0}&playsinline=1&rel=0&start=${start}`;
            this.radioPlayer.src = src;
            this.radioCurrentVideoId = videoId;
        }

        async loadRadioPlaylist() {
            if (this.radioPlaylist.length) return;
            try {
                const response = await fetch(`${API}/api/playlist`, { cache: "no-store" });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const result = await response.json();
                this.radioPlaylist = Array.isArray(result) ? result.filter(item => item?.videoId) : [];
                if (this.radioPlaylist.length) this.radioStationIndex %= this.radioPlaylist.length;
            } catch (error) {
                this.radioPlaylist = [];
                if (this.radioState) this.radioState.textContent = "unavailable";
                if (this.radioTitle) this.radioTitle.textContent = "radio station unavailable";
                if (this.radioMeta) this.radioMeta.textContent = error.message;
            }
        }

        renderRadioStation(forceLoad = false) {
            if (this.radioPlayerWrap) this.radioPlayerWrap.hidden = false;
            const item = this.radioPlaylist[this.radioStationIndex];
            if (!item) {
                if (this.radioState) this.radioState.textContent = "off air";
                if (this.radioTitle) this.radioTitle.textContent = "no station tracks available";
                if (this.radioMeta) this.radioMeta.textContent = "The site playlist is empty.";
                return;
            }
            if (this.radioState) this.radioState.textContent = this.radioStationPlaying ? "radio station" : "paused";
            if (this.radioTitle) this.radioTitle.textContent = item.title || item.videoId;
            if (this.radioMeta) this.radioMeta.textContent = `${this.radioStationIndex + 1} / ${this.radioPlaylist.length}`;
            if (forceLoad || this.radioCurrentVideoId !== item.videoId) {
                this.radioEmbed(item.videoId, 0, this.radioStationPlaying);
            }
        }

        renderRadioWatchParty(forceLoad = false) {
            const state = this.getLiveWatchPartyState() || {};
            if (this.radioPlayerWrap) this.radioPlayerWrap.hidden = false;

            if (!state.enabled || !state.currentVideoId) {
                this.radioMode = "station";
                this.updateRadioModeButtons();
                this.muteSitePlayerForRadio();
                if (this.radioPlayerWrap) this.radioPlayerWrap.hidden = false;
                this.loadRadioPlaylist().then(() => this.renderRadioStation(true));
                return;
            }

            const queue = Array.isArray(state.queue) ? state.queue : [];
            const item = queue[state.currentIndex] || queue.find(entry => entry.videoId === state.currentVideoId);
            const playerState = window.watchPartyPlayer?.getState?.() || {};
            let seconds = Number.isFinite(playerState.currentTime) ? playerState.currentTime : null;
            if (!Number.isFinite(seconds)) {
                seconds = state.paused && Number.isFinite(state.pausedAt) && Number.isFinite(state.startedAt)
                    ? Math.max(0, (state.pausedAt - state.startedAt) / 1000)
                    : Number.isFinite(state.startedAt)
                        ? Math.max(0, (Date.now() - state.startedAt) / 1000)
                        : 0;
            }

            const shouldLoad = forceLoad || this.radioCurrentVideoId !== state.currentVideoId;
            if (shouldLoad) {
                this.radioEmbed(state.currentVideoId, seconds, !state.paused);
                this.lastRadioWatchSyncAt = Date.now();
            } else {
                this.radioPostMessage(state.paused ? "pauseVideo" : "playVideo");
                if (!state.paused && (!this.lastRadioWatchSyncAt || Date.now() - this.lastRadioWatchSyncAt > 5000)) {
                    this.radioPostMessage("seekTo", [Math.max(0, seconds), true]);
                    this.lastRadioWatchSyncAt = Date.now();
                }
            }

            if (this.radioState) this.radioState.textContent = state.paused ? "watch party · paused" : "watch party · live";
            if (this.radioTitle) this.radioTitle.textContent = item?.title || state.currentVideoId;
            const parts = [];
            if (item?.requestedByName) parts.push(`requested by ${item.requestedByName}`);
            parts.push(this.formatTime(seconds));
            if (Number.isFinite(playerState.duration) && playerState.duration > 0) parts.push(`of ${this.formatTime(playerState.duration)}`);
            if (this.radioMeta) this.radioMeta.textContent = parts.join(" · ");
        }

        async refreshRadio(forceLoad = false) {
            if (!this.isWindowOpen("radio")) return;
            if (!this.lastRadioPresenceAt || Date.now() - this.lastRadioPresenceAt > 5000) {
                this.lastRadioPresenceAt = Date.now();
                this.setActivity(this.currentPath, "radio");
            }

            const nowMs = Date.now();
            const localState = window.chat?.watchParty;

            if (!localState || forceLoad || nowMs - (this.radioServerPollAt || 0) > 3000) {
                this.radioServerPollAt = nowMs;
                try {
                    const response = await fetch(`${API}/api/watchparty`, { cache: "no-store" });
                    if (response.ok) {
                        const data = await response.json();
                        const raw = data?.state || {};
                        this.radioWatchParty = {
                            enabled: raw.enabled === true,
                            currentVideoId: raw.currentVideoId || null,
                            currentIndex: Number.isInteger(raw.currentIndex) ? raw.currentIndex : 0,
                            startedAt: Number.isFinite(Number(raw.startedAt)) ? Number(raw.startedAt) : null,
                            paused: raw.paused === true,
                            pausedAt: Number.isFinite(Number(raw.pausedAt)) ? Number(raw.pausedAt) : null,
                            queue: Array.isArray(data?.queue) ? data.queue : (Array.isArray(raw.queue) ? raw.queue : [])
                        };
                        if (!localState && this.radioWatchParty.enabled) {
                            window.watchPartyPlayer?.applyState?.(this.radioWatchParty);
                        }
                    }
                } catch {}
            }

            const current = this.getLiveWatchPartyState();
            if (!this.radioMode) this.radioMode = current?.enabled ? "watchparty" : "station";
            if (this.radioMode === "watchparty" && !current?.enabled) this.radioMode = "station";

            if (this.radioMode === "watchparty") {
                this.restoreSitePlayerAfterRadio();
                this.renderRadioWatchParty(forceLoad);
            } else {
                this.muteSitePlayerForRadio();
                await this.loadRadioPlaylist();
                this.renderRadioStation(forceLoad);
            }
            this.updateRadioModeButtons();
        }

        async commandNowPlaying() { this.write("querying watch party…", "muted"); const response = await fetch(`${API}/api/watchparty`); if (!response.ok) throw new Error(`HTTP ${response.status}`); const data = await response.json(); const state = data?.state || {}; const queue = Array.isArray(data?.queue) ? data.queue : []; const item = queue[state.currentIndex] || queue.find(entry => entry.videoId === state.currentVideoId); if (!state.enabled || !state.currentVideoId) { this.write("watch party: inactive"); return; } this.write("WATCH PARTY", "ok"); this.write(`title       ${item?.title || state.currentVideoId}`); this.write(`requested   ${item?.requestedByName || "unknown"}`); this.write(`state       ${state.paused ? "paused" : "playing"}`); if (state.startedAt) { const seconds = state.paused && state.pausedAt ? Math.max(0, (Number(state.pausedAt) - Number(state.startedAt)) / 1000) : Math.max(0, (Date.now() - Number(state.startedAt)) / 1000); this.write(`position    ${this.formatTime(seconds)}`); } }

        getChatIdentity() {
            const widget = window.chat;
            let name = this.name;
            let avatar = "original.gif";
            let discordToken = "";
            try { name = widget?.getEffectiveChatName?.() || name; } catch {}
            try { avatar = widget?.getEffectiveOutgoingAvatar?.() || avatar; } catch {}
            if (typeof widget?.discordAuthToken === "string") discordToken = widget.discordAuthToken;
            return { name, avatar, discordToken };
        }

        formatChatMessage(message) {
            if (!message || !message.message) return;
            const id = Number(message.id) || message.id || "?";
            if (id !== "?" && this.chatSeenMessageIds.has(String(id))) return;
            if (id !== "?") this.chatSeenMessageIds.add(String(id));
            const stamp = message.created_at ? new Date(message.created_at) : null;
            const time = stamp && !Number.isNaN(stamp.getTime())
                ? stamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "--:--";
            if (message.reply_target_type && message.reply_target_id) {
                this.writeChat(`  ↳ reply to #${message.reply_target_id} ${message.reply_name ? `(${message.reply_name})` : ""}`, "muted");
            }
            this.writeChat(`[${time}] #${id} <${message.name || "guest"}> ${message.message}`);
        }

        getSiteChatWindow() {
            const widget = window.chat;
            if (widget?.window instanceof Element) return widget.window;
            return document.querySelector("#chatWindow, #chat-window, [data-chat-window]");
        }

        hideSiteChat() {
            if (!this.siteChatHiddenElements) this.siteChatHiddenElements = new Map();
            const candidates = new Set([
                this.getSiteChatWindow(),
                ...document.querySelectorAll("#chatWindow, #chat-window, [data-chat-window]")
            ]);
            for (const element of candidates) {
                if (!(element instanceof Element)) continue;
                if (!this.siteChatHiddenElements.has(element)) {
                    this.siteChatHiddenElements.set(element, element.style.display);
                }
                element.style.display = "none";
            }
            clearInterval(this.siteChatHideTimer);
            if (this.chatMode) {
                this.siteChatHideTimer = setInterval(() => {
                    if (this.chatMode) this.hideSiteChatOnce();
                }, 600);
            }
        }

        hideSiteChatOnce() {
            if (!this.siteChatHiddenElements) this.siteChatHiddenElements = new Map();
            const element = this.getSiteChatWindow();
            if (!(element instanceof Element)) return;
            if (!this.siteChatHiddenElements.has(element)) this.siteChatHiddenElements.set(element, element.style.display);
            element.style.display = "none";
        }

        restoreSiteChat() {
            clearInterval(this.siteChatHideTimer);
            this.siteChatHideTimer = null;
            if (!this.siteChatHiddenElements) return;
            for (const [element, display] of this.siteChatHiddenElements) {
                if (element?.isConnected) element.style.display = display ?? "";
            }
            this.siteChatHiddenElements.clear();
        }

        async enterChatClient() {
            if (this.chatMode) {
                this.openWindow("chat");
                this.hideSiteChat();
                return;
            }
            this.chatMode = true;
            this.hideSiteChat();
            this.chatSeenMessageIds.clear();
            if (this.chatOutput) this.chatOutput.textContent = "";
            this.openWindow("chat");
            this.setChatStatus("connecting…");
            this.writeChat("live chat", "ok");
            this.writeChat("same live messages as the site chat", "muted");
            this.writeChat("/reply <id> <message> · /users · /exit", "muted");
            try {
                const response = await fetch(`${API}/api/chat`);
                if (!response.ok) throw new Error(`history HTTP ${response.status}`);
                const messages = await response.json();
                const recent = Array.isArray(messages) ? messages.slice(-30) : [];
                recent.forEach(message => this.formatChatMessage(message));
            } catch (error) {
                this.writeChat(`history unavailable: ${error.message}`, "warn");
            }
            this.connectChatSocket();
        }

        leaveChatClient(announce = true) {
            const wasActive = this.chatMode;
            this.chatMode = false;
            clearTimeout(this.chatReconnectTimer);
            clearTimeout(this.chatTypingTimer);
            this.chatReconnectTimer = null;
            this.chatTypingTimer = null;
            if (this.chatSocket) {
                try { this.chatSocket.close(1000, "left live chat"); } catch {}
            }
            this.chatSocket = null;
            this.chatTypingUsers.clear();
            this.chatReplyTargetId = null;
            this.setChatStatus("disconnected");
            const chatWindow = this.root.querySelector('[data-jami-window="chat"]');
            if (chatWindow) chatWindow.hidden = true;
            this.restoreSiteChat();
            if (wasActive && announce) this.write("live chat closed", "muted");
            if (this.isWindowOpen("terminal")) {
                this.setActivity(this.currentPath, "terminal");
                setTimeout(() => this.input?.focus(), 0);
            }
        }

        connectChatSocket() {
            if (!this.chatMode) return;
            if (this.chatSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.chatSocket.readyState)) return;
            clearTimeout(this.chatReconnectTimer);
            const socket = new WebSocket(CHAT_WS);
            this.chatSocket = socket;
            socket.addEventListener("open", () => {
                if (this.chatSocket !== socket || !this.chatMode) return;
                this.addSystemEvent("live chat connected");
                const identity = this.getChatIdentity();
                socket.send(JSON.stringify({
                    type: "presence",
                    clientId: this.clientId,
                    name: identity.name,
                    avatar: identity.avatar,
                    afk: false,
                    discordToken: identity.discordToken || ""
                }));
                this.setChatStatus(`connected as ${identity.name}`);
                this.writeChat(`connected as ${identity.name}`, "ok");
                this.setActivity(this.currentPath, "cat-chat");
            });
            socket.addEventListener("message", event => {
                if (event.data === "pong") return;
                let data;
                try { data = JSON.parse(event.data); } catch { return; }
                if (data.type === "message" && data.message) {
                    this.formatChatMessage(data.message);
                    return;
                }
                if (data.type === "message-edited" && data.message) {
                    this.writeChat(`[edited #${data.message.id}] <${data.message.name || "guest"}> ${data.message.message}`, "muted");
                    return;
                }
                if (data.type === "members") {
                    this.chatMembers = Array.isArray(data.members) ? data.members : [];
                    return;
                }
                if (data.type === "typing") {
                    if (data.clientId === this.clientId) return;
                    if (data.isTyping) this.chatTypingUsers.set(data.clientId, data.name || "guest");
                    else this.chatTypingUsers.delete(data.clientId);
                    return;
                }
                if (data.type === "ban") {
                    this.writeChat(`chat access denied${data.reason ? `: ${data.reason}` : ""}`, "warn");
                }
            });
            socket.addEventListener("close", event => {
                if (this.chatSocket === socket) this.chatSocket = null;
                this.addSystemEvent(`live chat disconnected (${event.code})`);
                if (!this.chatMode) return;
                this.setChatStatus(`disconnected (${event.code})`);
                this.writeChat(`chat connection closed (${event.code})`, "warn");
                this.chatReconnectTimer = setTimeout(() => this.connectChatSocket(), 1800);
            });
            socket.addEventListener("error", () => {
                if (this.chatMode) this.writeChat("chat transport error", "warn");
            });
        }

        sendChatTyping(isTyping) {
            const socket = this.chatSocket;
            if (!socket || socket.readyState !== WebSocket.OPEN) return;
            const identity = this.getChatIdentity();
            socket.send(JSON.stringify({
                type: "typing",
                clientId: this.clientId,
                name: identity.name,
                isTyping: isTyping === true
            }));
        }

        async sendChatMessage(message, replyTargetId = null) {
            const text = String(message || "").trim();
            if (!text) return;
            const identity = this.getChatIdentity();
            this.sendChatTyping(false);
            const headers = { "Content-Type": "application/json" };
            if (identity.discordToken) headers.Authorization = `Bearer ${identity.discordToken}`;
            const response = await fetch(`${API}/api/chat`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    clientId: this.clientId,
                    name: identity.name,
                    message: text,
                    avatar: identity.avatar,
                    replyTargetType: replyTargetId ? "chat" : null,
                    replyTargetId: replyTargetId || null
                })
            });
            let result = null;
            try { result = await response.json(); } catch {}
            if (!response.ok) {
                const detail = result?.error || `HTTP ${response.status}`;
                const retry = result?.retryAfterMs ? ` (${Math.ceil(result.retryAfterMs / 1000)}s)` : "";
                throw new Error(`${detail}${retry}`);
            }
            this.chatReplyTargetId = null;
        }

        async handleChatInput(commandLine) {
            if (!commandLine) return;
            this.writeChat(`${this.name}@chat> ${commandLine}`);
            const normalized = commandLine.toLowerCase();
            if (normalized === "/exit") {
                this.leaveChatClient();
                return;
            }
            if (normalized === "/users") {
                if (!this.chatMembers.length) {
                    this.writeChat("no member snapshot received yet", "muted");
                    return;
                }
                this.writeChat(`${this.chatMembers.length} connected`);
                this.chatMembers.forEach(member => this.writeChat(`${member.name}${member.afk ? " (afk)" : ""}`));
                return;
            }
            if (normalized.startsWith("/reply ")) {
                const match = commandLine.match(/^\/reply\s+#?(\d+)\s+([\s\S]+)$/i);
                if (!match) {
                    this.writeChat("usage: /reply <message-id> <message>", "warn");
                    return;
                }
                try {
                    await this.sendChatMessage(match[2], Number(match[1]));
                } catch (error) {
                    this.writeChat(`send failed: ${error.message}`, "warn");
                }
                return;
            }
            if (commandLine.startsWith("/")) {
                this.writeChat("available commands: /reply  /users  /exit", "warn");
                return;
            }
            try {
                await this.sendChatMessage(commandLine, null);
            } catch (error) {
                this.writeChat(`send failed: ${error.message}`, "warn");
            }
        }

        async commandOpen(target) {
            const value = String(target || "");
            if (["terminal", "term"].includes(value.toLowerCase())) return this.openWindow("terminal");
            if (["files", "explorer"].includes(value.toLowerCase())) return this.openWindow("explorer");
            if (value.toLowerCase() === "chat") { await this.enterChatClient(); return; }
            if (value.toLowerCase() === "radio") { this.openWindow("radio"); return; }
            if (!value) { this.write("usage: open <app|path>"); return; }
            const path = this.resolveClientPath(value);
            try { const data = await this.api(`/api/test/jami/fs/stat?path=${encodeURIComponent(path)}`); if (data.node.kind === "folder") { this.openWindow("explorer"); await this.loadExplorer(path); } else await this.openTextFile(path); } catch { this.write(`${target}: application or file not found`, "warn"); }
        }
        async commandCd(target) { const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/stat?path=${encodeURIComponent(path)}`); if (data.node.kind !== "folder") throw new Error(`${target}: not a directory`); this.setActivity(path, "terminal"); }
        async commandLs(args) {
            const all = args.includes("-a") || args.includes("-la") || args.includes("-al");
            const long = args.includes("-l") || args.includes("-la") || args.includes("-al");
            const target = args.find(arg => !["-a", "-l", "-la", "-al"].includes(arg)) || ".";
            const path = this.resolveClientPath(target);
            const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(path)}&all=${all ? "1" : "0"}`);

            if (!long) {
                const names = data.items.map(item => `${item.name}${item.kind === "folder" ? "/" : ""}${item.system ? "*" : ""}`);
                this.write((all ? ["./", "../", ...names] : names).join("  ") || "(empty)");
                return;
            }

            this.write("TYPE   OWNER      REV    SIZE     NAME", "muted");
            for (const item of data.items) {
                const type = item.kind === "folder" ? "dir" : "text";
                const size = item.kind === "folder" ? "-" : String(item.size);
                const flags = `${item.hidden ? "h" : "-"}${item.system ? "s" : "-"}`;
                this.write(`${type.padEnd(6)} ${String(item.owner).padEnd(10)} ${String(item.revision).padEnd(6)} ${size.padEnd(8)} ${flags} ${item.name}${item.kind === "folder" ? "/" : ""}`);
            }
        }
        async commandCat(target) { if (!target) { this.write("usage: cat <file>", "warn"); return; } const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/read?path=${encodeURIComponent(path)}`); data.content.split("\n").forEach(line => this.write(line)); }
        async commandStat(target) { const path = this.resolveClientPath(target); const data = await this.api(`/api/test/jami/fs/stat?path=${encodeURIComponent(path)}`); const n = data.node; this.write(n.path, "ok"); this.write(`id:          ${n.id}`); this.write(`type:        ${n.kind}`); this.write(`owner:       ${n.owner}${n.system ? " (system)" : ""}`); this.write(`created by:  ${n.createdByName}`); this.write(`created:     ${new Date(n.createdAt).toLocaleString()}`); this.write(`modified:    ${new Date(n.modifiedAt).toLocaleString()}`); this.write(`revision:    ${n.revision} (${data.revisionCount} stored states)`); if (n.kind === "text") { const presence = this.filePresence[n.id]; this.write(`size:        ${n.size} bytes`); this.write(`readers:     ${presence?.readerCount || 0} online`); this.write(`editors:     ${presence?.editorCount || 0} online`); } if (Array.isArray(n.previousLocations) && n.previousLocations.length) { this.write("previous locations:"); n.previousLocations.forEach(p => this.write(`  ${p}`)); } }
        async commandTree(target) { const rootPath = this.resolveClientPath(target); const walk = async (path, prefix = "", depth = 0) => { if (depth > 5) return; const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent(path)}&all=1`); for (let i = 0; i < data.items.length; i++) { const item = data.items[i], last = i === data.items.length - 1, mark = last ? "└── " : "├── "; this.write(`${prefix}${mark}${item.name}${item.kind === "folder" ? "/" : ""}`); if (item.kind === "folder") await walk(item.path, `${prefix}${last ? "    " : "│   "}`, depth + 1); } }; this.write(rootPath); await walk(rootPath); }
        async commandCreate(kind, target) { if (!target) { this.write(`usage: ${kind === "folder" ? "mkdir" : "touch"} <name>`, "warn"); return; } const full = this.resolveClientPath(target); const parentPath = this.parentPath(full); const nodeName = this.baseName(full); const data = await this.api("/api/test/jami/fs/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: this.sessionId, name: this.name, parentPath, nodeName, kind }) }); this.write(`created ${data.node.path}`, "ok"); }
        async commandMv(source, destination) { if (!source || !destination) { this.write("usage: mv <source> <destination-folder>", "warn"); return; } const sourcePath = this.resolveClientPath(source); const destinationPath = this.resolveClientPath(destination); const data = await this.movePath(sourcePath, destinationPath, this.baseName(sourcePath)); this.write(`moved to ${data.node.path}`, "ok"); }
        async commandRename(source, newName) { if (!source || !newName) { this.write("usage: rename <path> <new-name>", "warn"); return; } const sourcePath = this.resolveClientPath(source); const data = await this.movePath(sourcePath, this.parentPath(sourcePath), newName); this.write(`renamed to ${data.node.path}`, "ok"); }
        async commandTrash(target) { if (!target) { this.write("usage: trash <path>", "warn"); return; } const data = await this.trashPath(this.resolveClientPath(target)); this.write(`${data.node.name} moved to trash`, "ok"); }
        async commandRestore(target) { if (!target) { this.write("usage: restore <name-or-id>", "warn"); return; } const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent("/trash")}&all=1`); const item = data.items.find(entry => entry.id === target || entry.name === target); if (!item) throw new Error("trashed item not found"); const restored = await this.api("/api/test/jami/fs/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: this.sessionId, name: this.name, id: item.id }) }); this.write(`restored ${restored.node.path}`, "ok"); }

        async commandDelete(target) { if (!target) { this.write("usage: delete <name-or-id>", "warn"); return; } const data = await this.api(`/api/test/jami/fs/list?path=${encodeURIComponent("/trash")}&all=1`); const item = data.items.find(entry => entry.id === target || entry.name === target); if (!item) throw new Error("trashed item not found"); await this.api("/api/test/jami/fs/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: this.sessionId, name: this.name, id: item.id }) }); this.write(`deleted ${item.name} forever`, "ok"); }
        async commandQuota() { const data = await this.api(`/api/test/jami/fs/quota?sessionId=${encodeURIComponent(this.sessionId)}`); const q = data.quota; this.write("SESSION ALLOWANCE", "ok"); this.write(`documents     ${q.files} / ${q.limits.files} created`); this.write(`folders       ${q.folders} / ${q.limits.folders} created`); this.write(`storage       ${q.storageBytes} / ${q.limits.storageBytes} bytes`); this.write("creation allowance resets with a new Jami visit/session", "muted"); }
        formatTime(seconds) { const total = Math.max(0, Math.floor(Number(seconds) || 0)); const minutes = Math.floor(total / 60); const remainder = total % 60; return `${minutes}:${String(remainder).padStart(2, "0")}`; }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => new JamiOS(), { once: true });
    else new JamiOS();
})();
