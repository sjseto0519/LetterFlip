import { HistoryItem } from "../../interfaces/game-data";
import { type IBabylonService, type IGameService, type ISignalRService, MyBabylonService, MyGameService, MySignalRService } from "../../interfaces/services";
import { type IEventAggregator, MyEventAggregator } from "../../interfaces/utils";
import { Game } from "../game";
import { bindable, containerless, inject } from "aurelia";

@containerless
@inject(MySignalRService, MyGameService, MyBabylonService, MyEventAggregator)
export class Drawer {
    
  @bindable parentViewModel?: Game;
    historyItems: HistoryItem[] = []; // Your history data
    message = '';
    showHistory = false;

    constructor(private signalRService: ISignalRService, private gameService: IGameService, private babylonService: IBabylonService, private eventAggregator: IEventAggregator) {

    }

    get windowWidth() {
        return Math.max(800, window.innerWidth);
      }
    
      get windowHeight() {
        return Math.max(512, window.innerHeight);
      }
    
      private resizeCanvas() {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        if (canvas) {
          canvas.width = this.windowWidth - 40;
          canvas.height = this.windowHeight - 40;
        }
      }

    attached() {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        canvas.width = this.windowWidth - 40;
        canvas.height = this.windowHeight - 40;
        this.babylonService.initialize(canvas, this.signalRService, this.eventAggregator);
        // Attach the window resize event listener
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    
detached() {
    // Remove the event listener when the component is detached
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }

      bound(initiator: any, parent: any) {
        if (this.parentViewModel) {
          this.parentViewModel.children.drawerRef = this;
        }
      }

      toggleHistory() {
        this.showHistory = !this.showHistory;
      }
      
      sendMessage() {
        this.historyItems.push({ item: this.message, yours: true, type: 'Message' });
        this.signalRService.sendMessage(this.message, this.gameService.gameState.gameId || '');
      }
    
      get reversedHistory() {
        return [...this.historyItems].reverse();
      }
  
}