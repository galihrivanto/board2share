import { html, TemplateResult } from "lit";
import { TailwindElement } from "./tailwind";
import { customElement, property } from "lit/decorators.js";
import "./toolbox-button.element";

@customElement("size-button")
export class SizeButton extends TailwindElement {
    @property({ type: Number })
    size: number = 1;

    @property({ type: Boolean })
    active: boolean = false;

    @property({ type: Boolean })
    showSizeDialog: boolean = false;

    private renderSizeDialog(): TemplateResult {
        return html`
            <div class="fixed left-16 top-1/2 -translate-y-1/2 z-50">
                <div class="bg-white p-4 rounded-lg shadow-xl">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Adjust Stroke Size</h3>
                        <button @click=${() => this.showSizeDialog = false} class="text-gray-500 hover:text-gray-700">
                            <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                        </button>
                    </div>
                    <div class="flex flex-col items-center gap-4">
                        <input type="range" min="1" max="10" value=${this.size} 
                            @change=${this.handleChange}
                            class="w-64">
                        <span class="px-3 py-1 bg-slate-100 rounded">${this.size}</span>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const sizeDialog = this.showSizeDialog ? this.renderSizeDialog() : "";

        return html`
            <toolbox-button ?active=${this.active} @click=${() => this.showSizeDialog = true}>
                <p class="text-sm font-bold">${this.size}</p>
            </toolbox-button>
            ${sizeDialog}
        `
    }

    private handleChange(e: InputEvent) {
        this.size = parseInt((e.target as HTMLInputElement)?.value, 10);
        this.dispatchEvent(new CustomEvent("size-change", 
            { 
                bubbles: true,
                composed: true,
                detail: this.size
            }));
        e.preventDefault();
        e.stopPropagation();
    }
}