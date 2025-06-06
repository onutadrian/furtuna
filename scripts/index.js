'use strict'

const lenis = new Lenis({
    autoRaf: true,
});

gsap.registerPlugin(Flip, ScrollTrigger, Draggable, InertiaPlugin, SplitText)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let mobileBreakpoint = 1024; //px
let isDesktop = window.innerWidth > mobileBreakpoint;

window.addEventListener('resize', () => {
    let isResizeDesktop = window.innerWidth > mobileBreakpoint;
    if (isResizeDesktop !== isDesktop) {
        if (isResizeDesktop) {
            const evt = new CustomEvent('switchedToDesktop', {})
            window.dispatchEvent(evt);
        } else {
            const evt = new CustomEvent('switchedToMobile', {})
            window.dispatchEvent(evt);
        }
        isDesktop = isResizeDesktop;
    }
});

function workSection(container = document) {

    let projectItems = container.getElementsByClassName(`_project-item`);

    let lastActiveProject = {
        item: null,
        displayVideo: null,
        tagsAnimation: null,
        titleAnimation: null,
        displayChatWrapper: null,
        chatMessagesAnimation: null,
        chatTpingIndicatorAnimation: null
    };

    function activateProject(currentProjectItem) {

        if (lastActiveProject.item == currentProjectItem) return;

        let videoID = currentProjectItem.getAttribute(`video-id`)
        let videoElement = document.getElementById(videoID)
        let projectTags = currentProjectItem.getElementsByClassName(`_tag`)
        let projectTitle = currentProjectItem.getElementsByClassName(`_title`)[0]
        let chatWrapper = currentProjectItem.getElementsByClassName(`_chat-wrapper`)[0]
        let chatMessageIslands = currentProjectItem.getElementsByClassName(`_chat-island`)
        let chatTypingIndicator = currentProjectItem.getElementsByClassName(`_typing`)[0]

        lastActiveProject.displayVideo = gsap.to(videoElement, {
            display: `block`,
            autoAlpha: .5,
            duration: 0.3
        })

        videoElement.play();

        lastActiveProject.tagsAnimation = gsap.fromTo(Array.from(projectTags), {
            y: -10,
            autoAlpha: 0
        }, {
            y: 0,
            stagger: 0.05,
            autoAlpha: 1,
            duration: 0.2
        });

        lastActiveProject.titleAnimation = gsap.to(projectTitle, {
            autoAlpha: 1,
            duration: 0.3
        })

        if (isDesktop == true) {

            let chatAnimationStatus = chatWrapper.getAttribute(`animation-status`)

            if (chatAnimationStatus == `none`) {

                chatWrapper.setAttribute(`animation-status`, `in-progress`);

                lastActiveProject.displayChatWrapper = gsap.fromTo(chatWrapper, {
                    autoAlpha: 0
                }, {
                    autoAlpha: 1,
                    duration: 0.3
                });

                lastActiveProject.chatMessagesAnimation = gsap.fromTo(Array.from(chatMessageIslands), {
                    display: `none`,
                    autoAlpha: 0
                }, {
                    display: `block`,
                    autoAlpha: 1,
                    delay: 0.5,
                    stagger: 1,
                    onComplete: () => {
                        chatWrapper.setAttribute(`animation-status`, `done`)
                    }
                });

                lastActiveProject.chatTpingIndicatorAnimation = gsap.to(chatTypingIndicator, {
                    autoAlpha: 0,
                    delay: 2.5,
                    duration: 0
                })

            } else if (chatAnimationStatus == `done`) {
                lastActiveProject.displayChatWrapper = gsap.fromTo(chatWrapper, {
                    autoAlpha: 0
                }, {
                    autoAlpha: 1,
                    duration: 0.3
                });
            }
        }
    }

    function deactivateProject(currentProjectItem) {

        if (lastActiveProject.item == currentProjectItem) return;

        if (lastActiveProject.item != null) {
            lastActiveProject.displayVideo.revert();
            lastActiveProject.tagsAnimation.revert();
            lastActiveProject.titleAnimation.revert();

            let videoID = lastActiveProject.item.getAttribute(`video-id`)
            let videoElement = document.getElementById(videoID)

            videoElement.pause();

            if (isDesktop == true && lastActiveProject.displayChatWrapper) {

                let chatWrapper = lastActiveProject.item.getElementsByClassName(`_chat-wrapper`)[0]
                let chatAnimationStatus = chatWrapper.getAttribute(`animation-status`)

                if (chatAnimationStatus != `done`) {
                    chatWrapper.setAttribute(`animation-status`, `none`);
                    lastActiveProject.displayChatWrapper.revert();
                    lastActiveProject.chatMessagesAnimation.revert();
                    lastActiveProject.chatTpingIndicatorAnimation.revert();
                } else {
                    lastActiveProject.displayChatWrapper.revert();
                }

            }

        }
    }

    Array.from(projectItems).forEach(projectItem => {

        let mm = gsap.matchMedia();

        let pointerEnterEvent = new PointerEvent('pointerenter', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        mm.add(`(max-width: ${mobileBreakpoint}px)`, () => {
            gsap.to(projectItem, {
                scrollTrigger: {
                    trigger: projectItem,
                    start: "top center",
                    end: "top center",
                    scrub: true,

                    onEnter: () => {
                        gsapHover.dispatchEvent(pointerEnterEvent);
                    },
                    onLeave: () => {
                        gsapHover.dispatchEvent(pointerEnterEvent);
                    },
                    onEnterBack: () => {
                        gsapHover.dispatchEvent(pointerEnterEvent);
                    },
                    onLeaveBack: () => {
                        gsapHover.dispatchEvent(pointerEnterEvent);
                    }
                }
            });
        });

        window.addEventListener('switchedToDesktop', () => {
            deactivateProject(projectItem);

            lastActiveProject = {
                item: null,
                displayVideo: null,
                tagsAnimation: null,
                titleAnimation: null,
                displayChatWrapper: null,
                chatMessagesAnimation: null,
                chatTpingIndicatorAnimation: null
            };
        });

        window.addEventListener('switchedToMobile', () => {
            deactivateProject(projectItem)
        });

        let gsapHover = projectItem.getElementsByClassName(`gsapHover`)[0]

        gsapHover.addEventListener(`pointerenter`, () => {
            deactivateProject(projectItem)
            activateProject(projectItem)
            lastActiveProject.item = projectItem;
        })

    });

}

async function indexToProjectTransitionLeave(trigger) {

    if (!trigger.hasAttribute(`video-id`)) {
        return
    };

    let videoID = trigger.getAttribute(`video-id`);

    let videoElement = document.getElementById(videoID);
    let transitionWrapper = document.getElementsByClassName(`video-transition-wrapper`)[0];
    let projectsWrappper = document.getElementsByClassName(`_projects-wrapper`)[0];
    let allLeftSides = projectsWrappper.querySelectorAll('._project-item > ._left');
    let allRightSides = projectsWrappper.querySelectorAll('._project-item > ._right');
    let gsapHover = projectsWrappper.getElementsByClassName(`gsapHover`)

    let state = Flip.getState(videoElement)


    gsap.to(Array.from(gsapHover), {
        display: `none`,
        duration: 0
    });

    gsap.to(Array.from(allLeftSides), {
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.3
    });

    gsap.to(Array.from(allRightSides), {
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.3
    });

    transitionWrapper.appendChild(videoElement)

    gsap.to(transitionWrapper, {
        display: `block`,
        autoAlpha: 1,
        duration: 0
    })

    await Flip.from(state, {
        duration: 0.3
    })

    await gsap.to(videoElement, {
        autoAlpha: 1,
        duration: 0.3
    });


}

async function indexToProjectTransitionEnter() {

    let transitionWrapper = document.getElementsByClassName(`video-transition-wrapper`)[0];
    if (!transitionWrapper.hasChildNodes()) {
        return;
    }

    let videoFromTransition = transitionWrapper.getElementsByTagName(`video`)[0];
    let projectHero = document.getElementsByClassName(`project-hero`)[0]
    let videoWrapper = projectHero.getElementsByClassName(`_video-wrapper`)[0]
    let inPageVideo = videoWrapper.getElementsByTagName(`video`)[0]
    let projectTitle = projectHero.getElementsByClassName(`_title`)[0]
    let projectMetaWrappers = projectHero.getElementsByClassName(`_meta-wrapper`)

    gsap.to(videoFromTransition, {
        autoAlpha: 1,
        duration: 0
    });

    gsap.to(projectTitle, {
        autoAlpha: 0,
        duration: 0
    })

    gsap.to(Array.from(projectMetaWrappers), {
        autoAlpha: 0,
        duration: 0
    })

    await sleep(500);

    window.scrollTo(0, 0);

    inPageVideo.remove();
    videoFromTransition.parentNode.insertBefore(videoWrapper, videoFromTransition);
    videoWrapper.appendChild(videoFromTransition)

    let state = Flip.getState(videoWrapper)

    projectHero.appendChild(videoWrapper)

    gsap.to(transitionWrapper, {
        autoAlpha: 0,
        duration: 0
    })

    gsap.fromTo(projectTitle, {
        y: 24
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        delay: 0.8
    })

    gsap.fromTo(Array.from(projectMetaWrappers), {
        y: 24
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        stagger: 0.1,
        delay: 0.9
    })

    await Flip.from(state, {
        duration: 1,
        ease: "power2.inOut"
    })
}

function createBlob(blobElement, blobContent, hoverElements, blobSize, ) {

    //blobElement always getElementsByClassName(`x`)[0]
    //blobContent always getElementsByClassName(`x`)[0]
    //hoverElements always querySelectorAll(`x`) even if only one
    //blobSize width of blob int value

    gsap.set(blobElement, {
        transformOrigin: 'center center'
    });

    let blobState = {
        active: 0
    }; // is blob in gsapHover?

    hoverElements.forEach(hoverElement => {
        hoverElement.addEventListener(`pointerenter`, async () => {

            if (!isDesktop) return;

            gsap.to(blobState, {
                active: 1,
                duration: 0.3
            });
        })

        hoverElement.addEventListener(`pointerleave`, async () => {

            if (!isDesktop) return;

            gsap.to(blobState, {
                active: 0,
                duration: 0.3,
                ease: 'power1.out'
            });
        })
    })

    function getAngle(dx, dy) {
        return (Math.atan2(dy, dx) * 180) / Math.PI;
    }

    function getScale(dx, dy) {
        let dist = Math.hypot(dx, dy);
        return Math.min(dist / 1200, 0.35);
    }

    let pos = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    let vel = {
        x: 0,
        y: 0
    };

    let set = {
        x: gsap.quickSetter(blobElement, "x", "px"),
        y: gsap.quickSetter(blobElement, "y", "px"),
        width: gsap.quickSetter(blobElement, "width", "px"),
        r: gsap.quickSetter(blobElement, "rotation", "deg"),
        sx: gsap.quickSetter(blobElement, "scaleX"),
        sy: gsap.quickSetter(blobElement, "scaleY"),
        rt: gsap.quickSetter(blobContent, "rotation", "deg")
    };

    function updateBlob() {
        let rotation = getAngle(vel.x, vel.y);
        let scale = getScale(vel.x, vel.y);

        set.x(pos.x);
        set.y(pos.y);
        set.width(blobSize + scale * 150);
        set.r(rotation);
        set.sx((1 + scale) * blobState.active);
        set.sy((1 - scale) * blobState.active);
        set.rt(-rotation);
    }

    gsap.ticker.add(updateBlob);

    window.addEventListener("mousemove", (e) => {
        let x = e.clientX,
            y = e.clientY;
        gsap.to(pos, {
            x,
            y,
            duration: 1,
            ease: "expo.out",
            onUpdate: () => {
                vel.x = x - pos.x;
                vel.y = y - pos.y;
            }
        });

        updateBlob();
    });
}

function initBlobs(container = document) {

    let footerBlobElement = container.getElementsByClassName(`_contact-blob`)[0];
    if (footerBlobElement) {
        let footerBlobContent = footerBlobElement.getElementsByClassName(`_content`)[0];
        let footerHoverElement = container.querySelectorAll(`._contact-cta`);
        createBlob(footerBlobElement, footerBlobContent, footerHoverElement, 180)
    }

    let dragBlobElement = container.getElementsByClassName(`_drag-blob`)[0];
    if (dragBlobElement) {
        let dragBlobContent = dragBlobElement.getElementsByClassName(`_blob-content`)[0];
        let dragHoverElement = container.getElementsByClassName(`cs-int-drag`)[0].querySelectorAll(`._content`);
        createBlob(dragBlobElement, dragBlobContent, dragHoverElement, 128)
    }

    let projectsBlobElement = container.getElementsByClassName(`_view-project-blob`)[0];
    if (projectsBlobElement) {
        let projectsBlobContent = projectsBlobElement.getElementsByClassName(`_content`)[0];
        let projectsHoverElement = container.querySelectorAll(`.gsapHover`);
        createBlob(projectsBlobElement, projectsBlobContent, projectsHoverElement, 230)
    }
}

function caseStudyAnimations(container = document) {

    let mm = gsap.matchMedia();

    mm.add(`(min-width: ${mobileBreakpoint}px)`, () => {

        let txtMainElements = container.querySelectorAll(".cs-txt-main-left, .cs-txt-main-right");

        if (txtMainElements) {

            Array.from(txtMainElements).forEach(txtMainElement => {
                let preHeadingParagraph = txtMainElement.querySelectorAll("._pre-heading p")[0]
                let headingParagraph = txtMainElement.querySelectorAll("._heading p")[0]

                let split = SplitText.create(headingParagraph, {
                    type: "lines"
                });

                gsap.from(preHeadingParagraph, {
                    x: -40,
                    opacity: 0,
                    duration: 0.3,

                    scrollTrigger: {
                        trigger: preHeadingParagraph,
                        start: 'top 80%',
                    }
                })

                gsap.from(split.lines, {
                    y: 5,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,
                    delay: 0.1,

                    scrollTrigger: {
                        trigger: headingParagraph,
                        start: 'top 80%',
                    }
                })
            });
        }

        let figOneFullElements = container.querySelectorAll(".cs-fig-1-full-left, .cs-fig-1-full-right");

        if (figOneFullElements) {

            Array.from(figOneFullElements).forEach(figOneFullElement => {
                let visualElement = figOneFullElement.querySelectorAll("img, video")[0]
                let descriptionParagraphs = figOneFullElement.querySelectorAll("._description p")

                gsap.from(visualElement, {
                    opacity: 0,
                    scale: 1.2,
                    duration: .8,
                    clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                    transformOrigin: 'top center',
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (visualElement.tagName == `VIDEO`) {
                            visualElement.play();
                        }
                    },

                    scrollTrigger: {
                        trigger: visualElement,
                        start: '20% 80%',
                    }
                })

                if (!descriptionParagraphs) return;

                Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                    let split = SplitText.create(descriptionParagraph, {
                        type: "lines"
                    });

                    gsap.from(split.lines, {
                        y: 5,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.1,

                        scrollTrigger: {
                            trigger: descriptionParagraph,
                            start: 'top 80%',
                        }
                    })
                })

            })
        }

        let figOneAsymElements = container.querySelectorAll(".cs-fig-1-asym-left, .cs-fig-1-asym-right");

        if (figOneAsymElements) {

            Array.from(figOneAsymElements).forEach(figOneAsymElement => {
                let visualElement = figOneAsymElement.querySelectorAll("img, video")[0]
                let descriptionParagraphs = figOneAsymElement.querySelectorAll("._description p")

                gsap.from(visualElement, {
                    opacity: 0,
                    scale: 1.2,
                    duration: .8,
                    clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                    transformOrigin: 'top center',
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (visualElement.tagName == `VIDEO`) {
                            visualElement.play();
                        }
                    },

                    scrollTrigger: {
                        trigger: visualElement,
                        start: '20% 80%',
                    }
                })

                if (!descriptionParagraphs) return;

                Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                    let split = SplitText.create(descriptionParagraph, {
                        type: "lines"
                    });

                    gsap.from(split.lines, {
                        y: 5,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.1,

                        scrollTrigger: {
                            trigger: descriptionParagraph,
                            start: 'top 80%',
                        }
                    })
                })
            })
        }

        let figOneByOneElements = container.querySelectorAll(".cs-fig-1x1-left, .cs-fig-1x1-right");

        if (figOneByOneElements) {
            Array.from(figOneByOneElements).forEach(figOneByOneElement => {
                let visualElements = figOneByOneElement.querySelectorAll("img, video")
                let descriptionParagraphs = figOneByOneElement.querySelectorAll("._description p")

                Array.from(visualElements).forEach(visualElement => {
                    gsap.from(visualElement, {
                        opacity: 0,
                        scale: 1.2,
                        duration: .8,
                        clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                        transformOrigin: 'top center',
                        ease: 'power2.inOut',
                        onComplete: () => {
                            if (visualElement.tagName == `VIDEO`) {
                                visualElement.play();
                            }
                        },

                        scrollTrigger: {
                            trigger: visualElement,
                            start: '20% 80%',
                        }
                    })
                })

                if (!descriptionParagraphs) return;

                Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                    let split = SplitText.create(descriptionParagraph, {
                        type: "lines"
                    });

                    gsap.from(split.lines, {
                        y: 5,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.1,

                        scrollTrigger: {
                            trigger: descriptionParagraph,
                            start: 'top 80%',
                        }
                    })
                })
            })
        }

        let figOneByOneAsymElements = container.querySelectorAll(".cs-fig-1x1-asym-left, .cs-fig-1x1-asym-right");

        if (figOneByOneAsymElements) {
            Array.from(figOneByOneAsymElements).forEach(figOneByOneAsymElement => {
                let visualElements = figOneByOneAsymElement.querySelectorAll("img, video")
                let descriptionParagraphs = figOneByOneAsymElement.querySelectorAll("._description p")

                Array.from(visualElements).forEach(visualElement => {
                    gsap.from(visualElement, {
                        opacity: 0,
                        scale: 1.2,
                        duration: .8,
                        clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                        transformOrigin: 'top center',
                        ease: 'power2.inOut',
                        onComplete: () => {
                            if (visualElement.tagName == `VIDEO`) {
                                visualElement.play();
                            }
                        },
                        scrollTrigger: {
                            trigger: visualElement,
                            start: '20% 80%',
                        }
                    })
                })



                if (!descriptionParagraphs) return;

                Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                    let split = SplitText.create(descriptionParagraph, {
                        type: "lines"
                    });

                    gsap.from(split.lines, {
                        y: 5,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.1,

                        scrollTrigger: {
                            trigger: descriptionParagraph,
                            start: 'top 80%',
                        }
                    })
                })
            })
        }

        let figOneByTwoAsymElements = container.querySelectorAll(".cs-fig-1x2-asym-left, .cs-fig-1x2-asym-right");

        if (figOneByTwoAsymElements) {
            Array.from(figOneByTwoAsymElements).forEach(figOneByTwoAsymElement => {
                let visualElements = figOneByTwoAsymElement.querySelectorAll("img, video")
                let descriptionParagraphs = figOneByTwoAsymElement.querySelectorAll("._description p")

                Array.from(visualElements).forEach(visualElement => {
                    gsap.from(visualElement, {
                        opacity: 0,
                        scale: 1.2,
                        duration: .8,
                        clipPath: `polygon(0 0, 100% 0, 100% 0%, 0 0%)`,
                        transformOrigin: 'top center',
                        ease: 'power2.inOut',
                        onComplete: () => {
                            if (visualElement.tagName == `VIDEO`) {
                                visualElement.play();
                            }
                        },
                        scrollTrigger: {
                            trigger: visualElement,
                            start: '20% 80%',
                        }
                    })
                })



                if (!descriptionParagraphs) return;

                Array.from(descriptionParagraphs).forEach(descriptionParagraph => {
                    let split = SplitText.create(descriptionParagraph, {
                        type: "lines"
                    });

                    gsap.from(split.lines, {
                        y: 5,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.1,

                        scrollTrigger: {
                            trigger: descriptionParagraph,
                            start: 'top 80%',
                        }
                    })
                })
            })
        }

    })
}

