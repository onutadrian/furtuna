'use strict'

const lenis = new Lenis({
    autoRaf: true,
    overscroll: false,
    prevent: (node) => node.id === "caseStudyOverlayScroll",
    anchors: {
        offset: -96
    }
});

gsap.registerPlugin(Flip, ScrollTrigger, Draggable, InertiaPlugin, SplitText)

// Global scroll direction detection
let scrollDirection = null;
lenis.on('scroll', (e) => {
    scrollDirection = e.direction
    ScrollTrigger.update();
    if (headerScrollListener) {
        headerScrollListener(e);
    }
})

// isScrollProgrammatic to diferentiate between user an non-user scroll
let isScrollProgrammatic = false;

// Disable scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Sleep function (to be used for delays)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// isDesktop detect (based on screen width)
let mobileBreakpoint = 1024; //px
let isDesktop = window.innerWidth > mobileBreakpoint;

// should the page scroll to top after page change
let scrollToTop = false;

// switchedToDesktop / switchedToMobile custom events (based on screen width) and isDesktop updater 
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

// Text Animations
// text-animation="word-reveal, chars, false, 0"

function textAnimations() {
    let wordRevealElements = document.querySelectorAll('[text-animation*="word-reveal"]');

    Array.from(wordRevealElements).forEach(element => {
        let properties = element.getAttribute(`text-animation`).split(`, `);
        //properties = animation type, split type, instant/on-scroll

        let split = SplitText.create(element, {
            type: properties[1],
            mask: properties[1],
            smartWrap: true
        });

        let toBeAnimated = null;

        switch (properties[1]) {
            case `lines`:
                toBeAnimated = split.lines
                break;
            case `words`:
                toBeAnimated = split.words
                break;
            case `chars`:
                toBeAnimated = split.chars
                break;
        }

        gsap.from(toBeAnimated, {
            y: -100,
            duration: 0.6,
            stagger: 0.01,
            delay: 0,
            ease: `power3.out`,
            delay: 2
        })

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
    };

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

// Helper Variables
// scrollDirection = 1 (down) / -1 (up)
// mobileBreakpoint
// isDesktop = true / false
// isScrollProgrammatic = true/false

// Helper Functions
// sleep(ms)
// Text Animations
// Create Blob

// Helper Custom Events
// document.addEventListener(`switchedToDesktop`)
// document.addEventListener(`switchedToMobile`)

function cookiesConsent(container = document) {
    let cookiesWrapperElement = container.querySelector(`.cookies-wrapper`)

    if (!cookiesWrapperElement) return;

    let acceptButton = cookiesWrapperElement.querySelector(`._button`)
    let consentGiven = localStorage.getItem("cookiesConsentGiven");

    if (consentGiven == null) {

        gsap.to(cookiesWrapperElement, {
            display: `flex`,
            duration: 0
        })

        acceptButton.addEventListener(`click`, () => {

            localStorage.setItem("cookiesConsentGiven", true);

            gsap.to(cookiesWrapperElement, {
                display: `none`,
                duration: 0
            })
        })
    }
}

function homeHeroIntro(container = document) {
    let homeHero = container.querySelector(`.homepage-hero`)

    if (homeHero) {
        let homeHeroHeading = homeHero.querySelector(`._heading`)

        let headingSplit = SplitText.create(homeHeroHeading, {
            type: `chars`,
            mask: `chars`,
            smartWrap: true
        });

        gsap.from(headingSplit.chars, {
            y: `-110%`,
            autoAlpha: 0,
            duration: 1.4,
            stagger: 0.02,
            ease: `power3.inOut`,
            onComplete: () => headingSplit.revert()
        })
    }
}

function projectsSection(container = document) {

    let matchMedia = gsap.matchMedia();

    let headerWrapperElement = container.querySelector(`.header-wrapper`)
    let homepageHeroElement = container.querySelector(`.homepage-hero`)

    let projectsSectionElement = container.querySelector(`.projects-section`)
    if (!projectsSectionElement) return;

    let stickyWarpperElement = projectsSectionElement.querySelector(`._sticky-wrapper`)
    let projectsWrapperElement = container.querySelector(`._projects-wrapper`)

    if (!stickyWarpperElement || !projectsWrapperElement || !headerWrapperElement || !homepageHeroElement) {
        return;
    }

    let projectItemElements = projectsWrapperElement.querySelectorAll(`._project-item`);

    let previousProject = null;

    matchMedia.add(`(min-width: ${mobileBreakpoint}px)`, () => { //only run on desktop

        let animationTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: projectsSectionElement,
                start: "0% 50%",
                end: "100% 40%",
                scrub: true,
                //markers: true
                onUpdate: self => {

                    let topEnterAlignInProgress = false;
                    let bottomEnterAlignInProgress = false;

                    // top enter align
                    if (self.progress > 0.32 && self.progress < 0.39 && !topEnterAlignInProgress && scrollDirection == 1) {
                        topEnterAlignInProgress = true;

                        const trigger = animationTimeline.scrollTrigger;
                        const scollToPos = trigger.start + 0.5 * (trigger.end - trigger.start); // scrollToPos = 40% of timeline


                        isScrollProgrammatic = true;
                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                topEnterAlignInProgress = false;
                            }
                        })

                        //programaticallyScrollTo(scollToPos, {
                        //    onComplete: () => {
                        //        topEnterAlignInProgress = false;
                        //    }
                        //})
                    }

                    //bottom enter align
                    if (self.progress < 0.56 && self.progress > 0.51 && !bottomEnterAlignInProgress && scrollDirection == -1) {
                        bottomEnterAlignInProgress = true;

                        const trigger = animationTimeline.scrollTrigger;
                        const scollToPos = trigger.start + 0.5 * (trigger.end - trigger.start); // scrollToPos = 40% of timeline

                        isScrollProgrammatic = true;
                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                bottomEnterAlignInProgress = false;
                            }
                        })
                    }
                }
            }
        });

        animationTimeline.fromTo(stickyWarpperElement, {
                y: 160,
                width: "80%",
                borderRadius: "32px"
            }, {
                y: 0,
                width: "100%",
                borderRadius: "0px",
                duration: 0.4
            })
            .to(headerWrapperElement, {
                autoAlpha: 0,
                duration: 0.1
            }, `<+=0.3`)
            .fromTo(projectsWrapperElement, {
                autoAlpha: 0,
                y: 48
            }, {
                autoAlpha: 1,
                duration: 0.2,
                y: 0
            }, "<")
            .to(homepageHeroElement, {
                autoAlpha: 0,
                duration: 0.2,
            }, "<")
            .to({}, {
                duration: 0.2
            })
            .to(stickyWarpperElement, {
                y: -160,
                width: "80%",
                borderRadius: "32px",
                duration: 0.4
            })
            .to(projectsWrapperElement, {
                autoAlpha: 0,
                duration: 0.1
            }, "<")
            .to(headerWrapperElement, {
                autoAlpha: 1,
                duration: 0.1
            }, `<+=0.3`)

    });

    function updateAndAnimateProjectTags(tags) {
        let tagsWrapperElement = container.querySelector(`.projects-section`).querySelector(`._tags-wrapper`)
        tagsWrapperElement.innerHTML = ``;

        let tagsArray = tags.split(`, `);

        tagsArray.forEach(tag => {
            tagsWrapperElement.innerHTML += `<div class="_tag">${tag}</div>`
        })

        let newTagElements = tagsWrapperElement.querySelectorAll(`._tag`)

        gsap.from(Array.from(newTagElements), {
            autoAlpha: 0,
            y: 24,
            stagger: 0.1,
            duration: 0.4,
            ease: `power3.out`
        })
    }

    function activateProjectItem(projectElement) {
        let videoID = projectElement.getAttribute(`video-id`);
        let videoElement = container.querySelector(`#${videoID}`)

        let titleElement = projectElement.querySelector(`._title`)
        let titleIconElement = projectElement.querySelector(`._icon`)
        let titleIconSVGs = projectElement.querySelectorAll(`svg`)

        let projectTags = projectElement.getAttribute(`tags`);
        updateAndAnimateProjectTags(projectTags)

        gsap.to(videoElement, {
            autoAlpha: 0.2,
            duration: 0.2
        })

        videoElement.play();

        gsap.to(titleElement, {
            autoAlpha: 1,
            duration: 0.2,
            color: `#ffffff`
        })

        gsap.to(titleIconElement, {
            autoAlpha: 1,
            duration: 0.2
        })

        //gsap.from(Array.from(titleIconSVGs), {
        //    y: `100%`,
        //    x: `-100%`,
        //    duration: 0.3,
        //    ease: "power1.out",
        //})

    }

    function deactivateProjectItem(projectElement) {
        let videoID = projectElement.getAttribute(`video-id`);
        let videoElement = container.querySelector(`#${videoID}`)

        let titleElement = projectElement.querySelector(`._title`)
        let titleIconElement = projectElement.querySelector(`._icon`)

        gsap.to(videoElement, {
            autoAlpha: 0,
            duration: 0.2
        })

        videoElement.pause();

        gsap.to(titleElement, {
            autoAlpha: 1,
            color: `#8B8B8B`,
            duration: 0.2
        })

        gsap.to(titleIconElement, {
            autoAlpha: 0,
            duration: 0.2
        })
    }

    let pointerEnterEvent = new PointerEvent('pointerenter', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    Array.from(projectItemElements).forEach(projectItem => {

        matchMedia.add(`(max-width: ${mobileBreakpoint}px)`, () => {
            gsap.to(projectItem, {
                scrollTrigger: {
                    trigger: projectItem,
                    start: "center center",
                    end: "center center",
                    scrub: true,
                    //markers: true,
                    onEnter: () => {
                        projectItem.dispatchEvent(pointerEnterEvent);
                    },
                    onEnterBack: () => {
                        projectItem.dispatchEvent(pointerEnterEvent);
                    }
                }
            });
        });

        projectItem.addEventListener(`pointerenter`, () => {

            if (previousProject == projectItem) return;

            if (previousProject) {
                deactivateProjectItem(previousProject)
            }

            activateProjectItem(projectItem)

            previousProject = projectItem
        })

        window.addEventListener('switchedToDesktop', () => {
            deactivateProjectItem(projectItem);
        });

        window.addEventListener('switchedToMobile', () => {
            deactivateProjectItem(projectItem)
        });

    })

    window.addEventListener('switchedToDesktop', () => {
        activateProjectItem(previousProject);
    });

    activateProjectItem(projectItemElements[0])
    previousProject = projectItemElements[0]

}

