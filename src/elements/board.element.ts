import { TemplateResult, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CanvasBoard } from "../lib/board";
import { BrushPainter } from "../lib/brush";
import { TailwindElement } from "./tailwind";
import "./color-palette.element";
import "./toolbox.element";
import "./toolbox-button.element"
import "iconify-icon";
import { PencilPainter } from "../lib/pencil";
import { SprayPainter } from "../lib/spray";
import { EraserPainter } from "../lib/eraser";
import { IBoard, ITransport, PaintEvent } from "../lib/types";
import { MQTTTransport } from "../lib/mqqt_transport";
import { PaintBucketPainter } from "../lib/paint_bucket";

@customElement("app-board")
export class Board extends TailwindElement {
    @property({ type: Number })
    width: number = 600;

    @property({ type: Number })
    height: number = 400;

    @property({ type: String, attribute: "transport-url"})
    transportURL: string = "";

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

    // unique client id to differentiate between clients
    clientID: string = "";

    renderShareToolbar(): TemplateResult {
        return html`
            <app-toolbox>
                <span class="w-fill text-slate-600">
                    ${window.location.href}
                </span>
                <toolbox-group>
                    <toolbox-button>
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

        return html`
        <div class="contain backdrop-blur-none lg:backdrop-blur-sm bg-white/30 p-2 rounded-lg shadow-lg">
            <div class="flex flex-col gap-2 ">  
                <app-toolbox>
                    <toolbox-group>
                        <toolbox-button ?active=${this.activeTool === "pencil"} @click=${() => this.changePainter("pencil")}>
                            <iconify-icon icon="mdi:pencil" class="text-lg"></iconify-icon>
                        </toolbox-button>
                        <toolbox-button ?active=${this.activeTool === "brush"} @click=${() => this.changePainter("brush")}>
                            <iconify-icon icon="mdi:brush" class="text-lg"></iconify-icon>
                        </toolbox-button>
                        <toolbox-button ?active=${this.activeTool === "spray"} @click=${() => this.changePainter("spray")}>
                            <iconify-icon icon="mdi:spray" class="text-lg"></iconify-icon>
                        </toolbox-button>
                        <toolbox-button ?active=${this.activeTool === "paint_bucket"} @click=${() => this.changePainter("paint_bucket")}>
                            <iconify-icon icon="mdi:paint-bucket" class="text-lg"></iconify-icon>
                        </toolbox-button>
                        <toolbox-button ?active=${this.activeTool === "eraser"} @click=${() => this.changePainter("eraser")}>
                            <iconify-icon icon="mdi:eraser" class="text-lg"></iconify-icon>
                        </toolbox-button>
                        <input type="range" min="1" max="10" value=${this.strokeSize} @change=${(e: InputEvent) => this.strokeSize = parseInt((e.target as HTMLInputElement)?.value, 10) }>
                        <span class="px-4 py-1 bg-white">${this.strokeSize}</span>
                    </toolbox-group>
                    <toolbox-group>
                        <toolbox-button @click=${() => this.clearBoard()}>
                            <iconify-icon icon="mdi:refresh" class="text-lg"></iconify-icon>
                        </toolbox-button>
                        <toolbox-button @click=${() => this.showShareToolbar = !this.showShareToolbar}>
                            <iconify-icon icon="mdi:share-variant" class="text-lg"></iconify-icon>
                        </toolbox-button>
                    </toolbox-group>
                </app-toolbox> 
                ${shareToolbar}        
                <div ${ref(this.containerRef)} class="cursor-crosshair flex justify-center bg-slate-400">
                    <canvas ${ref(this.canvasRef)} width=${this.width} height=${this.height}></canvas>
                </div>
                <color-palette @color-change=${this.handleColorChange}></color-palette>
            </div>
        </div>
        `;
    }  

    private clearBoard() {
        if (this.board) {
            this.board.Clear();
        }
    }

    private generateUniqueID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private changePainter(name: string) {
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

    private initBoard() {
        const canvas = this.canvasRef.value;
        if (canvas) {
            let board = new CanvasBoard(canvas);
            board.ChangeBackgroundColor("#ffffff");
            board.OnPaint = (event: PaintEvent) => {
                event.source = this.clientID;
                this.transport?.Send(event);
            }
            this.board = board;
        }
    }

    private registerPainters() {
        if (this.board && this.canvasRef.value) {
            this.board.RegisterPainter("pencil", new PencilPainter(this.canvasRef.value));
            this.board.RegisterPainter("brush", new BrushPainter(this.canvasRef.value));
            this.board.RegisterPainter("spray", new SprayPainter(this.canvasRef.value));
            this.board.RegisterPainter("paint_bucket", new PaintBucketPainter(this.canvasRef.value));
            this.board.RegisterPainter("eraser", new EraserPainter(this.canvasRef.value));
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

        console.log("w", this.width, "h", this.height)
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