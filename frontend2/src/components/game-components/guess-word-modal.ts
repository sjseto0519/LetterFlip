import { Header } from "./header";
import { bindable, containerless, inject } from "aurelia";
import { type IGameService, type ISignalRService, MyGameService, MySignalRService } from "../../interfaces/services";
import { Game } from "../game";
import { ILifecycleEvent, type ILifecycleService, LifecycleHooks, MyLifecycleService } from "../../interfaces/lifecycle";

@containerless
@inject(MySignalRService, MyGameService, MyLifecycleService)
export class GuessWordModal {
    
  @bindable parentViewModel?: Game;
    headerRef?: Header;
    guessedWord = '';

    constructor(private signalRService: ISignalRService, private gameService: IGameService, private lifecycleService: ILifecycleService) {
      this.lifecycleService.subscribe(GuessWordModal, LifecycleHooks.Bound, this.handleLifecycleEvent.bind(this));
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
          this.parentViewModel.children.guessWordRef = this;
        }
        this.lifecycleService.notifyLifecycleEvent(GuessWordModal, LifecycleHooks.Bound);
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

      detached() {
        this.lifecycleService.unsubscribe(GuessWordModal, LifecycleHooks.Bound);
        this.lifecycleService.unregisterComponent(GuessWordModal);
      }

}