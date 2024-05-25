import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CanvasBoard } from "../lib/board";
import { BrushPainter } from "../lib/brush";
import { TailwindElement } from "./tailwind";
import "./color-palette.element";
import "./toolbox.element";
import "./toolbox-button.element"
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
    eraseMode: boolean = false;

    render() {
        return html`
        <div class="flex flex-col gap-4">  
            <app-toolbox>
                <toolbox-button @click=${() => this.changePainter("pencil")}>Pencil</toolbox-button>
                <toolbox-button @click=${() => this.changePainter("brush")}>Brush</toolbox-button>
                <toolbox-button @click=${() => this.changePainter("spray")}>Spray</toolbox-button>
                <toolbox-button @click=${() => this.toggleEraser()}>${this.eraseMode ? "Disable" : "Enable"} Eraser</toolbox-button>
            </app-toolbox>         
            <div class="border border-slate-600 cursor-pointer">
                <canvas ${ref(this.canvasRef)} width=${this.width} height=${this.height}></canvas>
            </div>
            <color-palette @color-change=${this.handleColorChange}></color-palette>
        </div>
        `;
    }

    private toggleEraser() {
        console.log("toggle eraser", this.eraseMode)
        this.eraseMode = !this.eraseMode;
        if (this.board) {
            this.board.SetEraseMode(this.eraseMode);
        }
    }

    private changePainter(name: string) {
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

    firstUpdated() {
        this.initBoard();
        this.registerPainters();
    }
}