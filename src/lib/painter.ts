import { IPainter } from "./types";

export abstract class BasePainter implements IPainter {  
    private _canvas: HTMLCanvasElement | null;  
    private _context: CanvasRenderingContext2D | null;
    private _foregroundColor: string = "#000000";
    private _backgroundColor: string = "#FFFFFF";
    private _size: number = 1;
    protected lastX: number = 0;
    protected lastY: number = 0;

    constructor(canvas: HTMLCanvasElement){
        this._canvas = canvas;
        this._context = canvas.getContext("2d", { willReadFrequently: true });
    }    

    protected get context(): CanvasRenderingContext2D | null {
        return this._context;
    }

    protected get width(): number {
        return this._canvas?.width || 0;
    }

    protected get height(): number {
        return this._canvas?.height || 0;
    }

    protected get foregroundColor(): string {
        return this._foregroundColor;
    }

    protected get backgroundColor(): string {
        return this._backgroundColor;
    }

    protected get size(): number {
        return this._size;
    }

    SetForegroundColor(color: string): void {
        this._foregroundColor = color;
    }

    SetBackgroundColor(color: string): void {
        this._backgroundColor = color;
    }

    SetSize(size: number): void {
        this._size = size;
    }

    abstract StartStroke(x: number, y: number): void;

    abstract StrokeTo(x: number, y: number): void;

    abstract EndStroke(x: number, y: number): void;
}