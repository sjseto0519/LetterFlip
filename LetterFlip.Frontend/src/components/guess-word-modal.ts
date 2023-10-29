import { Game } from "game";
import { SignalRService } from "signalr-service";
import { GameService } from "game-service";
import { HeaderCustomElement } from "./header";
import { autoinject } from 'aurelia-framework';
import { computedFrom } from 'aurelia-framework';

@autoinject
export class GuessWordModalCustomElement {
    
    parentViewModel: Game;
    headerRef: HeaderCustomElement;
    guessedWord = '';

    constructor(private signalRService: SignalRService, private gameService: GameService) {

    }
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
        this.headerRef = this.parentViewModel.headerRef;
      }

      @computedFrom('headerRef.showGuessWordModal')
      get showGuessWordModal() {
        return this.headerRef?.showGuessWordModal;
      }

      toggleGuessWordModal() {
        this.headerRef?.toggleGuessWordModal();
      }

      submitWordGuess() {
        if (this.guessedWord) {
          this.guessedWord = this.guessedWord.toUpperCase();
          this.signalRService.guessWord(this.guessedWord, this.parentViewModel.toGameData().playerUrl, this.gameService.gameState.gameId);
          this.headerRef.toggleGuessWordModal();
        }
      }

}