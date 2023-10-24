import { EventAggregator } from "./event-aggregator";
import { Events } from "./events";

/**
 * EventAggregatorFactory class for creating and managing EventAggregator instances.
 */
export class EventAggregatorFactory {
  private instances: Map<EventDataPairs, any> = new Map();

  /**
   * Gets an existing EventAggregator instance or creates a new one.
   * 
   * @template TEvent - Type of events that can be published or subscribed to.
   * @template TData - Type of the data that will be sent with the event.
   * @param {EventDataPairs} pair - Enum key representing a pair of Event and Data types.
   * @return {EventAggregator<TEvent, TData>} - EventAggregator instance.
   */
  getEventAggregator<TEvent extends Events, TData>(pair: EventDataPairs): EventAggregator<TEvent, TData> {
    try {
      if (!this.instances.has(pair)) {
        const instance = new EventAggregator<TEvent, TData>();
        this.instances.set(pair, instance);
      }
      return this.instances.get(pair) as EventAggregator<TEvent, TData>;
    } catch (error) {
      console.error('An error occurred while getting the EventAggregator instance:', error);
      throw error;
    }
  }
}
