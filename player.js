import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class PlayerController {
  constructor(scene, physicsWorld, type = 'dash') {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.type = type;
    this.mesh = null;
    this.body = null;
    this.speed = 0;
    this.maxSpeed = 20;
    this.accel = 0.5;
    this.rotationObj = new THREE.Object3D();
    this.keys = {};

    this.init();
  }

  init() {
    if (this.type === 'dash') {
      this.initDash();
    } else {
      this.initStep();
    }

    window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
  }

  initDash() {
    // A simple car model
    const carGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2, 1, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#f87171' }); // Red
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    carGroup.add(body);

    const roofGeo = new THREE.BoxGeometry(1.8, 0.8, 2);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#ef4444' });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 0.9, -0.2);
    carGroup.add(roof);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const wheels = [[-1, -0.3, 1.5], [1, -0.3, 1.5], [-1, -0.3, -1.5], [1, -0.3, -1.5]];
    wheels.forEach(p => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI/2;
        wheel.position.set(p[0], p[1], p[2]);
        carGroup.add(wheel);
    });

    this.mesh = carGroup;
    this.scene.add(this.mesh);

    // Physics
    this.body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)),
        position: new CANNON.Vec3(0, 2, 0)
    });
    this.physicsWorld.addBody(this.body);
  }

  initStep() {
    // A simple character model
    const charGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#60a5fa' }); // Blue
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    charGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: '#fcd34d' });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;
    charGroup.add(head);

    this.mesh = charGroup;
    this.scene.add(this.mesh);

    // Physics
    this.body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.9, 0.4)),
        position: new CANNON.Vec3(15, 2, 40)
    });
    this.physicsWorld.addBody(this.body);
  }

  update() {
    if (!this.body) return;

    if (this.type === 'dash') {
      this.handleDashInput();
    } else {
      this.handleStepInput();
    }

    // Sync mesh to body
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  handleDashInput() {
    const forward = (this.keys['w'] || this.keys['arrowup']) ? 1 : (this.keys['s'] || this.keys['arrowdown']) ? -1 : 0;
    const steer = (this.keys['a'] || this.keys['arrowleft']) ? 1 : (this.keys['d'] || this.keys['arrowright']) ? -1 : 0;

    // Move in direction of rotation
    const rotation = this.body.quaternion;
    const vec = new CANNON.Vec3(0, 0, forward * this.maxSpeed);
    const worldForce = rotation.vmult(vec);

    if (forward !== 0) {
      this.body.velocity.x = worldForce.x;
      this.body.velocity.z = worldForce.z;

      // Simple steering
      const torque = new CANNON.Vec3(0, steer * 10, 0);
      this.body.angularVelocity.y = steer * 2;
    } else {
        this.body.velocity.x *= 0.95;
        this.body.velocity.z *= 0.95;
        this.body.angularVelocity.y *= 0.9;
    }
  }

  handleStepInput() {
    const walk = (this.keys['w'] || this.keys['arrowup']) ? -1 : (this.keys['s'] || this.keys['arrowdown']) ? 1 : 0;
    const side = (this.keys['a'] || this.keys['arrowleft']) ? -1 : (this.keys['d'] || this.keys['arrowright']) ? 1 : 0;

    this.body.velocity.z = walk * 5;
    this.body.velocity.x = side * 5;
  }
}
