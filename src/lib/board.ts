import { IBoard, IPainter, PaintEvent, StrokeState } from "./types";

// CanvasBoard is canvas implementation leveraging canvas element
export class CanvasBoard implements IBoard {
    private _canvas: HTMLCanvasElement;
    private _painters: Map<string, IPainter> = new Map<string, IPainter>();
    private _activePainterInstances: Map<string, IPainter> = new Map<string, IPainter>();
    private _activePainterName: string = "";
    private _activePainter: IPainter | null = null;
    private _backgroundColor: string = "rgba(255,255,255,1)";
    private _foregroundColor: string = "rgba(0,0,0,1)";
    private _strokeState: StrokeState = StrokeState.End;
    private _strokeSize: number = 1;
    private _unit: number = 1;
    private _panningMode: boolean = false;

    OnPaint?: (event: PaintEvent) => void;
    TransformCoordinates?: (x: number, y: number) => { x: number, y: number };

    constructor(element: HTMLCanvasElement){
        this._canvas = element;
        this.clearCanvas(false);

        this.setupEventListeners();
    }

    private get bounds(): DOMRect {
        return this._canvas.getBoundingClientRect();
    }

    private pointerInsideCanvas(x: number, y: number): boolean 
    {
        return x >= 0 && x <= this._canvas.width && y >= 0 && y <= this._canvas.height;
    }

    private getPointerPosition(e: MouseEvent | Touch) {
        const rawPos = {
            x: e.clientX - this.bounds.left,
            y: e.clientY - this.bounds.top
        };

        if (this.TransformCoordinates) {
            return this.TransformCoordinates(rawPos.x, rawPos.y);
        }

        return rawPos;
    }

    private setupEventListeners(): void {
        window.addEventListener('mousedown', (e: MouseEvent) => {
            if (this._panningMode) {
                return;
            }

            this.strokeStart(e);    
        });

		window.addEventListener('mousemove', (e: MouseEvent) => {
            if (this._panningMode) {
                return;
            }

            this.strokeMove(e);
        });

		window.addEventListener('mouseup',(e: MouseEvent) => {
            if (this._panningMode) {
                return;
            }
            
            this.strokeEnd(e);
        });

        window.addEventListener('touchstart', (e: TouchEvent) => {
            if (this._panningMode) {
                return;
            }
            
            if (e.touches.length == 1) {
                this.strokeStart(e.touches[0]);
            }
        });

        window.addEventListener('touchmove', (e: TouchEvent) => {
            if (this._panningMode) {
                return;
            }
            
            if (e.touches.length == 1) {
                this.strokeMove(e.touches[0]);
            }
        });

        window.addEventListener('touchend', (e: TouchEvent) => {
            if (this._panningMode) {
                return;
            }
            
            if (e.touches.length == 1) {
                this.strokeEnd(e.touches[0]);
            }
        });
    }

    private strokeEnd(e: MouseEvent | Touch) {
        if (!this._activePainter) return;
        
        this._strokeState = StrokeState.End;
        const pos = this.getPointerPosition(e);
        if (!this.pointerInsideCanvas(pos.x, pos.y)) {
            return;
        }
        
        this._activePainter.EndStroke(pos.x, pos.y);
        this.emitPaintEvent(pos.x, pos.y);
    }

    private strokeMove(e: MouseEvent | Touch) {
        if (!this._activePainter) return;
        
        const pos = this.getPointerPosition(e);
        if (!this.pointerInsideCanvas(pos.x, pos.y)) {
            if (this._strokeState === StrokeState.Stroke) {
                this._activePainter.EndStroke(pos.x, pos.y);
                this.emitPaintEvent(pos.x, pos.y);
            }

            if (this._strokeState === StrokeState.Start || this._strokeState === StrokeState.StartOutside) {
                this._strokeState = StrokeState.StrokeOutside;
            }
            
            return;
        }

        switch (this._strokeState) {
            case StrokeState.Start:
                this._strokeState = StrokeState.Stroke;
                this._activePainter.StrokeTo(pos.x, pos.y);
                break;
            case StrokeState.Stroke:
                this._activePainter.StrokeTo(pos.x, pos.y);
                break;
            case StrokeState.StartOutside, StrokeState.StrokeOutside:
                this._strokeState = StrokeState.Start;
                this._activePainter.StartStroke(pos.x, pos.y);
                break;
            default:
                return;
        }

        this.emitPaintEvent(pos.x, pos.y);
    }

