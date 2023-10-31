import { Game } from "../game";
import { Drawer } from "./drawer";
import { bindable, containerless } from "aurelia";

@containerless
export class ChatMessage {
    
  @bindable parentViewModel?: Game;
    drawerRef?: Drawer;
    showLastMessageToast = true;
    
    get lastElementWithTypeMessage() {
      return [...(this.drawerRef?.historyItems || [])].reverse().find(el => el.type === 'Message' && !el.yours);
    }

    get hasTypedElement() {
        if (!this.drawerRef)
        {
          return false;
        }
        return this.drawerRef.historyItems.findIndex(el => !!el.type && !el.yours) > -1;
      }
}