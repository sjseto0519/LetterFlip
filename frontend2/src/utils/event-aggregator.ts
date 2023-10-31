import { Subscriber } from "./subscriber";
import { Events } from "./events";
import { IEventAggregator, ISortStrategy } from "../interfaces/utils";
import { EventCallback, IData, ISubscriberContainer } from "../interfaces/event-data";

// Event Aggregator class
export class EventAggregator implements IEventAggregator {
  private events: Map<Events, Subscriber<IData>[]> = new Map();
  private predefinedOrder: Map<Events, string[]> = new Map();
  private sortStrategy?: ISortStrategy;

  initialize(sortStrategy: ISortStrategy): void {
      this.sortStrategy = sortStrategy;
  }

  // Subscribe to an event
  subscribe<TData extends IData>(eventName: Events, id: string, callback: EventCallback<TData>): void {
    if (!this.events.has(eventName)) {
        this.events.set(eventName, []);
    }

    // Add the subscriber to the list
    const newSubscriber = new Subscriber(id, callback);
    const subscribers = this.events.get(eventName);

    if (subscribers && this.sortStrategy) {
        // Use the sort strategy to sort subscribers
        const order = this.predefinedOrder.get(eventName) || [];
        subscribers.push(newSubscriber);
        
        // Cast to ISubscriberContainer for sorting
        const sortedSubscribers = this.sortStrategy.sort(subscribers as ISubscriberContainer[], order);
        
        this.events.set(eventName, sortedSubscribers as Subscriber<IData>[]);
    }
}

  // Unsubscribe from an event
  unsubscribe(eventName: Events, id: string): void {
      const subscribers = this.events.get(eventName);
      if (subscribers) {
          const index = subscribers.findIndex(sub => sub.id === id);
          if (index !== -1) {
              subscribers.splice(index, 1);
          }
      }
  }

  // Trigger an event
  publish<TData extends IData>(eventName: Events, data: TData): void {
      const subscribers = this.events.get(eventName);
      if (subscribers) {
          for (const subscriber of subscribers) {
              // Explicitly cast the callback to handle TData
              const callback = subscriber.callback as EventCallback<TData>;
              callback(data);
          }
      }
  }
}