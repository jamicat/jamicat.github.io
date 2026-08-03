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

        /*
         * The remaining effects are added
         * one at a time in later steps.
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

        button.setAttribute(
            "aria-pressed",
            String(!active)
        );

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
