import { Game } from "game";
import { Router } from 'aurelia-router';
import { computedFrom } from 'aurelia-framework';
import { autoinject } from 'aurelia-framework';
import { DrawerCustomElement } from "./drawer";
import { GameService } from "game-service";

@autoinject
export class HeaderCustomElement {
    
    parentViewModel: Game;
    showGuessLetterModal = false;
    showGuessWordModal = false;
    drawer: DrawerCustomElement;

    constructor(public gameService: GameService, private router: Router) {

    }

    @computedFrom('parentViewModel.playerName')
    get playerName() {
        return this.parentViewModel?.playerName;
    }

    @computedFrom('parentViewModel.otherPlayerName')
    get otherPlayerName() {
        return this.parentViewModel?.otherPlayerName;
    }
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
        this.drawer = this.parentViewModel.drawerRef;
      }

      toggleHistory() {
        this.drawer.toggleHistory();
      }

    toggleGuessLetterModal() {
        this.showGuessLetterModal = !this.showGuessLetterModal;
      }
    
      toggleGuessWordModal() {
        this.showGuessWordModal = !this.showGuessWordModal;
      }
    
      exitGame() {
        this.router.navigateToRoute('join-game');
      }
}