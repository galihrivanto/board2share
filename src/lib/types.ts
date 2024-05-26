interface IBoard {
    ChangeForegroundColor(color: string): void;
    ChangeBackgroundColor(color: string): void;
    RegisterPainter(name: string, painter: IPainter): void;
    RegisterEraser(painter:IPainter): void;
    SetStrokeSize(size: number): void;
    SetActivePainter(name: string): void;
    SetEraseMode(active: boolean): void;
}

interface IPainter {
    SetColor(color: string): void;
    SetSize(size: number): void;
    StartStroke(x: number, y: number): void;
    StrokeTo(x: number, y: number): void;
    EndStroke(x: number, y: number): void;
}