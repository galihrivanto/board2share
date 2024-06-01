import { BasePainter } from "./painter";

export class SprayPainter extends BasePainter {
    StartStroke(x: number, y: number): void {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(x, y);
        }
    }

    StrokeTo(x: number, y: number): void {
        if (this.context) {
            const density = 50;
            const radius = this.size * 10;
            for (let i = 0; i < density; i++) {
                const offsetX = Math.random() * radius * 2 - radius;
                const offsetY = Math.random() * radius * 2 - radius;
                if (offsetX * offsetX + offsetY * offsetY <= radius * radius) {
                    this.context.fillStyle = this.foregroundColor;
                    this.context.fillRect(x + offsetX, y + offsetY, 1, 1);
                }
            }
        }
    }

    EndStroke(x: number, y: number): void {
        this.StrokeTo(x, y);
    }
}