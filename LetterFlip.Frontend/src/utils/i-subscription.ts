import { EventHandler } from "./event-handler";
import { Events } from "./events";

export interface ISubscription<TData> {
  event: Events;
  handler: EventHandler<TData>;
  subscriber: object;

  // Method to clear or reset the subscription fields.
  clear(): void;
}