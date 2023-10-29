import { Game, GameData } from "game";
import { SignalRService } from "signalr-service";
import { GameService } from "game-service";
import { autoinject } from 'aurelia-framework';

@autoinject
export class GameOverModalCustomElement {
    
    parentViewModel: Game;
    isGameOver = false;
    isNewGameRequested = false;
    winner = '';

    get winnerName() {
        if (this.winner) {
          return this.winner === 'player1' ? this.parentViewModel.playerName : this.parentViewModel.otherPlayerName;
        }
        else
        {
          return '';
        }
      }

    constructor(private signalRService: SignalRService) {

    }
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
      }

      playNewGame() {
        this.isNewGameRequested = true;
        this.signalRService.requestNewGame(this.parentViewModel.toGameData());
      }

      toggleGameOverModal() {
        this.isGameOver = !this.isGameOver;
      }
}