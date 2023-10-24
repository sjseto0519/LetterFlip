import { EventHandler } from "./event-handler";
import { Events } from "./events";

export interface ISubscription {
    event: Events;
    handler: EventHandler<any>;
    subscriber: any;
    unsubscribe: () => void;
  }