import { Drawer } from "./drawer";
import { bindable, containerless, inject } from "aurelia";
import { type IGameService, MyGameService } from "../../interfaces/services";
import { Game } from "../game";
import { IRouter } from "@aurelia/router";
import { ILifecycleEvent, type ILifecycleService, LifecycleHooks, MyLifecycleService } from "../../interfaces/lifecycle";

@containerless
@inject(MyGameService, MyLifecycleService)
export class Header {
    
  @bindable parentViewModel?: Game;
    showGuessLetterModal = false;
    showGuessWordModal = false;
    drawerRef?: Drawer;

    constructor(public gameService: IGameService, private lifecycleService: ILifecycleService, @IRouter private router: IRouter) {
      this.lifecycleService.subscribe(Header, LifecycleHooks.Bound, this.handleLifecycleEvent.bind(this));
    }

    private handleLifecycleEvent(event: ILifecycleEvent) {
      if (event.lifecycleHook === LifecycleHooks.Bound) {
        if (this.parentViewModel) {
          this.drawerRef = this.parentViewModel.children.drawerRef;
        }
      }
    }

    get playerName() {
        return this.parentViewModel?.playerName;
    }

    get otherPlayerName() {
        return this.parentViewModel?.otherPlayerName;
    }

      bound(initiator: any, parent: any) {
        if (this.parentViewModel) {
          this.parentViewModel.children.headerRef = this;
        }
        this.lifecycleService.notifyLifecycleEvent(Header, LifecycleHooks.Bound);
      }

      toggleHistory() {
        this.drawerRef?.toggleHistory();
      }

    toggleGuessLetterModal() {
        this.showGuessLetterModal = !this.showGuessLetterModal;
      }
    
      toggleGuessWordModal() {
        this.showGuessWordModal = !this.showGuessWordModal;
      }
    
      exitGame() {
        this.router.load('join-game');
      }

      detached() {
        this.lifecycleService.unsubscribe(Header, LifecycleHooks.Bound);
        this.lifecycleService.unregisterComponent(Header);
      }
}