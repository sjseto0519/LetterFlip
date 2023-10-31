import { Constructable } from "aurelia";
import { IDisposable } from "../interfaces/lifecycle";

export class LifecycleSubscription implements IDisposable {

    componentName: Constructable | null;

    constructor(componentName: Constructable) {
        this.componentName = componentName;
    }

    dispose() {
        this.componentName = null;
    }

}