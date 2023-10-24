import { EventHandler } from "./event-handler";
import { Events } from "./events";
import { ISubscription } from "./i-subscription";

export class Subscription implements ISubscription {

    constructor(
      public event: Events, 
      public handler: EventHandler<any>,
      public subscriber: any
    ) {}
  
    unsubscribe = () => {
      // Unsubscribe logic
    }
  
  }