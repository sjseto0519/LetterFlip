import { type ILifecycleService, MyLifecycleService, ILifecycleEvent, LifecycleHooks } from "../../interfaces/lifecycle";
import { Game } from "../game";
import { Drawer } from "./drawer";
import { bindable, containerless, inject } from "aurelia";

@containerless
@inject(MyLifecycleService)
export class ActionMessage {
    
    @bindable parentViewModel?: Game;
    drawerRef?: Drawer;
    showLastActionToast = true;

    constructor(private lifecycleService: ILifecycleService) {
      this.lifecycleService.subscribe(ActionMessage, LifecycleHooks.Bound, this.handleLifecycleEvent.bind(this));
    }

    private handleLifecycleEvent(event: ILifecycleEvent) {
      if (event.lifecycleHook === LifecycleHooks.Bound) {
        if (this.parentViewModel) {
          this.drawerRef = this.parentViewModel.children.drawerRef;
        }
      }
    }

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

      bound(initiator: any, parent: any) {
        if (this.parentViewModel) {
          this.parentViewModel.children.actionMessageRef = this;
        }
        this.lifecycleService.notifyLifecycleEvent(ActionMessage, LifecycleHooks.Bound);
      }

      detached() {
        this.lifecycleService.unsubscribe(ActionMessage, LifecycleHooks.Bound);
        this.lifecycleService.unregisterComponent(ActionMessage);
      }
}