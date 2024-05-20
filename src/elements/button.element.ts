import { customElement } from 'lit/decorators.js';
import { TailwindElement } from './tailwind';

import { html } from 'lit';

@customElement('x-button')
export class XButton extends TailwindElement {
  render() {
    return html`<button class="bg-blue-200 text-yellow-200 p-2 rounded-full text-2xl">
      Hello World
    </button>`;
  }
}