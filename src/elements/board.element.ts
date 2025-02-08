import { TemplateResult, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CanvasBoard } from "../lib/board";
import { BrushPainter } from "../lib/brush";
import { TailwindElement } from "./tailwind";
import "./color-palette.element";
import "./toolbox.element";
import "./toolbox-button.element";
import "./analytics.element";
import "./size-button.element";
import "iconify-icon";
import { PencilPainter } from "../lib/pencil";
import { SprayPainter } from "../lib/spray";
import { EraserPainter } from "../lib/eraser";
import { IBoard, IPainter, ITransport, PaintEvent } from "../lib/types";
import { MQTTTransport } from "../lib/mqqt_transport";
import { PaintBucketPainter } from "../lib/paint_bucket";

interface PainterButton {
    name: string;
    icon: string;
    painter: IPainter;
}

@customElement("app-board")
export class Board extends TailwindElement {
    @property({ type: Number })
    width: number = 600;

    @property({ type: Number })
    height: number = 400;

    @property({ type: String, attribute: "transport-url"})
    transportURL: string = "";

    @state()
    clientID: string = "";

    @state()
    board: IBoard | null = null;

    @state()
    transport: ITransport | null = null;
    
    @state()
    canvasRef: Ref<HTMLCanvasElement> = createRef();

    @state()
    containerRef: Ref<HTMLDivElement> = createRef();

    @state()
    activeTool: string = "pencil";

    @state()
    strokeSize: number = 1;

    @state()
    eraseMode: boolean = false;

    @state()
    showShareToolbar: boolean = false;

    @state()
    shareID: string = "";

    @state()
    private scale: number = 1;

    @state()
    private offsetX: number = 0;

    @state()
    private offsetY: number = 0;

    @state()
    showQRDialog: boolean = false;

    @state()
    painters: PainterButton[] = [];

    @state()
    isPanningMode: boolean = false;

    private isDragging: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;
    private pinchStartDistance: number = 0;
    private interactionMode: 'draw' | 'pan' | 'none' = 'none';

    private renderQRDialog(): TemplateResult {
        return html`
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white p-6 rounded-lg shadow-xl">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Scan QR Code to Join Board</h3>
                        <button @click=${() => this.showQRDialog = false} class="text-gray-500 hover:text-gray-700">
                            <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                        </button>
                    </div>
                    <div class="flex justify-center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(window.location.href)}" 
                             alt="QR Code"
                             class="w-64 h-64">
                    </div>
                </div>
            </div>
        `;
    }

    renderShareToolbar(): TemplateResult {
        return html`
            <app-toolbox>
                <span class="w-fill text-slate-600">
                    ${window.location.href}
                </span>
                <toolbox-group>
                    <toolbox-button @click=${() => this.showQRDialog = true}>
                        <iconify-icon icon="mdi:qrcode" class="text-lg"></iconify-icon>
                    </toolbox-button>
                    <toolbox-button @click=${() => this.copyToClipboard(window.location.href)}>
                        <iconify-icon icon="mdi:content-copy" class="text-lg">
                        </iconify-icon>
                    </toolbox-button>
                </toolbox-group>
            </app-toolbox>
        `
    }

