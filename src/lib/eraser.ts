import { BasePainter } from "./painter";

export class EraserPainter extends BasePainter {
    StartStroke(x: number, y: number) {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(x, y);
        }
    }
    StrokeTo(x: number, y: number) {
        if (this.context) {
            this.context.lineTo(x, y);
            this.context.strokeStyle = this.backgroundColor;
            this.context.lineWidth = this.size * 5;
            this.context.lineCap = "round";
            this.context.lineJoin = "round";
            this.context.stroke();
        }
    }
    EndStroke(x: number, y: number) {
        this.StrokeTo(x, y);
    }
}