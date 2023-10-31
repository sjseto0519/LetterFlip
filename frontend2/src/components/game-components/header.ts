import { Drawer } from "./drawer";
import { bindable, containerless, inject } from "aurelia";
import { type IGameService, MyGameService } from "../../interfaces/services";
import { Game } from "../game";
import { IRouter } from "@aurelia/router";

@containerless
@inject(MyGameService)
export class Header {
    
  @bindable parentViewModel?: Game;
    showGuessLetterModal = false;
    showGuessWordModal = false;
    drawerRef?: Drawer;

    constructor(public gameService: IGameService, @IRouter private router: IRouter) {

    }

    get playerName() {
        return this.parentViewModel?.playerName;
    }

    get otherPlayerName() {
        return this.parentViewModel?.otherPlayerName;
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
}