(() => {
"use strict";

const STORAGE_KEY = "jamicat_source_view";
const MAX_LINES = 260;
const TARGET_VISIBLE_LINES = 145;
const FLUSH_MS = 86;
const SAMPLE_MS = 170;
const SLOW_SAMPLE_MS = 850;

const q = (sel, root = document) => root.querySelector(sel);
const qa = (sel, root = document) => [...root.querySelectorAll(sel)];

const clean = (value, max = 160) => String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .slice(0, max);

const num = (value, digits = 2) =>
    Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : "null";

class SourceStream {
    constructor() {
        this.enabled = false;
        this.root = null;
        this.feed = null;
        this.toggle = null;
        this.queue = [];
        this.seq = 0;
        this.lastFrame = performance.now();
        this.frameCount = 0;
        this.frameAccum = 0;
        this.lastFrameReport = performance.now();
        this.lastNodeCount = 0;
        this.lastVisibility = document.visibilityState;
        this.lastOnline = navigator.onLine;
        this.lastPlayerTime = null;
        this.lastPlayerPlaying = null;
        this.lastPlayerVideo = null;
        this.lastTerminalRect = "";
        this.lastTheme = "";
        this.lastChatCount = -1;
        this.lastSocketState = "";
        this.lastResourceCount = performance.getEntriesByType("resource").length;
        this.lastPointer = { x: 0, y: 0 };
        this.pendingMutations = { added: 0, removed: 0, attrs: 0, text: 0 };
        this.flushTimer = null;
        this.sampleTimer = null;
        this.slowTimer = null;
        this.raf = 0;
        this.observers = [];
        this.build();
        this.bind();
        this.startCollectors();

        if (localStorage.getItem(STORAGE_KEY) === "1") {
            this.setEnabled(true, false);
        }
    }

    build() {
        this.toggle = document.createElement("button");
        this.toggle.id = "sourceViewToggle";
        this.toggle.type = "button";
        this.toggle.setAttribute("aria-pressed", "false");
        this.toggle.innerHTML =
            '<span aria-hidden="true">&lt;/&gt;</span><span class="source-toggle-label">source</span>';

        this.root = document.createElement("section");
        this.root.id = "sourceView";
        this.root.setAttribute("aria-hidden", "true");
        this.root.innerHTML = `
            <div class="source-depth source-depth-a" aria-hidden="true"></div>
            <div class="source-depth source-depth-b" aria-hidden="true"></div>
            <header class="source-stream-head">
                <span><b>jamie.live</b> — runtime stream</span>
                <span data-source-head-state>standby</span>
            </header>
            <main class="source-feed-wrap">
                <div class="source-feed" role="log" aria-live="off" aria-label="Live website runtime stream"></div>
            </main>
            <footer class="source-stream-foot">
                <span data-source-rate>0 events/s</span>
                <span>live values · sampled rendering · secrets omitted</span>
                <button type="button" data-source-pause>pause</button>
                <button type="button" data-source-exit>GUI</button>
            </footer>
        `;
        document.body.append(this.root, this.toggle);
        this.feed = q(".source-feed", this.root);

        // Seed with genuine initialization facts, then the live collectors take over.
        this.push("runtime", "sourceView.attach", {
            readyState: document.readyState,
            timeOrigin: Math.round(performance.timeOrigin),
            viewport: `${innerWidth}x${innerHeight}`
        }, "system");
        this.push("observer", "collectors.start", {
            frame: true,
            mutation: true,
            performance: true,
            media: true,
            socket: true
        }, "system");
    }

    bind() {
        this.toggle.addEventListener("click", () => this.setEnabled(!this.enabled));
        q("[data-source-exit]", this.root).addEventListener("click", () => this.setEnabled(false));

        q("[data-source-pause]", this.root).addEventListener("click", event => {
            const paused = this.root.classList.toggle("source-paused");
            event.currentTarget.textContent = paused ? "resume" : "pause";
            q("[data-source-head-state]", this.root).textContent = paused ? "render paused" : "streaming";
        });

        window.addEventListener("site-player-state", event => {
            const d = event.detail || {};
            this.push("player", "site-player-state", {
                playing: d.playing === true,
                mode: clean(d.mode || "normal", 24),
                videoId: d.videoId ? clean(d.videoId, 32) : null
            }, "event");
        });

        window.addEventListener("site-theme-change", event => {
            const theme =
                event.detail?.themeName ||
                document.documentElement.getAttribute("data-theme") ||
                localStorage.getItem("theme") ||
                "Default";
            this.push("theme", "site-theme-change", { theme: clean(theme, 32) }, "event");
        });

        window.addEventListener("online", () => this.push("network", "navigator.online", { online: true }, "event"));
        window.addEventListener("offline", () => this.push("network", "navigator.online", { online: false }, "event"));
        document.addEventListener("visibilitychange", () => {
            this.push("document", "visibilitychange", { state: document.visibilityState }, "event");
        });

        // Pointer telemetry is sampled, never logged per raw pointer event.
        window.addEventListener("pointermove", event => {
            this.lastPointer.x = Math.round(event.clientX);
            this.lastPointer.y = Math.round(event.clientY);
        }, { passive: true });

        window.addEventListener("resize", () => {
            this.push("viewport", "resize", {
                width: innerWidth,
                height: innerHeight,
                dpr: num(devicePixelRatio, 2)
            }, "event");
        });
    }

    startCollectors() {
        const mutationObserver = new MutationObserver(records => {
            for (const record of records) {
                if (this.root.contains(record.target) || record.target === this.root || record.target === this.toggle) continue;
                if (record.type === "childList") {
                    this.pendingMutations.added += record.addedNodes.length;
                    this.pendingMutations.removed += record.removedNodes.length;
                } else if (record.type === "attributes") {
                    this.pendingMutations.attrs += 1;
                } else if (record.type === "characterData") {
                    this.pendingMutations.text += 1;
                }
            }
        });
        mutationObserver.observe(document.documentElement, {
            subtree: true, childList: true, attributes: true, characterData: true
        });
        this.observers.push(mutationObserver);

        if ("PerformanceObserver" in window) {
            try {
                const perfObserver = new PerformanceObserver(list => {
                    const entries = list.getEntries();
                    if (!entries.length) return;
                    const latest = entries[entries.length - 1];
                    if (latest.entryType === "resource") {
                        this.push("performance", "resource.complete", {
                            initiator: clean(latest.initiatorType || "other", 18),
                            durationMs: num(latest.duration, 1),
                            transfer: Number.isFinite(latest.transferSize) ? latest.transferSize : null
                        }, "quiet");
                    }
                });
                perfObserver.observe({ type: "resource", buffered: false });
                this.observers.push(perfObserver);
            } catch {}
        }

        const frame = now => {
            const dt = now - this.lastFrame;
            this.lastFrame = now;
            this.frameCount += 1;
            this.frameAccum += dt;

            if (now - this.lastFrameReport >= 500) {
                const avg = this.frameCount ? this.frameAccum / this.frameCount : 0;
                this.push("render", "requestAnimationFrame", {
                    frames: this.frameCount,
                    avgDeltaMs: num(avg, 2),
                    nowMs: num(now, 1)
                }, "heartbeat");
                this.frameCount = 0;
                this.frameAccum = 0;
                this.lastFrameReport = now;
            }
            this.raf = requestAnimationFrame(frame);
        };
        this.raf = requestAnimationFrame(frame);

        this.flushTimer = setInterval(() => this.flush(), FLUSH_MS);
        this.sampleTimer = setInterval(() => this.sampleFast(), SAMPLE_MS);
        this.slowTimer = setInterval(() => this.sampleSlow(), SLOW_SAMPLE_MS);
    }

    getPlayerSnapshot() {
        // Use the public Watch Party/player bridge if available; otherwise inspect media elements.
        try {
            if (window.watchPartyPlayer && typeof window.watchPartyPlayer.getState === "function") {
                const s = window.watchPartyPlayer.getState() || {};
                return {
                    currentTime: Number(s.currentTime),
                    duration: Number(s.duration),
                    playing: s.playing === true,
                    videoId: s.videoId || null,
                    source: "watchPartyPlayer"
                };
            }
        } catch {}

        const media = q("audio, video");
        if (media) {
            return {
                currentTime: Number(media.currentTime),
                duration: Number(media.duration),
                playing: !media.paused,
                videoId: null,
                source: media.tagName.toLowerCase()
            };
        }
        return null;
    }

    getSocket() {
        const candidates = [
            window.chat?.socket,
            window.chatWidget?.socket,
            window.chat?.ws,
            window.chatWidget?.ws
        ];
        return candidates.find(s => s && typeof s.readyState === "number") || null;
    }

    sampleFast() {
        const t = performance.now();

        // This is the continuous "heartbeat": genuine monotonic time and pointer state.
        this.push("clock", "performance.now", {
            t: num(t, 2),
            pointer: [this.lastPointer.x, this.lastPointer.y]
        }, "heartbeat");

        const player = this.getPlayerSnapshot();
        if (player && Number.isFinite(player.currentTime)) {
            this.push("media", "playback.tick", {
                currentTime: num(player.currentTime, 3),
                duration: Number.isFinite(player.duration) ? num(player.duration, 3) : null,
                playing: player.playing,
                source: player.source
            }, "heartbeat");
        }

        const m = this.pendingMutations;
        const mutationTotal = m.added + m.removed + m.attrs + m.text;
        if (mutationTotal) {
            this.push("dom", "mutation.batch", { ...m }, "activity");
            this.pendingMutations = { added: 0, removed: 0, attrs: 0, text: 0 };
        }
    }

    sampleSlow() {
        const nodeCount = document.getElementsByTagName("*").length;
        const terminal = q("#terminal");
        const theme =
            document.documentElement.getAttribute("data-theme") ||
            localStorage.getItem("theme") ||
            "Default";
        const chatCount = qa("#chatMessages .chatMessage, #chatMessages [data-message-id]").length;
        const socket = this.getSocket();
        const socketState = socket
            ? ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][socket.readyState] || String(socket.readyState)
            : "unexposed";

        const memory = performance.memory;
        const payload = {
            nodes: nodeCount,
            viewport: `${innerWidth}x${innerHeight}`,
            visibility: document.visibilityState,
            online: navigator.onLine,
            theme: clean(theme, 28)
        };
        if (memory && Number.isFinite(memory.usedJSHeapSize)) {
            payload.jsHeapMB = num(memory.usedJSHeapSize / 1048576, 1);
        }
        this.push("document", "sample", payload, "quiet");

        if (terminal) {
            const r = terminal.getBoundingClientRect();
            const rect = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}`;
            this.push("layout", "#terminal.getBoundingClientRect", {
                x: Math.round(r.left), y: Math.round(r.top),
                width: Math.round(r.width), height: Math.round(r.height)
            }, rect === this.lastTerminalRect ? "quiet" : "activity");
            this.lastTerminalRect = rect;
        }

        this.push("chat", "transport.sample", {
            socket: socketState,
            renderedMessages: chatCount,
            bufferedAmount: socket && Number.isFinite(socket.bufferedAmount) ? socket.bufferedAmount : null
        }, socketState !== this.lastSocketState || chatCount !== this.lastChatCount ? "activity" : "quiet");
        this.lastSocketState = socketState;
        this.lastChatCount = chatCount;

        const resources = performance.getEntriesByType("resource").length;
        if (resources !== this.lastResourceCount) {
            this.push("performance", "resource.count", {
                total: resources,
                delta: resources - this.lastResourceCount
            }, "activity");
            this.lastResourceCount = resources;
        }

        if (theme !== this.lastTheme) {
            this.push("theme", "active", { value: clean(theme, 28) }, "activity");
            this.lastTheme = theme;
        }
    }

    push(channel, name, data = null, weight = "normal") {
        const stamp = performance.now();
        this.queue.push({
            id: ++this.seq,
            stamp,
            channel,
            name,
            data,
            weight
        });
        if (this.queue.length > 120) this.queue.splice(0, this.queue.length - 120);
    }

    formatValue(value) {
        if (value === null) return '<span class="sv-null">null</span>';
        if (typeof value === "boolean") return `<span class="sv-bool">${value}</span>`;
        if (typeof value === "number") return `<span class="sv-num">${value}</span>`;
        if (Array.isArray(value)) {
            return `[${value.map(v => this.formatValue(v)).join('<span class="sv-punc">, </span>')}]`;
        }
        return `<span class="sv-str">"${this.escape(value)}"</span>`;
    }

    escape(value) {
        return clean(value, 180)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }

    renderEvent(event) {
        const line = document.createElement("div");
        line.className = `source-line source-${event.weight}`;
        line.dataset.seq = event.id;

        const stamp = event.stamp.toFixed(2).padStart(10, " ");
        let html =
            `<span class="sv-time">${stamp}</span>` +
            `<span class="sv-channel">${this.escape(event.channel)}</span>` +
            `<span class="sv-name">${this.escape(event.name)}</span>`;

        const entries = event.data && typeof event.data === "object"
            ? Object.entries(event.data).filter(([key]) =>
                !/token|secret|auth|key|password|cookie|session/i.test(key))
            : [];

        if (!entries.length) {
            html += `<span class="sv-punc">();</span>`;
        } else if (entries.length <= 2) {
            html += `<span class="sv-punc">(</span>`;
            html += entries.map(([k, v]) =>
                `<span class="sv-prop">${this.escape(k)}</span><span class="sv-punc">: </span>${this.formatValue(v)}`
            ).join('<span class="sv-punc">, </span>');
            html += `<span class="sv-punc">);</span>`;
        } else {
            html += `<span class="sv-punc">({</span>`;
            const detail = document.createElement("div");
            detail.className = "source-line-detail";
            detail.innerHTML = entries.map(([k, v]) =>
                `<span><i>${this.escape(k)}</i><b>:</b> ${this.formatValue(v)}<b>,</b></span>`
            ).join("");
            line.innerHTML = html;
            line.appendChild(detail);
            const close = document.createElement("span");
            close.className = "sv-close";
            close.textContent = "});";
            line.appendChild(close);
            return line;
        }

        line.innerHTML = html;
        return line;
    }

    flush() {
        if (!this.enabled || this.root.classList.contains("source-paused")) return;
        if (!this.queue.length) return;

        // Drain a small batch each visual tick. This makes the renderer continuous
        // without pretending that every displayed row occurred at a unique instant.
        const batch = this.queue.splice(0, Math.min(3, this.queue.length));
        const frag = document.createDocumentFragment();
        for (const event of batch) frag.appendChild(this.renderEvent(event));
        this.feed.appendChild(frag);

        while (this.feed.children.length > MAX_LINES) {
            this.feed.firstElementChild?.remove();
        }

        // Let the feed itself be the composition: newest data is always at the bottom.
        const wrap = q(".source-feed-wrap", this.root);
        wrap.scrollTop = wrap.scrollHeight;

        const rate = Math.round(1000 / FLUSH_MS * batch.length);
        q("[data-source-rate]", this.root).textContent = `${rate} render events/s`;

        // Feed two faint depth planes from real rendered rows, not canned Matrix text.
        if (this.seq % 9 < batch.length) this.refreshDepth();
    }

    refreshDepth() {
        const recent = [...this.feed.children].slice(-34);
        const text = recent.map(el => el.textContent.trim()).filter(Boolean).join("\n");
        qa(".source-depth", this.root).forEach((layer, i) => {
            layer.textContent = text;
            layer.style.setProperty("--depth-shift", `${i * 18}px`);
        });
    }

    setEnabled(enabled, persist = true) {
        this.enabled = Boolean(enabled);
        document.documentElement.classList.toggle("source-view-active", this.enabled);
        document.body.classList.toggle("source-view-active", this.enabled);
        this.root.setAttribute("aria-hidden", String(!this.enabled));
        this.toggle.setAttribute("aria-pressed", String(this.enabled));
        q(".source-toggle-label", this.toggle).textContent = this.enabled ? "GUI" : "source";
        q("[data-source-head-state]", this.root).textContent = this.enabled ? "streaming" : "standby";
        if (persist) localStorage.setItem(STORAGE_KEY, this.enabled ? "1" : "0");

        if (this.enabled) {
            this.push("runtime", "sourceView.enter", {
                at: new Date().toISOString(),
                queued: this.queue.length
            }, "event");
            requestAnimationFrame(() => {
                const wrap = q(".source-feed-wrap", this.root);
                wrap.scrollTop = wrap.scrollHeight;
            });
        }
    }
}

const start = () => {
    if (!window.sourceView) window.sourceView = new SourceStream();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
    start();
}
})();
