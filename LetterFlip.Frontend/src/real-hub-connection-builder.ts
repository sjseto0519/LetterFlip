import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { IHubConnectionBuilder } from 'interfaces/hub-connection-builder';

export class RealHubConnectionBuilder implements IHubConnectionBuilder {
    private hubConnection: HubConnection;

    constructor(url: string) {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .build();
    }

    async start() {
        await this.hubConnection.start();
    }

    async invoke(methodName: string, ...params: any[]) {
        return await this.hubConnection.invoke(methodName, ...params);
    }

    on<T>(methodName: string, callback: (data: T) => void) {
        this.hubConnection.on(methodName, callback);
    }

    onReconnecting(callback: () => void): void {
        this.hubConnection.onreconnecting(callback);
    }

    onReconnected(callback: () => void): void {
        this.hubConnection.onreconnected(callback);
    }

    onClose(callback: () => void): void {
        this.hubConnection.onclose(callback);
    }
}