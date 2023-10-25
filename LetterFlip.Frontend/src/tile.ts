import { Mesh } from "@babylonjs/core";

export class Tile {
    constructor(public letter: string, public mesh: Mesh) {
      this.isFlipped = false;
      this.currentAngle = 0;
      this.maxAngle = Math.PI / 2;
      this.minAngle = 0;
      this.angleIncrement = 0.1;
      this.box = mesh;
      this.numberOfAsterisks = 0;
    }
  
    isFlipped: boolean;
    currentAngle: number;
    maxAngle: number;
    minAngle: number;
    angleIncrement: number;
    numberOfAsterisks: number;
    box: Mesh;
    
    // Increment the number of asterisks
    incrementAsterisks() {
      this.numberOfAsterisks += 1;
    }

    flip() {
      this.isFlipped = !this.isFlipped;
    }

    unflip() {
      this.isFlipped = false;
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
  