    render() {
        const shareToolbar = this.showShareToolbar ? this.renderShareToolbar() : '';
        const qrDialog = this.showQRDialog ? this.renderQRDialog() : '';

        return html`
        <div class="relative h-screen">
            <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div ${ref(this.containerRef)} 
                     class="cursor-move flex justify-center bg-slate-400"
                     style="transform: translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})">
                    <canvas ${ref(this.canvasRef)}></canvas>
                </div>
            </div>

            <div class="relative z-10">
                <div class="w-full flex justify-center p-4">
                    <div class="contain backdrop-blur-none lg:backdrop-blur-sm bg-white/80 p-2 rounded-lg shadow-lg">
                        <app-toolbox> 
                            <toolbox-group class="right-0">
                                <toolbox-button @click=${() => this.clearBoard()}>
                                    <iconify-icon icon="mdi:refresh" class="text-lg"></iconify-icon>
                                </toolbox-button>
                                <toolbox-button @click=${() => this.exportBoard()}>
                                    <iconify-icon icon="mdi:download" class="text-lg"></iconify-icon>
                                </toolbox-button>
                                <toolbox-button @click=${() => this.showShareToolbar = !this.showShareToolbar}>
                                    <iconify-icon icon="mdi:share-variant" class="text-lg"></iconify-icon>
                                </toolbox-button>
                            </toolbox-group>
                        </app-toolbox>
                        ${shareToolbar}
                    </div>
                </div>
            </div>

            <div class="fixed left-4 top-1/2 -translate-y-1/2 z-10">
                <div class="contain backdrop-blur-none lg:backdrop-blur-sm bg-white/80 p-2 rounded-lg shadow-lg">
                    <app-toolbox orientation="vertical">
                        <toolbox-group orientation="vertical">
                            ${this.painters.map((painter) => html`
                                <toolbox-button ?active=${this.activeTool === painter.name} @click=${() => this.changePainter(painter.name)}>
                                    <iconify-icon icon=${painter.icon} class="text-lg"></iconify-icon>
                                </toolbox-button>
                            `)}
                            <toolbox-button ?active=${this.isPanningMode} 
                                          @click=${() => this.togglePanningMode()}>
                                <iconify-icon icon="mdi:pan" class="text-lg"></iconify-icon>
                            </toolbox-button>
                            <size-button
                                .size=${this.strokeSize}
                                @size-change=${this.handleSizeChange}
                            >
                            </size-button>
                        </toolbox-group>
                    </app-toolbox>
                </div>
            </div>

            <div class="fixed bottom-0 w-full flex justify-center p-4 z-10">
                <div class="contain backdrop-blur-none lg:backdrop-blur-sm bg-white/80 p-2 rounded-lg shadow-lg">
                    <color-palette @color-change=${this.handleColorChange}></color-palette>
                </div>
            </div>

            ${qrDialog}
            <analytics-wrapper></analytics-wrapper>
        </div>
        `;
    }

    private togglePanningMode() {
        this.isPanningMode = !this.isPanningMode;
        this.interactionMode = this.isPanningMode ? 'pan' : 'draw';

        if (this.containerRef.value) {
            this.containerRef.value.style.cursor = this.isPanningMode ? 'move' : 'default';
        }

        if (this.board) {
            this.board.SetPanningMode(this.isPanningMode);
        }
    }

    private handleWheel(e: WheelEvent) {
        if (this.isPanningMode) {
            e.preventDefault();        

            const delta = -e.deltaY * 0.001;
            const newScale = Math.min(Math.max(this.scale + delta, 0.5), 5);
            const rect = this.containerRef.value?.getBoundingClientRect();
            
            if (rect) {
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                this.offsetX += mouseX * (1 - newScale/this.scale);
                this.offsetY += mouseY * (1 - newScale/this.scale);
                this.scale = newScale;
            }    
            
            this.requestUpdate();
        }
    }

    private handlePointerDown(e: PointerEvent) {
        if (this.isPanningMode) {
            this.interactionMode = 'pan';
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.containerRef.value?.setPointerCapture(e.pointerId);
        }
    }

    private handlePointerMove(e: PointerEvent) {
        if (this.isPanningMode && this.isDragging) {
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            
            this.requestUpdate();
        }
    }

    private handlePointerUp(e: PointerEvent) {
        this.isDragging = false;
        this.containerRef.value?.releasePointerCapture(e.pointerId);
    }

    private handleTouchStart(e: TouchEvent) {
        if (this.isPanningMode && e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.pinchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
        }
    }

    private handleTouchMove(e: TouchEvent) {
        if (this.isPanningMode && e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            
            const delta = currentDistance - this.pinchStartDistance;
            const newScale = Math.min(Math.max(this.scale + delta * 0.01, 0.5), 5);
            
            const rect = this.containerRef.value?.getBoundingClientRect();
            if (rect) {
                const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
                const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
                
                this.offsetX += centerX * (1 - newScale/this.scale);
                this.offsetY += centerY * (1 - newScale/this.scale);
                this.scale = newScale;
            }
            
            this.pinchStartDistance = currentDistance;
            this.requestUpdate();
        }
    }

    private handleSizeChange(e: CustomEvent<number>) {
        this.strokeSize = e.detail;
    }

    private clearBoard() {
        if (this.board) {
            this.board.Clear();
        }
    }

    private exportBoard() {
        if (this.board) {
            this.board.Export();
        }
    }

    private generateUniqueID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private changePainter(name: string) {
        if (this.isPanningMode) {
            this.togglePanningMode();
        }

        if (this.containerRef.value) {
            this.containerRef.value.style.cursor = 'default';
        }
        this.activeTool = name;
        if (this.board) {
            this.board.SetActivePainter(name);
        }
    }

