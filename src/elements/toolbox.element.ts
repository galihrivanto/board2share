import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { TailwindElement } from "./tailwind";

@customElement("app-toolbox")
export class Toolbox extends TailwindElement {
    render() {
        return html`
            <div class="flex flex-row flex-wrap gap-2 items-center">
                <slot></slot>
            </div>
        `;
    }

    handleClear() {
        this.dispatchEvent(new CustomEvent("clear"));
    }

}