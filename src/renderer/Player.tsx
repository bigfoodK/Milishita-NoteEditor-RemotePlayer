import React, { createRef, Component } from 'react';
import path from 'path';
import { WebsocketManager } from './websocketManager';

export default class Player extends Component {
  constructor(props: any) {
    super(props);
    this.handleWebsocketPlay = this.handleWebsocketPlay.bind(this);
    this.handleWebsocketStop = this.handleWebsocketStop.bind(this);
    this.handleWebsocketSeek = this.handleWebsocketSeek.bind(this);
  }
  private websocketManager: WebsocketManager = new WebsocketManager();

  private ref = createRef<HTMLAudioElement>();

  private handleWebsocketPlay() {
    const element = this.ref.current;
    if (!element) {
      return;
    }

    element.play();
  }

  private handleWebsocketStop() {
    const element = this.ref.current;
    if (!element) {
      return;
    }

    element.pause();
  }

  private handleWebsocketSeek(millisecond: number) {
    const element = this.ref.current;
    if (!element) {
      return;
    }

    element.currentTime = millisecond / 1000;
  }

  public componentDidMount() {
    this.websocketManager.on('play', this.handleWebsocketPlay);
    this.websocketManager.on('stop', this.handleWebsocketStop);
    this.websocketManager.on('seek', this.handleWebsocketSeek);
    this.websocketManager.connect('ws://localhost:1235');
  }

  public componentWillUnmount() {
    this.websocketManager.removeListener('play', this.handleWebsocketPlay);
    this.websocketManager.removeListener('stop', this.handleWebsocketStop);
    this.websocketManager.removeListener('seek', this.handleWebsocketSeek);
  }

  public render() {
    return <audio
      controls
      ref={this.ref}
      src={path.join(__dirname, '../src/dear.mp3')}
      onPlay={() => this.websocketManager.play()}
      onPause={() => this.websocketManager.stop()}
      onSeeking={event => this.websocketManager.seek(event.currentTarget.currentTime * 1000)}
    ></audio>
  }
}
