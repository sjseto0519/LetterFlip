import { Game } from "game";
import { DrawerCustomElement } from "./drawer";

export class ChatMessageCustomElement {
    
    parentViewModel: Game;
    drawerRef: DrawerCustomElement;
    showLastMessageToast = true;
    
    get lastElementWithTypeMessage() {
      return [...(this.drawerRef?.historyItems || [])].reverse().find(el => el.type === 'Message' && !el.yours);
    }

    get hasTypedElement() {
        return this.drawerRef?.historyItems.findIndex(el => !!el.type && !el.yours) > -1;
      }
    
    bind(bindingContext, overrideContext) {
        this.parentViewModel = bindingContext;
        this.drawerRef = this.parentViewModel.drawerRef;
      }

     
}