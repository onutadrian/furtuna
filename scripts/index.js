'use strict'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function homeProjectsList() {
    let projectItem = document.getElementsByClassName(`_project-item`)

    for (let i = 0; i < projectItem.length; i++) {

        let mouseIsIn = false;

        let projectTags = projectItem[i].getElementsByClassName(`_tag`)
        let gsapHover = projectItem[i].getElementsByClassName(`gsapHover`)[0]
        let chatWrapper = projectItem[i].getElementsByClassName(`_chat-wrapper`)[0]

        gsapHover.addEventListener(`mouseenter`, async () => {
            if (mouseIsIn == false) {
                mouseIsIn = true;
                gsap.fromTo(Array.from(projectTags), {
                    y: -10,
                    opacity: 0
                }, {
                    y: 0,
                    stagger: 0.05,
                    opacity: 1,
                    duration: 0.2
                });

                gsap.fromTo(chatWrapper, {
                    x: -32,
                    opacity: 0
                }, {
                    x: 0,
                    opacity: 1,
                    duration: 0.3
                });
            }
        })

        projectItem[i].addEventListener(`mouseleave`, async () => {
            mouseIsIn = false;
            gsap.to(Array.from(projectTags), {
                y: -10,
                stagger: 0.05,
                opacity: 0,
                duration: 0.2
            });

            gsap.to(chatWrapper, {
                x: -32,
                opacity: 0,
                duration: 0.3
            });

        })
    }
}

homeProjectsList()