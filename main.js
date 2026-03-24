import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from '@tweenjs/tween.js';
import { initI18n, t, setLanguage } from './i18n.js';
import { WorldManager } from './world.js';
import { PlayerController } from './player.js';
import { TriggerSystem } from './trigger.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.awareness = 100;
    this.mode = 'intro';
    this.chapter = 0;
    this.languageSelected = false;
    this.clock = new THREE.Clock();

    this.initScene();
    this.initPhysics();
    this.initWorld();
    this.initTriggerSystem();
    this.initListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#93c5fd'); 

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    this.camera.position.set(30, 30, 30);
    this.camera.lookAt(0, 0, 0);
  }

  initPhysics() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -20.82, 0)
    });
  }

  initWorld() {
    this.worldManager = new WorldManager(this.scene, this.world);
  }

  initTriggerSystem() {
    this.triggerSystem = new TriggerSystem();
    // Stop sign trigger
    this.triggerSystem.addTrigger('stop_sign', new THREE.Vector3(0, 0, 15), 10, () => {
      this.checkStopLesson();
    });
    // Crosswalk trigger
    this.triggerSystem.addTrigger('crosswalk', new THREE.Vector3(0, 0, 40), 10, () => {
      this.checkCrosswalkLesson();
    });
  }

  initListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.getElementById('lang-en').onclick = () => this.selectLanguage('en');
    document.getElementById('lang-pt').onclick = () => this.selectLanguage('pt');
    document.getElementById('dialog-next').onclick = () => this.hideDialog();
  }

  async selectLanguage(lang) {
    await initI18n(lang);
    this.languageSelected = true;
    document.getElementById('lang-en').classList.add('hidden');
    document.getElementById('lang-pt').classList.add('hidden');
    this.updateUIText();
    this.startGame();
  }

  updateUIText() {
    document.querySelector('#intro-screen h1').innerText = t('title');
    document.querySelector('#intro-screen p').innerText = t('subtitle');

    document.getElementById('mode-display').innerText = this.mode === 'dash' ? t('mode.dash') : t('mode.step');
    document.getElementById('meter-label').innerText = t('feedback.awareness') + ': ' + Math.round(this.awareness) + '%';
  }

  startGame() {
    document.getElementById('overlay-layer').classList.add('hidden');
    this.startChapter(1);
  }

  startChapter(num) {
    this.chapter = num;
    if (num === 1) {
      this.mode = 'dash';
      this.dash = new PlayerController(this.scene, this.world, 'dash');
      this.player = this.dash;
      this.showDialog(t('intro.chapters.1'));
      document.getElementById('objective-display').innerText = "OBJ: STOP AT THE SIGN";
    } else if (num === 2) {
      this.mode = 'step';
      if (this.dash) {
          this.scene.remove(this.dash.mesh);
          this.world.removeBody(this.dash.body);
      }
      this.step = new PlayerController(this.scene, this.world, 'step');
      this.player = this.step;
      this.showDialog(t('intro.chapters.2'));
      document.getElementById('objective-display').innerText = "OBJ: NAVIGATE TO CROSSWALK";
    } else if (num === 3) {
      this.showDialog(t('intro.chapters.3'));
      document.getElementById('objective-display').innerText = "OBJ: MISSION COMPLETE!";
    }
  }

  checkStopLesson() {
      const speed = this.player.body.velocity.length();
      if (speed > 1) {
          this.updateAwareness(-30);
          this.showDialog(t('lessons.stop_sign'));
      } else {
          this.updateAwareness(10);
          this.showDialog(t('feedback.good'));
      }
      setTimeout(() => this.startChapter(2), 2000);
  }

  checkCrosswalkLesson() {
      this.updateAwareness(20);
      this.showDialog(t('lessons.phone'));
      setTimeout(() => this.startChapter(3), 2000);
  }

  showDialog(text) {
    const dialog = document.getElementById('dialog-layer');
    const content = document.getElementById('dialog-content');
    content.innerText = text;
    dialog.classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  }

  hideDialog() {
    document.getElementById('dialog-layer').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    this.updateUIText();
  }

  updateAwareness(delta) {
    this.awareness = Math.max(0, Math.min(100, this.awareness + delta));
    const fill = document.getElementById('meter-fill');
    fill.style.width = this.awareness + '%';
    document.getElementById('meter-label').innerText = t('feedback.awareness') + ': ' + Math.round(this.awareness) + '%';
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = this.clock.getDelta();
    this.world.step(1/60);
    TWEEN.update();

    if (this.player) {
      this.player.update();
      this.triggerSystem.check(this.player.mesh.position);

      const targetPos = new THREE.Vector3().copy(this.player.mesh.position);
      if (this.mode === 'dash') {
          targetPos.add(new THREE.Vector3(0, 10, -20));
      } else {
          targetPos.add(new THREE.Vector3(0, 15, -15));
      }
      this.camera.position.lerp(targetPos, 0.05);
      this.camera.lookAt(this.player.mesh.position);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
