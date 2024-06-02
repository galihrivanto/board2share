import { BasePainter } from "./painter";
import Queue from "./queue";

export class PaintBucketPainter extends BasePainter {
    private getColorAtPixel(x: number, y: number): number[] {
        if (!this.context) return [0, 0, 0, 0];

        const pixel = this.context?.getImageData(x, y, 1, 1).data;
        return Array.from(pixel);
    }

    private hexToRgba(hex: string, alpha: number = 255): number[] {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return [r, g, b, alpha];
    }

    private colorsMatch(a: number[], b: number[], tolerance: number = 20): boolean {
        return Math.abs(a[0] - b[0]) <= tolerance &&
               Math.abs(a[1] - b[1]) <= tolerance &&
               Math.abs(a[2] - b[2]) <= tolerance &&
               Math.abs(a[3] - b[3]) <= tolerance;
    }

    private floodFill(x: number, y: number, targetColor: number[], fillColor: number[]): void {
        if (!this.context) return;

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
            const currentColor = this.getColorAtPixel(curX, curY);
    
            if (this.colorsMatch(currentColor, targetColor)) {
                this.context.fillStyle = `rgba(${fillColor[0]}, ${fillColor[1]}, ${fillColor[2]}, ${fillColor[3] / 255})`;
                this.context.fillRect(curX, curY, 1, 1);

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
    }
   
    StartStroke(x: number, y: number): void {
        if (!this.context) return;

        const targetColor = this.getColorAtPixel(x, y);
        console.log('target:', targetColor);
        const replacementColor = this.hexToRgba(this.foregroundColor);
        console.log('replacement:', replacementColor);
        this.floodFill(x, y, targetColor, replacementColor);
    }

    StrokeTo(x: number, y: number): void {
        // nothing to do
    }

    EndStroke(x: number, y: number): void {
        // nothing to do
    }
    
}