function becauseWeAnimation() {

    let mm = gsap.matchMedia();

    mm.add(`(min-width: ${mobileBreakpoint}px)`, () => {

        let whyWorkWithUsElement = document.querySelector(`.why-work-with-us`)
        if (!whyWorkWithUsElement) return;

        let animationWrapper = whyWorkWithUsElement.querySelector(`._animation-wrapper`)
        let headingElement = animationWrapper.querySelector(`._we`)

        let animationTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: animationWrapper,
                start: `0% 40%`,
                end: `90% 40%`,
                scrub: true,
                //ers: true,
                pin: headingElement,
                pinSpacing: false
            }
        })

        animationTimeline.to({}, {
                duration: 0.9
            })
            .to(headingElement, {
                opacity: 0,
                duration: 0.1
            }, `<+=0.75"`)

        let reasonElements = animationWrapper.querySelectorAll(`._reason`)

        Array.from(reasonElements).forEach(reasonElement => {
            let content = reasonElement.querySelector(`._content`)
            let number = content.querySelector(`._number`)
            let text = content.querySelector(`._text`)

            gsap.fromTo(number, {
                autoAlpha: 0,
                y: -24,
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                ease: `power3.inOut`,
                scrollTrigger: {
                    trigger: reasonElement,
                    start: `0% 55%`,
                    end: `100% 55%`,
                    //markers: true,
                }
            })

            let textSplit = SplitText.create(text, {
                type: `words`,
                mask: `words`,
                smartWrap: true
            });

            gsap.fromTo(textSplit.words, {
                autoAlpha: 0,
                y: -24,
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.02,
                ease: `power3.inOut`,
                scrollTrigger: {
                    trigger: reasonElement,
                    start: `0% 55%`,
                    end: `100% 55%`,
                    //markers: true,
                }
            })

            gsap.to(text, {
                opacity: 0.5,
                duration: 0.4,
                ease: `power3.inOut`,
                scrollTrigger: {
                    trigger: reasonElement,
                    start: `0% 30%`,
                    end: `100% 60%`,
                    //markers: true,
                    toggleActions: "play none reverse none",
                }

            })
        })

    });
}

function testimonialsSection(container = document) {

    let mm = gsap.matchMedia();

    let testimonialsSection = container.querySelector(`.testimonials`)

    if (!testimonialsSection) {
        return;
    }

    let testimonialsItems = testimonialsSection.querySelectorAll(`._testimonial-items ._item`)

    let progressBar = testimonialsSection.querySelector(`._progress ._current`)

    let currentTestimonialIndex = 0;
    let testimonialsObjects = []
    let imageElements = {}

    Array.from(testimonialsItems).forEach(item => {
        let addToTestimonialsObjects = {
            "quote": `${item.querySelector(`._quote`).innerHTML}`,
            "name": `${item.querySelector(`._name`).innerHTML}`,
            "company": `${item.querySelector(`._company`).innerHTML}`,
            "position": `${item.querySelector(`._position`).innerHTML}`,
            "imageElement": testimonialsSection.querySelector(`#${item.getAttribute("image-id")}`),
            "caseStudyLink": `${item.getAttribute(`case-study-link`)}`
        }

        testimonialsObjects.push(addToTestimonialsObjects)
    })

    let quoteElement = testimonialsSection.querySelector(`._quote`)
    let nameElement = testimonialsSection.querySelector(`._name`)
    let companyElement = testimonialsSection.querySelector(`._company`)
    let positionElement = testimonialsSection.querySelector(`._position`)
    let ctaButton = testimonialsSection.querySelector(`.cta-button`)

    function switchTestimonial(testimonialItem) {

        let oldImage = testimonialItem.imageElement

        currentTestimonialIndex++;

        if (currentTestimonialIndex > testimonialsObjects.length - 1) {
            currentTestimonialIndex = 0;
        }

        let newTestimonialItem = testimonialsObjects[currentTestimonialIndex]
        let newImage = newTestimonialItem.imageElement

        let animationTimeline = gsap.timeline()

        animationTimeline.to(quoteElement, {
                duration: 0.4,
                y: -24,
                autoAlpha: 0
            })
            .to(nameElement, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.2`)
            .to(companyElement, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.1`)
            .to(positionElement, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.1`)
            .to(ctaButton, {
                duration: 0.3,
                y: -24,
                autoAlpha: 0
            }, `<+=0.1`)
            .to(oldImage, {
                duration: 0.3,
                autoAlpha: 0,
            }, `<+=0.1`)
            .to({}, {
                onComplete: function () {
                    quoteElement.innerHTML = newTestimonialItem.quote
                    nameElement.innerHTML = newTestimonialItem.name
                    companyElement.innerHTML = newTestimonialItem.company
                    positionElement.innerHTML = newTestimonialItem.position
                    ctaButton.setAttribute(`href`, newTestimonialItem.caseStudyLink)
                }
            }, `<`)
            .to(newImage, {
                duration: 0.3,
                autoAlpha: 1,
            }, `<`)
            .to(quoteElement, {
                duration: 0.4,
                y: 0,
                autoAlpha: 1
            })
            .to(nameElement, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.2`)
            .to(companyElement, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.1`)
            .to(positionElement, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.1`)
            .to(ctaButton, {
                duration: 0.3,
                y: 0,
                autoAlpha: 1
            }, `<+=0.1`)
    }

    gsap.to(progressBar, {
        duration: 8,
        width: `100%`,
        ease: `none`,
        repeat: -1,
        onRepeat: function () {
            switchTestimonial(testimonialsObjects[currentTestimonialIndex])
        }
    })

    let headerWrapperElement = container.querySelector(`.header-wrapper`)


    mm.add(`(min-width: ${mobileBreakpoint}px)`, () => {

        let snapTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: testimonialsSection,
                start: "0% 15%",
                end: "100% 85%",
                scrub: true,
                //markers: true,
                onUpdate: self => {

                    let topEnterAlignInProgress = false;
                    let bottomEnterAlignInProgress = false;

                    // top enter align
                    if (self.progress > 0 && self.progress < 0.3 && !topEnterAlignInProgress && scrollDirection == 1) {
                        topEnterAlignInProgress = true;

                        const scollToPos = testimonialsSection.getBoundingClientRect().top + window.pageYOffset;

                        isScrollProgrammatic = true;

                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                topEnterAlignInProgress = false;
                            }
                        })
                    }

                    //bottom enter align
                    if (self.progress < 1 && self.progress > 0.7 && !bottomEnterAlignInProgress && scrollDirection == -1) {
                        bottomEnterAlignInProgress = true;

                        const scollToPos = testimonialsSection.getBoundingClientRect().top + window.pageYOffset;

                        isScrollProgrammatic = true;

                        lenis.scrollTo(scollToPos, {
                            onComplete: () => {
                                isScrollProgrammatic = false;
                                bottomEnterAlignInProgress = false;
                            }
                        })
                    }
                }
            }
        });

        snapTimeline.to({}, {
                duration: 0.1
            })
            .to(headerWrapperElement, {
                autoAlpha: 0,
                duration: 0.1
            })
            .to({}, {
                duration: 0.7
            })
            .to(headerWrapperElement, {
                autoAlpha: 1,
                duration: 0.1
            })

    });
}

