import { BasePainter } from "./painter";
import Queue from "./queue";

interface color {  
    r: number;
    g: number;
    b: number;
    a: number;
}

export class PaintBucketPainter extends BasePainter {
    private getColorAtPixel(imageData: ImageData, x: number, y: number): color {
        const data = imageData.data
        return {
            r: data[4 * (this.width * y + x) + 0],
            g: data[4 * (this.width * y + x) + 1],
            b: data[4 * (this.width * y + x) + 2],
            a: data[4 * (this.width * y + x) + 3]
        }
    }

    private setColorAtPixel(imageData: ImageData, color: color, x: number, y: number) {
        const data = imageData.data

        data[4 * (this.width * y + x) + 0] = color.r & 0xff
        data[4 * (this.width * y + x) + 1] = color.g & 0xff
        data[4 * (this.width * y + x) + 2] = color.b & 0xff
        data[4 * (this.width * y + x) + 3] = color.a & 0xff
    }

    private hexToRgba(hex: string, a: number = 255): color {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return {r,g, b, a};
    }

    private colorsMatch(a: color, b: color, tolerance: number = 20): boolean {
        return Math.abs(a.r - b.r) <= tolerance &&
               Math.abs(a.g - b.g) <= tolerance &&
               Math.abs(a.b - b.b) <= tolerance &&
               Math.abs(a.a - b.a) <= tolerance;
    }

    private floodFill(x: number, y: number, fillColor: color): void {
        if (!this.context) return;

        const data = this.context.getImageData(0, 0, this.width, this.height);
        const targetColor = this.getColorAtPixel(data, x, y);

        if (this.colorsMatch(targetColor, fillColor)) {
            return;
        }
    
        const queue = new Queue<[number, number]>();
        queue.enqueue([x, y]);

        const visited: boolean[][] = Array.from({ length: this.width }, () => Array(this.height).fill(false));

        while (!queue.isEmpty()) {
            const [curX, curY] = queue.dequeue()!;
            if (visited[curX][curY]) continue;

            visited[curX][curY] = true;
            const currentColor = this.getColorAtPixel(data, curX, curY);
    
            if (this.colorsMatch(currentColor, targetColor)) {
                this.setColorAtPixel(data, fillColor, curX, curY);

                const neighbors: [number, number][] = [
                    [curX - 1, curY],
                    [curX, curY - 1],
                    [curX + 1, curY],
                    [curX, curY + 1]
                ];

                for (const [neighborX, neighborY] of neighbors) {
                    if (neighborX >= 0 && neighborX < this.width && neighborY >= 0 && neighborY < this.height && !visited[neighborX][neighborY]) {
                        queue.enqueue([neighborX, neighborY]);                        
                    }
                }
            } 
        }

        this.context.putImageData(data, 0, 0);
    }
   
    StartStroke(_x: number, _y: number): void {
        // nothing to do
    }

    StrokeTo(_x: number, _y: number): void {
        // nothing to do
    }

    EndStroke(x: number, y: number): void {
        if (!this.context) return;

        const replacementColor = this.hexToRgba(this.foregroundColor);
        console.log('replacement:', replacementColor);
        this.floodFill(Math.round(x), Math.round(y), replacementColor);
    }
    
}