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
            {
                id:
                    "crt-bloom",
                label:
                    "CRT Bloom"
            },
            {
                id:
                    "cctv",
                label:
                    "CCTV"
            },
            {
                id:
                    "scanner-lid-open",
                label:
                    "Scanner Lid Open"
            },
            {
                id:
                    "broken-webcam",
                label:
                    "Broken Webcam"
            },
            {
                id:
                    "jpeg-deep-fry",
                label:
                    "JPEG Deep Fry"
            },
            {
                id:
                    "jpeg-100x",
                label:
                    "JPEG 100x"
            },
            {
                id:
                    "gifify-32",
                label:
                    "GIFify — 32 Colours"
            },
            {
                id:
                    "custom-emojis",
                label:
                    "Custom Emojis"
            },
            {
                id:
                    "ghost-orbs",
                label:
                    "Ghost Orbs"
            }
        ];

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
                class="jami-remix-editor"
                role="dialog"
                aria-modal="true"
                aria-label="Remix image"
            >
                <div
                    class="jami-remix-header"
                >
                    <div
                        class="jami-remix-title"
                    >
                        Remix Image
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
                        </div>
                    </div>

                    <aside
                        class="jami-remix-sidebar"
                    >
                        <div
                            class="jami-remix-section-title"
                        >
                            Effects
                        </div>

                        <div
                            class="jami-remix-filter-list"
                            data-jami-remix-effects
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
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="jami-remix-save"
                        data-jami-remix-save
                    >
                        Save Remix
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(
            overlay
        );

        this.overlay = overlay;

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
                () => {
                    console.log(
                        "Remix save requested:",
                        {
                            image:
                                this.currentImage,

                            effects:
                                [
                                    ...this
                                        .activeEffects
                                ]
                        }
                    );

                    window.alert(
                        "The editor shell works. Saving comes next."
                    );
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

        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                        "Escape" &&
                    !this.overlay.hidden
                ) {
                    this.close();
                }
            }
        );
    }

    async loadSourceImage(
    imageUrl
) {
    const image =
        new Image();

    /*
     * Required when loading an image
     * from the Worker or another origin.
     */
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
                            "Could not load image for remixing"
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

    /*
     * Always rebuild from the untouched
     * source so effects do not repeatedly
     * damage the previous preview.
     */
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

        /*
         * Emojis and ghost orbs are added
         * in the interactive-overlay pass.
         */
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

    /*
     * Slightly increased contrast and
     * saturation for the monitor image.
     */
    context.save();

    context.filter =
        "contrast(1.12) saturate(1.14) brightness(1.03)";

    context.drawImage(
        original,
        0,
        0
    );

    context.restore();

    /*
     * Soft phosphor glow.
     */
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

    /*
     * Horizontal CRT scanlines.
     */
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

    /*
     * Gentle vignette around the edges.
     */
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

    /*
     * Very faint cool monitor tint.
     */
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

    /*
     * Base monochrome security-camera look.
     */
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

    /*
     * Slight green-grey monitor tint.
     */
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

    /*
     * Fine sensor noise.
     */
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

    /*
     * Security monitor scanlines.
     */
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

    /*
     * Faint horizontal rolling band.
     */
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

    /*
     * Dark camera housing vignette.
     */
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

    /*
     * Tiny CCTV-style corner marks.
     */
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

    /*
     * Top-left.
     */
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

    /*
     * Top-right.
     */
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

    /*
     * Bottom-left.
     */
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

    /*
     * Bottom-right.
     */
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

    /*
     * Repeated shrinking and enlargement
     * approximates many generations of
     * low-quality JPEG recompression without
     * making the render pipeline asynchronous.
     */
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

        /*
         * Quantise colour and partially share
         * chroma inside JPEG-like blocks.
         */
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

    /*
     * Faint block-grid seams complete the
     * repeatedly-recompressed appearance.
     */
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

    /*
     * A fixed 32-colour RGB palette:
     * 4 red levels × 4 green levels ×
     * 2 blue levels. Ordered dithering
     * prevents broad flat bands.
     */
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

    /*
     * Give it the slightly crunchy display
     * quality of a small web GIF enlarged in
     * the browser.
     */
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
            "Cannot open remix editor without an image URL"
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
            "Could not open remix editor:",
            error
        );

        window.alert(
            error.message
        );

        this.close();
    }
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

    this.activeEffects.clear();
}
}

window.jamiImageRemixEditor =
    new JamiImageRemixEditor();
