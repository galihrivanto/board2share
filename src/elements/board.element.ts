import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CanvasBoard } from "../lib/board";
import { BrushPainter } from "../lib/brush";
import { TailwindElement } from "./tailwind";

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

    render() {
        return html`
        <div class="border border-slate-600 cursor-pointer">
            <canvas ${ref(this.canvasRef)} width=${this.width} height=${this.height}></canvas>
        </div>
        `;
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
            this.board.RegisterPainter("brush", new BrushPainter(this.canvasRef.value));
        }

        if (this.board) {
            this.board.SetActivePainter("brush");
        }
    }

    firstUpdated() {
        this.initBoard();
        this.registerPainters();
    }
}