class JamiImageRemixEditor {
    constructor() {
        this.overlay = null;
        this.image = null;
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
                            <img
                                class="jami-remix-image"
                                data-jami-remix-image
                                alt="image being remixed"
                            >
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

        this.image =
            overlay.querySelector(
                "[data-jami-remix-image]"
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
    }

    open(image) {
        const imageUrl =
            typeof image === "string"
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

        this.image.src =
            imageUrl;

        this.overlay.hidden =
            false;

        document.body.style.overflow =
            "hidden";
    }

    close() {
        this.overlay.hidden =
            true;

        document.body.style.overflow =
            "";

        this.image.removeAttribute(
            "src"
        );

        this.currentImage =
            null;

        this.activeEffects.clear();
    }
}

window.jamiImageRemixEditor =
    new JamiImageRemixEditor();