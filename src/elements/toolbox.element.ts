import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind";

@customElement("toolbox-group")
export class ToolboxGroup extends TailwindElement {
    @property({ type: String })
    orientation: 'horizontal' | 'vertical' = 'horizontal';

    render() {
        return html`
            <div class="flex ${this.orientation === 'horizontal' ? 'flex-row' : 'flex-col'} flex-wrap gap-2 items-center">
                <slot></slot>
            </div>
        `;
    }

}

@customElement("app-toolbox")
export class Toolbox extends TailwindElement {
    @property({ type: String })
    orientation: 'horizontal' | 'vertical' = 'horizontal';

    render() {
        return html`
            <div class="flex ${this.orientation === 'horizontal' ? 'flex-row' : 'flex-col'} flex-wrap gap-2 items-center justify-between">
                <slot></slot>
            </div>
        `;
    }

    handleClear() {
        this.dispatchEvent(new CustomEvent("clear"));
    }
}