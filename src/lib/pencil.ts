import { BasePainter } from "./painter";

export class PencilPainter extends BasePainter {
    StartStroke(x: number, y: number): void {
        if (this.context) {
            this.context.beginPath();
            this.context.moveTo(x, y);
        }
    }

    StrokeTo(x: number, y: number): void {
        if (this.context) {
            this.context.lineTo(x, y);
            this.context.strokeStyle = this.foregroundColor;
            this.context.lineWidth = this.size;
            this.context.lineCap = "round";
            this.context.lineJoin = "round";
            this.context.stroke();
        }
    }

    EndStroke(x: number, y: number): void {
        this.StrokeTo(x, y);
    }
}