function caseStudySectionCompare(container = document) {
    let compareElements = container.getElementsByClassName(`cs-int-compare`);

    if (compareElements) {

        Array.from(compareElements).forEach(compareElement => {
            let beforeImage = compareElement.getElementsByClassName(`_before`)[0]
            let dividerElement = compareElement.getElementsByClassName(`_divider`)[0]
            let pulsatingCircleElement = compareElement.getElementsByClassName(`_pulsating-circle`)[0]

            let ratio = 0.5;

            let pulseTween = null;

            function startPulse() {
                if (pulseTween == null) {
                    pulseTween = gsap.to(pulsatingCircleElement, {
                        delay: 2,
                        scale: 1.75,
                        opacity: 0,
                        duration: 1.5,
                        repeat: -1,
                        repeatDelay: 1,
                        ease: "power1.inOut"
                    });
                }
            }
            startPulse()

            function stopPulse() {
                pulseTween.revert();
                pulseTween = null;
            }

            function onDrag() {
                let width = compareElement.getBoundingClientRect().width;
                gsap.set(beforeImage, {
                    clipPath: `inset(0px ${width - draggable.x}px 0px 0px)`
                });
                ratio = draggable.x / width;

                if (pulseTween !== null) {
                    stopPulse()
                }
            }

            let draggable = new Draggable(dividerElement, {
                type: "x",
                bounds: compareElement,
                onDrag: onDrag,
                onThrowUpdate: onDrag,
                onDragEnd: startPulse,
                onThrowComplete: startPulse,
                inertia: true
            });

            function onResize() {
                let width = compareElement.getBoundingClientRect().width;
                let x = ratio * width;

                gsap.set(dividerElement, {
                    x: x
                });

                gsap.set(beforeImage, {
                    clipPath: `inset(0px ${width - x}px 0px 0px)`
                });

                draggable.update(true);
            }

            window.addEventListener("resize", onResize);
            onResize();

        });
    }
}