function initBlobs(container = document) {

    let footerBlobElement = container.querySelector(`._contact-blob`);
    if (footerBlobElement) {
        let footerBlobContent = footerBlobElement.querySelector(`._content`);
        let footerHoverElement = container.querySelectorAll(`._get-in-touch`);
        createBlob(footerBlobElement, footerBlobContent, footerHoverElement, 180)
    }

    let dragBlobElement = container.getElementsByClassName(`_drag-blob`)[0];
    if (dragBlobElement) {
        let dragBlobContent = dragBlobElement.getElementsByClassName(`_blob-content`)[0];
        let dragHoverElement = container.getElementsByClassName(`cs-int-drag`)[0].querySelectorAll(`._content`);
        createBlob(dragBlobElement, dragBlobContent, dragHoverElement, 128)
    }
}

function caseStudyProgressBar(container = document) {

    let currentProgressElement = container.querySelector(`.case-study-progress ._current`)

    if (!currentProgressElement) return;

    gsap.to(currentProgressElement, {
        width: `100%`,
        ease: "none",
        scrollTrigger: {
            scrub: 0.3,
        }
    });

}

function caseStudyAnimations(container = document) {
    if (!container || container.dataset.caseStudyAnimationsInitialized === `true`) {
        return;
    }
    container.dataset.caseStudyAnimationsInitialized = `true`;

    function markCaseStudySplitElement(element) {
        if (!element) return false;
        if (element.dataset.caseStudySplitInitialized === `true`) return false;
        element.dataset.caseStudySplitInitialized = `true`;
        return true;
    }

    let txtMainElements = container.querySelectorAll(".cs-txt-main-left, .cs-txt-main-right");

    if (txtMainElements) {

        Array.from(txtMainElements).forEach(txtMainElement => {
            let preHeadingParagraph = txtMainElement.querySelectorAll("._pre-heading p")[0]
            let headingParagraph = txtMainElement.querySelectorAll("._heading p")

            if (!markCaseStudySplitElement(preHeadingParagraph)) return;
            Array.from(headingParagraph).forEach(markCaseStudySplitElement);

            let split = SplitText.create(headingParagraph, {
                type: "lines"
            });

            gsap.from(preHeadingParagraph, {
                x: -40,
                opacity: 0,
                duration: 0.3,

                scrollTrigger: {
                    trigger: preHeadingParagraph,
                    start: 'top 70%',
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
                    start: 'top 70%',
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
                if (!markCaseStudySplitElement(descriptionParagraph)) return;

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
                        start: 'top 70%',
                        //markers: true,
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
                if (!markCaseStudySplitElement(descriptionParagraph)) return;

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
                        start: 'top 70%',
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
                if (!markCaseStudySplitElement(descriptionParagraph)) return;

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
                        start: 'top 70%',
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
                if (!markCaseStudySplitElement(descriptionParagraph)) return;

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
                        start: 'top 70%',
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
                if (!markCaseStudySplitElement(descriptionParagraph)) return;

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
                        start: 'top 70%',
                    }
                })
            })
        })
    }
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



