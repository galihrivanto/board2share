import { html } from "lit";
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

@customElement("app-board")
export class Board extends TailwindElement {
    @property({ type: Number })
    width: number = 600;

    @property({ type: Number })
    height: number = 400;

    @state()
    board: IBoard | null = null;
    
    @state()
    canvasRef: Ref<HTMLCanvasElement> = createRef();

    @state()
    activeTool: string = "pencil";

    @state()
    strokeSize: number = 1;

    @state()
    eraseMode: boolean = false;

    render() {
        return html`
        <div class="contain backdrop-blur-none lg:backdrop-blur-sm bg-white/30 p-2 rounded-lg shadow-lg">
            <div class="flex flex-col gap-2 ">  
                <app-toolbox>
                    <toolbox-button ?active=${this.activeTool === "pencil"} @click=${() => this.changePainter("pencil")}>
                        <iconify-icon icon="mdi:pencil" class="text-lg"></iconify-icon>
                    </toolbox-button>
                    <toolbox-button ?active=${this.activeTool === "brush"} @click=${() => this.changePainter("brush")}>
                        <iconify-icon icon="mdi:brush" class="text-lg"></iconify-icon>
                    </toolbox-button>
                    <toolbox-button ?active=${this.activeTool === "spray"} @click=${() => this.changePainter("spray")}>
                        <iconify-icon icon="mdi:spray" class="text-lg"></iconify-icon>
                    </toolbox-button>
                    <toolbox-button ?active=${this.activeTool === "eraser"} @click=${() => this.toggleEraser()}>
                        <iconify-icon icon="mdi:eraser" class="text-lg"></iconify-icon>
                    </toolbox-button>
                    <input type="range" min="1" max="10" value=${this.strokeSize} @change=${(e: InputEvent) => this.strokeSize = parseInt((e.target as HTMLInputElement)?.value, 10) }>
                    <span class="px-4 py-1 bg-white">${this.strokeSize}</span>
                </app-toolbox>         
                <div class="border border-slate-300 cursor-crosshair" style="width:${this.width}px; height:${this.height}px;">
                    <canvas ${ref(this.canvasRef)} width=${this.width} height=${this.height}></canvas>
                </div>
                <color-palette @color-change=${this.handleColorChange}></color-palette>
            </div>
        </div>
        `;
    }  

    private toggleEraser() {
        this.eraseMode = !this.eraseMode;
        if (this.board) {
            this.board.SetEraseMode(this.eraseMode);
        }
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
            this.board = new CanvasBoard(canvas);
            this.board?.ChangeBackgroundColor("#ffffff");
        }
    }

    private registerPainters() {
        if (this.board && this.canvasRef.value) {
            this.board.RegisterPainter("pencil", new PencilPainter(this.canvasRef.value));
            this.board.RegisterPainter("brush", new BrushPainter(this.canvasRef.value));
            this.board.RegisterPainter("spray", new SprayPainter(this.canvasRef.value));
            
            this.board.RegisterEraser(new EraserPainter(this.canvasRef.value));
        }

        if (this.board) {
            this.activeTool = "pencil";
            this.board.SetActivePainter("pencil");
        }
    }

    protected override onWindowResized(): void {
        console.log(this.isLandscape, this.screenWidth, this.screenHeight)
        let w = this.isLandscape ? this.screenWidth : this.screenHeight;
    
        if (this.isLgAndUp) {
            this.width = 800;
            this.height = 3/4 * this.width;
        } else {
            this.width = w - 80;
            this.height = 3/4 * this.width;
        }

        console.log("w", this.width, "h", this.height)
    }

    updated(values: Map<string | number | symbol, unknown>) {
        if (values.has("strokeSize") && this.board) {
            this.board.SetStrokeSize(this.strokeSize);
        }
    }

    firstUpdated() {
        this.initBoard();
        this.registerPainters();

        this.canvasRef.value?.addEventListener('wheel', (e) => e.preventDefault(), true);
        this.canvasRef.value?.addEventListener('drag', (e) => e.preventDefault(), true);
    }
}