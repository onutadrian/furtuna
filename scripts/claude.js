'use strict';

// Initialize core libraries
const lenis = new Lenis({
  autoRaf: true
});
gsap.registerPlugin(Flip, ScrollTrigger);

// Utility functions
const Utils = {
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  getAngle(dx, dy) {
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  },

  getScale(dx, dy) {
    let dist = Math.hypot(dx, dy);
    return Math.min(dist / 1200, 0.35);
  }
};

// Project Blob Animation Controller
const BlobController = {
  element: null,
  contentElement: null,
  state: {
    active: 0
  },
  pos: {
    x: 0,
    y: 0
  },
  vel: {
    x: 0,
    y: 0
  },
  setters: {},

  init() {
    this.element = document.getElementsByClassName('_view-project-blob')[0];
    this.contentElement = this.element.getElementsByClassName('_content')[0];

    // Initialize position
    this.pos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    // Initialize GSAP setters
    gsap.set(this.element, {
      transformOrigin: 'center center'
    });
    this.setters = {
      x: gsap.quickSetter(this.element, "x", "px"),
      y: gsap.quickSetter(this.element, "y", "px"),
      width: gsap.quickSetter(this.element, "width", "px"),
      r: gsap.quickSetter(this.element, "rotation", "deg"),
      sx: gsap.quickSetter(this.element, "scaleX"),
      sy: gsap.quickSetter(this.element, "scaleY"),
      rt: gsap.quickSetter(this.contentElement, "rotation", "deg")
    };

    // Add event listeners and animation ticker
    this.setupEventListeners();
    gsap.ticker.add(this.update.bind(this));
  },

  activate() {
    gsap.to(this.state, {
      active: 1,
      duration: 0.3
    });
  },

  deactivate() {
    gsap.to(this.state, {
      active: 0,
      duration: 0.3,
      ease: 'power1.out'
    });
  },

  update() {
    const rotation = Utils.getAngle(this.vel.x, this.vel.y);
    const scale = Utils.getScale(this.vel.x, this.vel.y);

    this.setters.x(this.pos.x);
    this.setters.y(this.pos.y);
    this.setters.width(230 + scale * 150);
    this.setters.r(rotation);
    this.setters.sx((1 + scale) * this.state.active);
    this.setters.sy((1 - scale) * this.state.active);
    this.setters.rt(-rotation);
  },

  setupEventListeners() {
    window.addEventListener("mousemove", (e) => {
      let x = e.clientX,
        y = e.clientY;
      gsap.to(this.pos, {
        x,
        y,
        duration: 1,
        ease: "expo.out",
        onUpdate: () => {
          this.vel.x = x - this.pos.x;
          this.vel.y = y - this.pos.y;
        }
      });

      this.update();
    });
  }
};

// Project Items Controller
const ProjectsController = {
  items: [],
  lastActiveItem: 'none',

  init() {
    this.items = Array.from(document.getElementsByClassName('_project-item'));
    this.setupProjectItems();
    this.setupMediaQueries();
  },

  setupProjectItems() {
    this.items.forEach(item => {
      const videoId = item.getAttribute('video-id');
      const videoElement = document.getElementById(videoId);
      const hoverElement = item.getElementsByClassName('gsapHover')[0];

      // Setup event listeners
      hoverElement.addEventListener('pointerenter', () => this.handleItemEnter(item));
      hoverElement.addEventListener('pointerleave', () => this.handleItemLeave(item));
    });
  },

  setupMediaQueries() {
    ScrollTrigger.matchMedia({
      "(max-width: 1008px)": () => {
        this.items.forEach(item => {
          const hoverElement = item.getElementsByClassName('gsapHover')[0];
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

          gsap.to(item, {
            scrollTrigger: {
              trigger: item,
              start: "top center",
              end: "top center",
              scrub: true,
              markers: true,
              onEnter: () => hoverElement.dispatchEvent(pointerEnterEvent),
              onLeave: () => hoverElement.dispatchEvent(pointerLeaveEvent),
              onEnterBack: () => hoverElement.dispatchEvent(pointerEnterEvent),
              onLeaveBack: () => hoverElement.dispatchEvent(pointerLeaveEvent)
            }
          });
        });
      }
    });
  },

  async handleItemEnter(item) {
    // Activate blob
    BlobController.activate();

    if (this.lastActiveItem != item) {
      await this.activateItem(item);

      if (this.lastActiveItem != 'none') {
        this.deactivateItem(this.lastActiveItem);
      }
    }
  },

  handleItemLeave(item) {
    this.lastActiveItem = item;
    BlobController.deactivate();
  },

  async activateItem(item) {
    const videoId = item.getAttribute('video-id');
    const videoElement = document.getElementById(videoId);
    const tags = Array.from(item.getElementsByClassName('_tag'));
    const title = item.getElementsByClassName('_title')[0];
    const chatWrapper = item.getElementsByClassName('_chat-wrapper')[0];

    // Show video
    gsap.to(videoElement, {
      display: 'block',
      autoAlpha: 0.5,
      duration: 0.3
    });
    videoElement.play();

    // Animate tags
    gsap.fromTo(tags, {
      y: -10,
      autoAlpha: 0
    }, {
      y: 0,
      stagger: 0.05,
      autoAlpha: 1,
      duration: 0.2
    });

    // Animate title
    gsap.to(title, {
      autoAlpha: 1,
      duration: 0.3
    });

    // Animate chat wrapper
    gsap.fromTo(chatWrapper, {
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      duration: 0.3
    });

    // Handle chat animation if needed
    this.handleChatAnimation(item);
  },

  deactivateItem(item) {
    const videoId = item.getAttribute('video-id');
    const videoElement = document.getElementById(videoId);
    const tags = Array.from(item.getElementsByClassName('_tag'));
    const title = item.getElementsByClassName('_title')[0];
    const chatWrapper = item.getElementsByClassName('_chat-wrapper')[0];

    // Hide video
    gsap.to(videoElement, {
      display: 'none',
      autoAlpha: 0,
      duration: 0.3
    });
    videoElement.pause();

    // Animate tags
    gsap.to(tags, {
      y: -10,
      stagger: 0.05,
      autoAlpha: 0,
      duration: 0.2
    });

    // Animate title
    gsap.to(title, {
      autoAlpha: 0.3,
      duration: 0.3
    });

    // Animate chat wrapper
    gsap.to(chatWrapper, {
      autoAlpha: 0,
      duration: 0.3
    });
  },

  handleChatAnimation(item) {
    const chatWrapper = item.getElementsByClassName('_chat-wrapper')[0];
    const animationStatus = chatWrapper.getAttribute('animation-status');

    if (animationStatus === 'none') {
      chatWrapper.setAttribute('animation-status', 'in-progress');

      const messageIslands = item.getElementsByClassName('_chat-island');
      const typingIndicator = item.getElementsByClassName('_typing')[0];

      // Animate chat islands
      gsap.fromTo(messageIslands, {
        display: 'none',
        autoAlpha: 0
      }, {
        display: 'block',
        autoAlpha: 1,
        delay: 0.5,
        stagger: 1,
        onComplete: () => {
          chatWrapper.setAttribute('animation-status', 'done');
        }
      });

      // Hide typing indicator after animations
      gsap.to(typingIndicator, {
        autoAlpha: 0,
        delay: 2.5,
        duration: 0
      });
    }
  }
};

