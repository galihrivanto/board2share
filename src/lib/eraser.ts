import { BasePainter } from "./painter";

export class EraserPainter extends BasePainter {
    StartStroke(x: number, y: number) {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.lastX = x;
            this.lastY = y;
        }
    }
    StrokeTo(x: number, y: number) {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(this.lastX, this.lastY);
            this.context.lineTo(x, y);
            this.context.strokeStyle = this.backgroundColor;
            this.context.lineWidth = this.size * 5;
            this.context.lineCap = "round";
            this.context.lineJoin = "round";
            this.context.stroke();
            this.lastX = x;
            this.lastY = y;
        }
    }
    EndStroke(x: number, y: number) {
        this.StrokeTo(x, y);
    }
}