import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind";
import { html } from "lit";

const msPaintPalette = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#FF0000",
    lime: "#00FF00",
    blue: "#0000FF",
    yellow: "#FFFF00",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    gray: "#808080",
    silver: "#C0C0C0",
    maroon: "#800000",
    olive: "#808000",
    green: "#008000",
    purple: "#800080",
    teal: "#008080",
    navy: "#000080",
};

@customElement("color-palette")
export class ColorPaletteElement extends TailwindElement {
    @property({ type: Number})
    width: number = 600;

    @property({ type: String }) 
    color =  msPaintPalette.black;

    @property({ type: Array }) 
    colors = [
        msPaintPalette.black,
        msPaintPalette.white,
        msPaintPalette.red,
        msPaintPalette.lime,
        msPaintPalette.blue,
        msPaintPalette.yellow,
        msPaintPalette.cyan,
        msPaintPalette.magenta,
        msPaintPalette.gray,
        msPaintPalette.silver,
        msPaintPalette.maroon,
        msPaintPalette.olive,
        msPaintPalette.green,
        msPaintPalette.purple,
        msPaintPalette.teal,
        msPaintPalette.navy,
    ];

    private handleColorChange(color: string) {
        this.color = color;
        this.dispatchEvent(new CustomEvent<string>("color-change", {
            detail: color,
        }));
    }

    render() {
        return html`
            <div class="flex flex-wrap gap-1" style="width:${this.width}">
                ${this.colors.map((color) => html`
                    <button 
                        class="rounded-full w-8 h-8 border-2 ${this.color === color ? "border-blue-500" : "border-white"}"
                        style="background-color: ${color}"
                        @click=${() => this.handleColorChange(color)}
                    ></button>
                `)}
            </div>
        `;
    }
    
} 
    