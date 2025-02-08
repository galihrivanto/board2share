import { BasePainter } from "./painter";

export class PencilPainter extends BasePainter {
    StartStroke(x: number, y: number): void {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.lastX = x;
            this.lastY = y;
        }
    }

    StrokeTo(x: number, y: number): void {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(this.lastX, this.lastY);
            this.context.lineTo(x, y);
            this.context.strokeStyle = this.foregroundColor;
            this.context.lineWidth = this.size;
            this.context.lineCap = "round";
            this.context.lineJoin = "round";
            this.context.stroke();
            this.lastX = x;
            this.lastY = y;
        }
    }

    EndStroke(x: number, y: number): void {
        this.StrokeTo(x, y);
    }
}