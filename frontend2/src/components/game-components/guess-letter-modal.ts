import { bindable, containerless, inject } from "aurelia";
import { Game } from "../game";
import { Header } from "./header";
import { type IGameService, type ISignalRService, MyGameService, MySignalRService } from "../../interfaces/services";

@containerless
@inject(MySignalRService, MyGameService)
export class GuessLetterModal {
    
  @bindable parentViewModel?: Game;
    headerRef?: Header;
    guessedPositions: string[] = [];
    guessedPosition = 0;

    constructor(private signalRService: ISignalRService, private gameService: IGameService) {

    }

      get showGuessLetterModal() {
        return this.headerRef?.showGuessLetterModal;
      }

      submitLetterGuess() {
        const guessedLetter = this.guessedPositions.find(Boolean);
        if (guessedLetter) {
          if (this.parentViewModel && this.headerRef) {
            this.signalRService.guessLetter(guessedLetter, this.guessedPosition, this.parentViewModel.toGameData().playerUrl, this.gameService.gameState.gameId || '');
            this.headerRef.toggleGuessLetterModal();
          }
        }
      }

      toggleGuessLetterModal() {
        this.headerRef?.toggleGuessLetterModal();
      }

      updateGuess(position: number, value: string) {
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