    private handleColorChange(e: CustomEvent<string>) {
        if (this.board) {
            this.board.ChangeForegroundColor(e.detail);
        }
    }

    private getAdjustedCoordinates(x: number, y: number) {
        // Convert screen coordinates to canvas coordinates
        const coord = {
            x: x / this.scale,
            y: y / this.scale
        };

        return coord;
    }

    private initBoard() {
        const canvas = this.canvasRef.value;
        if (canvas) {
            let board = new CanvasBoard(canvas, this.clientID);
            board.ChangeBackgroundColor("#ffffff");
            board.OnPaint = (event: PaintEvent) => {
                // No need to adjust coordinates here anymore since they're already adjusted
                event.source = this.clientID;
                this.transport?.Send(event);
            }
            
            // Add coordinate transform function to the board
            board.TransformCoordinates = (x: number, y: number) => {
                return this.getAdjustedCoordinates(x, y);
            };

            this.board = board;
        }
    }

    private registerPainter(name: string, painter: IPainter) {
        this.painters.push({
            name: name,
            icon: `mdi:${name}`,
            painter: painter
        });

        if (this.board && this.canvasRef.value) {
            this.board.RegisterPainter(name, painter);
        }
    }

    private registerPainters() {
        if (this.board && this.canvasRef.value) {
            this.registerPainter("pencil", new PencilPainter(this.canvasRef.value));
            this.registerPainter("brush", new BrushPainter(this.canvasRef.value));
            this.registerPainter("spray", new SprayPainter(this.canvasRef.value));
            this.registerPainter("paint", new PaintBucketPainter(this.canvasRef.value));
            this.registerPainter("eraser", new EraserPainter(this.canvasRef.value));
        }

        if (this.board) {
            this.activeTool = "pencil";
            this.board.SetActivePainter("pencil");
        }
    }

    protected override onWindowResized(): void {
        let w = this.isLandscape ? this.screenWidth : this.screenHeight;
    
        if (this.isLgAndUp) {
            this.width = 800;
            this.height = 3/4 * this.width;
            this.board?.Resize(this.width, this.height, this.width / 800);
        } else {
            this.width = w - 80;
            this.height = 3/4 * this.width;
            this.board?.Resize(this.width, this.height, this.width / 800);
        }
    }

    updated(values: Map<string | number | symbol, unknown>) {
        if (values.has("strokeSize") && this.board) {
            this.board.SetStrokeSize(this.strokeSize);
        }
    }

    firstUpdated() {
        this.clientID = this.generateUniqueID();
        this.initBoard();
        this.registerPainters();
        this.initShareID();
        this.initTransport();
        this.onWindowResized();

        this.containerRef.value?.addEventListener('wheel', (e) => {
            e.preventDefault()
        }, true);
        this.containerRef.value?.addEventListener('touchstart', (e) => {
            e.preventDefault()
        }, true);

        if (this.containerRef.value) {
            this.containerRef.value.style.cursor = this.isPanningMode ? 'move' : 'default';
        }

        const container = this.containerRef.value;
        if (container) {
            container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
            container.addEventListener('pointerdown', this.handlePointerDown.bind(this));
            container.addEventListener('pointermove', this.handlePointerMove.bind(this));
            container.addEventListener('pointerup', this.handlePointerUp.bind(this));
            container.addEventListener('touchstart', this.handleTouchStart.bind(this));
            container.addEventListener('touchmove', this.handleTouchMove.bind(this));
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();

        if (this.transport) {
            this.transport.Disconnect();
        }
    }

    private initTransport() {
        if (!this.transportURL) {
            return;
        }

        this.transport = new MQTTTransport<PaintEvent>(this.transportURL, this.shareID);
        this.transport.Connect();
        this.transport.OnReceive = (data: PaintEvent) => {
            if (this.board && data.source !== this.clientID) {
                this.board.ApplyPaint?.(data);
            }
        }
    }

    private initShareID() {
        // load share id from url
        const url = new URL(window.location.href);
        const shareID = url.searchParams.get("share");
        if (shareID) {
            this.shareID = shareID;
        } else {
            this.shareID = this.generateUniqueID();
            url.searchParams.set("share", this.shareID);
            window.history.pushState({}, '', url.toString());
        }
    }

    private copyToClipboard(text: string): Promise<void> {
        if (!navigator.clipboard) {
          console.error('Clipboard API not available');
          return Promise.reject('Clipboard API not available');
        }
        
        return navigator.clipboard.writeText(text)
          .then(() => {
            console.log('Text copied to clipboard');
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      }
}