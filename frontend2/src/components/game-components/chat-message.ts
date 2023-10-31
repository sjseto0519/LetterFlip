import { MyLifecycleService, type ILifecycleService, ILifecycleEvent, LifecycleHooks } from "../../interfaces/lifecycle";
import { Game } from "../game";
import { Drawer } from "./drawer";
import { bindable, containerless, inject } from "aurelia";

@containerless
@inject(MyLifecycleService)
export class ChatMessage {
    
  @bindable parentViewModel?: Game;
    drawerRef?: Drawer;
    showLastMessageToast = true;

    constructor(private lifecycleService: ILifecycleService) {
      this.lifecycleService.subscribe(ChatMessage, LifecycleHooks.Bound, this.handleLifecycleEvent.bind(this));
    }

    private handleLifecycleEvent(event: ILifecycleEvent) {
      if (event.lifecycleHook === LifecycleHooks.Bound) {
        if (this.parentViewModel) {
          this.drawerRef = this.parentViewModel.children.drawerRef;
        }
      }
    }
    
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

      bound(initiator: any, parent: any) {
        if (this.parentViewModel) {
          this.parentViewModel.children.chatMessageRef = this;
        }
        this.lifecycleService.notifyLifecycleEvent(ChatMessage, LifecycleHooks.Bound);
      }
     
      detached() {
        this.lifecycleService.unsubscribe(ChatMessage, LifecycleHooks.Bound);
        this.lifecycleService.unregisterComponent(ChatMessage);
      }
}