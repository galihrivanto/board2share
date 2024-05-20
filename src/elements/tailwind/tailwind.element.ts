import { LitElement, unsafeCSS } from 'lit';

import style from './tailwind.global.css?inline';

const tailwindElement = unsafeCSS(style);

export function TailwindElementStyled(style?: unknown) {
  return class extends LitElement {
    static styles = [tailwindElement, unsafeCSS(style)];
  };
}

export const TailwindElement = TailwindElementStyled();