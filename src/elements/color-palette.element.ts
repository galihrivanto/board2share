import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind";
import { html } from "lit";
import 'iconify-icon';

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
    private readonly STORAGE_KEY = "color-palette";
    
    @property({ type: Number})
    width: number = 600;

    @property({ type: String }) 
    color =  msPaintPalette.black;

    @property({ type: Array }) 
    colors = this.loadColors();

    private loadColors(): string[] {
        const colors = localStorage.getItem(this.STORAGE_KEY);
        if (colors) {
            return JSON.parse(colors);
        }

        // fallback to default colors
        return Object.values(msPaintPalette);
    }

    private saveColors() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.colors));
    }

    private handleColorChange(color: string) {
        this.color = color;
        this.dispatchEvent(new CustomEvent<string>("color-change", {
            detail: color,
        }));
    }

    private handleRemoveColor(colorToRemove: string) {
        if (this.colors.length > 1) {  // Prevent removing all colors
            this.colors = this.colors.filter(color => color !== colorToRemove);
            this.saveColors();
            if (this.color === colorToRemove) {
                this.handleColorChange(this.colors[0]);
            }
        }
    }

    protected override onWindowResized(): void {
        let w = this.isLandscape ? this.screenWidth : this.screenHeight;
    
        if (this.isLgAndUp) {
            this.width = 800;
        } else {
            this.width = w - 80;
        }
    }

    firstUpdated() {
        this.onWindowResized();
    }

    render() {
        return html`
            <div class="relative" style="width: ${this.width}px">
                <div class="flex gap-1 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    ${this.colors.map((color) => html`
                        <div class="relative group flex-shrink-0">
                            <button 
                                class="rounded-full w-8 h-8 border-2 ${
                                    this.color === color ? "border-blue-500" : "border-slate-300"
                                }"
                                style="background-color: ${color}"
                                @click=${() => this.handleColorChange(color)}
                            ></button>
                            <button 
                                class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                                @click=${() => this.handleRemoveColor(color)}
                            >×</button>
                        </div>
                    `)}
                    <div class="relative flex-shrink-0">
                        <input 
                            type="color"
                            class="rounded-full w-8 h-8 border-2 border-slate-300 opacity-0 absolute inset-0 cursor-pointer"
                            @change=${(e: Event) => {
                                const newColor = (e.target as HTMLInputElement).value;
                                if (!this.colors.includes(newColor)) {
                                    this.colors = [...this.colors, newColor];
                                    this.saveColors();
                                }
                            }}
                        />
                        <div class="rounded-full w-8 h-8 border-2 border-slate-300 flex items-center justify-center bg-white">
                            <iconify-icon icon="mdi:plus" class="text-slate-300"></iconify-icon>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
} 
    