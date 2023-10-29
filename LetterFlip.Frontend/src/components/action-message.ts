import { Game } from "game";
import { DrawerCustomElement } from "./drawer";

export class ActionMessageCustomElement {
    
    parentViewModel: Game;
    drawerRef: DrawerCustomElement;
    showLastActionToast = true;

    get lastElementWithTypeAction() {
        return [...(this.drawerRef?.historyItems || [])].reverse().find(el => el.type !== 'Message');
    }
    
      get hasTypelessElement() {
        return this.drawerRef?.historyItems.findIndex(el => !el.type) > -1;
      }
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
        this.drawerRef = this.parentViewModel.drawerRef;
      }
}