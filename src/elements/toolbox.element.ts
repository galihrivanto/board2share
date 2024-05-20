import { LitElement, css, html } from "lit";

export class Toolbox extends LitElement {
    render() {
        return html`
            <div class="toolbox">
                <button @click=${this.handleClear}>Clear</button>
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