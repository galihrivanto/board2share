import { LitElement, unsafeCSS } from 'lit';

import style from './tailwind.global.css?inline';

const tailwindElement = unsafeCSS(style);

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export function TailwindElementStyled(style?: unknown) {
  return class extends LitElement {
    static styles = [tailwindElement, unsafeCSS(style)];

    protected onWindowResized(): void {}

    private get xsQuery(): MediaQueryList {
      return window.matchMedia(`(max-width: ${BREAKPOINTS.sm}px)`);
    }

    protected get isXs(): boolean {
      return this.xsQuery.matches;
    }

    private get smQuery(): MediaQueryList {
      return  window.matchMedia(
        `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md}px)`
      )
    }

    protected get isSm(): boolean {
      return this.smQuery.matches;
    }

    private get smAndDownQuery(): MediaQueryList{
      return window.matchMedia(`(max-width: ${BREAKPOINTS.md}px)`)
    }

    protected get isSmAndDown(): boolean {
      return this.smAndDownQuery.matches;
    }

    protected get isSmAndUp(): boolean {
      return !this.isXs;
    }

    private get mdQuery(): MediaQueryList {
      return  window.matchMedia(
        `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg}px)`
      )
    }

    protected get isMd(): boolean {
      return this.mdQuery.matches;
    }

    private get mdAndDownQuery(): MediaQueryList{
      return window.matchMedia(`(max-width: ${BREAKPOINTS.lg}px)`)
    }

    protected get isMdAndDown(): boolean {
      return this.mdAndDownQuery.matches;
    }

    protected get isMdAndUp() {
      return !this.isMdAndDown || this.isMd;
    }

    private get lgQuery(): MediaQueryList { 
      return window.matchMedia(
        `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl}px)`
      )
    }

    protected get isLg(): boolean {
      return this.lgQuery.matches;
    }

    private get lgAndDownQuery(): MediaQueryList {
      return window.matchMedia(`(max-width: ${BREAKPOINTS.xl}px)`)
    }

    protected get isLgAndDown(): boolean {
      return this.lgAndDownQuery.matches;
    }

    protected get isLgAndUp() {
      return !this.isLgAndDown || this.isLg;
    }

    private get xlQuery(): MediaQueryList { 
      return window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`)
    }

    protected get isXl(): boolean {
      return this.xlQuery.matches;
    }

    protected get isMobile(): boolean {
      return this.isSmAndDown;
    }

    protected get screen(): Screen {
      return window.screen;
    }

    protected get isLandscape(): boolean {
      return this.screen.orientation.type.includes('landscape');
    }

    protected get isPortrait(): boolean {
      return this.screen.orientation.type.includes('portrait');
    }

    protected get screenRatio(): number {
      return this.screenWidth / this.screenWidth;
    }

    protected screenWidth: number = window.innerWidth;
    protected screenHeight: number = window.innerHeight;

    connectedCallback() {
      super.connectedCallback();
      window.addEventListener('resize', () => this.updateLayout());
      this.updateLayout();
    }

    disconnectedCallback() {
      window.removeEventListener('resize', () => this.updateLayout());
      super.disconnectedCallback();
    }
  
    updateLayout() {
      this.screenWidth = window.innerHeight;
      this.screenHeight = window.innerWidth;

      this.onWindowResized();
    }
  };
}

export const TailwindElement = TailwindElementStyled();