export enum StrokeState {
    Start = "stroke::start",
    Stroke = "stroke::stroke",
    End = "stroke::end",
    StartOutside = "stroke::start::outside",
    StrokeOutside = "stroke::stroke::outside",
    Clear = "clear"
}


export type PaintEvent = {
    source?: string;
    painter: string;
    strokeState: StrokeState;
    x: number;
    y: number;
    foregroundColor: string;
    backgroundColor: string;
    size: number;
}

export interface IBoard {
    OnPaint?: (event: PaintEvent) => void;
    ChangeForegroundColor(color: string): void;
    ChangeBackgroundColor(color: string): void;
    RegisterPainter(name: string, painter: IPainter): void;
    SetStrokeSize(size: number): void;
    SetActivePainter(name: string): void;
    SetPanningMode(enabled: boolean): void;
    ApplyPaint(event: PaintEvent): void;
    Clear(): void;
    Resize(width: number, height: number, unit: number): void;
    Export(): void;
    TransformCoordinates?: (x: number, y: number) => { x: number, y: number };
}

export interface IPainter {
    SetForegroundColor(color: string): void;
    SetBackgroundColor(color: string): void;
    SetSize(size: number): void;
    StartStroke(x: number, y: number): void;
    StrokeTo(x: number, y: number): void;
    EndStroke(x: number, y: number): void;
}

export interface ITransport {
    Connect(): void;
    Disconnect(): void;
    Send(data: any): void;
    OnReceive?: (data: any) => void;
    OnError?: (err: Error) => void;
    OnConnected?: () => void;
    OnDisconnected?: () => void;
}