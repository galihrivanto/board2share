import { html } from "lit";
import { TailwindElement } from "./tailwind";
import { customElement, property } from "lit/decorators.js";

@customElement("toolbox-button")
export class ToolboxButton extends TailwindElement {
    @property({ type: Boolean })
    active: boolean = false;

    render() {
        return html`
            <button type="button" @click=${this.handleClick} class="text-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500 ${this.active ? "bg-blue-700 text-white" : ""}">
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