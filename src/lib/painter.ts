import { IPainter } from "./types";

export abstract class BasePainter implements IPainter {    
    private _context: CanvasRenderingContext2D | null;
    private _color: string = "#000000";
    private _size: number = 1;

    constructor(canvas: HTMLCanvasElement){
        this._context = canvas.getContext("2d");
    }    

    protected get context(): CanvasRenderingContext2D | null {
        return this._context;
    }

    protected get color(): string {
        return this._color;
    }

    protected get size(): number {
        return this._size;
    }

    SetColor(color: string): void {
        this._color = color;
    }

    SetSize(size: number): void {
        this._size = size;
    }

    abstract StartStroke(x: number, y: number): void;

    abstract StrokeTo(x: number, y: number): void;

    abstract EndStroke(x: number, y: number): void;    
}