async function caseStudySectionDrag(container = document) {

    await sleep(500);

    let dragElements = container.querySelectorAll(`.cs-int-drag`);

    if (dragElements) {
        Array.from(dragElements).forEach(dragElement => {

            let galleryElement = dragElement.querySelector(`._gallery`);

            let drag = Draggable.create(galleryElement, {
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

function resetProjectViewportTransition() {
    const transitionWrapper = document.querySelector(`.video-transition-wrapper`);
    if (!transitionWrapper) return;

    transitionWrapper.innerHTML = ``;
    gsap.set(transitionWrapper, {
        autoAlpha: 0,
        display: `none`
    });
}

function capabilitiesOverlay(container = document) {
    let tellMeMoreButtons = container.querySelectorAll(`.capabilities section ._button`)

    if (tellMeMoreButtons.length === 0) return;

    let capabilitiesOverlayElement = container.querySelector(`.capabilities-overlay`)

    let capabilitiesOverlayAppendIn = capabilitiesOverlayElement.querySelector(`.width-limiter`)
    let capabilitiesOverlayContent = capabilitiesOverlayElement.querySelector(`._content`)
    let overlayBorder;
    let lastTellMeMoreButton = null;

    let capabilitiesOverlayTitleElement = capabilitiesOverlayElement.querySelector(`._title`)
    let capabilitiesOverlayParagraphsElement = capabilitiesOverlayElement.querySelector(`._paragraphs`)

    let tellMeLessButton = capabilitiesOverlayElement.querySelector(`._button`)
    let outsideClickElement = capabilitiesOverlayElement.querySelector(`._outside-click`)

    Array.from(tellMeMoreButtons).forEach(button => {
        button.addEventListener(`click`, () => {

            lenis.stop()

            let itemContent = button.parentNode

            capabilitiesOverlayTitleElement.innerHTML = itemContent.querySelector(`._overlay-content ._title`).innerHTML
            capabilitiesOverlayParagraphsElement.innerHTML = itemContent.querySelector(`._overlay-content ._paragraphs`).innerHTML


            capabilitiesOverlayContent.scrollTo(0, 0);

            let buttonContent = button.querySelector(`._content`)

            lastTellMeMoreButton = button;

            overlayBorder = button.querySelector(`._overlay-border`)
            let state = Flip.getState(overlayBorder)
            capabilitiesOverlayAppendIn.insertBefore(overlayBorder, capabilitiesOverlayContent)

            let animationTimeline = gsap.timeline()

            animationTimeline.to(capabilitiesOverlayElement, {
                    autoAlpha: 0,
                    display: `block`,
                    duration: 0
                })
                .to(capabilitiesOverlayElement, {
                    autoAlpha: 1,
                    duration: 0.2,
                })
                .to(capabilitiesOverlayContent, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.2
                }, `<+=0.45`)
                .to(buttonContent, {
                    autoAlpha: 0
                })

            Flip.from(state, {
                duration: .6,
                ease: `power3.inOut`
            })
        })
    })

    function closeOverlay() {

        lenis.start()

        overlayBorder = capabilitiesOverlayElement.querySelector(`._overlay-border`)
        let state = Flip.getState(overlayBorder)
        lastTellMeMoreButton.appendChild(overlayBorder)

        let buttonContent = lastTellMeMoreButton.querySelector(`._content`)

        let animationTimeline = gsap.timeline()

        animationTimeline.to(capabilitiesOverlayContent, {
                autoAlpha: 0,
                duration: 0.2
            })
            .to(capabilitiesOverlayElement, {
                autoAlpha: 0,
                duration: 0.2,
            })
            .to(capabilitiesOverlayElement, {
                autoAlpha: 0,
                display: `block`,
                duration: 0
            })
            .to(buttonContent, {
                autoAlpha: 1,
                duration: 0.1
            }, `<+=0.1`)

        Flip.from(state, {
            duration: .6,
            ease: `power3.inOut`
        })
    }

    tellMeLessButton.addEventListener(`click`, () => {
        closeOverlay()
    })

    outsideClickElement.addEventListener(`click`, () => {
        closeOverlay()
    })
}

let mobileMenuOpen = false;
let headerScrollListener = null;

function headerScrollAnimation(container = document) {

    let headerWrapperElement = container.querySelector(`.header-wrapper`)
    if (!headerWrapperElement) return;

    headerScrollListener = null;

    gsap.set(headerWrapperElement, {
        yPercent: 0
    });

    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let topThreshold = 72;
    let hideThreshold = 24;
    let showThreshold = 12;
    let isHeaderHidden = false;
    let accumulatedDelta = 0;

    function hideHeader() {
        gsap.killTweensOf(headerWrapperElement);
        gsap.to(headerWrapperElement, {
            yPercent: -100,
            duration: 0.28,
            ease: `power3.out`,
            overwrite: true
        });
    }

    function showHeader() {
        gsap.killTweensOf(headerWrapperElement);
        gsap.to(headerWrapperElement, {
            yPercent: 0,
            duration: 0.28,
            ease: `power3.out`,
            overwrite: true
        });
    }

    headerScrollListener = (event) => {
        if (isScrollProgrammatic) return;

        let currentScrollY = event?.scroll ?? window.scrollY ?? window.pageYOffset ?? 0;
        let scrollDelta = currentScrollY - lastScrollY;

        if (currentScrollY <= topThreshold) {
            if (isHeaderHidden) {
                showHeader();
                isHeaderHidden = false;
            }
            accumulatedDelta = 0;
            lastScrollY = currentScrollY;
            return;
        }

        if (Math.abs(scrollDelta) < 1) {
            return;
        }

        if ((accumulatedDelta > 0 && scrollDelta < 0) || (accumulatedDelta < 0 && scrollDelta > 0)) {
            accumulatedDelta = 0;
        }

        accumulatedDelta += scrollDelta;

        if (accumulatedDelta >= hideThreshold && mobileMenuOpen == false && !isHeaderHidden) {
            hideHeader();
            isHeaderHidden = true;
            accumulatedDelta = 0;
        } else if (accumulatedDelta <= -showThreshold && isHeaderHidden) {
            showHeader();
            isHeaderHidden = false;
            accumulatedDelta = 0;
        }

        lastScrollY = currentScrollY;
    };
}

function toggleMobileMenu(container = document) {
    let mobileMenuToggleButton = container.querySelector(`.header-wrapper ._mobile-menu-toggle`)
    let mobileMenuElement = container.querySelector(`.mobile-menu`)

    let menuItems = container.querySelectorAll(`.mobile-menu li`)
    let isRomanian = document.documentElement.lang === `ro`;
    let menuLabel = isRomanian ? `MENIU` : `MENU`;
    let closeLabel = isRomanian ? `ÎNCHIDE` : `CLOSE`;

    function openMenu() {
        lenis.stop()
        mobileMenuOpen = true;
        mobileMenuToggleButton.innerHTML = closeLabel

        gsap.to(mobileMenuElement, {
            x: `0%`,
            duration: 0.3,
            ease: `power3.out`
        })
    }

    function closeMenu() {
        lenis.start()
        mobileMenuOpen = false;
        mobileMenuToggleButton.innerHTML = menuLabel

        gsap.to(mobileMenuElement, {
            x: `100%`,
            duration: 0.3,
            ease: `power3.out`
        })
    }

    mobileMenuToggleButton.addEventListener(`click`, () => {

        if (mobileMenuOpen == false) {
            openMenu()

        } else if (mobileMenuOpen == true) {
            closeMenu()
        }
    })

    window.addEventListener(`switchedToDesktop`, () => {
        closeMenu()
    })

    Array.from(menuItems).forEach(menuItem => {
        menuItem.addEventListener(`click`, () => {
            lenis.start()
        })
    })
}

async function projectPageEnter(container = document) {
    let headerWrapperElement = container.querySelector(`.header-wrapper`)
    let nextProjectWrapperElement = container.querySelector(`.next-project-wrapper`)
    let projectHero = container.querySelector(`.project-hero`)

    function revealProjectHeader() {
        if (!headerWrapperElement) return;
        gsap.killTweensOf(headerWrapperElement);
        gsap.to(headerWrapperElement, {
            y: 0,
            autoAlpha: 1,
            duration: 0.45,
            ease: `power3.out`,
            overwrite: `auto`,
            onComplete: () => {
                gsap.set(headerWrapperElement, {
                    y: 0,
                    yPercent: 0,
                    autoAlpha: 1,
                    clearProps: `transform`
                });
            }
        });
    }

    if (headerWrapperElement) {
        gsap.killTweensOf(headerWrapperElement);
        gsap.set(headerWrapperElement, {
            y: -72,
            autoAlpha: 0
        });
    }

    if (nextProjectWrapperElement) {
        gsap.set(nextProjectWrapperElement, {
            autoAlpha: 0
        });
    }

    if (!projectHero) {
        revealProjectHeader();
        return;
    }

    let videoWrapper = projectHero.querySelector(`._video-wrapper`)
    let projectTitle = projectHero.querySelector(`._top ._title`)
    let projectMetaWrappers = projectHero.querySelectorAll(`._meta-wrapper`)
    let projectMetaTextWrappers = Array.from(projectHero.querySelectorAll(`._project-metas .text-wrapper`))
        .filter(el => el !== projectTitle)

    if (videoWrapper) {
        gsap.set(videoWrapper, {
            autoAlpha: 1
        });
    }

    isScrollProgrammatic = true;
    lenis.scrollTo(0, {
        immediate: true,
        onComplete: () => {
            isScrollProgrammatic = false;
        }
    })
    resetProjectViewportTransition();

    revealProjectHeader();

    gsap.fromTo(projectTitle, {
        y: 20,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        ease: `power3.out`
    })

    gsap.fromTo(Array.from(projectMetaWrappers), {
        y: 18,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        stagger: 0.08,
        ease: `power3.out`,
        delay: 0.3
    })

    gsap.from(projectMetaTextWrappers, {
        y: 8,
        duration: 0.22,
        stagger: 0.02,
        ease: `power3.out`,
        delay: 0.34,
        immediateRender: false
    })

    if (nextProjectWrapperElement) {
        gsap.to(nextProjectWrapperElement, {
            autoAlpha: 1,
            duration: 0.3
        })
    }

}

function homeHeaderTheme(container = document) {
    let headerWrapperElement = container.querySelector(`.header-wrapper--home`)
    let heroElement = container.querySelector(`.home-hero`)

    if (!headerWrapperElement || !heroElement) return;

    headerWrapperElement.classList.remove(`is-light`);

    ScrollTrigger.create({
        trigger: heroElement,
        start: `bottom top+=88`,
        onEnter: () => headerWrapperElement.classList.add(`is-light`),
        onLeaveBack: () => headerWrapperElement.classList.remove(`is-light`)
    });
}

function workPage(container = document) {

    let workItemElements = container.querySelectorAll(`.work-items ._item`)
    if (!workItemElements) return;

    let lastAnimation = null;

    function itemHover(video) {
        lastAnimation = gsap.to(video, {
            scale: 1.05,
            duration: 0.3
        })
    }

    Array.from(workItemElements).forEach(item => {

        let video = item.querySelector(`video`)

        let videoStartTime = video.getAttribute(`start-time`)
        video.currentTime = videoStartTime ? videoStartTime : 0;

        item.addEventListener(`pointerenter`, () => {
            video.play()
            itemHover(video)
        })

        item.addEventListener(`pointerleave`, () => {
            video.pause()
            video.currentTime = videoStartTime ? videoStartTime : 0;
            lastAnimation.reverse()
        })
    })
}

const playgroundItems = {
    'motion-systems': {
        title: 'Animated landing page intro.',
        titleRo: 'Intro animat pentru landing page.',
        description: 'This was an actual landing page for one of the BlackRock companies. They wanted to make use of the video behind, so I animated the header and demo dashboard to build the landing page nicely.',
        descriptionRo: 'A fost un landing page real pentru una dintre companiile BlackRock. Voiau să folosească video-ul din fundal, așa că am animat headerul și dashboardul demo ca să construiesc mai natural pagina.',
        type: 'video',
        src: '/media/playground/6.webm',
    },
    'interaction-study': {
        title: 'macOS app for my Govee lights',
        titleRo: 'Aplicație macOS pentru luminile mele Govee',
        description: 'Govee doesn\'t have a macOS app to control their lights, so I designed and built one tailored to my needs, with functionality for both LAN and Cloud using the Govee API.',
        descriptionRo: 'Govee nu are o aplicație macOS pentru controlul luminilor, așa că am designuit și construit una adaptată nevoilor mele, cu funcționalitate atât prin LAN, cât și prin Cloud, folosind API-ul Govee.',
        type: 'video',
        src: '/media/playground/govee.webm',
    },
    'visual-direction': {
        title: 'Coffee shop branding',
        titleRo: 'Branding pentru coffee shop',
        description: 'I don\'t really do branding, but this one was for a friend, and I liked the outcome.',
        descriptionRo: 'Nu prea fac branding, dar acesta a fost pentru un prieten și mi-a plăcut direcția în care a ieșit.',
        type: 'image',
        src: '/media/playground/pungicafea-az.jpg',
        alt: 'Two bags of coffee on an espresso machine.',
    },
    'hero-prototype': {
        title: 'Projects with testimonials',
        titleRo: 'Proiecte cu testimoniale',
        description: 'Had a lot of fun with this one. The idea was to build a project portfolio with testimonials. On hover, the background shows the featured video, the view project button behaves like a blob with GSAP, and the testimonials work like a WhatsApp-style conversation.',
        descriptionRo: 'M-am distrat destul de mult cu explorarea asta. Ideea era să construiesc un portofoliu de proiecte cu testimoniale. La hover, fundalul arată video-ul proiectului, butonul de view project se comportă ca un blob construit cu GSAP, iar testimonialele funcționează ca o conversație în stil WhatsApp.',
        type: 'video',
        src: '/media/playground/portfolio-background-hero-testimonials.webm',
    },
    'app-flow': {
        title: 'Logo animation',
        titleRo: 'Animație de logo',
        description: 'Played around with logo animations',
        descriptionRo: 'O explorare rapidă cu animații de logo.',
        type: 'video',
        src: '/media/playground/5.webm',
    },
    'ui-exploration': {
        title: 'Visual exploration',
        titleRo: 'Explorare vizuală',
        description: 'This is actual client work. I was showing the difference between using icons and animations to convey meaning. But the client didn\'t have the budget necessary for it.',
        descriptionRo: 'Aici este muncă reală pentru client. Arătam diferența dintre folosirea iconurilor și a animațiilor pentru a transmite sens, dar clientul nu avea bugetul necesar pentru direcția asta.',
        type: 'image',
        src: '/media/playground/illustrationvsicon.jpg',
        alt: 'Side by side screens comparing illustrations vs icons.',
    },
    'prototype-pass': {
        title: 'Shader interactive footer',
        titleRo: 'Footer interactiv cu shader',
        description: 'I was experimenting with one of the designs for my footers. Designed in Figma and built with GSAP and Unicorn Studio for the glitch text shader animation.',
        descriptionRo: 'Experimentam cu una dintre direcțiile de footer. Design în Figma, apoi construit cu GSAP și Unicorn Studio pentru animația glitch pe text.',
        type: 'video',
        src: '/media/playground/screen-recording-2025-05-23-11-41-42.webm',
    },
    'mobile-detail': {
        title: 'Card animation',
        titleRo: 'Animație de card',
        description: 'Did this animation in Jitter to show the client how we might animate charts like these',
        descriptionRo: 'Am făcut animația în Jitter ca să-i arăt clientului cum am putea anima grafice de genul acesta.',
        type: 'video',
        src: '/media/playground/4.webm',
    },
    'identity-study': {
        title: 'Identity study',
        titleRo: 'Studiu de identitate',
        description: 'Played around in Photoshop to test an announcement banner',
        descriptionRo: 'M-am jucat în Photoshop ca să testez un banner de anunț.',
        type: 'image',
        src: '/media/playground/furtuna0525.webp',
        alt: 'Man walking by a billboard.',
    },
    'system-prototype': {
        title: 'Portfolio showcase section.',
        titleRo: 'Secțiune de prezentare pentru portofoliu.',
        description: 'Built a portfolio showcase section with a video background. Designed in Figma and built with Codex for static HTML and as a Framer component.',
        descriptionRo: 'Am construit o secțiune de showcase pentru portofoliu, cu video în fundal. Designul a fost făcut în Figma, apoi construit cu Codex pentru static HTML și ca componentă Framer.',
        type: 'video',
        src: '/media/playground/screen-recording-2026-02-09-13-32-35.webm',
    },
    'flow-fragment': {
        title: 'Glitch navigation',
        titleRo: 'Navigație glitch',
        description: 'Early exploration for https://furtune.design/. Done with Figma, Jitter, and Unicorn Studio.',
        descriptionRo: 'Explorare timpurie pentru https://furtune.design/. Făcută cu Figma, Jitter și Unicorn Studio.',
        type: 'video',
        src: '/media/playground/screen-recording-2025-10-27-13-16-16.webm',
    },
};

let playgroundDetailTransitionItem = null;
let playgroundDetailTransitionMedia = null;
let playgroundDetailTransitionState = null;
let playgroundDetailTransitionScrollTop = 0;

function getPlaygroundDetailItem() {
    const params = new URLSearchParams(window.location.search);
    return playgroundItems[params.get('item')] || playgroundItems['motion-systems'];
}

function getPlaygroundDetailCopy(item) {
    const isRomanian = window.location.pathname.startsWith('/playground/');

    return {
        title: isRomanian ? item.titleRo || item.title : item.title,
        description: isRomanian ? item.descriptionRo || item.description : item.description,
    };
}

function createPlaygroundDetailMedia(item) {
    const media = document.createElement(item.type === 'video' ? 'video' : 'img');
    media.className = 'playground-detail-media';

    if (item.type === 'video') {
        media.src = item.src;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.setAttribute('playsinline', '');
        media.setAttribute('preload', 'metadata');
    } else {
        media.src = item.src;
        media.alt = item.alt || item.title;
        media.loading = 'eager';
    }

    return media;
}

function populatePlaygroundDetail(container = document, options = {}) {
    const item = playgroundDetailTransitionItem || getPlaygroundDetailItem();
    const copy = getPlaygroundDetailCopy(item);
    const title = container.querySelector('[data-playground-detail-title]');
    const description = container.querySelector('[data-playground-detail-description]');
    const mediaShell = container.querySelector('[data-playground-detail-media]');

    if (title) title.textContent = copy.title;
    if (description) description.textContent = copy.description;

    if (!options.skipMedia && mediaShell && !mediaShell.querySelector('img, video')) {
        mediaShell.appendChild(createPlaygroundDetailMedia(item));
        mediaShell.querySelector('video')?.play?.().catch(() => {});
    }

    return item;
}

function playgroundDetailPage(container = document) {
    cookiesConsent(container);
    headerScrollAnimation(container);
    toggleMobileMenu(container);
    initBlobs(container);
    populatePlaygroundDetail(container);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            ScrollTrigger.refresh();
        });
    });
}

function preparePlaygroundDetailLinks(container = document) {
    container.querySelectorAll('[data-playground-detail-link]').forEach(link => {
        link.addEventListener('click', () => {
            container.querySelectorAll('[data-playground-detail-link]').forEach(item => {
                item.removeAttribute('data-playground-link-active');
            });
            link.setAttribute('data-playground-link-active', 'true');
            playgroundDetailTransitionItem = playgroundItems[link.getAttribute('data-playground-slug')];
        });
    });
}

function getActivePlaygroundMedia(container = document) {
    const activeLink = container.querySelector('[data-playground-link-active="true"]');
    return activeLink?.querySelector('[data-playground-transition-media]');
}

function getMediaAspectRatio(media) {
    if (!media) return null;

    const link = media.closest('[data-playground-detail-link]');
    const cssRatio = link ? getComputedStyle(link).getPropertyValue('--ar').trim() : '';
    const cssRatioParts = cssRatio.split('/').map(part => Number(part.trim()));

    if (cssRatioParts.length === 2 && cssRatioParts.every(Boolean)) {
        return `${cssRatioParts[0]} / ${cssRatioParts[1]}`;
    }

    if (media.tagName === 'VIDEO' && media.videoWidth && media.videoHeight) {
        return `${media.videoWidth} / ${media.videoHeight}`;
    }

    if (media.tagName === 'IMG' && media.naturalWidth && media.naturalHeight) {
        return `${media.naturalWidth} / ${media.naturalHeight}`;
    }

    return null;
}

function getMediaAspectRatioValue(media) {
    if (!media) return null;

    const link = media.closest('[data-playground-detail-link]');
    const cssRatio = link ? getComputedStyle(link).getPropertyValue('--ar').trim() : '';
    const cssRatioParts = cssRatio.split('/').map(part => Number(part.trim()));

    if (cssRatioParts.length === 2 && cssRatioParts.every(Boolean)) {
        return cssRatioParts[0] / cssRatioParts[1];
    }

    if (media.tagName === 'VIDEO' && media.videoWidth && media.videoHeight) {
        return media.videoWidth / media.videoHeight;
    }

    if (media.tagName === 'IMG' && media.naturalWidth && media.naturalHeight) {
        return media.naturalWidth / media.naturalHeight;
    }

    return null;
}

async function playgroundDetailTransitionBefore(data) {
    const media = getActivePlaygroundMedia(data.current.container);

    if (!media) {
        window.FurtunaPlaygroundWebGL?.destroy?.();
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        return;
    }

    const activeLink = media.closest('[data-playground-detail-link]');
    playgroundDetailTransitionItem = playgroundItems[activeLink?.getAttribute('data-playground-slug')] || playgroundDetailTransitionItem;
    playgroundDetailTransitionMedia = media;

    media.pause?.();
    gsap.set(media, { autoAlpha: 0 });

    const gallery = window.FurtunaPlaygroundWebGL;
    const tl = gsap.timeline({ paused: true });

    gallery?.medias?.forEach(item => {
        item.scrollTween?.scrollTrigger?.kill();
        if (item.media === media) {
            const currentProgress = item.material.uniforms.uProgress.value;
            tl.to(item.material.uniforms.uProgress, {
                value: 1,
                duration: Math.max(0.15, 0.7 * (1 - currentProgress)),
                ease: 'linear',
                onComplete: () => {
                    gsap.set(media, { autoAlpha: 1, visibility: 'visible' });
                    gsap.set(item.material.uniforms.uProgress, { value: 0 });
                }
            }, 0);
        } else {
            const currentProgress = item.material.uniforms.uProgress.value;
            tl.to(item.material.uniforms.uProgress, {
                value: 0,
                duration: Math.max(0.15, 0.7 * currentProgress),
                ease: 'linear'
            }, 0);
        }
    });

    tl.to(data.current.container.querySelectorAll('.playground-hero ._heading, .playground-webgl-item--copy p, .playground-webgl-item--media span'), {
        autoAlpha: 0,
        y: -16,
        duration: 0.25,
        ease: 'power2.out',
    }, 0);

    await new Promise(resolve => {
        tl.eventCallback('onComplete', resolve);
        tl.play();
    });
}

function playgroundDetailTransitionLeave(data) {
    if (!playgroundDetailTransitionMedia) return;

    playgroundDetailTransitionScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    gsap.set(data.current.container, {
        position: 'fixed',
        top: -playgroundDetailTransitionScrollTop,
        left: 0,
        width: '100%',
        zIndex: 1000,
    });

    playgroundDetailTransitionState = Flip.getState(playgroundDetailTransitionMedia);
}

function playgroundDetailTransitionBeforeEnter() {
    isScrollProgrammatic = true;
    lenis.scrollTo(0, {
        immediate: true,
        onComplete: () => {
            isScrollProgrammatic = false;
        }
    });
}

async function playgroundDetailTransitionEnter(data) {
    populatePlaygroundDetail(data.next.container, { skipMedia: Boolean(playgroundDetailTransitionMedia) });

    const mediaShell = data.next.container.querySelector('[data-playground-detail-media]');
    const media = playgroundDetailTransitionMedia;
    const state = playgroundDetailTransitionState;

    if (!mediaShell || !media || !state) {
        populatePlaygroundDetail(data.next.container);
        playgroundDetailTransitionMedia = null;
        playgroundDetailTransitionState = null;
        playgroundDetailTransitionItem = null;
        return;
    }

    mediaShell.innerHTML = '';
    const mediaAspectRatio = getMediaAspectRatio(media);
    const mediaAspectRatioValue = getMediaAspectRatioValue(media);
    if (mediaAspectRatio) {
        mediaShell.style.aspectRatio = mediaAspectRatio;
        mediaShell.style.height = 'auto';
        mediaShell.style.minHeight = '0';

        if (mediaAspectRatioValue && mediaAspectRatioValue < 1) {
            mediaShell.style.width = `min(100%, calc((100vh - 13rem) * ${mediaAspectRatioValue}))`;
            mediaShell.style.marginLeft = 'auto';
            mediaShell.style.marginRight = 'auto';
        } else {
            mediaShell.style.width = '';
            mediaShell.style.marginLeft = '';
            mediaShell.style.marginRight = '';
        }
    }
    media.classList.add('playground-detail-media');
    mediaShell.appendChild(media);

    gsap.set(data.next.container.querySelectorAll('[data-playground-detail-copy] > *'), { autoAlpha: 0, y: 24 });
    gsap.set(media, { width: '100%', height: '100%', objectFit: 'cover', display: 'block', autoAlpha: 1 });
    media.play?.().catch(() => {});

    await new Promise(resolve => {
        Flip.from(state, {
            absolute: true,
            duration: 1,
            ease: 'power3.inOut',
            onComplete: resolve,
        });
    });

    gsap.to(data.next.container.querySelectorAll('[data-playground-detail-copy] > *'), {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power3.out',
    });

    window.FurtunaPlaygroundWebGL?.destroy?.({ preserveMedia: media });
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    media.play?.().catch(() => {});
    playgroundDetailTransitionMedia = null;
    playgroundDetailTransitionState = null;
    playgroundDetailTransitionItem = null;
    playgroundDetailTransitionScrollTop = 0;
}

const mainNavTransitionNamespaces = ['home', 'allWork', 'capabilities', 'playground', 'resume'];
const mainNavTransitionDefaults = {
    scale: 0.78,
    yVh: -30,
    overlayOpacity: 0.75,
    duration: 1,
};

function isMainNavTransition(data) {
    const currentNamespace = data.current.namespace;
    const nextNamespace = data.next.namespace;

    return mainNavTransitionNamespaces.includes(currentNamespace) && mainNavTransitionNamespaces.includes(nextNamespace);
}

async function mainNavCrossfadeTransition(data) {
    const currentContainer = data.current.container;
    const nextContainer = data.next.container;

    if (!currentContainer || !nextContainer) return;

    window.FurtunaPlaygroundWebGL?.destroy?.();
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    resetProjectViewportTransition();

    const currentHeader = currentContainer.querySelector('.header-wrapper');
    const nextHeader = nextContainer.querySelector('.header-wrapper');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const currentHeaderParent = currentHeader?.parentNode;
    const currentHeaderNextSibling = currentHeader?.nextSibling;
    const overlayElement = document.createElement('div');
    const previousBodyBackground = document.body.style.backgroundColor;
    const transitionSettings = mainNavTransitionDefaults;

    headerScrollListener = null;
    isScrollProgrammatic = true;

    gsap.killTweensOf([currentContainer, nextContainer, currentHeader, nextHeader].filter(Boolean));

    if (currentHeader) {
        document.body.appendChild(currentHeader);
    }

    overlayElement.className = 'main-nav-transition-overlay';
    currentContainer.appendChild(overlayElement);
    document.body.style.backgroundColor = '#000000';

    gsap.set(currentContainer, {
        position: 'fixed',
        top: -currentScrollTop,
        left: 0,
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#ffffff',
        transformOrigin: '50% 0%',
        zIndex: 1,
        pointerEvents: 'none',
        force3D: true,
    });

    gsap.set(overlayElement, {
        position: 'absolute',
        inset: 0,
        background: '#000000',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 900,
    });

    lenis.scrollTo(0, { immediate: true });

    gsap.set(nextContainer, {
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#ffffff',
        zIndex: 400,
        pointerEvents: 'none',
        autoAlpha: 1,
        clipPath: prefersReducedMotion ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        yPercent: prefersReducedMotion ? 0 : 8,
        force3D: true,
    });

    if (currentHeader) {
        gsap.set(currentHeader, {
            yPercent: 0,
            autoAlpha: 1,
            zIndex: 700,
        });
    }

    if (nextHeader) {
        gsap.set(nextHeader, {
            yPercent: 0,
            autoAlpha: 0,
        });
    }

    if (!prefersReducedMotion) {
        const timeline = gsap.timeline({
            defaults: {
                ease: 'power3.inOut',
            },
        });

        timeline
            .to(currentContainer, {
                scale: transitionSettings.scale,
                y: `${transitionSettings.yVh}vh`,
                borderRadius: '1.25rem',
                duration: transitionSettings.duration,
                ease: 'power2.inOut',
            }, 0)
            .to(overlayElement, {
                opacity: transitionSettings.overlayOpacity,
                duration: transitionSettings.duration,
                ease: 'power2.inOut',
            }, 0)
            .to(nextContainer, {
                clipPath: 'inset(0% 0% 0% 0%)',
                yPercent: 0,
                duration: transitionSettings.duration,
                ease: 'power2.inOut',
            }, 0);

        if (nextHeader) {
            timeline.to(nextHeader, {
                autoAlpha: 1,
                duration: 0.24,
                ease: 'power2.out',
            }, 0.84);
        }

        await new Promise(resolve => {
            timeline.eventCallback('onComplete', resolve);
        });
    }

    if (nextHeader) {
        gsap.set(nextHeader, {
            autoAlpha: 1,
            yPercent: 0,
        });
    }

    if (currentHeader && currentHeaderParent) {
        currentHeaderParent.insertBefore(currentHeader, currentHeaderNextSibling);
    }

    overlayElement.remove();

    gsap.set(currentContainer, {
        autoAlpha: 0,
        pointerEvents: 'none',
    });

    gsap.set(nextContainer, {
        clearProps: 'position,inset,top,left,right,bottom,width,height,overflow,background,zIndex,pointerEvents,clipPath,opacity,visibility,transform,borderRadius',
    });

    document.body.style.backgroundColor = previousBodyBackground;
    isScrollProgrammatic = false;
}

function playgroundPage(container = document) {

    if (container.querySelector(`.playground-webgl-grid`)) {
        preparePlaygroundDetailLinks(container);
        return import('/scripts/playground-webgl.js')
            .then(module => module.initPlaygroundWebGLGallery({ container, gsap, ScrollTrigger }))
            .catch(error => console.error('Failed to initialize playground WebGL gallery', error));
    }

    let mm = gsap.matchMedia();
    let playgroundGrid = container.querySelector(`.playground-grid`)
    if (!playgroundGrid) return;

    let playgroundItems = Array.from(playgroundGrid.querySelectorAll(`._item`))
    if (!playgroundItems.length) return;

    let isFullscreen = false;
    let activeVideoParent = null;

    let fullscreenElement = container.querySelector(`.playground-item-fullscreen`)
    let fullscreenVideoWrapper = fullscreenElement.querySelector(`._video-wrapper`)
    let fullscreenBackground = fullscreenElement.querySelector(`._background`)

    let closeButton = fullscreenElement.querySelector(`._close-button`)

    playgroundItems.forEach((item, index) => {
        item.dataset.playgroundOrder = index;
    })

    function getPlaygroundColumnCount() {
        if (window.innerWidth <= 767) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getPlaygroundItemWeight(item) {
        let aspectValue = getComputedStyle(item).getPropertyValue(`--item-aspect`).trim();
        if (!aspectValue || !aspectValue.includes(`/`)) return 1;

        let [widthValue, heightValue] = aspectValue.split(`/`).map(value => parseFloat(value.trim()));
        if (!widthValue || !heightValue) return 1;

        return heightValue / widthValue;
    }

    function getPlaygroundColumnSpan(item, columnCount) {
        if (columnCount === 1) return 1;

        let aspectRatio = 1 / getPlaygroundItemWeight(item);
        let wideThreshold = 1.35;
        let fullThreshold = 3;

        if (aspectRatio >= fullThreshold) return columnCount;
        if (aspectRatio >= wideThreshold) return Math.min(2, columnCount);
        return 1;
    }

    function applyIntrinsicAspectRatio(item) {
        let declaredAspect = item.dataset.aspect;
        if (declaredAspect && declaredAspect.includes(`/`)) {
            item.style.setProperty(`--item-aspect`, declaredAspect);
            return true;
        }

        let image = item.querySelector(`img`);
        if (image && image.naturalWidth && image.naturalHeight) {
            item.style.setProperty(`--item-aspect`, `${image.naturalWidth} / ${image.naturalHeight}`);
            return true;
        }

        let video = item.querySelector(`video`);
        if (video && video.videoWidth && video.videoHeight) {
            item.style.setProperty(`--item-aspect`, `${video.videoWidth} / ${video.videoHeight}`);
            return true;
        }

        return false;
    }

    function watchIntrinsicAspectRatio(item) {
        let image = item.querySelector(`img`);
        if (image) {
            if (applyIntrinsicAspectRatio(item)) return;

            image.addEventListener(`load`, () => {
                if (applyIntrinsicAspectRatio(item)) {
                    balancePlaygroundColumns();
                }
            }, { once: true });
            return;
        }

        let video = item.querySelector(`video`);
        if (video) {
            let applyVideoRatio = () => {
                if (applyIntrinsicAspectRatio(item)) {
                    balancePlaygroundColumns();
                }
            };

            if (video.readyState >= 1 && applyIntrinsicAspectRatio(item)) return;

            video.addEventListener(`loadedmetadata`, applyVideoRatio, { once: true });
            video.addEventListener(`loadeddata`, applyVideoRatio, { once: true });
            video.addEventListener(`canplay`, applyVideoRatio, { once: true });
            video.addEventListener(`durationchange`, applyVideoRatio, { once: true });

            video.preload = `metadata`;
            video.load();
        }
    }

    function balancePlaygroundColumns() {
        if (isFullscreen) return;

        let columnCount = getPlaygroundColumnCount();
        let gapValue = parseFloat(getComputedStyle(playgroundGrid).gap) || 0;
        let columnWidth = (playgroundGrid.clientWidth - (gapValue * (columnCount - 1))) / columnCount;
        let columnHeights = new Array(columnCount).fill(0);

        playgroundItems.forEach(item => {
            let aspectRatio = 1 / getPlaygroundItemWeight(item);
            let columnSpan = Math.min(getPlaygroundColumnSpan(item, columnCount), columnCount);
            let targetWidth = (columnWidth * columnSpan) + (gapValue * (columnSpan - 1));
            let targetHeight = targetWidth / aspectRatio;

            let bestColumn = 0;
            let bestOffset = Infinity;

            for (let start = 0; start <= columnCount - columnSpan; start++) {
                let offset = Math.max(...columnHeights.slice(start, start + columnSpan));
                if (offset < bestOffset) {
                    bestOffset = offset;
                    bestColumn = start;
                }
            }

            let x = (columnWidth + gapValue) * bestColumn;
            let y = bestOffset;

            item.style.setProperty(`--item-width`, `${targetWidth}px`);
            item.style.setProperty(`--item-height`, `${targetHeight}px`);
            item.style.setProperty(`--item-x`, `${x}px`);
            item.style.setProperty(`--item-y`, `${y}px`);

            let nextHeight = y + targetHeight + gapValue;
            for (let index = bestColumn; index < bestColumn + columnSpan; index++) {
                columnHeights[index] = nextHeight;
            }
        });

        let containerHeight = Math.max(...columnHeights, 0);
        playgroundGrid.style.height = `${Math.max(0, containerHeight - gapValue)}px`;
    }

    balancePlaygroundColumns();

    let playgroundResizeObserver = new ResizeObserver(() => {
        balancePlaygroundColumns();
    });

    playgroundResizeObserver.observe(playgroundGrid);

    playgroundItems.forEach(item => {
        watchIntrinsicAspectRatio(item);
    });

    playgroundItems.forEach(item => {

        let video = item.querySelector(`video`)

        if (video) {

            let videoStartTime = video.getAttribute(`start-time`)

            video.currentTime = videoStartTime ? videoStartTime : 0;

            item.addEventListener(`pointerenter`, () => {
                video.play();
            })

            item.addEventListener(`pointerleave`, () => {
                video.pause();
                video.currentTime = videoStartTime ? videoStartTime : 0;
            })

            item.addEventListener(`click`, () => {
                isFullscreen = true;
                activeVideoParent = item;

                let state = Flip.getState(video)

                fullscreenVideoWrapper.appendChild(video)
                gsap.to(fullscreenElement, {
                    opacity: 1,
                    duration: 0.1,
                    pointerEvents: `all`,
                    onComplete: () => {
                        video.play()
                    }
                })

                Flip.from(state, {
                    duration: 0
                })
            })
        }
    })

    fullscreenElement.addEventListener(`click`, () => {
        if (!isFullscreen) return;
        isFullscreen = false;

        fullscreenVideoWrapper = fullscreenElement.querySelector(`._video-wrapper`)
        let video = fullscreenVideoWrapper.querySelector(`video`)
        let videoStartTime = video.getAttribute(`start-time`)

        let state = Flip.getState(video)

        activeVideoParent.appendChild(video)

        gsap.to(fullscreenElement, {
            opacity: 0,
            duration: 0,
            pointerEvents: `none`,
            onComplete: () => {
                video.pause()
                video.currentTime = videoStartTime ? videoStartTime : 0;
            }
        })

        Flip.from(state, {
            duration: 0
        })

    })

}

async function runViewInitializers(namespace, container) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    switch (namespace) {
        case 'home':
            cookiesConsent(container)
            headerScrollAnimation(container)
            homeHeaderTheme(container)
            toggleMobileMenu(container)
            textAnimations(container)
            initBlobs(container)
            homeHeroIntro(container)
            projectsSection(container)
            becauseWeAnimation(container)
            testimonialsSection(container)

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });

            isScrollProgrammatic = true;

            lenis.scrollTo(0, {
                immediate: true,
                onComplete: () => {
                    isScrollProgrammatic = false;
                }
            })
            break;

        case 'project':
            cookiesConsent(container)
            if (headerScrollListener) {
                window.removeEventListener(`scroll`, headerScrollListener);
                headerScrollListener = null;
            }
            toggleMobileMenu(container)
            await projectPageEnter(container);
            initBlobs(container);

            caseStudyAnimations(container);
            caseStudySectionCompare(container);
            caseStudySectionDrag(container);
            caseStudyProgressBar(container)

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });
            break;

        case 'allWork':
            cookiesConsent(container)
            headerScrollAnimation(container);
            toggleMobileMenu(container)
            initBlobs(container);
            workPage(container);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });

            await sleep(500)

            isScrollProgrammatic = true;
            lenis.scrollTo(0, {
                immediate: true,
                onComplete: () => {
                    isScrollProgrammatic = false;
                }
            })
            break;

        case 'capabilities':
            cookiesConsent(container)
            headerScrollAnimation(container)
            toggleMobileMenu(container)
            initBlobs(container);
            capabilitiesOverlay(container)

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });

            await sleep(500)

            isScrollProgrammatic = true;
            lenis.scrollTo(0, {
                immediate: true,
                onComplete: () => {
                    isScrollProgrammatic = false;
                }
            })
            break;

        case 'playground':
            cookiesConsent(container)
            headerScrollAnimation(container);
            toggleMobileMenu(container)
            initBlobs(container);

            isScrollProgrammatic = true;
            lenis.scrollTo(0, {
                immediate: true,
                onComplete: () => {
                    isScrollProgrammatic = false;
                }
            })

            await playgroundPage(container);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });
            break;

        case 'playgroundDetail':
            playgroundDetailPage(container);

            isScrollProgrammatic = true;
            lenis.scrollTo(0, {
                immediate: true,
                onComplete: () => {
                    isScrollProgrammatic = false;
                }
            })
            break;

        case 'resume':
            cookiesConsent(container)
            headerScrollAnimation(container);
            toggleMobileMenu(container)
            initBlobs(container);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });

            isScrollProgrammatic = true;
            lenis.scrollTo(0, {
                immediate: true,
                onComplete: () => {
                    isScrollProgrammatic = false;
                }
            })
            break;
    }
}

