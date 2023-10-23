import { IHubConnectionBuilder } from "interfaces/hub-connection-builder";
import { DataType } from "real-hub-connection-builder";

export class DualHubConnectionBuilder {
    constructor(private hubConnectionBuilder: IHubConnectionBuilder) {}

    async start() {
        await this.hubConnectionBuilder.start();
    }

    async invoke(methodName: string, ...params: any[]) {
        return await this.hubConnectionBuilder.invoke(methodName, ...params);
    }

    on<T>(methodName: string, callback: (data: T) => void, dataType: DataType) {
        this.hubConnectionBuilder.on<T>(methodName, callback, dataType);
    }

    onReconnecting(callback: () => void) {
        this.hubConnectionBuilder.onReconnecting(callback);
    }

    onReconnected(callback: () => void) {
        this.hubConnectionBuilder.onReconnected(callback);
    }

    onClose(callback: () => void) {
        this.hubConnectionBuilder.onClose(callback);
    }

}