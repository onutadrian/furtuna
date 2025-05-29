'use strict'

const lenis = new Lenis({
    autoRaf: true,
});

gsap.registerPlugin(Flip, ScrollTrigger)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function indexPage() {

    let projectItems = document.getElementsByClassName(`_project-item`)
    let lastProjectItem = `none`;

    for (let i = 0; i < projectItems.length; i++) {

        let currentVideoId = projectItems[i].getAttribute(`video-id`)
        let currentVideoElement = document.getElementById(currentVideoId)

        let gsapHover = projectItems[i].getElementsByClassName(`gsapHover`)[0]

        let currentProjectTags = projectItems[i].getElementsByClassName(`_tag`)
        let currentProjectTitle = projectItems[i].getElementsByClassName(`_title`)[0]

        let currentChatWrapper = projectItems[i].getElementsByClassName(`_chat-wrapper`)[0]
        let currentChatAnimationStatus;

        let currentChatMessageIslands = projectItems[i].getElementsByClassName(`_chat-island`)
        let currentChatTypingIndicator = projectItems[i].getElementsByClassName(`_typing`)[0]

        ScrollTrigger.matchMedia({
            "(max-width: 1008px)": function () {

                const pointerEnterEvent = new PointerEvent('pointerenter', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });

                const pointerLeaveEvent = new PointerEvent('pointerleave', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });

                gsap.to(projectItems[i], {
                    scrollTrigger: {
                        trigger: projectItems[i],
                        start: "top center",
                        end: "top center",
                        scrub: true,
                        markers: true,
                        onEnter: () => {
                            gsapHover.dispatchEvent(pointerEnterEvent);
                        },
                        onLeave: () => {
                            gsapHover.dispatchEvent(pointerLeaveEvent);
                        },
                        onEnterBack: () => {
                            gsapHover.dispatchEvent(pointerEnterEvent);
                        },
                        onLeaveBack: () => {
                            gsapHover.dispatchEvent(pointerLeaveEvent);
                        }
                    }
                });
            }
        })

        gsapHover.addEventListener(`pointerenter`, async () => {

            if (lastProjectItem != projectItems[i]) {

                gsap.to(currentVideoElement, {
                    display: `block`,
                    autoAlpha: .5,
                    duration: 0.3
                })

                currentVideoElement.play();

                gsap.fromTo(Array.from(currentProjectTags), {
                    y: -10,
                    autoAlpha: 0
                }, {
                    y: 0,
                    stagger: 0.05,
                    autoAlpha: 1,
                    duration: 0.2
                });

                gsap.to(currentProjectTitle, {
                    autoAlpha: 1,
                    duration: 0.3
                })

                gsap.fromTo(currentChatWrapper, {
                    //x: -32,
                    autoAlpha: 0
                }, {
                    //x: 0,
                    autoAlpha: 1,
                    duration: 0.3
                });

                currentChatAnimationStatus = currentChatWrapper.getAttribute(`animation-status`)

                if (currentChatAnimationStatus == `none`) {

                    currentChatWrapper.setAttribute(`animation-status`, `in-progress`)

                    currentChatIslandAnimation = gsap.fromTo(currentChatMessageIslands, {
                        display: `none`,
                        autoAlpha: 0
                    }, {
                        display: `block`,
                        autoAlpha: 1,
                        delay: 0.5,
                        stagger: 1,
                        onComplete: () => {
                            currentChatWrapper.setAttribute(`animation-status`, `done`)
                        }
                    });

                    currentChatTypingIndicatorAnimation = gsap.to(currentChatTypingIndicator, {
                        autoAlpha: 0,
                        delay: 2.5,
                        duration: 0
                    })

                }

                if (lastProjectItem != `none`) {

                    let lastVideoId = lastProjectItem.getAttribute(`video-id`)
                    let lastVideoElement = document.getElementById(lastVideoId)

                    let lastProjectTags = lastProjectItem.getElementsByClassName(`_tag`)
                    let lastProjectTitle = lastProjectItem.getElementsByClassName(`_title`)[0]

                    let lastChatWrapper = lastProjectItem.getElementsByClassName(`_chat-wrapper`)[0]

                    gsap.to(lastVideoElement, {
                        display: `none`,
                        autoAlpha: 0,
                        duration: 0.3
                    })

                    lastVideoElement.pause();

                    gsap.to(Array.from(lastProjectTags), {
                        y: -10,
                        stagger: 0.05,
                        autoAlpha: 0,
                        duration: 0.2
                    });

                    gsap.to(lastProjectTitle, {
                        autoAlpha: 0.3,
                        duration: 0.3
                    })

                    gsap.to(lastChatWrapper, {
                        //x: -32,
                        autoAlpha: 0,
                        duration: 0.3
                    });
                }
            }
        })

        gsapHover.addEventListener(`pointerleave`, async () => {
            lastProjectItem = projectItems[i];
        })

    }

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

function createBlob(blobElement, blobContent, hoverElements, blobSize) {

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
            gsap.to(blobState, {
                active: 1,
                duration: 0.3
            });
        })

        hoverElement.addEventListener(`pointerleave`, async () => {
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

function initBlobs() {
    let footerBlobElement = document.getElementsByClassName(`_contact-blob`)[0];
    let footerBlobContent = footerBlobElement.getElementsByClassName(`_content`)[0];
    let footerHoverElement = document.querySelectorAll(`._contact-cta`);

    createBlob(footerBlobElement, footerBlobContent, footerHoverElement, 180)

    let projectsBlobElement = document.getElementsByClassName(`_view-project-blob`)[0];
    let projectsBlobContent = projectsBlobElement.getElementsByClassName(`_content`)[0];
    let projectsHoverElement = document.querySelectorAll(`.gsapHover`);

    createBlob(projectsBlobElement, projectsBlobContent, projectsHoverElement, 230)
}

barba.init({
    transitions: [{
        name: 'autoAlpha-transition',
        async leave(data) {
            const triggeredElement = data.trigger; // the clicked element

            if (triggeredElement) {
                await indexToProjectTransitionLeave(triggeredElement)
            }
        },
        async afterEnter(data) {
            //await indexToProjectTransitionEnter()
        }
    }],
    views: [{
        namespace: 'home', // optional, if using <body data-barba-namespace="your-namespace">
        afterEnter(data) {
            indexPage();
            initBlobs();
        }
    }, {
        namespace: 'project', // optional, if using <body data-barba-namespace="your-namespace">
        afterEnter(data) {
            indexToProjectTransitionEnter();
            initBlobs();
        }
    }]
});