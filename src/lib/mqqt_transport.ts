import { ITransport } from "./types";
import mqtt, { MqttClient } from "mqtt";

export class MQTTTransport<T> implements ITransport {
    private _url: string = "";
    private _topic: string = "";
    private _client: MqttClient | null = null;

    constructor(url: string, topic: string) {
        this._url = url;
        this._topic = topic;
    }

    Connect(): void {
        const options = {
            keepalive: 30,
        }
    
        this._client = mqtt.connect(this._url, options);
        this._client.on('connect', () => {
            console.log("Connected to MQTT broker");

            if (this.OnConnected) {
                this.OnConnected();
            }

            this._client?.subscribe(this._topic, (err) => {
                if (err) {
                    console.error("Failed to subscribe to topic", this._topic);
                }
            });

        });

        this._client?.on('message', (_, message) => {
            if (this.OnReceive) {
                this.OnReceive(JSON.parse(message.toString()) as T);
            }
        });

        this._client?.on('error', (err) => {
            if (this.OnError) {
                this.OnError(err);
            }
        });

        this._client?.on('close', () => {
            if (this.OnDisconnected) {
                this.OnDisconnected();
            }
        });
    }

    Disconnect(): void {
        this._client?.end();
    }

    Send(data: T): void {
        if (this._client) {
            this._client.publish(this._topic, JSON.stringify(data));
        }
    }

    OnReceive?: ((data: T) => void);
    
    OnError?: ((err: Error) => void);

    OnConnected?: (() => void);

    OnDisconnected?: (() => void);
}