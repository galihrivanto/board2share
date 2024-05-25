import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-toolbox")
export class Toolbox extends LitElement {
    render() {
        return html`
            <div class="flex flex-row gap-2">
                <slot></slot>
            </div>
        `;
    }

    handleClear() {
        this.dispatchEvent(new CustomEvent("clear"));
    }

    static styles = css`
        .toolbox {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }

        button {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }
        `
}