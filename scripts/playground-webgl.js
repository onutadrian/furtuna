import * as THREE from '../vendor/three/three.module.min.js';

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uContainerRes;
uniform float uProgress;
uniform vec3 uColor;
uniform float uDecodeTexture;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 squaresGrid(vec2 uv) {
    float imageAspectX = 1.0;
    float imageAspectY = 1.0;
    float containerAspectX = uResolution.x / uResolution.y;
    float containerAspectY = uResolution.y / uResolution.x;

    vec2 ratio = vec2(
        min(containerAspectX / imageAspectX, 1.0),
        min(containerAspectY / imageAspectY, 1.0)
    );

    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
}

void main() {
    float imageAspectX = uResolution.x / uResolution.y;
    float imageAspectY = uResolution.y / uResolution.x;
    float containerAspectX = uContainerRes.x / uContainerRes.y;
    float containerAspectY = uContainerRes.y / uContainerRes.x;

    vec2 ratio = vec2(
        min(containerAspectX / imageAspectX, 1.0),
        min(containerAspectY / imageAspectY, 1.0)
    );

    vec2 coverUvs = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec2 squareUvs = squaresGrid(coverUvs);
    float gridSize = max(2.0, floor(uContainerRes.x / 20.0));
    vec2 grid = vec2(floor(squareUvs.x * gridSize) / gridSize, floor(squareUvs.y * gridSize) / gridSize);

    vec4 gridTexture = vec4(uColor, 0.0);
    vec4 texture = texture2D(uTexture, coverUvs);
    if (uDecodeTexture > 0.5) {
        texture.rgb = pow(texture.rgb, vec3(2.2));
    }

    float height = 0.2;
    float progress = (1.0 + height) - (uProgress * (1.0 + height + height));
    float dist = 1.0 - distance(grid.y, progress);
    float clampedDist = smoothstep(height, 0.0, distance(grid.y, progress));
    float randDist = step(1.0 - height * random(grid), dist);
    dist = step(1.0 - height, dist);

    float rand = random(grid);
    float alpha = dist * (clampedDist + rand - 0.5 * (1.0 - randDist));
    alpha = max(0.0, alpha);
    gridTexture.a = alpha;

    texture.rgba *= step(progress, grid.y);
    gl_FragColor = vec4(mix(texture, gridTexture, gridTexture.a));
    #include <colorspace_fragment>
}
`;

class PlaygroundWebGLMedia {
    constructor({ element, scene, cameraSizes, gsap, ScrollTrigger }) {
        this.element = element;
        this.media = element.querySelector('img, video');
        this.scene = scene;
        this.cameraSizes = cameraSizes;
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.isVideo = this.media?.tagName === 'VIDEO';
        this.resizeObserver = null;
        this.scrollTween = null;

        if (!this.media) return;

        this.createGeometry();
        this.createMaterial();
        this.createMesh();
        this.createTexture();
        this.createScrollTrigger();
        this.scene.add(this.mesh);
    }

    createGeometry() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    }

    createMaterial() {
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            toneMapped: false,
            uniforms: {
                uTexture: new THREE.Uniform(null),
                uResolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
                uContainerRes: new THREE.Uniform(new THREE.Vector2(1, 1)),
                uProgress: new THREE.Uniform(0),
                uColor: new THREE.Uniform(new THREE.Color('#ffffff')),
                uDecodeTexture: new THREE.Uniform(0),
            },
        });
    }

    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    setResolution(width, height) {
        if (!width || !height) return;
        this.material.uniforms.uResolution.value.set(width, height);
    }

    createTexture() {
        if (this.isVideo) {
            const video = this.media;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'metadata';

            this.texture = new THREE.VideoTexture(video);
            this.texture.colorSpace = THREE.NoColorSpace;
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.material.uniforms.uTexture.value = this.texture;
            this.material.uniforms.uDecodeTexture.value = 1;

            const updateVideoResolution = () => {
                this.setResolution(video.videoWidth, video.videoHeight);
                this.element.classList.add('is-webgl-media-ready');
            };
            if (video.videoWidth && video.videoHeight) updateVideoResolution();
            video.addEventListener('loadedmetadata', updateVideoResolution, { once: true });
            video.addEventListener('loadeddata', updateVideoResolution, { once: true });
            video.load();
            return;
        }

        const image = this.media;
        this.texture = new THREE.TextureLoader().load(image.currentSrc || image.src, texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            this.setResolution(texture.image.naturalWidth || texture.image.width, texture.image.naturalHeight || texture.image.height);
            this.element.classList.add('is-webgl-media-ready');
        });
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.material.uniforms.uTexture.value = this.texture;
    }

    createScrollTrigger() {
        this.scrollTween = this.gsap.to(this.material.uniforms.uProgress, {
            value: 1,
            duration: 1.6,
            ease: 'linear',
            scrollTrigger: {
                trigger: this.element,
                start: 'top bottom',
                end: 'bottom top',
                toggleActions: 'play reset restart reset',
                onEnter: () => this.play(),
                onEnterBack: () => this.play(),
                onLeave: () => this.pause(),
                onLeaveBack: () => this.pause(),
            },
        });
    }

    syncInitialProgress() {
        const bounds = this.element.getBoundingClientRect();

        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
            this.material.uniforms.uProgress.value = 1;
            this.play();
        }
    }

    play() {
        if (!this.isVideo) return;
        this.media.play().catch(() => {});
    }

    pause() {
        if (!this.isVideo) return;
        this.media.pause();
    }

    update(cameraSizes) {
        if (!this.mesh || !this.element) return;
        this.cameraSizes = cameraSizes;

        const bounds = this.element.getBoundingClientRect();
        const meshWidth = (bounds.width * cameraSizes.width) / window.innerWidth;
        const meshHeight = (bounds.height * cameraSizes.height) / window.innerHeight;

        this.mesh.scale.set(meshWidth, meshHeight, 1);

        let x = (bounds.left * cameraSizes.width) / window.innerWidth;
        let y = (-bounds.top * cameraSizes.height) / window.innerHeight;

        x -= cameraSizes.width / 2;
        x += meshWidth / 2;
        y -= meshHeight / 2;
        y += cameraSizes.height / 2;

        this.mesh.position.set(x, y, 0);
        this.material.uniforms.uContainerRes.value.set(bounds.width, bounds.height);
    }

    destroy(options = {}) {
        if (options.preserveMedia !== this.media) {
            this.pause();
        }
        this.scrollTween?.scrollTrigger?.kill();
        this.scrollTween?.kill();
        if (this.mesh) this.scene.remove(this.mesh);
        this.texture?.dispose();
        this.geometry?.dispose();
        this.material?.dispose();
    }
}

class PlaygroundWebGLGallery {
    constructor({ container, gsap, ScrollTrigger }) {
        this.container = container;
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this.medias = [];
        this.textAnimations = [];
        this.destroyed = false;
        this.render = this.render.bind(this);
        this.onResize = this.onResize.bind(this);

        this.items = Array.from(container.querySelectorAll('[data-webgl-media]'));
        if (!this.items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.createCanvas();
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.setCameraSizes();
        this.createMedias();
        this.createTextAnimations();

        requestAnimationFrame(() => {
            if (this.destroyed) return;
            this.ScrollTrigger.refresh();
            this.medias.forEach(media => media.syncInitialProgress());
            this.render();
            requestAnimationFrame(() => {
                if (this.destroyed) return;
                this.container.classList.add('is-webgl-ready');
            });
        });

        window.addEventListener('resize', this.onResize);
        this.gsap.ticker.add(this.render);
        this.render();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'playground-webgl-canvas';
        this.container.prepend(this.canvas);
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 10;
        this.scene.add(this.camera);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setCameraSizes() {
        const fov = this.camera.fov * (Math.PI / 180);
        const height = this.camera.position.z * Math.tan(fov / 2) * 2;
        const width = height * this.camera.aspect;
        this.cameraSizes = { width, height };
    }

    createMedias() {
        this.medias = this.items.map(element => new PlaygroundWebGLMedia({
            element,
            scene: this.scene,
            cameraSizes: this.cameraSizes,
            gsap: this.gsap,
            ScrollTrigger: this.ScrollTrigger,
        }));
    }

    createTextAnimations() {
        const textElements = Array.from(this.container.querySelectorAll('.playground-webgl-item--copy p, .playground-webgl-item--media span'));
        this.gsap.set(textElements, { autoAlpha: 0, y: 24 });

        this.textAnimations = textElements.map(element => this.gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element.closest('.playground-webgl-item') || element,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
        }));
    }

    onResize() {
        if (this.destroyed) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.setCameraSizes();
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }

    render() {
        if (this.destroyed) return;
        this.medias.forEach(media => media.update(this.cameraSizes));
        this.renderer.render(this.scene, this.camera);
    }

    destroy(options = {}) {
        if (this.destroyed) return;
        this.destroyed = true;
        window.removeEventListener('resize', this.onResize);
        this.gsap.ticker.remove(this.render);
        this.medias.forEach(media => media.destroy(options));
        this.textAnimations.forEach(animation => {
            animation.scrollTrigger?.kill();
            animation.kill();
        });
        this.medias = [];
        this.textAnimations = [];
        this.container.classList.remove('is-webgl-ready');
        this.canvas?.remove();
        this.renderer?.dispose();
    }
}

export function initPlaygroundWebGLGallery({ container, gsap, ScrollTrigger }) {
    window.FurtunaPlaygroundWebGL?.destroy?.();
    const gallery = new PlaygroundWebGLGallery({ container, gsap, ScrollTrigger });
    window.FurtunaPlaygroundWebGL = gallery;
    return gallery;
}
