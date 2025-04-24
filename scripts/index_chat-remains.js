'use strict'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function homeProjectsList() {
    let projectItems = document.getElementsByClassName(`_project-item`)
    let lastProjectItem = `none`;

    for (let i = 0; i < projectItems.length; i++) {

        let currentVideoId = projectItems[i].getAttribute(`video-id`)
        let currentVideoElement = document.getElementById(currentVideoId)

        let gsapHover = projectItems[i].getElementsByClassName(`gsapHover`)[0]

        let currentProjectTags = projectItems[i].getElementsByClassName(`_tag`)
        let currentProjectTitle = projectItems[i].getElementsByClassName(`_title`)[0]

        let currentChatWrapper = projectItems[i].getElementsByClassName(`_chat-wrapper`)[0]

        let currentChatMessageIslands = projectItems[i].getElementsByClassName(`_chat-island`)
        let currentChatTypingIndicator = projectItems[i].getElementsByClassName(`_typing`)[0]

        gsapHover.addEventListener(`mouseenter`, async () => {

            if (lastProjectItem != projectItems[i]) {

                gsap.to(currentVideoElement, {
                    display: `block`,
                    autoAlpha: .5,
                    duration: 0.3
                })

                currentVideoElement.play();

                gsap.fromTo(Array.from(currentProjectTags), {
                    y: -10,
                    opacity: 0
                }, {
                    y: 0,
                    stagger: 0.05,
                    opacity: 1,
                    duration: 0.2
                });

                gsap.to(currentProjectTitle, {
                    autoAlpha: 1,
                    duration: 0.3
                })

                gsap.fromTo(currentChatWrapper, {
                    //x: -32,
                    opacity: 0
                }, {
                    //x: 0,
                    opacity: 1,
                    duration: 0.3
                });

                let currentChatAnimationStatus = currentChatWrapper.getAttribute(`animation-status`)

                if (currentChatAnimationStatus == `none`) {

                    currentChatWrapper.setAttribute(`animation-status`, `in-progress`)

                    gsap.fromTo(currentChatMessageIslands, {
                        display: `none`,
                        autoAlpha: 0
                    }, {
                        display: `block`,
                        autoAlpha: 1,
                        delay: 0.5,
                        stagger: 1,
                    });

                    gsap.to(currentChatTypingIndicator, {
                        opacity: 0,
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
                    let lastChatAnimationStatus = lastChatWrapper.getAttribute(`animation-status`)

                    let lastChatMessageIslands = lastProjectItem.getElementsByClassName(`_chat-island`)
                    let lastChatTypingIndicator = lastProjectItem.getElementsByClassName(`_typing`)[0]


                    gsap.to(lastVideoElement, {
                        display: `none`,
                        autoAlpha: 0,
                        duration: 0.3
                    })

                    lastVideoElement.pause();

                    gsap.to(Array.from(lastProjectTags), {
                        y: -10,
                        stagger: 0.05,
                        opacity: 0,
                        duration: 0.2
                    });

                    gsap.to(lastProjectTitle, {
                        autoAlpha: 0.3,
                        duration: 0.3
                    })

                    gsap.to(lastChatWrapper, {
                        //x: -32,
                        opacity: 0,
                        duration: 0.3
                    });

                    //gsap.to(lastChatTypingIndicator, {
                    //    opacity: 1,
                    //    duration: 0
                    //})
                }
            }
        })

        gsapHover.addEventListener(`mouseleave`, async () => {
            lastProjectItem = projectItems[i];
        })
    }
}

homeProjectsList()