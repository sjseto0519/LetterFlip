import { Game, GameData, HistoryItem } from "game";
import { SignalRService } from "signalr-service";
import { GameService } from "game-service";
import { BabylonService } from "babylon-service";
import { EventAggregator } from "utils/event-aggregator";
import { autoinject } from 'aurelia-framework';

@autoinject
export class DrawerCustomElement {
    
    parentViewModel: Game;
    historyItems: HistoryItem[] = []; // Your history data
    message = '';
    showHistory = false;

    constructor(private signalRService: SignalRService, private gameService: GameService, private babylonService: BabylonService, private eventAggregator: EventAggregator) {

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
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
      }

      toggleHistory() {
        this.showHistory = !this.showHistory;
      }
      
      sendMessage() {
        this.historyItems.push({ item: this.message, yours: true, type: 'Message' });
        this.signalRService.sendMessage(this.message, this.gameService.gameState.gameId);
      }
    
      get reversedHistory() {
        return [...this.historyItems].reverse();
      }
  
}