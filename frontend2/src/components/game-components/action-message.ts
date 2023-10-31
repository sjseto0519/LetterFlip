import { Game } from "../game";
import { Drawer } from "./drawer";
import { bindable, containerless } from "aurelia";

@containerless
export class ActionMessage {
    
    @bindable parentViewModel?: Game;
    drawerRef?: Drawer;
    showLastActionToast = true;

    get lastElementWithTypeAction() {
        return [...(this.drawerRef?.historyItems || [])].reverse().find(el => el.type !== 'Message');
    }
    
      get hasTypelessElement() {
        if (!this.drawerRef)
        {
          return false;
        }
        return this.drawerRef.historyItems.findIndex(el => !el.type) > -1;
      }
}