function caseStudySectionDrag(container = document) {
    let dragElements = container.getElementsByClassName(`cs-int-drag`);

    if (dragElements) {
        Array.from(dragElements).forEach(dragElement => {

            let galleryElement = dragElement.getElementsByClassName(`_gallery`)[0];

            Draggable.create(galleryElement, {
                type: "x",
                bounds: {
                    maxX: 0,
                    minX: galleryElement.clientWidth - galleryElement.scrollWidth
                },
                edgeResistance: 0.65,
                inertia: true
            });

        })
    }

}

barba.init({
    transitions: [{
        name: 'projectTransition',
        async leave(data) {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            const triggeredElement = data.trigger;
            if (triggeredElement) {
                await indexToProjectTransitionLeave(triggeredElement);
            }
        }
    }],
    views: [{
            namespace: 'home',
            beforeEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                workSection(data.next.container);
                initBlobs(data.next.container);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        ScrollTrigger.refresh();
                    });
                });
            }
        },
        {
            namespace: 'project',
            afterEnter(data) {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                indexToProjectTransitionEnter();
                caseStudyAnimations(data.next.container);
                caseStudySectionCompare(data.next.container);
                caseStudySectionDrag(data.next.container);
                initBlobs(data.next.container);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        ScrollTrigger.refresh();
                    });
                });
            }
        }
    ]
});