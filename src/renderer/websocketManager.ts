import { EventEmitter } from 'events';
import { WebsocketEvent } from './websocketEvents';

export declare interface WebsocketManager {
  on(event: 'play', listener: Function): this;
  on(event: 'stop', listener: Function): this;
  on(event: 'seek', listener: (millisecond: number) => void): this;
}

export class WebsocketManager extends EventEmitter {
  constructor() {
    super();
    this.send = this.send.bind(this);
  }

  private connections: Set<WebSocket> = new Set();

  private handleMessage(data: string): void {
    if (typeof data !== 'string') {
      return;
    }
    const event = JSON.parse(data) as WebsocketEvent.Base;

    switch (event.type) {
      case 'play': {
        this.emit('play')
      } break;

      case 'stop': {
        this.emit('stop')
      } break;

      case 'seek': {
        const seekEvent = event as WebsocketEvent.Seek;
        const millisecond = seekEvent.millisecond;
        this.emit('seek', millisecond)
      } break;

      default:
        break;
    }
  }

  private send(string: string) {
    this.connections.forEach(connection => connection.send(string));
  }

  public connect(address: string) {
    const connection = new WebSocket(address);

    connection.addEventListener('close', () => {
      console.log('disconnected')
      this.connections.delete(connection);
    });

    connection.addEventListener('open', () => {
      console.log(`connected to ${connection.url}`);
      this.connections.add(connection);
    })

    connection.addEventListener('message', event => this.handleMessage(event.data));
  }

  public play() {
    const playEvent: WebsocketEvent.Play = { type: 'play' };
    this.send(JSON.stringify(playEvent));
  }

  public stop() {
    const stopEvent: WebsocketEvent.Stop = { type: 'stop' };
    this.send(JSON.stringify(stopEvent));
  }

  public seek(millisecond: number) {
    const seekEvent: WebsocketEvent.Seek = {
      type: 'seek',
      millisecond,
    };
    this.send(JSON.stringify(seekEvent));
  }
}
