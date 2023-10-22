import { autoinject } from 'aurelia-framework';
import { BabylonService } from "babylon-service";
import { SignalRService } from 'signalr-service';

@autoinject
export class Game {
  constructor(private babylonService: BabylonService, private signalRService: SignalRService) { }

    private gameId: string;
    private playerName: string;
    private otherPlayerName: string;

  activate(params) {
    // Do something with the router parameters
    let { gameId, playerName, otherPlayerName } = params;
    // Initialize any class properties based on these
    this.gameId = gameId;
    this.playerName = playerName;
    this.otherPlayerName = otherPlayerName;
  }

  attached() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
    this.babylonService.initialize(canvas, this.signalRService, this.gameId, this.playerName, this.otherPlayerName);
  }
}