import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class WorldManager {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.roads = [];
    this.buildings = [];
    this.signs = [];
    this.initWorld();
  }

  initWorld() {
    this.createRoads();
    this.createBuildings();
    this.createStopSign(0, 5, 20);
    this.createZebraCrossing(0, 0, 40);
  }

  createRoads() {
    // Road setup
    const roadMat = new THREE.MeshStandardMaterial({ color: '#334155' });
    const lineMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });

    // Central road
    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(20, 200), roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.01;
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Dotted lines
    for (let i = -90; i < 90; i += 10) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 4), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, i);
      this.scene.add(line);
    }
  }

  createBuildings() {
    const colors = ['#f87171', '#60a5fa', '#4ade80', '#fbbf24', '#a78bfa'];
    for (let i = 0; i < 12; i++) {
        const h = 5 + Math.random() * 10;
        const color = colors[i % colors.length];
        const geo = new THREE.BoxGeometry(10, h, 10);
        const mat = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        const x = i % 2 === 0 ? -25 : 25;
        const z = -80 + i * 15;
        mesh.position.set(x, h/2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(5, h/2, 5)),
            position: new CANNON.Vec3(x, h/2, z)
        });
        this.physicsWorld.addBody(body);
    }
  }

  createStopSign(x, y, z) {
    const poleMat = new THREE.MeshStandardMaterial({ color: '#94a3b8' });
    const signMat = new THREE.MeshStandardMaterial({ color: '#ef4444' });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 10), poleMat);
    pole.position.set(x + 12, 5, z);
    this.scene.add(pole);

    const octagon = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.2, 8), signMat);
    octagon.position.set(x + 12, 10, z);
    octagon.rotation.z = Math.PI / 2;
    octagon.rotation.x = Math.PI / 8;
    this.scene.add(octagon);
  }

  createZebraCrossing(x, y, z) {
      const mat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
      for (let i = -8; i <= 8; i += 4) {
          const bar = new THREE.Mesh(new THREE.PlaneGeometry(16, 2), mat);
          bar.rotation.x = -Math.PI/2;
          bar.position.set(0, 0.05, z + i);
          this.scene.add(bar);
      }
  }
}
