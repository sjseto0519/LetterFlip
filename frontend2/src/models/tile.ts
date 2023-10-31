import { Mesh, Quaternion, Vector3 } from "@babylonjs/core";

export class Tile {
    constructor(public letter: string, public mesh: Mesh) {
      this.isFlipped = false;
      this.currentAngle = 0;
      this.maxAngle = Math.PI / 2;
      this.minAngle = 0;
      this.angleIncrement = 0.1;
      this.box = mesh;
      this.asterisksStr = '';
    }
  
    isFlipped: boolean;
    currentAngle: number;
    maxAngle: number;
    minAngle: number;
    angleIncrement: number;
    asterisksStr = '';
    box: Mesh;
    asterisks?: Mesh;
    
    // Increment the number of asterisks
    incrementAsterisks() {
      this.asterisksStr = this.asterisksStr + '*';
    }

    flip() {
      this.isFlipped = !this.isFlipped;
      this.mesh.rotationQuaternion = null;
    }

    unflip() {
      this.isFlipped = false;
      this.mesh.rotation.x = this.minAngle;
      let angle = Math.PI / 8;  // 45 degrees in radians
      let axis = new Vector3(1, 0, 0); // Y-axis

      this.mesh.rotationQuaternion = Quaternion.RotationAxis(axis, angle);
    }
    
    // In your Tile class definition
    update() {
        if (this.isFlipped && this.currentAngle > -this.maxAngle) {
        this.currentAngle -= this.angleIncrement;
        if (this.currentAngle < -this.maxAngle) {
            this.currentAngle = -this.maxAngle;
        }
        this.mesh.rotation.x = this.currentAngle;
        }
        else if (!this.isFlipped && this.currentAngle < this.minAngle) {
        this.currentAngle += this.angleIncrement;
        if (this.currentAngle > this.minAngle) {
            this.currentAngle = this.minAngle;
        }
        this.mesh.rotation.x = this.currentAngle;
        }
    }
  }
  