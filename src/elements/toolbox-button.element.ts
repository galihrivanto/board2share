import { html } from "lit";
import { TailwindElement } from "./tailwind";
import { customElement } from "lit/decorators.js";

@customElement("toolbox-button")
export class ToolboxButton extends TailwindElement {
    render() {
        return html`
            <button type="button" @click=${this.handleClick} class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800">
                <slot></slot>
            </button>
        `
    }

    private handleClick(e: Event) {
        this.dispatchEvent(new CustomEvent("click", { bubbles: false}));
        e.preventDefault();
        e.stopPropagation();
    }
}