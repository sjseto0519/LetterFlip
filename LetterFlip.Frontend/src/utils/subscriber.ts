import { EventCallback, IData, ISubscriberContainer } from "interfaces/event-data";

// Define a class to represent each subscriber
export class Subscriber<TData extends IData> implements ISubscriberContainer {
    public id: string;
    public callback: EventCallback<TData>;

    constructor(id: string, callback: EventCallback<TData>) {
        this.id = id;
        this.callback = callback;
    }
}