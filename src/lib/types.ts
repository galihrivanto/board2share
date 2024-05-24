interface IBoard {
    ChangeForegroundColor(color: string): void;
    ChangeBackgroundColor(color: string): void;
    RegisterPainter(name: string, painter: IPainter): void;
    SetActivePainter(name: string): void;
}

interface IPainter {
    SetColor(color: string): void;
    SetSize(size: number): void;
    StartStroke(x: number, y: number): void;
    StrokeTo(x: number, y: number): void;
    EndStroke(x: number, y: number): void;
}