if (window.location.protocol === 'file:') {
    // Barba uses XHR/fetch and cannot navigate between file:// pages due browser CORS restrictions.
    const container = document.querySelector(`[data-barba="container"]`) || document;
    const namespace = container.getAttribute(`data-barba-namespace`);
    runViewInitializers(namespace, container);
} else {
    barba.init({
        transitions: [{
            name: 'playgroundDetailTransition',
            from: {
                namespace: ['playground']
            },
            to: {
                namespace: ['playgroundDetail']
            },
            async before(data) {
                await playgroundDetailTransitionBefore(data);
            },
            leave(data) {
                playgroundDetailTransitionLeave(data);
            },
            beforeEnter() {
                playgroundDetailTransitionBeforeEnter();
            },
            async enter(data) {
                await playgroundDetailTransitionEnter(data);
            }
        }, {
            name: 'mainNavCrossfadeTransition',
            sync: true,
            custom(data) {
                return isMainNavTransition(data);
            },
            leave(data) {
                return mainNavCrossfadeTransition(data);
            }
        }, {
            name: 'defaultTransition',
            leave() {
                window.FurtunaPlaygroundWebGL?.destroy?.();
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                resetProjectViewportTransition();
            }
        }],
        views: [{
                namespace: 'home',
                async afterEnter(data) {
                    await runViewInitializers('home', data.next.container);
                }
            },
            {
                namespace: 'project',
                async afterEnter(data) {
                    await runViewInitializers('project', data.next.container);
                }
            },
            {
                namespace: 'allWork',
                async afterEnter(data) {
                    await runViewInitializers('allWork', data.next.container);
                }
            },
            {
                namespace: `capabilities`,
                async afterEnter(data) {
                    await runViewInitializers('capabilities', data.next.container);
                }
            },
            {
                namespace: 'playground',
                async afterEnter(data) {
                    await runViewInitializers('playground', data.next.container);
                }
            },
            {
                namespace: 'playgroundDetail',
                async afterEnter(data) {
                    await runViewInitializers('playgroundDetail', data.next.container);
                }
            },
            {
                namespace: 'resume',
                async afterEnter(data) {
                    await runViewInitializers('resume', data.next.container);
                }
            },
        ]
    });
}
