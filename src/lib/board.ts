enum StrokeState {
    Start = "stroke::start",
    Stroke = "stroke::stroke",
    End = "stroke::end",
    StartOutside = "stroke::start::outside",
    StrokeOutside = "stroke::stroke::outside",
}

// CanvasBoard is canvas implementation leveraging canvas element
export class CanvasBoard implements IBoard {
    private _canvas: HTMLCanvasElement;
    private _painters: Map<string, IPainter> = new Map<string, IPainter>();
    private _eraser: IPainter | null = null;
    private _activePainterName: string = "";
    private _activePainter: IPainter | null = null;
    private _backgroundColor: string = "#ffffff";
    private _foregroundColor: string = "#000000";
    private _strokeState: StrokeState = StrokeState.End;

    constructor(element: HTMLCanvasElement){
        this._canvas = element;

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
        return {
            x: e.clientX - this.bounds.left,
            y: e.clientY - this.bounds.top
        };
    }

    private setupEventListeners(): void {
        window.addEventListener('mousedown', (e: MouseEvent) => {
            this.strokeStart(e);    
        });

		window.addEventListener('mousemove', (e: MouseEvent) => {
            this.strokeMove(e);
        });

		window.addEventListener('mouseup',(e: MouseEvent) => {
            this.strokeEnd(e);
        });

        window.addEventListener('touchstart', (e: TouchEvent) => {
            if (e.touches.length == 1) {
                this.strokeStart(e.touches[0]);
            }
        });

        window.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.touches.length == 1) {
                this.strokeMove(e.touches[0]);
            }
        });

        window.addEventListener('touchend', (e: TouchEvent) => {
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
    }

    private strokeMove(e: MouseEvent | Touch) {
        if (!this._activePainter) return;
        
        const pos = this.getPointerPosition(e);
        if (!this.pointerInsideCanvas(pos.x, pos.y)) {
            if (this._strokeState === StrokeState.Stroke) {
                this._activePainter.EndStroke(pos.x, pos.y);;
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
                break;
        }
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
    }

    RegisterPainter(name: string, painter: IPainter): void {
        this._painters.set(name, painter);
    }

    RegisterEraser(painter: IPainter): void {
        this._eraser = painter;
    }

    SetActivePainter(name: string): void {
        if (this._painters.has(name)){
            this._activePainterName = name;
            this._activePainter = this._painters.get(name) || null;
            this.ChangeForegroundColor(this._foregroundColor);
        }
    }

    SetEraseMode(active: boolean): void {
        if (active && this._eraser !== null){
            this._activePainter = this._eraser || null;
            this._activePainter.SetColor(this._backgroundColor);
        } else {
            this.SetActivePainter(this._activePainterName);
        }
    }

    ChangeForegroundColor(color: string): void {
        this._foregroundColor = color;
        if (this._activePainter !== null){
            this._activePainter.SetColor(color);
        }
    }

    ChangeBackgroundColor(color: string): void {
        this._backgroundColor = color;
        this._canvas.style.backgroundColor = color;
    }
}