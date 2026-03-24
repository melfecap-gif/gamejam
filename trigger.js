import * as THREE from 'three';

export class TriggerSystem {
    constructor() {
        this.triggers = [];
    }

    addTrigger(name, pos, size, callback) {
        this.triggers.push({ name, pos, size, callback, active: true });
    }

    check(pos) {
        for (let t of this.triggers) {
            if (!t.active) continue;
            const dist = pos.distanceTo(t.pos);
            if (dist < t.size) {
                t.callback();
                t.active = false; // Trigger once
            }
        }
    }
}
