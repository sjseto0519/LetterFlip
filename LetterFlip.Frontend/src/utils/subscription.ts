import { EventHandler } from "./event-handler";
import { Events } from "./events";
import { ISubscription } from "./i-subscription";

export class Subscription<TEvent extends Events, TData> implements ISubscription<TData> {
  constructor(
      public event: TEvent,
      public handler: EventHandler<TData>,
      public subscriber: object
  ) {}

  clear() {
      this.event = null;
      this.handler = null;
      this.subscriber = null;
  }
}