import { EventCallback, IData, ISubscriberContainer } from "interfaces/event-data";
import { IEventAggregator } from "./i-event-aggregator";
import { Subscriber } from "./subscriber";
import { ISortStrategy } from "./i-sort-strategy";
import { Events } from "./events";

// Event Aggregator class
export class EventAggregator implements IEventAggregator {
  private events: Map<Events, Subscriber<IData>[]> = new Map();
  private predefinedOrder: Map<Events, string[]> = new Map();
  private sortStrategy?: ISortStrategy;

  constructor() {
      // Initialize predefined order
      this.predefinedOrder.set(Events.GuessLetterCorrect, ['sub1', 'sub2', 'sub3']);
      this.predefinedOrder.set(Events.GuessWordCorrect, ['sub2', 'sub1']);
  }

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