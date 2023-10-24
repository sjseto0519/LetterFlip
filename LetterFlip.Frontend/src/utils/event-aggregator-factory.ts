import { EventAggregator } from "./event-aggregator";
import { Events } from "./events";

export class EventAggregatorFactory {

    private cache = new Map<string, EventAggregator<Events, HasId>>();

    get<TEvent extends Events, TData extends HasId>(event: TEvent, data: TData) {
      const key = `${event}-${data.id}`;
      let ea = this.cache.get(key);
      if (!ea) {
        ea = new EventAggregator<TEvent, TData>();
        this.cache.set(key, ea);
      }
      return ea;
    }

}