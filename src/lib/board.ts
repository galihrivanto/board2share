// CanvasBoard is canvas implementation leveraging canvas element
export class CanvasBoard implements IBoard {
    private _canvas: HTMLCanvasElement;
    private _painters: Map<string, IPainter> = new Map<string, IPainter>();
    private _activePainter: IPainter | null = null;
    private _backgroundColor: string = "#ffffff";
    private _foregroundColor: string = "#000000";
    private _mouseDown: boolean = false;

    constructor(element: HTMLCanvasElement){
        this._canvas = element;

        this.setupEventListeners();
    }

    private get bounds(): DOMRect {
        return this._canvas.getBoundingClientRect();
    }

    private getMousePosition(e: MouseEvent) {
        return {
            x: e.clientX - this.bounds.left,
            y: e.clientY - this.bounds.top
        };
    }

    private setupEventListeners(): void {
        this._canvas.addEventListener('mousedown', (e: MouseEvent) => {
            const pos = this.getMousePosition(e);
            this._mouseDown = true;
            if (this._activePainter !== null){
                this._activePainter.StartStroke(pos.x, pos.y);
            }        
        });

		this._canvas.addEventListener('mousemove', (e: MouseEvent) => {
            const pos = this.getMousePosition(e);
            if (this._activePainter !== null && this._mouseDown){
                this._activePainter.StrokeTo(pos.x, pos.y);
            }
        });

		this._canvas.addEventListener('mouseup',(e: MouseEvent) => {
            const pos = this.getMousePosition(e);
            if (this._activePainter !== null && this._mouseDown){
                this._activePainter.EndStroke(pos.x, pos.y);
            }
            this._mouseDown = false;
        });

        this._canvas.addEventListener('mouseleave', (_: MouseEvent) => {
            this._mouseDown = false;
        });
    }

    RegisterPainter(name: string, painter: IPainter): void {
        this._painters.set(name, painter);
    }

    SetActivePainter(name: string): void {
        if (this._painters.has(name)){
            this._activePainter = this._painters.get(name) || null;
            this.ChangeForegroundColor(this._foregroundColor);
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