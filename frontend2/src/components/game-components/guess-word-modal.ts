import { Header } from "./header";
import { bindable, containerless, inject } from "aurelia";
import { type IGameService, type ISignalRService, MyGameService, MySignalRService } from "../../interfaces/services";
import { Game } from "../game";

@containerless
@inject(MySignalRService, MyGameService)
export class GuessWordModal {
    
  @bindable parentViewModel?: Game;
    headerRef?: Header;
    guessedWord = '';

    constructor(private signalRService: ISignalRService, private gameService: IGameService) {

    }

      get showGuessWordModal() {
        return this.headerRef?.showGuessWordModal;
      }

      toggleGuessWordModal() {
        this.headerRef?.toggleGuessWordModal();
      }

      submitWordGuess() {
        if (this.guessedWord) {
          this.guessedWord = this.guessedWord.toUpperCase();
          if (this.parentViewModel && this.headerRef) {
            this.signalRService.guessWord(this.guessedWord, this.parentViewModel.toGameData().playerUrl, this.gameService.gameState.gameId || '');
            this.headerRef.toggleGuessWordModal();
          }
        }
      }

}