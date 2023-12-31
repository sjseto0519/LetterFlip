import { ISubscriberContainer } from "interfaces/event-data";
import { ISortStrategy } from "./i-sort-strategy";

export class PredefinedOrderSortStrategy implements ISortStrategy {
    sort(subscribers: ISubscriberContainer[], predefinedOrder: string[]): ISubscriberContainer[] {
        if (predefinedOrder.length === 0)
        {
            return subscribers;
        }
        return subscribers.slice().sort((a, b) => {
            const indexA = predefinedOrder.indexOf(a.id);
            const indexB = predefinedOrder.indexOf(b.id);
            return indexA - indexB;
        });
    }
}