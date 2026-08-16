class JamiImageRemixEditor {
    constructor() {
        this.overlay = null;
        this.canvas = null;
this.context = null;
this.sourceImage = null;
this.sourceCanvas = null;
this.sourceContext = null;
        this.currentImage = null;
        this.activeEffects =
            new Set();

        this.effectSeed =
    Math.floor(
        Math.random() *
        2147483647
    );
        this.effects = [
            { id: "crt-bloom", label: "CRT bloom" },
            { id: "cctv", label: "CCTV" },
            { id: "scanner-lid-open", label: "scanner lid open" },
            { id: "broken-webcam", label: "broken webcam" },
            { id: "jpeg-deep-fry", label: "JPEG deep fry" },
            { id: "jpeg-100x", label: "JPEG 100x" },
            { id: "gifify-32", label: "GIFify 32 colours" }
        ];

     this.emojiFiles = [
    "blahajspin.gif",
    "blueblob.gif",
    "bobasip.png",
    "bulbasip.png",
    "cantlook.png",
    "catboba.gif",
    "catcooking.gif",
    "catdance.gif",
    "catflip.gif",
    "catpeace.gif",
    "catpregger.png",
    "catslide.gif",
    "clefable.gif",
    "cutespin.gif",
    "drooling.gif",
    "duckbop.gif",
    "duckdance.gif",
    "duckjump.gif",
    "espeonconfetti.gif",
    "floatpuff.gif",
    "hmphshork.png",
    "huh.gif",
    "meowhappy.gif",
    "mew.gif",
    "monsterlemon.png",
    "monstermango.png",
    "monsternails.png",
    "monsterwhite.png",
    "pawpaw.gif",
    "pikagiggle.png",
    "pikagrin.png",
    "pikapuff.gif",
    "pikasideeye.png",
    "pikasway.gif",
    "pikatea.png",
    "pikathink.png",
    "pinkblob.gif",
    "pinkdance.gif",
    "pointandlaugh.png",
    "pokecharge.gif",
    "sharkbongo.gif",
    "sharkburg.gif",
    "sharkgirl.png",
    "sharklove.gif",
    "sharkspin.gif",
    "shorkA.gif",
    "shorkAA.png",
    "shorkboba.png",
    "shorkdance.gif",
    "shorkhug.png",
    "shorkpat.gif",
    "shorkpuffed.webp",
    "shorkspeen.gif",
    "shorkwash.gif",
    "shubadance.gif",
    "smushcat.gif",
    "spinnyshork.gif",
    "sprigdance.gif",
    "staresatyou.png",
    "tongue.gif",
    "widevapo.png",
    "wooperyay.gif",
    "yellowblob.gif"
];

        this.stage = null;
        this.overlayLayer = null;
        this.emojiPicker = null;
        this.overlayItems = [];
        this.selectedOverlayId = null;
        this.overlaySequence = 0;
        this.lastExportBlob = null;
        this.maximumOverlayCount = 24;
        this.maximumAnimatedEmojiCount = 8;
        this.maximumAnimatedOutputBytes =
            Math.floor(7.5 * 1024 * 1024);

        this.createEditor();
    }

    createEditor() {
        const overlay =
            document.createElement(
                "div"
            );

        overlay.className =
            "jami-remix-overlay";

        overlay.hidden = true;

        overlay.innerHTML = `
            <div
                class="jami-remix-editor theme-body"
                role="dialog"
                aria-modal="true"
                aria-label="remix image"
            >
                <div
                    class="jami-remix-header"
                >
                    <div
                        class="jami-remix-title theme-heading"
                    >
                        remix image
                    </div>

                    <button
                        type="button"
                        class="jami-remix-close"
                        data-jami-remix-close
                        aria-label="close remix editor"
                    >
                        ×
                    </button>
                </div>

                <div
                    class="jami-remix-content"
                >
                    <div
                        class="jami-remix-stage-wrapper"
                    >
                        <div
                            class="jami-remix-stage"
                            data-jami-remix-stage
                        >
                            <canvas
                                class="jami-remix-canvas"
                                data-jami-remix-canvas
                                aria-label="image being remixed"
                            ></canvas>

                            <div
                                class="jami-remix-overlay-layer"
                                data-jami-remix-overlay-layer
                            ></div>
                        </div>
                    </div>

                    <aside
                        class="jami-remix-sidebar"
                    >
                        <div
                            class="jami-remix-section-title"
                        >
                            effects
                        </div>

                        <div
                            class="jami-remix-filter-list"
                            data-jami-remix-effects
                        ></div>

                        <div
                            class="jami-remix-section-title jami-remix-overlay-title"
                        >
                            overlays
                        </div>

                        <div
                            class="jami-remix-filter-list"
                            data-jami-remix-overlay-tools
                        ></div>

                        <div
                            class="jami-remix-emoji-picker"
                            data-jami-remix-emoji-picker
                            hidden
                        ></div>
                    </aside>
                </div>

                <div
                    class="jami-remix-footer"
                >
                    <button
                        type="button"
                        data-jami-remix-cancel
                    >
                        cancel
                    </button>

                    <button
                        type="button"
                        class="jami-remix-save"
                        data-jami-remix-save
                    >
                        save remix
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(
            overlay
        );

        this.overlay = overlay;

        this.stage =
            overlay.querySelector(
                "[data-jami-remix-stage]"
            );

        this.overlayLayer =
            overlay.querySelector(
                "[data-jami-remix-overlay-layer]"
            );

        this.emojiPicker =
            overlay.querySelector(
                "[data-jami-remix-emoji-picker]"
            );

        this.canvas =
    overlay.querySelector(
        "[data-jami-remix-canvas]"
    );

this.context =
    this.canvas.getContext(
        "2d",
        {
            willReadFrequently:
                true
        }
    );

this.sourceCanvas =
    document.createElement(
        "canvas"
    );

this.sourceContext =
    this.sourceCanvas.getContext(
        "2d",
        {
            willReadFrequently:
                true
        }
    );

        const effectsContainer =
            overlay.querySelector(
                "[data-jami-remix-effects]"
            );

        for (
            const effect
            of this.effects
        ) {
            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "jami-remix-filter";

            button.textContent =
    effect.label;

button.dataset.effectId =
    effect.id;

button.dataset.effectLabel =
    effect.label;

            button.setAttribute(
                "aria-pressed",
                "false"
            );

            button.addEventListener(
                "click",
                () => {
                    this.toggleEffect(
                        effect.id,
                        button
                    );
                }
            );

            effectsContainer.appendChild(
                button
            );
        }

        const overlayToolsContainer =
            overlay.querySelector(
                "[data-jami-remix-overlay-tools]"
            );

        const emojiButton =
            this.createToolButton(
                "custom emoji picker",
                () => this.toggleEmojiPicker()
            );

        const orbButton =
            this.createToolButton(
                "add ghost orb",
                () => this.addGhostOrb()
            );

        overlayToolsContainer.append(
            emojiButton,
            orbButton
        );

        this.renderEmojiPicker();

        overlay
            .querySelector(
                "[data-jami-remix-close]"
            )
            .addEventListener(
                "click",
                () => this.close()
            );

        overlay
            .querySelector(
                "[data-jami-remix-cancel]"
            )
            .addEventListener(
                "click",
                () => this.close()
            );

        overlay
            .querySelector(
                "[data-jami-remix-save]"
            )
            .addEventListener(
                "click",
                async () => {
                    await this.saveRemix();
                }
            );

        overlay.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    overlay
                ) {
                    this.close();
                }
            }
        );

        this.stage.addEventListener(
            "pointerdown",
            event => {
                if (
                    event.target === this.stage ||
                    event.target === this.canvas ||
                    event.target === this.overlayLayer
                ) {
                    this.selectOverlay(null);
                }
            }
        );

        document.addEventListener(
            "keydown",
            event => {
                if (this.overlay.hidden) {
                    return;
                }

                if (event.key === "Escape") {
                    if (this.emojiPicker && !this.emojiPicker.hidden) {
                        this.emojiPicker.hidden = true;
                        return;
                    }

                    this.close();
                    return;
                }

                if (
                    (event.ctrlKey || event.metaKey) &&
                    event.key.toLowerCase() === "d" &&
                    this.selectedOverlayId
                ) {
                    event.preventDefault();
                    this.duplicateOverlay(
                        this.selectedOverlayId
                    );
                    return;
                }

                if (
                    event.key === "[" &&
                    this.selectedOverlayId
                ) {
                    event.preventDefault();
                    this.moveOverlayLayer(
                        this.selectedOverlayId,
                        -1
                    );
                    return;
                }

                if (
                    event.key === "]" &&
                    this.selectedOverlayId
                ) {
                    event.preventDefault();
                    this.moveOverlayLayer(
                        this.selectedOverlayId,
                        1
                    );
                    return;
                }

                if (
                    event.key === "Delete" ||
                    event.key === "Backspace"
                ) {
                    const target = event.target;

                    if (
                        target instanceof HTMLInputElement ||
                        target instanceof HTMLTextAreaElement
                    ) {
                        return;
                    }

                    if (this.selectedOverlayId) {
                        event.preventDefault();
                        this.removeOverlay(
                            this.selectedOverlayId
                        );
                    }
                }
            }
        );
    }

    async loadSourceImage(
    imageUrl
) {
    const image =
        new Image();

    image.crossOrigin =
        "anonymous";

    await new Promise(
        (
            resolve,
            reject
        ) => {
            image.addEventListener(
                "load",
                resolve,
                {
                    once: true
                }
            );

            image.addEventListener(
                "error",
                () => {
                    reject(
                        new Error(
                            "could not load image for remixing"
                        )
                    );
                },
                {
                    once: true
                }
            );

            image.src =
                imageUrl;
        }
    );

    this.sourceImage =
        image;

    const maximumDimension =
        1400;

    const scale =
        Math.min(
            1,
            maximumDimension /
                Math.max(
                    image.naturalWidth,
                    image.naturalHeight
                )
        );

    const width =
        Math.max(
            1,
            Math.round(
                image.naturalWidth *
                scale
            )
        );

    const height =
        Math.max(
            1,
            Math.round(
                image.naturalHeight *
                scale
            )
        );

    this.sourceCanvas.width =
        width;

    this.sourceCanvas.height =
        height;

    this.canvas.width =
        width;

    this.canvas.height =
        height;

    this.sourceContext.clearRect(
        0,
        0,
        width,
        height
    );

    this.sourceContext.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    this.render();
}

    render() {
    if (
        !this.sourceCanvas ||
        !this.context
    ) {
        return;
    }

    const width =
        this.sourceCanvas.width;

    const height =
        this.sourceCanvas.height;

    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }

    const workingCanvas =
        document.createElement(
            "canvas"
        );

    workingCanvas.width =
        width;

    workingCanvas.height =
        height;

    const workingContext =
        workingCanvas.getContext(
            "2d",
            {
                willReadFrequently:
                    true
            }
        );

    workingContext.drawImage(
        this.sourceCanvas,
        0,
        0
    );

    for (
        const effectId
        of this.activeEffects
    ) {
        this.applyEffect(
            effectId,
            workingCanvas,
            workingContext
        );
    }

    this.context.clearRect(
        0,
        0,
        width,
        height
    );

    this.context.drawImage(
        workingCanvas,
        0,
        0
    );
}

applyEffect(
    effectId,
    canvas,
    context
) {
    switch (effectId) {
        case "crt-bloom":
            this.applyCrtBloom(
                canvas,
                context
            );
            break;

        case "cctv":
            this.applyCctv(
                canvas,
                context
            );
            break;

        case "scanner-lid-open":
            this.applyScannerLidOpen(
                canvas,
                context
            );
            break;

        case "broken-webcam":
            this.applyBrokenWebcam(
                canvas,
                context
            );
            break;

        case "jpeg-deep-fry":
            this.applyJpegDeepFry(
                canvas,
                context
            );
            break;

        case "jpeg-100x":
            this.applyJpeg100x(
                canvas,
                context
            );
            break;

        case "gifify-32":
            this.applyGifify32(
                canvas,
                context
            );
            break;

        default:
            break;
    }
}

    applyCrtBloom(
    canvas,
    context
) {
    const width =
        canvas.width;

    const height =
        canvas.height;

    const original =
        document.createElement(
            "canvas"
        );

    original.width =
        width;

    original.height =
        height;

    const originalContext =
        original.getContext(
            "2d"
        );

    originalContext.drawImage(
        canvas,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.save();

    context.filter =
        "contrast(1.12) saturate(1.14) brightness(1.03)";

    context.drawImage(
        original,
        0,
        0
    );

    context.restore();
    context.save();

    context.globalCompositeOperation =
        "screen";

    context.globalAlpha =
        0.34;

    context.filter =
        "blur(5px) saturate(1.2)";

    context.drawImage(
        original,
        0,
        0
    );

    context.restore();

    context.save();

    context.globalAlpha =
        0.16;

    context.fillStyle =
        "#000";

    for (
        let y = 1;
        y < height;
        y += 3
    ) {
        context.fillRect(
            0,
            y,
            width,
            1
        );
    }

    context.restore();

    const vignette =
        context.createRadialGradient(
            width / 2,
            height / 2,
            Math.min(
                width,
                height
            ) * 0.22,

            width / 2,
            height / 2,
            Math.max(
                width,
                height
            ) * 0.72
        );

    vignette.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    vignette.addColorStop(
        0.72,
        "rgba(0,0,0,0.04)"
    );

    vignette.addColorStop(
        1,
        "rgba(0,0,0,0.36)"
    );

    context.fillStyle =
        vignette;

    context.fillRect(
        0,
        0,
        width,
        height
    );

    context.save();

    context.globalCompositeOperation =
        "screen";

    context.globalAlpha =
        0.055;

    context.fillStyle =
        "#7799bb";

    context.fillRect(
        0,
        0,
        width,
        height
    );

    context.restore();
}

    createSeededRandom(
    seed
) {
    let state =
        Number(seed) ||
        1;

    return () => {
        state =
            (
                state *
                1664525 +
                1013904223
            ) >>> 0;

        return (
            state /
            4294967296
        );
    };
}
    
applyCctv(
    canvas,
    context
) {
    const width =
        canvas.width;

    const height =
        canvas.height;

    const random =
    this.createSeededRandom(
        this.effectSeed +
        2001
    );

    const original =
        document.createElement(
            "canvas"
        );

    original.width =
        width;

    original.height =
        height;

    const originalContext =
        original.getContext(
            "2d"
        );

    originalContext.drawImage(
        canvas,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.save();

    context.filter = [
        "grayscale(0.92)",
        "contrast(1.22)",
        "brightness(0.88)",
        "saturate(0.35)"
    ].join(" ");

    context.drawImage(
        original,
        0,
        0
    );

    context.restore();
    context.save();

    context.globalCompositeOperation =
        "screen";

    context.globalAlpha =
        0.11;

    context.fillStyle =
        "#6f9278";

    context.fillRect(
        0,
        0,
        width,
        height
    );

    context.restore();
    
    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );

    const pixels =
        imageData.data;

    for (
        let index = 0;
        index < pixels.length;
        index += 4
    ) {
        const noise =
            (
                random() -
                0.5
            ) * 22;

        pixels[index] =
            Math.max(
                0,
                Math.min(
                    255,
                    pixels[index] +
                    noise
                )
            );

        pixels[index + 1] =
            Math.max(
                0,
                Math.min(
                    255,
                    pixels[index + 1] +
                    noise
                )
            );

        pixels[index + 2] =
            Math.max(
                0,
                Math.min(
                    255,
                    pixels[index + 2] +
                    noise
                )
            );
    }

    context.putImageData(
        imageData,
        0,
        0
    );

    context.save();

    context.globalAlpha =
        0.13;

    context.fillStyle =
        "#07100a";

    for (
        let y = 0;
        y < height;
        y += 4
    ) {
        context.fillRect(
            0,
            y,
            width,
            1
        );
    }

    context.restore();

    const bandY =
        Math.floor(
            height * 0.62
        );

    const bandGradient =
        context.createLinearGradient(
            0,
            bandY - 24,
            0,
            bandY + 24
        );

    bandGradient.addColorStop(
        0,
        "rgba(255,255,255,0)"
    );

    bandGradient.addColorStop(
        0.5,
        "rgba(210,235,215,0.10)"
    );

    bandGradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    context.fillStyle =
        bandGradient;

    context.fillRect(
        0,
        bandY - 24,
        width,
        48
    );

    const vignette =
        context.createRadialGradient(
            width / 2,
            height / 2,
            Math.min(
                width,
                height
            ) * 0.18,

            width / 2,
            height / 2,
            Math.max(
                width,
                height
            ) * 0.72
        );

    vignette.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    vignette.addColorStop(
        0.68,
        "rgba(0,0,0,0.05)"
    );

    vignette.addColorStop(
        1,
        "rgba(0,0,0,0.48)"
    );

    context.fillStyle =
        vignette;

    context.fillRect(
        0,
        0,
        width,
        height
    );

    const cornerSize =
        Math.max(
            12,
            Math.round(
                Math.min(
                    width,
                    height
                ) * 0.035
            )
        );

    const inset =
        Math.max(
            8,
            Math.round(
                cornerSize * 0.6
            )
        );

    context.save();

    context.strokeStyle =
        "rgba(220,240,225,0.55)";

    context.lineWidth =
        Math.max(
            1,
            Math.round(
                width / 700
            )
        );

    context.beginPath();

    context.moveTo(
        inset,
        inset + cornerSize
    );

    context.lineTo(
        inset,
        inset
    );

    context.lineTo(
        inset + cornerSize,
        inset
    );

    context.moveTo(
        width - inset - cornerSize,
        inset
    );

    context.lineTo(
        width - inset,
        inset
    );

    context.lineTo(
        width - inset,
        inset + cornerSize
    );

    context.moveTo(
        inset,
        height - inset - cornerSize
    );

    context.lineTo(
        inset,
        height - inset
    );

    context.lineTo(
        inset + cornerSize,
        height - inset
    );

    context.moveTo(
        width - inset - cornerSize,
        height - inset
    );

    context.lineTo(
        width - inset,
        height - inset
    );

    context.lineTo(
        width - inset,
        height - inset - cornerSize
    );

    context.stroke();
    context.restore();
}

    

applyScannerLidOpen(
    canvas,
    context
) {
    const width = canvas.width;
    const height = canvas.height;

    const random =
        this.createSeededRandom(
            this.effectSeed + 4003
        );

    const original =
        document.createElement(
            "canvas"
        );

    original.width = width;
    original.height = height;

    const originalContext =
        original.getContext("2d");

    originalContext.drawImage(
        canvas,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    const angle =
        (random() - 0.5) *
        0.014;

    context.save();
    context.translate(
        width / 2,
        height / 2
    );
    context.rotate(angle);
    context.scale(1.018, 1.018);
    context.filter = [
        "brightness(1.13)",
        "contrast(0.86)",
        "saturate(0.74)",
        "sepia(0.05)"
    ].join(" ");
    context.drawImage(
        original,
        -width / 2,
        -height / 2
    );
    context.restore();

    context.save();
    context.globalCompositeOperation =
        "screen";
    context.globalAlpha = 0.12;
    context.fillStyle = "#e7edf0";
    context.fillRect(
        0,
        0,
        width,
        height
    );
    context.restore();

    const leakFromLeft =
        random() > 0.5;

    const leakWidth =
        Math.round(
            width *
            (0.24 + random() * 0.16)
        );

    const leakGradient =
        context.createLinearGradient(
            leakFromLeft ? 0 : width,
            0,
            leakFromLeft
                ? leakWidth
                : width - leakWidth,
            0
        );

    leakGradient.addColorStop(
        0,
        "rgba(255,255,255,0.82)"
    );
    leakGradient.addColorStop(
        0.2,
        "rgba(245,250,252,0.58)"
    );
    leakGradient.addColorStop(
        0.58,
        "rgba(225,235,240,0.18)"
    );
    leakGradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    context.save();
    context.globalCompositeOperation =
        "screen";
    context.fillStyle =
        leakGradient;
    context.fillRect(
        0,
        0,
        width,
        height
    );
    context.restore();

    context.save();

    for (
        let index = 0;
        index < 22;
        index += 1
    ) {
        const x =
            Math.floor(
                random() * width
            );

        const alpha =
            0.015 +
            random() * 0.05;

        context.fillStyle =
            `rgba(255,255,255,${alpha})`;

        context.fillRect(
            x,
            0,
            random() > 0.84 ? 2 : 1,
            height
        );
    }

    for (
        let index = 0;
        index < 9;
        index += 1
    ) {
        const x =
            Math.floor(
                random() * width
            );

        context.fillStyle =
            `rgba(15,25,30,${0.012 + random() * 0.03})`;

        context.fillRect(
            x,
            0,
            1,
            height
        );
    }

    context.restore();

    const sweepY =
        Math.round(
            height *
            (0.22 + random() * 0.56)
        );

    const sweepHeight =
        Math.max(
            8,
            Math.round(
                height * 0.035
            )
        );

    const sweepGradient =
        context.createLinearGradient(
            0,
            sweepY - sweepHeight,
            0,
            sweepY + sweepHeight
        );

    sweepGradient.addColorStop(
        0,
        "rgba(255,255,255,0)"
    );
    sweepGradient.addColorStop(
        0.5,
        "rgba(255,255,255,0.12)"
    );
    sweepGradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    context.fillStyle =
        sweepGradient;
    context.fillRect(
        0,
        sweepY - sweepHeight,
        width,
        sweepHeight * 2
    );

    const dustCount =
        Math.max(
            18,
            Math.round(
                width * height /
                22000
            )
        );

    context.save();

    for (
        let index = 0;
        index < dustCount;
        index += 1
    ) {
        const x = random() * width;
        const y = random() * height;
        const radius =
            0.4 + random() * 1.4;

        context.beginPath();
        context.fillStyle =
            random() > 0.5
                ? "rgba(255,255,255,0.20)"
                : "rgba(20,25,28,0.14)";
        context.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );
        context.fill();
    }

    context.restore();

    const shadowGradient =
        context.createLinearGradient(
            leakFromLeft ? width : 0,
            0,
            leakFromLeft
                ? width * 0.78
                : width * 0.22,
            0
        );

    shadowGradient.addColorStop(
        0,
        "rgba(20,25,30,0.20)"
    );
    shadowGradient.addColorStop(
        1,
        "rgba(20,25,30,0)"
    );

    context.fillStyle =
        shadowGradient;
    context.fillRect(
        0,
        0,
        width,
        height
    );
}

applyBrokenWebcam(
    canvas,
    context
) {
    const width = canvas.width;
    const height = canvas.height;

    const random =
        this.createSeededRandom(
            this.effectSeed + 6007
        );

    const original =
        document.createElement(
            "canvas"
        );

    original.width = width;
    original.height = height;

    const originalContext =
        original.getContext("2d");

    originalContext.drawImage(
        canvas,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.save();
    context.filter = [
        "contrast(1.08)",
        "brightness(0.92)",
        "saturate(0.78)",
        "blur(0.45px)"
    ].join(" ");
    context.drawImage(
        original,
        0,
        0
    );
    context.restore();

    const channelShift =
        Math.max(
            2,
            Math.round(
                width * 0.006
            )
        );

    context.save();
    context.globalCompositeOperation =
        "screen";
    context.globalAlpha = 0.30;
    context.filter =
        "sepia(1) saturate(8) hue-rotate(-45deg)";
    context.drawImage(
        original,
        -channelShift,
        0
    );
    context.restore();

    context.save();
    context.globalCompositeOperation =
        "screen";
    context.globalAlpha = 0.22;
    context.filter =
        "sepia(1) saturate(8) hue-rotate(155deg)";
    context.drawImage(
        original,
        channelShift,
        0
    );
    context.restore();

    const stripCount =
        2 +
        Math.floor(
            random() * 4
        );

    for (
        let index = 0;
        index < stripCount;
        index += 1
    ) {
        const stripHeight =
            Math.max(
                3,
                Math.round(
                    height *
                    (0.018 + random() * 0.06)
                )
            );

        const sourceY =
            Math.floor(
                random() *
                Math.max(
                    1,
                    height - stripHeight
                )
            );

        const offset =
            Math.round(
                (random() - 0.5) *
                width * 0.10
            );

        context.drawImage(
            original,
            0,
            sourceY,
            width,
            stripHeight,
            offset,
            sourceY,
            width,
            stripHeight
        );

        context.fillStyle =
            `rgba(255,255,255,${0.025 + random() * 0.06})`;
        context.fillRect(
            0,
            sourceY,
            width,
            1
        );
    }

    const rollingY =
        Math.floor(
            height *
            (0.25 + random() * 0.5)
        );

    const rollingGradient =
        context.createLinearGradient(
            0,
            rollingY - 35,
            0,
            rollingY + 35
        );

    rollingGradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );
    rollingGradient.addColorStop(
        0.5,
        "rgba(180,210,220,0.13)"
    );
    rollingGradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    context.fillStyle =
        rollingGradient;
    context.fillRect(
        0,
        rollingY - 35,
        width,
        70
    );

    const deadPixelCount =
        Math.max(
            20,
            Math.round(
                width * height /
                18000
            )
        );

    for (
        let index = 0;
        index < deadPixelCount;
        index += 1
    ) {
        const x =
            Math.floor(
                random() * width
            );
        const y =
            Math.floor(
                random() * height
            );

        const colours = [
            "rgba(255,40,65,0.65)",
            "rgba(50,255,105,0.55)",
            "rgba(60,120,255,0.60)",
            "rgba(255,255,255,0.55)",
            "rgba(0,0,0,0.75)"
        ];

        context.fillStyle =
            colours[
                Math.floor(
                    random() *
                    colours.length
                )
            ];

        const size =
            random() > 0.88
                ? 2
                : 1;

        context.fillRect(
            x,
            y,
            size,
            size
        );
    }

    context.save();
    context.globalAlpha = 0.075;
    context.fillStyle = "#001820";

    for (
        let y = 0;
        y < height;
        y += 3
    ) {
        context.fillRect(
            0,
            y,
            width,
            1
        );
    }

    context.restore();
}

applyJpegDeepFry(
    canvas,
    context
) {
    const width = canvas.width;
    const height = canvas.height;

    const original =
        document.createElement(
            "canvas"
        );

    original.width = width;
    original.height = height;

    const originalContext =
        original.getContext("2d");

    originalContext.drawImage(
        canvas,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.save();
    context.filter = [
        "contrast(1.65)",
        "saturate(2.75)",
        "brightness(1.08)",
        "sepia(0.12)"
    ].join(" ");
    context.drawImage(
        original,
        0,
        0
    );
    context.restore();

    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );

    const pixels = imageData.data;

    for (
        let index = 0;
        index < pixels.length;
        index += 4
    ) {
        let red = pixels[index];
        let green = pixels[index + 1];
        let blue = pixels[index + 2];

        const luminance =
            red * 0.299 +
            green * 0.587 +
            blue * 0.114;

        if (luminance < 72) {
            red *= 0.58;
            green *= 0.48;
            blue *= 0.50;
        }

        if (luminance > 184) {
            red =
                Math.min(
                    255,
                    red * 1.22 + 18
                );
            green =
                Math.min(
                    255,
                    green * 1.12 + 10
                );
            blue =
                Math.min(
                    255,
                    blue * 0.94
                );
        }

        red =
            Math.round(red / 14) * 14;
        green =
            Math.round(green / 16) * 16;
        blue =
            Math.round(blue / 18) * 18;

        pixels[index] =
            Math.max(
                0,
                Math.min(
                    255,
                    red
                )
            );
        pixels[index + 1] =
            Math.max(
                0,
                Math.min(
                    255,
                    green
                )
            );
        pixels[index + 2] =
            Math.max(
                0,
                Math.min(
                    255,
                    blue
                )
            );
    }

    context.putImageData(
        imageData,
        0,
        0
    );

    const sharpened =
        document.createElement(
            "canvas"
        );

    sharpened.width = width;
    sharpened.height = height;

    const sharpenedContext =
        sharpened.getContext("2d");

    sharpenedContext.filter =
        "contrast(1.25)";
    sharpenedContext.drawImage(
        canvas,
        0,
        0
    );

    context.save();
    context.globalCompositeOperation =
        "overlay";
    context.globalAlpha = 0.34;
    context.drawImage(
        sharpened,
        -1,
        0
    );
    context.drawImage(
        sharpened,
        1,
        0
    );
    context.restore();

    context.save();
    context.globalCompositeOperation =
        "screen";
    context.globalAlpha = 0.10;
    context.fillStyle = "#ff541f";
    context.fillRect(
        0,
        0,
        width,
        height
    );
    context.restore();
}


applyJpeg100x(
    canvas,
    context
) {
    const width = canvas.width;
    const height = canvas.height;

    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }

    const random =
        this.createSeededRandom(
            this.effectSeed +
            8107
        );

    const source =
        document.createElement(
            "canvas"
        );

    source.width = width;
    source.height = height;

    const sourceContext =
        source.getContext(
            "2d",
            {
                willReadFrequently:
                    true
            }
        );

    sourceContext.drawImage(
        canvas,
        0,
        0
    );

    let current = source;

    const passes = 7;

    for (
        let pass = 0;
        pass < passes;
        pass += 1
    ) {
        const degradation =
            pass /
            Math.max(
                1,
                passes - 1
            );

        const scale =
            Math.max(
                0.20,
                0.58 -
                degradation * 0.23 -
                random() * 0.035
            );

        const reducedWidth =
            Math.max(
                8,
                Math.round(
                    width * scale
                )
            );

        const reducedHeight =
            Math.max(
                8,
                Math.round(
                    height * scale
                )
            );

        const reduced =
            document.createElement(
                "canvas"
            );

        reduced.width =
            reducedWidth;

        reduced.height =
            reducedHeight;

        const reducedContext =
            reduced.getContext(
                "2d",
                {
                    willReadFrequently:
                        true
                }
            );

        reducedContext.imageSmoothingEnabled =
            true;

        reducedContext.imageSmoothingQuality =
            "low";

        reducedContext.filter = [
            `contrast(${1.02 + pass * 0.015})`,
            `saturate(${0.97 - pass * 0.012})`
        ].join(" ");

        reducedContext.drawImage(
            current,
            0,
            0,
            current.width,
            current.height,
            0,
            0,
            reducedWidth,
            reducedHeight
        );

        const expanded =
            document.createElement(
                "canvas"
            );

        expanded.width = width;
        expanded.height = height;

        const expandedContext =
            expanded.getContext(
                "2d",
                {
                    willReadFrequently:
                        true
                }
            );

        expandedContext.imageSmoothingEnabled =
            true;

        expandedContext.imageSmoothingQuality =
            "low";

        expandedContext.drawImage(
            reduced,
            0,
            0,
            reducedWidth,
            reducedHeight,
            0,
            0,
            width,
            height
        );

        const imageData =
            expandedContext.getImageData(
                0,
                0,
                width,
                height
            );

        const pixels =
            imageData.data;

        const blockSize =
            pass < 3
                ? 4
                : 8;

        const quantization =
            5 +
            pass * 2;

        for (
            let blockY = 0;
            blockY < height;
            blockY += blockSize
        ) {
            for (
                let blockX = 0;
                blockX < width;
                blockX += blockSize
            ) {
                let redTotal = 0;
                let greenTotal = 0;
                let blueTotal = 0;
                let samples = 0;

                for (
                    let y = blockY;
                    y < Math.min(
                        height,
                        blockY + blockSize
                    );
                    y += 2
                ) {
                    for (
                        let x = blockX;
                        x < Math.min(
                            width,
                            blockX + blockSize
                        );
                        x += 2
                    ) {
                        const offset =
                            (
                                y * width +
                                x
                            ) * 4;

                        redTotal +=
                            pixels[offset];

                        greenTotal +=
                            pixels[offset + 1];

                        blueTotal +=
                            pixels[offset + 2];

                        samples += 1;
                    }
                }

                const averageRed =
                    redTotal /
                    Math.max(
                        1,
                        samples
                    );

                const averageGreen =
                    greenTotal /
                    Math.max(
                        1,
                        samples
                    );

                const averageBlue =
                    blueTotal /
                    Math.max(
                        1,
                        samples
                    );

                for (
                    let y = blockY;
                    y < Math.min(
                        height,
                        blockY + blockSize
                    );
                    y += 1
                ) {
                    for (
                        let x = blockX;
                        x < Math.min(
                            width,
                            blockX + blockSize
                        );
                        x += 1
                    ) {
                        const offset =
                            (
                                y * width +
                                x
                            ) * 4;

                        const luminance =
                            pixels[offset] * 0.299 +
                            pixels[offset + 1] * 0.587 +
                            pixels[offset + 2] * 0.114;

                        const chromaMix =
                            0.12 +
                            pass * 0.025;

                        const red =
                            pixels[offset] *
                                (1 - chromaMix) +
                            averageRed *
                                chromaMix;

                        const green =
                            pixels[offset + 1] *
                                (1 - chromaMix) +
                            averageGreen *
                                chromaMix;

                        const blue =
                            pixels[offset + 2] *
                                (1 - chromaMix) +
                            averageBlue *
                                chromaMix;

                        const mosquito =
                            (
                                random() -
                                0.5
                            ) *
                            (
                                1.2 +
                                pass * 0.8
                            );

                        pixels[offset] =
                            Math.max(
                                0,
                                Math.min(
                                    255,
                                    Math.round(
                                        (
                                            red +
                                            mosquito +
                                            luminance * 0.006
                                        ) /
                                        quantization
                                    ) *
                                    quantization
                                )
                            );

                        pixels[offset + 1] =
                            Math.max(
                                0,
                                Math.min(
                                    255,
                                    Math.round(
                                        (
                                            green +
                                            mosquito
                                        ) /
                                        quantization
                                    ) *
                                    quantization
                                )
                            );

                        pixels[offset + 2] =
                            Math.max(
                                0,
                                Math.min(
                                    255,
                                    Math.round(
                                        (
                                            blue -
                                            mosquito
                                        ) /
                                        quantization
                                    ) *
                                    quantization
                                )
                            );
                    }
                }
            }
        }

        expandedContext.putImageData(
            imageData,
            0,
            0
        );

        current = expanded;
    }

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.save();
    context.filter =
        "contrast(1.08) saturate(0.92)";
    context.drawImage(
        current,
        0,
        0
    );
    context.restore();

    context.save();
    context.globalAlpha = 0.045;
    context.strokeStyle = "#111";
    context.lineWidth = 1;

    for (
        let x = 8;
        x < width;
        x += 8
    ) {
        context.beginPath();
        context.moveTo(
            x + 0.5,
            0
        );
        context.lineTo(
            x + 0.5,
            height
        );
        context.stroke();
    }

    for (
        let y = 8;
        y < height;
        y += 8
    ) {
        context.beginPath();
        context.moveTo(
            0,
            y + 0.5
        );
        context.lineTo(
            width,
            y + 0.5
        );
        context.stroke();
    }

    context.restore();
}

applyGifify32(
    canvas,
    context
) {
    const width = canvas.width;
    const height = canvas.height;

    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }

    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );

    const pixels =
        imageData.data;

    const bayer4 = [
        0, 8, 2, 10,
        12, 4, 14, 6,
        3, 11, 1, 9,
        15, 7, 13, 5
    ];

    const redLevels = [
        0,
        85,
        170,
        255
    ];

    const greenLevels = [
        0,
        85,
        170,
        255
    ];

    const blueLevels = [
        36,
        218
    ];

    const nearestLevel = (
        value,
        levels
    ) => {
        let nearest = levels[0];
        let distance =
            Math.abs(
                value -
                nearest
            );

        for (
            let index = 1;
            index < levels.length;
            index += 1
        ) {
            const candidate =
                levels[index];

            const candidateDistance =
                Math.abs(
                    value -
                    candidate
                );

            if (
                candidateDistance <
                distance
            ) {
                nearest = candidate;
                distance =
                    candidateDistance;
            }
        }

        return nearest;
    };

    for (
        let y = 0;
        y < height;
        y += 1
    ) {
        for (
            let x = 0;
            x < width;
            x += 1
        ) {
            const offset =
                (
                    y * width +
                    x
                ) * 4;

            const threshold =
                (
                    bayer4[
                        (
                            y % 4
                        ) * 4 +
                        (
                            x % 4
                        )
                    ] -
                    7.5
                ) /
                7.5;

            const red =
                Math.max(
                    0,
                    Math.min(
                        255,
                        pixels[offset] +
                        threshold * 25
                    )
                );

            const green =
                Math.max(
                    0,
                    Math.min(
                        255,
                        pixels[offset + 1] +
                        threshold * 23
                    )
                );

            const blue =
                Math.max(
                    0,
                    Math.min(
                        255,
                        pixels[offset + 2] +
                        threshold * 34
                    )
                );

            pixels[offset] =
                nearestLevel(
                    red,
                    redLevels
                );

            pixels[offset + 1] =
                nearestLevel(
                    green,
                    greenLevels
                );

            pixels[offset + 2] =
                nearestLevel(
                    blue,
                    blueLevels
                );
        }
    }

    context.putImageData(
        imageData,
        0,
        0
    );

    const reduced =
        document.createElement(
            "canvas"
        );

    const reductionScale =
        Math.min(
            1,
            720 /
            Math.max(
                width,
                height
            )
        );

    reduced.width =
        Math.max(
            1,
            Math.round(
                width *
                reductionScale
            )
        );

    reduced.height =
        Math.max(
            1,
            Math.round(
                height *
                reductionScale
            )
        );

    const reducedContext =
        reduced.getContext("2d");

    reducedContext.imageSmoothingEnabled =
        false;

    reducedContext.drawImage(
        canvas,
        0,
        0,
        width,
        height,
        0,
        0,
        reduced.width,
        reduced.height
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.imageSmoothingEnabled =
        false;

    context.drawImage(
        reduced,
        0,
        0,
        reduced.width,
        reduced.height,
        0,
        0,
        width,
        height
    );

    context.imageSmoothingEnabled =
        true;
}

    createToolButton(
        label,
        onClick
    ) {
        const button =
            document.createElement(
                "button"
            );

        button.type = "button";
        button.className =
            "jami-remix-filter jami-remix-tool";
        button.textContent = label;

        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                onClick();
            }
        );

        return button;
    }

    renderEmojiPicker() {
        if (!this.emojiPicker) {
            return;
        }

        this.emojiPicker.replaceChildren();

        for (const filename of this.emojiFiles) {
            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";
            button.className =
                "jami-remix-emoji-choice";
            button.title =
                filename.replace(/\.[^.]+$/, "");

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                `/emojis/${filename}`;
            image.alt = button.title;
            image.loading = "lazy";

            button.appendChild(image);

            button.addEventListener(
                "click",
                () => {
                    this.addEmoji(filename);
                    this.emojiPicker.hidden = true;
                }
            );

            this.emojiPicker.appendChild(
                button
            );
        }
    }

    toggleEmojiPicker() {
        if (!this.emojiPicker) {
            return;
        }

        this.emojiPicker.hidden =
            !this.emojiPicker.hidden;
    }

    isAnimatedEmojiSource(source) {
        return (
            typeof source === "string" &&
            /\.gif(?:$|[?#])/i.test(source)
        );
    }

    getAnimatedEmojiCount() {
        return this.overlayItems.filter(
            item =>
                item.type === "emoji" &&
                this.isAnimatedEmojiSource(
                    item.source
                )
        ).length;
    }

    showProgramMessage(message) {
        const existing =
            document.querySelector(
                "[data-jami-remix-program-message]"
            );

        existing?.remove();

        const backdrop =
            document.createElement(
                "div"
            );

        backdrop.className =
            "jami-remix-program-message-backdrop";

        backdrop.dataset.jamiRemixProgramMessage =
            "true";

        const dialog =
            document.createElement(
                "div"
            );

        dialog.className =
            "jami-remix-program-message theme-body";

        dialog.setAttribute(
            "role",
            "alertdialog"
        );

        dialog.setAttribute(
            "aria-modal",
            "true"
        );

        const title =
            document.createElement(
                "div"
            );

        title.className =
            "jami-remix-program-message-title theme-heading";

        title.textContent =
            "program message";

        const body =
            document.createElement(
                "div"
            );

        body.className =
            "jami-remix-program-message-body";

        body.textContent =
            String(message || "something went wrong");

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "jami-remix-program-message-actions";

        const okButton =
            document.createElement(
                "button"
            );

        okButton.type =
            "button";

        okButton.className =
            "jami-remix-program-message-ok";

        okButton.textContent =
            "ok";

        const close = () => {
            backdrop.remove();
        };

        okButton.addEventListener(
            "click",
            close,
            { once: true }
        );

        backdrop.addEventListener(
            "click",
            event => {
                if (event.target === backdrop) {
                    close();
                }
            }
        );

        const onKeyDown = event => {
            if (
                event.key === "Escape" ||
                event.key === "Enter"
            ) {
                event.preventDefault();
                document.removeEventListener(
                    "keydown",
                    onKeyDown
                );
                close();
            }
        };

        document.addEventListener(
            "keydown",
            onKeyDown
        );

        actions.appendChild(
            okButton
        );

        dialog.append(
            title,
            body,
            actions
        );

        backdrop.appendChild(
            dialog
        );

        document.body.appendChild(
            backdrop
        );

        requestAnimationFrame(
            () => {
                backdrop.classList.add(
                    "is-visible"
                );
                okButton.focus();
            }
        );
    }

    showRemixLimitAlert(message) {
        this.showProgramMessage(
            `could not add that to the remix.\n\n${message}`
        );
    }

    canAddOverlay(options = {}) {
        if (
            this.overlayItems.length >=
            this.maximumOverlayCount
        ) {
            this.showRemixLimitAlert(
                `a remix can contain up to ${this.maximumOverlayCount} emojis and ghost orbs in total. remove one before adding another.`
            );

            return false;
        }

        const isAnimatedEmoji =
            options.type === "emoji" &&
            this.isAnimatedEmojiSource(
                options.source
            );

        if (
            isAnimatedEmoji &&
            this.getAnimatedEmojiCount() >=
                this.maximumAnimatedEmojiCount
        ) {
            this.showRemixLimitAlert(
                `a remix can contain up to ${this.maximumAnimatedEmojiCount} animated GIF emojis. remove one before adding another. static PNG emojis and ghost orbs can still be added, up to ${this.maximumOverlayCount} total overlays.`
            );

            return false;
        }

        return true;
    }

    addEmoji(filename) {
        this.addOverlay({
            type: "emoji",
            source: `/emojis/${filename}`,
            label:
                filename.replace(/\.[^.]+$/, ""),
            x: 50,
            y: 50,
            width: 22,
            rotation: 0
        });
    }

    addGhostOrb() {
        const random =
            this.createSeededRandom(
                this.effectSeed +
                8000 +
                this.overlaySequence * 97
            );

        const hues = [
            185,
            210,
            270,
            52,
            125
        ];

        const hue =
            hues[
                Math.floor(
                    random() * hues.length
                )
            ];

        this.addOverlay({
            type: "orb",
            x: 25 + random() * 50,
            y: 22 + random() * 56,
            width: 15 + random() * 18,
            rotation: 0,
            hue,
            opacity: 0.35 + random() * 0.28,
            core: 0.16 + random() * 0.16,
            ring: 0.54 + random() * 0.18
        });
    }

    addOverlay(options) {
        if (!this.overlayLayer) {
            return null;
        }

        if (!this.canAddOverlay(options)) {
            return null;
        }

        const item = {
            id:
                `overlay-${++this.overlaySequence}`,
            type: options.type,
            source: options.source || null,
            label: options.label || options.type,
            x: Number(options.x) || 50,
            y: Number(options.y) || 50,
            width:
                Math.max(
                    5,
                    Number(options.width) || 20
                ),
            rotation:
                Number(options.rotation) || 0,
            flipX:
                options.flipX === true,
            flipY:
                options.flipY === true,
            hue: Number(options.hue) || 200,
            opacity:
                Number(options.opacity) || 0.5,
            core:
                Number(options.core) || 0.22,
            ring:
                Number(options.ring) || 0.62,
            element: null
        };

        const element =
            document.createElement(
                "div"
            );

        element.className =
            `jami-remix-object jami-remix-object-${item.type}`;
        element.dataset.overlayId = item.id;
        element.tabIndex = 0;

        const content =
            document.createElement(
                "div"
            );

        content.className =
            "jami-remix-object-content";

        if (item.type === "emoji") {
            const image =
                document.createElement(
                    "img"
                );

            image.src = item.source;
            image.alt = item.label;
            image.draggable = false;
            content.appendChild(image);
        } else {
            content.classList.add(
                "jami-remix-ghost-orb"
            );
        }

        const removeButton =
            document.createElement(
                "button"
            );

        removeButton.type = "button";
        removeButton.className =
            "jami-remix-object-remove";
        removeButton.textContent = "×";
        removeButton.title = "remove";

        const resizeHandle =
            document.createElement(
                "span"
            );

        resizeHandle.className =
            "jami-remix-object-resize";
        resizeHandle.title = "resize";

        const rotateHandle =
            document.createElement(
                "span"
            );

        rotateHandle.className =
            "jami-remix-object-rotate";
        rotateHandle.title = "rotate";

        const flipHorizontalButton =
            document.createElement(
                "button"
            );

        flipHorizontalButton.type = "button";
        flipHorizontalButton.className =
            "jami-remix-object-flip jami-remix-object-flip-horizontal";
        flipHorizontalButton.textContent = "↔";
        flipHorizontalButton.title =
            "flip horizontally";

        const flipVerticalButton =
            document.createElement(
                "button"
            );

        flipVerticalButton.type = "button";
        flipVerticalButton.className =
            "jami-remix-object-flip jami-remix-object-flip-vertical";
        flipVerticalButton.textContent = "↕";
        flipVerticalButton.title =
            "flip vertically";

        const sendBackwardButton =
            document.createElement(
                "button"
            );

        sendBackwardButton.type = "button";
        sendBackwardButton.className =
            "jami-remix-object-layer jami-remix-object-layer-back";
        sendBackwardButton.textContent = "−";
        sendBackwardButton.title =
            "send backward";

        const bringForwardButton =
            document.createElement(
                "button"
            );

        bringForwardButton.type = "button";
        bringForwardButton.className =
            "jami-remix-object-layer jami-remix-object-layer-front";
        bringForwardButton.textContent = "+";
        bringForwardButton.title =
            "bring forward";

        const duplicateButton =
            document.createElement(
                "button"
            );

        duplicateButton.type = "button";
        duplicateButton.className =
            "jami-remix-object-duplicate";
        duplicateButton.textContent = "⧉";
        duplicateButton.title =
            "duplicate";

        element.append(
            content,
            removeButton,
            resizeHandle,
            rotateHandle,
            flipHorizontalButton,
            flipVerticalButton,
            sendBackwardButton,
            bringForwardButton,
            duplicateButton
        );

        item.element = element;
        this.overlayItems.push(item);
        this.overlayLayer.appendChild(element);

        element.addEventListener(
            "pointerdown",
            event => {
                if (
                    event.target === removeButton ||
                    event.target === resizeHandle ||
                    event.target === rotateHandle ||
                    event.target === flipHorizontalButton ||
                    event.target === flipVerticalButton ||
                    event.target === sendBackwardButton ||
                    event.target === bringForwardButton ||
                    event.target === duplicateButton
                ) {
                    return;
                }

                this.beginOverlayDrag(
                    event,
                    item
                );
            }
        );

        resizeHandle.addEventListener(
            "pointerdown",
            event => {
                this.beginOverlayResize(
                    event,
                    item
                );
            }
        );

        rotateHandle.addEventListener(
            "pointerdown",
            event => {
                this.beginOverlayRotate(
                    event,
                    item
                );
            }
        );

        flipHorizontalButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();
                item.flipX = !item.flipX;
                this.selectOverlay(item.id);
                this.updateOverlayElement(item);
            }
        );

        flipVerticalButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();
                item.flipY = !item.flipY;
                this.selectOverlay(item.id);
                this.updateOverlayElement(item);
            }
        );

        sendBackwardButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();
                this.moveOverlayLayer(item.id, -1);
            }
        );

        bringForwardButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();
                this.moveOverlayLayer(item.id, 1);
            }
        );

        duplicateButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();
                this.duplicateOverlay(item.id);
            }
        );

        removeButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                this.removeOverlay(item.id);
            }
        );

        element.addEventListener(
            "focus",
            () => this.selectOverlay(item.id)
        );

        this.updateOverlayElement(item);
        this.syncOverlayLayerOrder();
        this.selectOverlay(item.id);

        return item;
    }


    moveOverlayLayer(
        id,
        direction
    ) {
        const index =
            this.overlayItems.findIndex(
                item => item.id === id
            );

        if (index < 0) {
            return;
        }

        const nextIndex =
            Math.max(
                0,
                Math.min(
                    this.overlayItems.length - 1,
                    index + Math.sign(direction)
                )
            );

        if (nextIndex === index) {
            return;
        }

        const [item] =
            this.overlayItems.splice(index, 1);

        this.overlayItems.splice(
            nextIndex,
            0,
            item
        );

        this.syncOverlayLayerOrder();
        this.selectOverlay(id);
    }

    syncOverlayLayerOrder() {
        if (!this.overlayLayer) {
            return;
        }

        this.overlayItems.forEach(
            (item, index) => {
                if (!item.element) {
                    return;
                }

                item.element.style.zIndex =
                    String(index + 2);

                this.overlayLayer.appendChild(
                    item.element
                );
            }
        );
    }

    duplicateOverlay(id) {
        const sourceItem =
            this.overlayItems.find(
                item => item.id === id
            );

        if (!sourceItem) {
            return null;
        }

        return this.addOverlay({
            type: sourceItem.type,
            source: sourceItem.source,
            label: sourceItem.label,
            x: Math.min(94, sourceItem.x + 4),
            y: Math.min(94, sourceItem.y + 4),
            width: sourceItem.width,
            rotation: sourceItem.rotation,
            flipX: sourceItem.flipX,
            flipY: sourceItem.flipY,
            hue: sourceItem.hue,
            opacity: sourceItem.opacity,
            core: sourceItem.core,
            ring: sourceItem.ring
        });
    }

    selectOverlay(id) {
        this.selectedOverlayId = id || null;

        for (const item of this.overlayItems) {
            item.element?.classList.toggle(
                "is-selected",
                item.id === this.selectedOverlayId
            );
        }
    }

    removeOverlay(id) {
        const index =
            this.overlayItems.findIndex(
                item => item.id === id
            );

        if (index < 0) {
            return;
        }

        this.overlayItems[index]
            .element?.remove();

        this.overlayItems.splice(index, 1);

        if (this.selectedOverlayId === id) {
            this.selectedOverlayId = null;
        }
    }

    updateOverlayElement(item) {
        if (!item?.element) {
            return;
        }

        item.element.style.left =
            `${item.x}%`;
        item.element.style.top =
            `${item.y}%`;
        item.element.style.width =
            `${item.width}%`;
        item.element.style.transform =
            `translate(-50%, -50%) rotate(${item.rotation}deg)`;

        const content =
            item.element.querySelector(
                ".jami-remix-object-content"
            );

        if (content) {
            content.style.transform =
                `scale(${item.flipX ? -1 : 1}, ${item.flipY ? -1 : 1})`;
        }

        item.element.classList.toggle(
            "is-flipped-horizontal",
            item.flipX
        );

        item.element.classList.toggle(
            "is-flipped-vertical",
            item.flipY
        );

        if (item.type === "orb") {
            const orb =
                item.element.querySelector(
                    ".jami-remix-ghost-orb"
                );

            orb?.style.setProperty(
                "--orb-hue",
                String(item.hue)
            );
            orb?.style.setProperty(
                "--orb-opacity",
                String(item.opacity)
            );
            orb?.style.setProperty(
                "--orb-core",
                `${item.core * 100}%`
            );
            orb?.style.setProperty(
                "--orb-ring",
                `${item.ring * 100}%`
            );
        }
    }

    beginOverlayDrag(
        event,
        item
    ) {
        event.preventDefault();
        event.stopPropagation();

        this.selectOverlay(item.id);

        const rect =
            this.overlayLayer
                .getBoundingClientRect();

        const startX = event.clientX;
        const startY = event.clientY;
        const initialX = item.x;
        const initialY = item.y;

        const move = moveEvent => {
            item.x = Math.max(
                0,
                Math.min(
                    100,
                    initialX +
                    (
                        moveEvent.clientX -
                        startX
                    ) /
                    rect.width * 100
                )
            );

            item.y = Math.max(
                0,
                Math.min(
                    100,
                    initialY +
                    (
                        moveEvent.clientY -
                        startY
                    ) /
                    rect.height * 100
                )
            );

            this.updateOverlayElement(item);
        };

        const end = () => {
            window.removeEventListener(
                "pointermove",
                move
            );
            window.removeEventListener(
                "pointerup",
                end
            );
            window.removeEventListener(
                "pointercancel",
                end
            );
        };

        window.addEventListener(
            "pointermove",
            move
        );
        window.addEventListener(
            "pointerup",
            end
        );
        window.addEventListener(
            "pointercancel",
            end
        );
    }

    beginOverlayResize(
        event,
        item
    ) {
        event.preventDefault();
        event.stopPropagation();

        this.selectOverlay(item.id);

        const rect =
            this.overlayLayer
                .getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width * item.x / 100;
        const centerY =
            rect.top +
            rect.height * item.y / 100;

        const resize = moveEvent => {
            const distance = Math.hypot(
                moveEvent.clientX - centerX,
                moveEvent.clientY - centerY
            );

            item.width = Math.max(
                5,
                Math.min(
                    80,
                    distance * 2 /
                    rect.width * 100
                )
            );

            this.updateOverlayElement(item);
        };

        const end = () => {
            window.removeEventListener(
                "pointermove",
                resize
            );
            window.removeEventListener(
                "pointerup",
                end
            );
            window.removeEventListener(
                "pointercancel",
                end
            );
        };

        window.addEventListener(
            "pointermove",
            resize
        );
        window.addEventListener(
            "pointerup",
            end
        );
        window.addEventListener(
            "pointercancel",
            end
        );
    }

    beginOverlayRotate(
        event,
        item
    ) {
        event.preventDefault();
        event.stopPropagation();

        this.selectOverlay(item.id);

        const rect =
            this.overlayLayer
                .getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width * item.x / 100;

        const centerY =
            rect.top +
            rect.height * item.y / 100;

        const startPointerAngle =
            Math.atan2(
                event.clientY - centerY,
                event.clientX - centerX
            );

        const initialRotation =
            Number(item.rotation) || 0;

        const rotate = moveEvent => {
            const currentPointerAngle =
                Math.atan2(
                    moveEvent.clientY - centerY,
                    moveEvent.clientX - centerX
                );

            let rotation =
                initialRotation +
                (
                    currentPointerAngle -
                    startPointerAngle
                ) * 180 / Math.PI;

            if (moveEvent.shiftKey) {
                rotation =
                    Math.round(rotation / 15) * 15;
            }

            item.rotation =
                (rotation + 360) % 360;

            this.updateOverlayElement(item);
        };

        const end = () => {
            window.removeEventListener(
                "pointermove",
                rotate
            );
            window.removeEventListener(
                "pointerup",
                end
            );
            window.removeEventListener(
                "pointercancel",
                end
            );
        };

        window.addEventListener(
            "pointermove",
            rotate
        );
        window.addEventListener(
            "pointerup",
            end
        );
        window.addEventListener(
            "pointercancel",
            end
        );
    }

    async loadOverlayImage(source) {
        const image = new Image();
        image.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(
                new Error(
                    `could not load overlay ${source}`
                )
            );
            image.src = source;
        });

        return image;
    }

    async createExportCanvas() {
        const exportCanvas =
            document.createElement(
                "canvas"
            );

        exportCanvas.width =
            this.canvas.width;
        exportCanvas.height =
            this.canvas.height;

        const exportContext =
            exportCanvas.getContext("2d");

        exportContext.drawImage(
            this.canvas,
            0,
            0
        );

        for (const item of this.overlayItems) {
            const centerX =
                exportCanvas.width * item.x / 100;
            const centerY =
                exportCanvas.height * item.y / 100;
            const drawWidth =
                exportCanvas.width * item.width / 100;

            exportContext.save();
            exportContext.translate(
                centerX,
                centerY
            );
            exportContext.rotate(
                item.rotation * Math.PI / 180
            );
            exportContext.scale(
                item.flipX ? -1 : 1,
                item.flipY ? -1 : 1
            );

            if (item.type === "emoji") {
                try {
                    const image =
                        await this.loadOverlayImage(
                            item.source
                        );

                    const ratio =
                        image.naturalHeight /
                        Math.max(
                            1,
                            image.naturalWidth
                        );

                    exportContext.drawImage(
                        image,
                        -drawWidth / 2,
                        -drawWidth * ratio / 2,
                        drawWidth,
                        drawWidth * ratio
                    );
                } catch (error) {
                    console.warn(error);
                }
            } else {
                const radius = drawWidth / 2;
                const gradient =
                    exportContext.createRadialGradient(
                        -radius * 0.2,
                        -radius * 0.25,
                        radius * item.core,
                        0,
                        0,
                        radius
                    );

                gradient.addColorStop(
                    0,
                    `hsla(${item.hue}, 100%, 96%, ${item.opacity})`
                );
                gradient.addColorStop(
                    item.ring,
                    `hsla(${item.hue}, 80%, 82%, ${item.opacity * 0.32})`
                );
                gradient.addColorStop(
                    0.82,
                    `hsla(${item.hue}, 90%, 74%, ${item.opacity * 0.16})`
                );
                gradient.addColorStop(
                    1,
                    `hsla(${item.hue}, 100%, 86%, 0)`
                );

                exportContext.globalCompositeOperation =
                    "screen";
                exportContext.filter =
                    `blur(${Math.max(1, radius * 0.035)}px)`;
                exportContext.fillStyle = gradient;
                exportContext.beginPath();
                exportContext.arc(
                    0,
                    0,
                    radius,
                    0,
                    Math.PI * 2
                );
                exportContext.fill();
            }

            exportContext.restore();
        }

        return exportCanvas;
    }


    hasAnimatedEmojiOverlays() {
        return this.getAnimatedEmojiCount() > 0;
    }

    getExportDimensions(
        maximumDimension = 900
    ) {
        const sourceWidth =
            Math.max(1, this.canvas.width);
        const sourceHeight =
            Math.max(1, this.canvas.height);

        const scale = Math.min(
            1,
            maximumDimension /
                Math.max(
                    sourceWidth,
                    sourceHeight
                )
        );

        return {
            width: Math.max(
                1,
                Math.round(
                    sourceWidth * scale
                )
            ),
            height: Math.max(
                1,
                Math.round(
                    sourceHeight * scale
                )
            )
        };
    }

    getOverlayPreviewImage(item) {
        if (!item?.element) {
            return null;
        }

        return item.element.querySelector(
            ".jami-remix-object-content img"
        );
    }

    drawGhostOrbForExport(
        context,
        item,
        drawWidth
    ) {
        const radius = drawWidth / 2;
        const gradient =
            context.createRadialGradient(
                -radius * 0.2,
                -radius * 0.25,
                radius * item.core,
                0,
                0,
                radius
            );

        gradient.addColorStop(
            0,
            `hsla(${item.hue}, 100%, 96%, ${item.opacity})`
        );
        gradient.addColorStop(
            item.ring,
            `hsla(${item.hue}, 80%, 82%, ${item.opacity * 0.32})`
        );
        gradient.addColorStop(
            0.82,
            `hsla(${item.hue}, 90%, 74%, ${item.opacity * 0.16})`
        );
        gradient.addColorStop(
            1,
            `hsla(${item.hue}, 100%, 86%, 0)`
        );

        context.globalCompositeOperation =
            "screen";
        context.filter =
            `blur(${Math.max(1, radius * 0.035)}px)`;
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(
            0,
            0,
            radius,
            0,
            Math.PI * 2
        );
        context.fill();
    }

    async drawOverlayItemsForExport(
        context,
        width,
        height,
        {
            usePreviewImages = false,
            animatedFramesBySource = null,
            animationTimeMs = 0
        } = {}
    ) {
        for (const item of this.overlayItems) {
            const centerX =
                width * item.x / 100;
            const centerY =
                height * item.y / 100;
            const drawWidth =
                width * item.width / 100;

            context.save();
            context.translate(
                centerX,
                centerY
            );
            context.rotate(
                item.rotation *
                Math.PI / 180
            );
            context.scale(
                item.flipX ? -1 : 1,
                item.flipY ? -1 : 1
            );

            if (item.type === "emoji") {
                try {
                    let image = null;

                    const decodedAnimation =
                        animatedFramesBySource?.get(
                            item.source
                        );

                    if (
                        decodedAnimation &&
                        decodedAnimation.frames.length > 0
                    ) {
                        image =
                            this.getDecodedGifFrameAtTime(
                                decodedAnimation,
                                animationTimeMs
                            );
                    } else {
                        image =
                            usePreviewImages
                                ? this.getOverlayPreviewImage(
                                    item
                                )
                                : await this.loadOverlayImage(
                                    item.source
                                );
                    }

                    if (
                        image &&
                        (
                            image.complete === undefined ||
                            image.complete
                        )
                    ) {
                        const naturalWidth =
                            image.naturalWidth ||
                            image.videoWidth ||
                            image.width ||
                            1;
                        const naturalHeight =
                            image.naturalHeight ||
                            image.videoHeight ||
                            image.height ||
                            1;
                        const ratio =
                            naturalHeight /
                            Math.max(
                                1,
                                naturalWidth
                            );

                        context.drawImage(
                            image,
                            -drawWidth / 2,
                            -drawWidth * ratio / 2,
                            drawWidth,
                            drawWidth * ratio
                        );
                    }
                } catch (error) {
                    console.warn(error);
                }
            } else {
                this.drawGhostOrbForExport(
                    context,
                    item,
                    drawWidth
                );
            }

            context.restore();
        }
    }

    async createAnimatedExportFrame(
        width,
        height,
        animatedFramesBySource,
        animationTimeMs
    ) {
        const frameCanvas =
            document.createElement(
                "canvas"
            );

        frameCanvas.width = width;
        frameCanvas.height = height;

        const frameContext =
            frameCanvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );

        frameContext.drawImage(
            this.canvas,
            0,
            0,
            this.canvas.width,
            this.canvas.height,
            0,
            0,
            width,
            height
        );

        await this.drawOverlayItemsForExport(
            frameContext,
            width,
            height,
            {
                usePreviewImages: false,
                animatedFramesBySource,
                animationTimeMs
            }
        );

        return frameContext.getImageData(
            0,
            0,
            width,
            height
        ).data;
    }

    async decodeGifEmojiSource(
        source
    ) {
        if (
            typeof window.ImageDecoder !==
            "function"
        ) {
            throw new Error(
                "animated emoji export is not supported by this browser. update Chrome or Edge and try again."
            );
        }

        const request = await fetch(
            source,
            {
                cache: "force-cache"
            }
        );

        if (!request.ok) {
            throw new Error(
                `could not load animated emoji “${source.split("/").pop()}”.`
            );
        }

        const bytes =
            await request.arrayBuffer();

        const decoder =
            new ImageDecoder({
                data: bytes,
                type: "image/gif",
                preferAnimation: true
            });

        await decoder.tracks.ready;

        const track =
            decoder.tracks.selectedTrack;

        const frameCount =
            Number(track?.frameCount) || 0;

        if (frameCount < 2) {
            decoder.close();

            throw new Error(
                `the animated emoji “${source.split("/").pop()}” did not contain multiple readable frames.`
            );
        }

        const frames = [];
        let totalDurationMs = 0;

        try {
            for (
                let frameIndex = 0;
                frameIndex < frameCount;
                frameIndex += 1
            ) {
                const result =
                    await decoder.decode({
                        frameIndex,
                        completeFramesOnly: true
                    });

                const videoFrame =
                    result.image;

                const bitmap =
                    await createImageBitmap(
                        videoFrame
                    );

                const durationMs =
                    Math.max(
                        20,
                        Number(
                            videoFrame.duration
                        ) / 1000 ||
                        100
                    );

                videoFrame.close();

                frames.push({
                    bitmap,
                    durationMs,
                    startsAtMs:
                        totalDurationMs
                });

                totalDurationMs +=
                    durationMs;
            }
        } finally {
            decoder.close();
        }

        return {
            frames,
            totalDurationMs:
                Math.max(
                    1,
                    totalDurationMs
                )
        };
    }

    async prepareAnimatedEmojiFrames() {
        const sources = [
            ...new Set(
                this.overlayItems
                    .filter(item =>
                        item.type === "emoji" &&
                        this.isAnimatedEmojiSource(
                            item.source
                        )
                    )
                    .map(item =>
                        item.source
                    )
            )
        ];

        const decoded = new Map();

        try {
            for (const source of sources) {
                decoded.set(
                    source,
                    await this.decodeGifEmojiSource(
                        source
                    )
                );
            }

            return decoded;
        } catch (error) {
            this.releaseDecodedGifFrames(
                decoded
            );

            throw error;
        }
    }

    getDecodedGifFrameAtTime(
        decodedAnimation,
        animationTimeMs
    ) {
        const frames =
            decodedAnimation.frames;

        if (frames.length === 0) {
            return null;
        }

        const loopTime =
            animationTimeMs %
            decodedAnimation.totalDurationMs;

        for (
            let index = frames.length - 1;
            index >= 0;
            index -= 1
        ) {
            if (
                loopTime >=
                frames[index].startsAtMs
            ) {
                return frames[index].bitmap;
            }
        }

        return frames[0].bitmap;
    }

    releaseDecodedGifFrames(
        decodedAnimations
    ) {
        for (
            const animation
            of decodedAnimations.values()
        ) {
            for (
                const frame
                of animation.frames
            ) {
                frame.bitmap.close?.();
            }
        }

        decodedAnimations.clear();
    }

    createGifPalette332() {
        const palette =
            new Uint8Array(256 * 3);

        for (
            let index = 0;
            index < 256;
            index += 1
        ) {
            const red =
                (index >> 5) & 7;
            const green =
                (index >> 2) & 7;
            const blue =
                index & 3;

            palette[index * 3] =
                Math.round(red * 255 / 7);
            palette[index * 3 + 1] =
                Math.round(green * 255 / 7);
            palette[index * 3 + 2] =
                Math.round(blue * 255 / 3);
        }

        return palette;
    }

    quantizeRgbaTo332(rgba) {
        const pixelCount =
            Math.floor(rgba.length / 4);
        const indexed =
            new Uint8Array(pixelCount);

        for (
            let pixel = 0;
            pixel < pixelCount;
            pixel += 1
        ) {
            const offset = pixel * 4;
            const alpha =
                rgba[offset + 3] / 255;

            const red = Math.round(
                rgba[offset] * alpha +
                255 * (1 - alpha)
            );
            const green = Math.round(
                rgba[offset + 1] * alpha +
                255 * (1 - alpha)
            );
            const blue = Math.round(
                rgba[offset + 2] * alpha +
                255 * (1 - alpha)
            );

            indexed[pixel] =
                (red >> 5) << 5 |
                (green >> 5) << 2 |
                (blue >> 6);
        }

        return indexed;
    }

    encodeGifLzw(indexedPixels) {
        const clearCode = 256;
        const endCode = 257;
        const codeSize = 9;
        const maximumLiteralsPerBlock = 240;

        let bitBuffer = 0;
        let bitCount = 0;
        const bytes = [];

        const writeCode = code => {
            bitBuffer |=
                code << bitCount;
            bitCount += codeSize;

            while (bitCount >= 8) {
                bytes.push(
                    bitBuffer & 255
                );
                bitBuffer >>>= 8;
                bitCount -= 8;
            }
        };

        let literalsSinceClear = 0;

        writeCode(clearCode);

        for (
            let index = 0;
            index < indexedPixels.length;
            index += 1
        ) {
            if (
                literalsSinceClear >=
                    maximumLiteralsPerBlock
            ) {
                writeCode(clearCode);
                literalsSinceClear = 0;
            }

            writeCode(
                indexedPixels[index]
            );

            literalsSinceClear += 1;
        }

        writeCode(endCode);

        if (bitCount > 0) {
            bytes.push(
                bitBuffer & 255
            );
        }

        return new Uint8Array(bytes);
    }

    appendGifSubBlocks(
        output,
        data
    ) {
        for (
            let offset = 0;
            offset < data.length;
            offset += 255
        ) {
            const length = Math.min(
                255,
                data.length - offset
            );

            output.push(length);

            for (
                let index = 0;
                index < length;
                index += 1
            ) {
                output.push(
                    data[offset + index]
                );
            }
        }

        output.push(0);
    }

    appendGifWord(
        output,
        value
    ) {
        output.push(
            value & 255,
            value >> 8 & 255
        );
    }

    encodeAnimatedGif(
        frames,
        width,
        height,
        delayCentiseconds
    ) {
        const output = [];
        const appendText = text => {
            for (const character of text) {
                output.push(
                    character.charCodeAt(0)
                );
            }
        };

        appendText("GIF89a");
        this.appendGifWord(
            output,
            width
        );
        this.appendGifWord(
            output,
            height
        );

        output.push(
            0xF7,
            0,
            0
        );

        const palette =
            this.createGifPalette332();
        for (const byte of palette) {
            output.push(byte);
        }

        output.push(
            0x21,
            0xFF,
            0x0B
        );
        appendText("NETSCAPE2.0");
        output.push(
            0x03,
            0x01,
            0x00,
            0x00,
            0x00
        );

        for (const rgba of frames) {
            output.push(
                0x21,
                0xF9,
                0x04,
                0x00,
                delayCentiseconds & 255,
                delayCentiseconds >> 8 & 255,
                0x00,
                0x00
            );

            output.push(0x2C);
            this.appendGifWord(
                output,
                0
            );
            this.appendGifWord(
                output,
                0
            );
            this.appendGifWord(
                output,
                width
            );
            this.appendGifWord(
                output,
                height
            );
            output.push(0x00);

            output.push(8);

            const indexed =
                this.quantizeRgbaTo332(
                    rgba
                );
            const compressed =
                this.encodeGifLzw(
                    indexed
                );

            this.appendGifSubBlocks(
                output,
                compressed
            );
        }

        output.push(0x3B);

        return new Blob(
            [new Uint8Array(output)],
            {
                type: "image/gif"
            }
        );
    }

    wait(milliseconds) {
        return new Promise(resolve => {
            window.setTimeout(
                resolve,
                milliseconds
            );
        });
    }

    async createAnimatedGifBlob(
        onProgress = () => {}
    ) {
        const dimensions =
            this.getExportDimensions(520);
        const framesPerSecond = 6;
        const durationMilliseconds = 2500;
        const frameDelay =
            Math.round(
                1000 / framesPerSecond
            );
        const frameCount =
            Math.round(
                durationMilliseconds /
                frameDelay
            );
        const frames = [];

        this.selectOverlay(null);

        const animatedFramesBySource =
            await this.prepareAnimatedEmojiFrames();

        try {

            for (
                let index = 0;
                index < frameCount;
                index += 1
            ) {
                frames.push(
                    await this.createAnimatedExportFrame(
                        dimensions.width,
                        dimensions.height,
                        animatedFramesBySource,
                        index * frameDelay
                    )
                );

                onProgress(
                    (index + 1) / frameCount
                );

                await this.wait(0);
            }
        } finally {
            this.releaseDecodedGifFrames(
                animatedFramesBySource
            );
        }

        return this.encodeAnimatedGif(
            frames,
            dimensions.width,
            dimensions.height,
            Math.max(
                2,
                Math.round(
                    frameDelay / 10
                )
            )
        );
    }

    validateRemixBeforeSave() {
        const overlayCount =
            this.overlayItems.length;
        const animatedEmojiCount =
            this.getAnimatedEmojiCount();

        if (
            overlayCount >
            this.maximumOverlayCount
        ) {
            throw new Error(
                `this remix has ${overlayCount} overlays. the maximum is ${this.maximumOverlayCount}. remove some emojis or ghost orbs before saving.`
            );
        }

        if (
            animatedEmojiCount >
            this.maximumAnimatedEmojiCount
        ) {
            throw new Error(
                `this remix has ${animatedEmojiCount} animated GIF emojis. the maximum is ${this.maximumAnimatedEmojiCount}. remove some animated emojis before saving.`
            );
        }

        const missingEmoji =
            this.overlayItems.find(item => {
                if (item.type !== "emoji") {
                    return false;
                }

                const image =
                    this.getOverlayPreviewImage(
                        item
                    );

                return (
                    !image ||
                    !image.complete ||
                    image.naturalWidth <= 0 ||
                    image.naturalHeight <= 0
                );
            });

        if (missingEmoji) {
            throw new Error(
                `the emoji “${missingEmoji.label || "unknown"}” has not finished loading. wait a moment and try again.`
            );
        }

        return {
            overlayCount,
            animatedEmojiCount
        };
    }

    async countGifImageFrames(
        blob
    ) {
        const bytes =
            new Uint8Array(
                await blob.arrayBuffer()
            );

        let count = 0;

        for (
            let index = 0;
            index < bytes.length - 9;
            index += 1
        ) {
            if (bytes[index] === 0x2C) {
                count += 1;
            }
        }

        return count;
    }

    async validateGeneratedImageBlob(
        blob,
        { animated = false } = {}
    ) {
        if (!(blob instanceof Blob) || blob.size <= 0) {
            throw new Error(
                "the rendered image was empty. nothing was uploaded."
            );
        }

        if (
            animated &&
            blob.size >
                this.maximumAnimatedOutputBytes
        ) {
            throw new Error(
                `the animated remix is ${(blob.size / 1024 / 1024).toFixed(1)} MB, which is too large to upload safely. remove some animated emojis, make them smaller, or use fewer overlays.`
            );
        }

        if (animated) {
            const gifFrameCount =
                await this.countGifImageFrames(
                    blob
                );

            if (gifFrameCount < 2) {
                throw new Error(
                    "the animated remix contained only one frame. nothing was uploaded."
                );
            }
        }

        const objectUrl =
            URL.createObjectURL(blob);

        try {
            const image = new Image();

            await new Promise(
                (resolve, reject) => {
                    const timeout =
                        window.setTimeout(
                            () => reject(
                                new Error(
                                    "the rendered image could not be verified in time. nothing was uploaded."
                                )
                            ),
                            8000
                        );

                    image.onload = () => {
                        window.clearTimeout(
                            timeout
                        );
                        resolve();
                    };

                    image.onerror = () => {
                        window.clearTimeout(
                            timeout
                        );
                        reject(
                            new Error(
                                "the rendered image was invalid. nothing was uploaded."
                            )
                        );
                    };

                    image.src = objectUrl;
                }
            );

            if (
                image.naturalWidth <= 0 ||
                image.naturalHeight <= 0
            ) {
                throw new Error(
                    "the rendered image had invalid dimensions. nothing was uploaded."
                );
            }
        } finally {
            URL.revokeObjectURL(
                objectUrl
            );
        }
    }

    async saveRemix() {
        if (
            !this.canvas.width ||
            !this.canvas.height
        ) {
            return;
        }

        const saveButton =
            this.overlay.querySelector(
                "[data-jami-remix-save]"
            );

        saveButton.disabled = true;

        try {
            const preflight =
                this.validateRemixBeforeSave();

            const isAnimated =
                preflight.animatedEmojiCount > 0;

            let blob;
            let filename;

            if (isAnimated) {
                saveButton.textContent =
                    "capturing animation...";

                blob = await this.createAnimatedGifBlob(
                    progress => {
                        saveButton.textContent =
                            `capturing ${Math.round(progress * 100)}%`;
                    }
                );

                filename =
                    `jamicat-remix-${Date.now()}.gif`;
            } else {
                saveButton.textContent =
                    "rendering...";

                const exportCanvas =
                    await this.createExportCanvas();

                blob = await new Promise(
                    (resolve, reject) => {
                        exportCanvas.toBlob(
                            result => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(
                                        new Error(
                                            "could not render remix"
                                        )
                                    );
                                }
                            },
                            "image/png"
                        );
                    }
                );

                filename =
                    `jamicat-remix-${Date.now()}.png`;
            }

            saveButton.textContent =
                "checking remix...";

            await this.validateGeneratedImageBlob(
                blob,
                { animated: isAnimated }
            );

            this.lastExportBlob = blob;

            const detail = {
                blob,
                filename,
                contentType: blob.type,
                animated: isAnimated,
                source: this.currentImage,
                effects: [
                    ...this.activeEffects
                ],
                overlays:
                    this.overlayItems.map(
                        (item, layerIndex) => ({
                            type: item.type,
                            layerIndex,
                            source: item.source,
                            x: item.x,
                            y: item.y,
                            width: item.width,
                            rotation:
                                item.rotation,
                            flipX:
                                item.flipX === true,
                            flipY:
                                item.flipY === true
                        })
                    )
            };

            window.dispatchEvent(
                new CustomEvent(
                    "jami-remix-ready",
                    { detail }
                )
            );

            console.log(
                "remix rendered and ready for upload:",
                detail
            );
        } catch (error) {
            console.error(
                "could not render remix:",
                error
            );

            this.showProgramMessage(
                `could not save remix.\n\n${error.message}\n\nnothing was uploaded.`
            );
        } finally {
            saveButton.disabled = false;
            saveButton.textContent =
                "save remix";
        }
    }

    toggleEffect(
    effectId,
    button
) {
    const active =
        this.activeEffects.has(
            effectId
        );

    if (active) {
        this.activeEffects.delete(
            effectId
        );
    } else {
        this.activeEffects.add(
            effectId
        );
    }

    const isNowActive =
        !active;

    button.setAttribute(
        "aria-pressed",
        String(isNowActive)
    );

    const label =
        button.dataset.effectLabel ||
        button.textContent
            .replace(/^✓\s*/, "");

    button.textContent =
        isNowActive
            ? `✓ ${label}`
            : label;

    this.render();
}

    async open(image) {
    const imageUrl =
        typeof image ===
            "string"
            ? image
            : image?.imageUrl ||
              image?.src ||
              "";

    if (!imageUrl) {
        console.error(
            "cannot open remix editor without an image URL"
        );

        return;
    }

    this.currentImage =
        image;

        this.effectSeed =
    Math.floor(
        Math.random() *
        2147483647
    );
        
    this.activeEffects.clear();
    this.clearOverlays();

    if (this.emojiPicker) {
        this.emojiPicker.hidden = true;
    }

    this.overlay
    .querySelectorAll(
        "[data-effect-id]"
    )
    .forEach(button => {
        button.setAttribute(
            "aria-pressed",
            "false"
        );

        button.textContent =
            button.dataset.effectLabel ||
            button.textContent
                .replace(/^✓\s*/, "");
    });

    this.overlay.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    try {
        await this.loadSourceImage(
            imageUrl
        );
    } catch (error) {
        console.error(
            "could not open remix editor:",
            error
        );

        this.showProgramMessage(
            error.message
        );

        this.close();
    }
}

    clearOverlays() {
        for (const item of this.overlayItems) {
            item.element?.remove();
        }

        this.overlayItems = [];
        this.selectedOverlayId = null;
    }

    close() {
    this.overlay.hidden =
        true;

    document.body.style.overflow =
        "";

    this.context?.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
    );

    this.sourceContext?.clearRect(
        0,
        0,
        this.sourceCanvas.width,
        this.sourceCanvas.height
    );

    this.canvas.width =
        0;

    this.canvas.height =
        0;

    this.sourceCanvas.width =
        0;

    this.sourceCanvas.height =
        0;

    this.sourceImage =
        null;

    this.currentImage =
        null;

    this.clearOverlays();

    if (this.emojiPicker) {
        this.emojiPicker.hidden = true;
    }

    this.activeEffects.clear();
}
}

window.jamiImageRemixEditor =
    new JamiImageRemixEditor();