// Page Transition Controller
const TransitionController = {
  async leaveIndex(trigger) {
    if (!trigger.hasAttribute('video-id')) {
      return;
    }

    const videoId = trigger.getAttribute('video-id');
    const videoElement = document.getElementById(videoId);
    const transitionWrapper = document.getElementsByClassName('video-transition-wrapper')[0];
    const projectsWrapper = document.getElementsByClassName('_projects-wrapper')[0];
    const allLeftSides = projectsWrapper.querySelectorAll('._project-item > ._left');
    const allRightSides = projectsWrapper.querySelectorAll('._project-item > ._right');
    const gsapHover = projectsWrapper.getElementsByClassName('gsapHover');

    const state = Flip.getState(videoElement);

    // Hide hover elements
    gsap.to(Array.from(gsapHover), {
      display: 'none',
      duration: 0
    });

    // Fade out project items
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

    // Move video to transition wrapper
    transitionWrapper.appendChild(videoElement);

    gsap.to(transitionWrapper, {
      display: 'block',
      autoAlpha: 1,
      duration: 0
    });

    // Animate transition with Flip
    await Flip.from(state, {
      duration: 0.3
    });

    await gsap.to(videoElement, {
      autoAlpha: 1,
      duration: 0.3
    });
  },

  async enterProject() {
    const transitionWrapper = document.getElementsByClassName('video-transition-wrapper')[0];

    if (!transitionWrapper.hasChildNodes()) {
      return;
    }

    const videoFromTransition = transitionWrapper.getElementsByTagName('video')[0];
    const projectHero = document.getElementsByClassName('project-hero')[0];
    const videoWrapper = projectHero.getElementsByClassName('_video-wrapper')[0];
    const inPageVideo = videoWrapper.getElementsByTagName('video')[0];
    const projectTitle = projectHero.getElementsByClassName('_title')[0];
    const projectMetaWrappers = projectHero.getElementsByClassName('_meta-wrapper');

    // Prepare video and hide elements
    gsap.to(videoFromTransition, {
      autoAlpha: 1,
      duration: 0
    });

    gsap.to(projectTitle, {
      autoAlpha: 0,
      duration: 0
    });

    gsap.to(Array.from(projectMetaWrappers), {
      autoAlpha: 0,
      duration: 0
    });

    // Wait for page load
    await Utils.sleep(500);
    window.scrollTo(0, 0);

    // Replace video
    inPageVideo.remove();
    videoFromTransition.parentNode.insertBefore(videoWrapper, videoFromTransition);
    videoWrapper.appendChild(videoFromTransition);

    const state = Flip.getState(videoWrapper);
    projectHero.appendChild(videoWrapper);

    // Hide transition wrapper
    gsap.to(transitionWrapper, {
      autoAlpha: 0,
      duration: 0
    });

    // Animate project title
    gsap.fromTo(projectTitle, {
      y: 24
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.3,
      delay: 0.8
    });

    // Animate meta wrappers
    gsap.fromTo(Array.from(projectMetaWrappers), {
      y: 24
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.3,
      stagger: 0.1,
      delay: 0.9
    });

    // Complete transition with Flip
    await Flip.from(state, {
      duration: 1,
      ease: "power2.inOut"
    });
  }
};

// Initialize Barba.js
const BarbaManager = {
  init() {
    barba.init({
      transitions: [{
        name: 'autoAlpha-transition',
        async leave(data) {
          const triggeredElement = data.trigger;
          if (triggeredElement) {
            await TransitionController.leaveIndex(triggeredElement);
          }
        },
        async afterEnter() {
          // Placeholder for future functionality
        }
      }],
      views: [{
        namespace: 'home',
        afterEnter() {
          // Initialize home page
          BlobController.init();
          ProjectsController.init();
        }
      }, {
        namespace: 'project',
        afterEnter() {
          TransitionController.enterProject();
        }
      }]
    });
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  BarbaManager.init();
});