(() => {
    "use strict";

    const STORAGE_KEY = "jamicat_source_view";
    const PINK = "#f6b8d0";

    const SOURCE_LINES = [
        'const themes = { Default: { glowPrimary: "text-blue-glow" } };',
        'document.documentElement.setAttribute("data-theme", themeName);',
        'window.dispatchEvent(new CustomEvent("site-theme-change", { detail: { themeName } }));',
        'const mainAvatar = document.getElementById("mainAvatar");',
        'const terminal = document.getElementById("terminal");',
        'window.addEventListener("site-player-state", event => { ... });',
        'window.watchPartyPlayer.applyState(state);',
        'player.seekTo(Math.max(0, Number(targetTime) || 0), true);',
        'const socket = new WebSocket(socketUrl);',
        'this.watchParty = { enabled: false, currentVideoId: null, queue: [] };',
        'windowElement.id = "chatWindow";',
        'windowElement.className = `fixed right-4 bottom-4 z-[99999] flex`;',
        'this.setupDragging();',
        'this.setupEmojiPicker();',
        'this.loadHistory().then(() => this.loadReactions());',
        'document.querySelectorAll(".terminal-button").forEach(btn => { ... });',
        'const theme = localStorage.getItem("theme") || "Default";',
        'applyTheme(theme);',
        'const sliderRect = normalProgressSlider.getBoundingClientRect();',
        'const ratio = getRangePointerRatio(normalProgressSlider, pointerX, 10);',
        'updatePlaybackIcons(playing);',
        'document.body.classList.toggle("source-view-active", enabled);',
        'requestAnimationFrame(render);',
        'getBoundingClientRect();',
        'classList.add("active");',
        'classList.remove("hidden");'
    ];

    const escapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const code = value => `<code>${escapeHtml(value)}</code>`;

    class SourceView {
        constructor() {
            this.enabled = false;
            this.root = null;
            this.toggle = null;
            this.clock = null;
            this.profileState = null;
            this.chatState = null;
            this.playerState = null;
            this.streams = null;
            this.lastPlayerState = { playing: false, mode: "normal", videoId: null };
            this.tickTimer = null;
            this.build();
            this.bind();
            this.renderState();

            if (localStorage.getItem(STORAGE_KEY) === "1") {
                this.setEnabled(true, false);
            }
        }

        build() {
            this.toggle = document.createElement("button");
            this.toggle.id = "sourceViewToggle";
            this.toggle.type = "button";
            this.toggle.setAttribute("aria-pressed", "false");
            this.toggle.setAttribute("aria-label", "Open live source view");
            this.toggle.innerHTML = '<span aria-hidden="true">&lt;/&gt;</span><span class="source-toggle-label">source</span>';

            this.root = document.createElement("section");
            this.root.id = "sourceView";
            this.root.setAttribute("aria-hidden", "true");
            this.root.innerHTML = `
                <div class="source-ambient" aria-hidden="true">
                    <div class="source-stream source-stream-a"></div>
                    <div class="source-stream source-stream-b"></div>
                    <div class="source-stream source-stream-c"></div>
                    <div class="source-stream source-stream-d"></div>
                </div>

                <header class="source-header">
                    <div class="source-brand">
                        <span class="source-comment">/*</span>
                        <strong>jamie.live</strong>
                        <span class="source-comment">— rendered as source */</span>
                    </div>
                    <div class="source-header-state">
                        <span data-source-clock>--:--:--</span>
                        <button type="button" data-source-exit>GUI</button>
                    </div>
                </header>

                <main class="source-stage">
                    <article class="source-module source-profile" data-source-module="profile">
                        <div class="source-module-label">
                            <span>01</span>
                            <b>profile.js</b>
                            <i data-source-profile-state>mounted</i>
                        </div>
                        <pre class="source-code source-code-primary"><span class="tok-key">const</span> <span class="tok-fn">jamie</span> = {
    <span class="tok-prop">element</span>: <span class="tok-str">"#terminal"</span>,
    <span class="tok-prop">visible</span>: <span class="tok-bool">true</span>,
    <span class="tok-prop">section</span>: <span data-source-section class="tok-str">"home"</span>,
    <span class="tok-prop">position</span>: <span data-source-position class="tok-value">{ x: 0, y: 0 }</span>
};

<span class="tok-key">function</span> <span class="tok-fn">navigate</span>(section) {
    jamie.section = section;
    <span class="tok-comment">// same functions used by the GUI</span>
}</pre>
                        <nav class="source-nav" aria-label="Code view navigation">
                            <button data-source-action="about"><span>01</span>navigate(<b>"about"</b>)</button>
                            <button data-source-action="art"><span>02</span>navigate(<b>"art"</b>)</button>
                            <button data-source-action="playlist"><span>03</span>navigate(<b>"playlist"</b>)</button>
                            <button data-source-action="guestbook"><span>04</span>navigate(<b>"guestbook"</b>)</button>
                        </nav>
                        <div class="source-brace" aria-hidden="true">};</div>
                    </article>

                    <article class="source-module source-player" data-source-module="player">
                        <div class="source-module-label">
                            <span>02</span>
                            <b>player.runtime</b>
                            <i data-source-player-badge>observing</i>
                        </div>
                        <pre class="source-code"><span class="tok-key">const</span> playback = {
    <span class="tok-prop">mode</span>: <span data-source-player-mode class="tok-str">"normal"</span>,
    <span class="tok-prop">playing</span>: <span data-source-player-playing class="tok-bool">false</span>,
    <span class="tok-prop">videoId</span>: <span data-source-player-video class="tok-value">null</span>
};

window.<span class="tok-fn">addEventListener</span>(
    <span class="tok-str">"site-player-state"</span>,
    state => playback = state.detail
);</pre>
                        <div class="source-pulse-line"><span></span><em>site-player-state</em></div>
                    </article>

                    <article class="source-module source-chat" data-source-module="chat">
                        <div class="source-module-label">
                            <span>03</span>
                            <b>chat.socket</b>
                            <i data-source-chat-badge>locating</i>
                        </div>
                        <pre class="source-code"><span class="tok-key">const</span> chat = {
    <span class="tok-prop">element</span>: <span class="tok-str">"#chatWindow"</span>,
    <span class="tok-prop">mounted</span>: <span data-source-chat-mounted class="tok-bool">false</span>,
    <span class="tok-prop">messages</span>: <span data-source-message-count class="tok-value">0</span>,
    <span class="tok-prop">socket</span>: <span data-source-socket class="tok-value">unknown</span>
};

<span class="tok-comment">// Cat Chat keeps running behind this renderer.</span>
chat.<span class="tok-fn">render</span>();</pre>
                        <button class="source-chat-jump" type="button" data-source-chat-jump>
                            <span>open</span> document.querySelector(<b>"#chatWindow"</b>)
                        </button>
                        <div class="source-brace" aria-hidden="true">}</div>
                    </article>

                    <article class="source-module source-dom" data-source-module="dom">
                        <div class="source-module-label">
                            <span>04</span>
                            <b>document.state</b>
                            <i>live snapshot</i>
                        </div>
                        <div class="source-metrics">
                            <div><span>nodes</span><b data-source-nodes>0</b></div>
                            <div><span>viewport</span><b data-source-viewport>0×0</b></div>
                            <div><span>theme</span><b data-source-theme>Default</b></div>
                            <div><span>visibility</span><b data-source-visibility>visible</b></div>
                        </div>
                        <pre class="source-code source-small"><span class="tok-key">if</span> (document.visibilityState === <span class="tok-str">"visible"</span>) {
    <span class="tok-fn">requestAnimationFrame</span>(render);
}</pre>
                    </article>
                </main>

                <footer class="source-footer">
                    <span><b>PASS 01</b> presentation layer</span>
                    <span class="source-footer-code">normal site remains mounted beneath this view</span>
                </footer>
            `;

            document.body.append(this.root, this.toggle);
            this.clock = this.root.querySelector("[data-source-clock]");
            this.streams = [...this.root.querySelectorAll(".source-stream")];
            this.fillStreams();
        }

        fillStreams() {
            this.streams.forEach((stream, streamIndex) => {
                const lines = [];
                for (let i = 0; i < 24; i += 1) {
                    const source = SOURCE_LINES[(i * 3 + streamIndex * 5) % SOURCE_LINES.length];
                    lines.push(`<span>${escapeHtml(source)}</span>`);
                }
                stream.innerHTML = lines.join("");
            });
        }

        bind() {
            this.toggle.addEventListener("click", () => this.setEnabled(!this.enabled));
            this.root.querySelector("[data-source-exit]").addEventListener("click", () => this.setEnabled(false));

            this.root.querySelectorAll("[data-source-action]").forEach(button => {
                button.addEventListener("click", () => {
                    const action = button.dataset.sourceAction;
                    const actions = {
                        about: () => window.siteFAQ?.(),
                        art: () => window.showArt?.(),
                        playlist: () => window.showList?.(),
                        guestbook: () => window.showGuestBook?.()
                    };
                    actions[action]?.();
                    this.root.querySelector("[data-source-section]").textContent = `"${action}"`;
                    this.flash(button);
                });
            });

            this.root.querySelector("[data-source-chat-jump]").addEventListener("click", () => {
                const chat = document.getElementById("chatWindow");
                if (!chat) return;
                if (chat.classList.contains("hidden")) chat.classList.remove("hidden");
                this.flash(this.root.querySelector(".source-chat"));
            });

            window.addEventListener("site-player-state", event => {
                this.lastPlayerState = { ...this.lastPlayerState, ...(event.detail || {}) };
                this.renderPlayer();
            });

            window.addEventListener("site-theme-change", () => this.renderState());
            window.addEventListener("resize", () => this.renderState());
            document.addEventListener("visibilitychange", () => this.renderState());
        }

        setEnabled(enabled, persist = true) {
            this.enabled = Boolean(enabled);
            document.documentElement.classList.toggle("source-view-active", this.enabled);
            document.body.classList.toggle("source-view-active", this.enabled);
            this.root.setAttribute("aria-hidden", String(!this.enabled));
            this.toggle.setAttribute("aria-pressed", String(this.enabled));
            this.toggle.querySelector(".source-toggle-label").textContent = this.enabled ? "GUI" : "source";
            this.toggle.setAttribute("aria-label", this.enabled ? "Return to normal website" : "Open live source view");

            if (persist) localStorage.setItem(STORAGE_KEY, this.enabled ? "1" : "0");

            if (this.enabled) {
                this.renderState();
                this.tickTimer ||= window.setInterval(() => this.renderState(), 1000);
            } else if (this.tickTimer) {
                clearInterval(this.tickTimer);
                this.tickTimer = null;
            }
        }

        renderState() {
            if (!this.root) return;
            const now = new Date();
            this.clock.textContent = now.toLocaleTimeString([], { hour12: false });

            const terminal = document.getElementById("terminal");
            if (terminal) {
                const rect = terminal.getBoundingClientRect();
                this.root.querySelector("[data-source-position]").textContent =
                    `{ x: ${Math.round(rect.left)}, y: ${Math.round(rect.top)} }`;
                this.root.querySelector("[data-source-profile-state]").textContent =
                    terminal.classList.contains("terminal-minimized") ? "minimized" : "mounted";
            }

            const chat = document.getElementById("chatWindow");
            const messages = document.querySelectorAll("#chatMessages .chatMessage");
            this.root.querySelector("[data-source-chat-mounted]").textContent = String(Boolean(chat));
            this.root.querySelector("[data-source-message-count]").textContent = String(messages.length);

            let socketState = "unavailable";
            const socket = window.chat?.socket || window.chatWidget?.socket || null;
            if (socket && typeof socket.readyState === "number") {
                socketState = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][socket.readyState] || String(socket.readyState);
            } else if (chat) {
                socketState = "mounted";
            }
            this.root.querySelector("[data-source-socket]").textContent = socketState;
            this.root.querySelector("[data-source-chat-badge]").textContent = chat ? "mounted" : "waiting";

            this.root.querySelector("[data-source-nodes]").textContent =
                document.getElementsByTagName("*").length.toLocaleString();
            this.root.querySelector("[data-source-viewport]").textContent =
                `${window.innerWidth}×${window.innerHeight}`;
            this.root.querySelector("[data-source-theme]").textContent =
                document.documentElement.getAttribute("data-theme") ||
                localStorage.getItem("theme") ||
                "Default";
            this.root.querySelector("[data-source-visibility]").textContent =
                document.visibilityState;

            this.renderPlayer();
        }

        renderPlayer() {
            const state = this.lastPlayerState || {};
            this.root.querySelector("[data-source-player-mode]").textContent =
                `"${state.mode || "normal"}"`;
            this.root.querySelector("[data-source-player-playing]").textContent =
                String(state.playing === true);
            this.root.querySelector("[data-source-player-video]").textContent =
                state.videoId ? `"${String(state.videoId).slice(0, 24)}"` : "null";
            this.root.querySelector("[data-source-player-badge]").textContent =
                state.playing === true ? "playing" : "observing";
        }

        flash(element) {
            element?.classList.remove("source-flash");
            void element?.offsetWidth;
            element?.classList.add("source-flash");
        }
    }

    const start = () => {
        if (window.sourceView) return;
        window.sourceView = new SourceView();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
