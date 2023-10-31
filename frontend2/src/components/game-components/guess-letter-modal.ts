import { bindable, containerless, inject } from "aurelia";
import { Game } from "../game";
import { Header } from "./header";
import { type IGameService, type ISignalRService, MyGameService, MySignalRService } from "../../interfaces/services";
import { ILifecycleEvent, type ILifecycleService, LifecycleHooks, MyLifecycleService } from "../../interfaces/lifecycle";

@containerless
@inject(MySignalRService, MyGameService, MyLifecycleService)
export class GuessLetterModal {
    
  @bindable parentViewModel?: Game;
    headerRef?: Header;
    guessedPositions: string[] = [];
    guessedPosition = 0;

    constructor(private signalRService: ISignalRService, private gameService: IGameService, private lifecycleService: ILifecycleService) {
      this.lifecycleService.subscribe(GuessLetterModal, LifecycleHooks.Bound, this.handleLifecycleEvent.bind(this));
    }

    private handleLifecycleEvent(event: ILifecycleEvent) {
      if (event.lifecycleHook === LifecycleHooks.Bound) {
        if (this.parentViewModel) {
          this.headerRef = this.parentViewModel.children.headerRef;
        }
      }
    }
  
      bound(initiator: any, parent: any) {
        if (this.parentViewModel) {
          this.parentViewModel.children.guessLetterRef = this;
        }
        this.lifecycleService.notifyLifecycleEvent(GuessLetterModal, LifecycleHooks.Bound);
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

      detached() {
        this.lifecycleService.unsubscribe(GuessLetterModal, LifecycleHooks.Bound);
        this.lifecycleService.unregisterComponent(GuessLetterModal);
      }

}