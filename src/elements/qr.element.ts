import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind";
import { QRCode, GradientType } from '@galihrivanto/fancy-qr';
import { html } from "lit";
import { Ref, ref, createRef } from 'lit/directives/ref.js';

@customElement("qr-code")
export class QRCodeElement extends TailwindElement {
    @property({ type: String })
    text: string = "";

    private qr: QRCode | null = null;
    container: Ref<HTMLElement> = createRef();

    private initQRCode() {
        console.log('initQRCode', this.container.value);
        if (!this.container.value) return;
        
        try {
            this.qr = new QRCode(360);
            this.qr.attachTo(this.container.value);
            this.qr.setText(this.text);

            // Apply QR code styling
            const gradientStyle = {
                type: GradientType.Radial,
                from: 'red',
                to: 'blue'
            };

            this.qr.setOuterFinder({
                shape: 'OuterFinder.Drop',
                fill: gradientStyle
            });

            this.qr.setInnerFinder({
                shape: 'InnerFinder.Drop',
                fill: gradientStyle
            });

            this.qr.setData({
                shape: 'Data.Circle',
                fill: gradientStyle
            });
        } catch (error) {
            console.error('Failed to initialize QR code:', error);
        }
    }

    updated(changedProperties: Map<string, any>) {
        super.updated(changedProperties);
        
        if (changedProperties.has('text') && this.qr) {
            try {
                this.qr.setText(this.text);
            } catch (error) {
                console.error('Failed to update QR code text:', error);
            }
        }
    }

    render() {
        return html`
            <div 
                ${ref(this.container)} 
                class="w-full h-full flex items-center justify-center"
            ></div>
        `;
    }

    firstUpdated() {
        this.initQRCode();
    }

    disconnectedCallback() {
        this.qr = null;
        super.disconnectedCallback();
    }
}