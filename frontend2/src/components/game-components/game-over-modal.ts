import { bindable, containerless, inject } from "aurelia";
import { Game } from "../game";
import { type ISignalRService, MySignalRService } from "../../interfaces/services";

@containerless
@inject(MySignalRService)
export class GameOverModal {
    
  @bindable parentViewModel?: Game;
    isGameOver = false;
    isNewGameRequested = false;
    winner = '';

    get winnerName() {
        if (this.winner) {
          return this.winner === 'player1' ? this.parentViewModel?.playerName : this.parentViewModel?.otherPlayerName;
        }
        else
        {
          return '';
        }
      }

    constructor(private signalRService: ISignalRService) {

    }

      playNewGame() {
        this.isNewGameRequested = true;
        if (this.parentViewModel) {
          this.signalRService.requestNewGame(this.parentViewModel.toGameData());
        }
      }

      toggleGameOverModal() {
        this.isGameOver = !this.isGameOver;
      }
}