    private strokeStart(e: MouseEvent | Touch) {
        if (!this._activePainter) return;

        const pos = this.getPointerPosition(e);
        if (!this.pointerInsideCanvas(pos.x, pos.y)) {
            this._strokeState = StrokeState.StartOutside;
            return;
        };
        
        this._strokeState = StrokeState.Start;
        this._activePainter.StartStroke(pos.x, pos.y);
        this.emitPaintEvent(pos.x, pos.y);
    }

    private emitPaintEvent(x: number, y: number, state?: StrokeState): void {
        if (!this.OnPaint) return;

        const event: PaintEvent = {
            painter: this._activePainterName,
            strokeState: state ? state : this._strokeState,
            x: x / this._unit,
            y: y / this._unit,
            foregroundColor: this._foregroundColor,
            backgroundColor: this._backgroundColor,
            size: this._strokeSize / this._unit
        };

        this.OnPaint(event);
    }

    RegisterPainter(name: string, painter: IPainter): void {
        this._painters.set(name, painter);
    }

    SetStrokeSize(size: number): void {
        this._strokeSize = size;
        if (this._activePainter !== null){
            this._activePainter.SetSize(size);
        }
    }

    SetActivePainter(name: string): void {
        if (this._painters.has(name)){
            this._activePainterName = name;
            this._activePainter = this._painters.get(name) || null;
            this._activePainter?.SetForegroundColor(this._foregroundColor);
            this._activePainter?.SetBackgroundColor(this._backgroundColor);
            this._activePainter?.SetSize(this._strokeSize);
        }
    }

    SetPanningMode(enabled: boolean): void {
        this._panningMode = enabled;
    }

    ChangeForegroundColor(color: string): void {
        this._foregroundColor = color;
        if (this._activePainter !== null){
            this._activePainter.SetForegroundColor(color);
        }
    }

    ChangeBackgroundColor(color: string): void {
        this._backgroundColor = color;
        this._canvas.style.backgroundColor = color;
        if (this._activePainter !== null){
            this._activePainter.SetBackgroundColor(color);
        }
    }

    private clearCanvas(emit: boolean): void {
        if (this._canvas && this._canvas.getContext){
            const ctx = this._canvas.getContext("2d");
            if (ctx){
                ctx.fillStyle = this._backgroundColor;
                ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
                if (emit){
                    this.emitPaintEvent(0, 0, StrokeState.Clear);
                }
            }
        }
    }

    Clear(): void {
        this.clearCanvas(true);
    }

    Resize(width: number, height: number, unit: number): void {
        // save current image data
        const ctx = this._canvas.getContext("2d");
        if (!ctx) return;

        // Save the current canvas content as an image data URL
        const dataURL = this._canvas.toDataURL();

        // Create a new image object
        const img = new Image();

        // Set the source of the image to the data URL
        img.src = dataURL;

        // Once the image has loaded, resize the canvas and redraw the image
        img.onload = () => {
            // Save the original canvas size
            const oldWidth = this._canvas.width;
            const oldHeight = this._canvas.height;

            // Resize the canvas
            this._canvas.width = width;
            this._canvas.height = height;
            this._unit = unit;

            // Clear the canvas and redraw the image with high quality scaling
            ctx.clearRect(0, 0, width, height);

            // Draw the image on the resized canvas, scaling it to fit
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, oldWidth, oldHeight, 0, 0, width, height);
        };
    }

    ApplyPaint(event: PaintEvent): void {
        if (!this._painters.has(event.painter)) return;
        
        // Get or create painter instance for this source
        const sourceKey = `${event.painter}-${event.source}`;
        let painter = this._activePainterInstances.get(sourceKey);
        
        if (!painter) {
            // Clone the original painter for this source
            painter = Object.create(this._painters.get(event.painter)!);
            if (!painter) return;
            
            this._activePainterInstances.set(sourceKey, painter);
        }
    
        const size = event.size * this._unit;
        const x = event.x * this._unit;
        const y = event.y * this._unit;
    
        painter.SetForegroundColor(event.foregroundColor);
        painter.SetBackgroundColor(event.backgroundColor);
        painter.SetSize(size);
        
        switch (event.strokeState) {
            case StrokeState.Start:
                painter.StartStroke(x, y);
                break;
            case StrokeState.Stroke:
                painter.StrokeTo(x, y);
                break;
            case StrokeState.End:
                painter.EndStroke(x, y);
                // Clean up the painter instance after stroke ends
                this._activePainterInstances.delete(sourceKey);
                break;
            case StrokeState.Clear:
                this.clearCanvas(false);
                // Clear all active painter instances
                this._activePainterInstances.clear();
                break;
            default:
                return;
        }
    }

    Export(): void {
        const dataURL = this._canvas.toDataURL();
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `canvas-${Date.now()}.png`;
        a.click();
        a.remove();
    }
}