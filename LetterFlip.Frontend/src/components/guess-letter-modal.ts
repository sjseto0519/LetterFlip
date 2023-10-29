import { Game } from "game";
import { SignalRService } from "signalr-service";
import { GameService } from "game-service";
import { HeaderCustomElement } from "./header";
import { autoinject } from 'aurelia-framework';
import { computedFrom } from 'aurelia-framework';

@autoinject
export class GuessLetterModalCustomElement {
    
    parentViewModel: Game;
    headerRef: HeaderCustomElement;
    guessedPositions = [];
    guessedPosition = 0;

    constructor(private signalRService: SignalRService, private gameService: GameService) {

    }
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
        this.headerRef = this.parentViewModel.headerRef;
      }

      @computedFrom('headerRef.showGuessLetterModal')
      get showGuessLetterModal() {
        return this.headerRef?.showGuessLetterModal;
      }

      submitLetterGuess() {
        const guessedLetter = this.guessedPositions.find(Boolean);
        if (guessedLetter) {
          this.signalRService.guessLetter(guessedLetter, this.guessedPosition, this.parentViewModel.toGameData().playerUrl, this.gameService.gameState.gameId);
          this.headerRef.toggleGuessLetterModal();
        }
      }

      toggleGuessLetterModal() {
        this.headerRef?.toggleGuessLetterModal();
      }

      updateGuess(position, value: string) {
        // Create a new array with all empty strings
        const newGuessedPositions = new Array(this.guessedPositions.length).fill('');
    
        // Update the selected position
        newGuessedPositions[position] = value.toUpperCase();
    
        // Replace the old array with the new one
        this.guessedPositions = newGuessedPositions;
    
        this.guessedPosition = position;
      }

      setGuessedPositions(difficulty: number) {
        this.guessedPositions = Array.from({ length: difficulty }, () => '');
      }

}