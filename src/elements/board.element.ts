import { LitElement, css, html } from "lit";

export class Board extends LitElement {
    render() {
        return html`
            <div class="board">
                <div class="row">
                    <div class="cell">1</div>
                    <div class="cell">2</div>
                    <div class="cell">3</div>
                </div>
                <div class="row">
                    <div class="cell">4</div>
                    <div class="cell">5</div>
                    <div class="cell">6</div>
                </div>
                <div class="row">
                    <div class="cell">7</div>
                    <div class="cell">8</div>
                    <div class="cell">9</div>
                </div>
            </div>
        `;
    }

    static styles = css``
}