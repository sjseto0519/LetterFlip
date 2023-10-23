import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { IHubConnectionBuilder } from 'interfaces/hub-connection-builder';

export enum DataType {
    User,
    Message,
    Timestamp
}

export class RealHubConnectionBuilder implements IHubConnectionBuilder {
    private hubConnection: HubConnection;
    private dataTypeMap: Map<DataType, string[]> = new Map([
        [DataType.User, ['id', 'name']],
        [DataType.Message, ['content', 'type']],
        [DataType.Timestamp, ['time']]
      ]);

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

    on<T>(methodName: string, callback: (data: T) => void, dataType: DataType) {
        const propertyNames = this.dataTypeMap.get(dataType) || [];
        this.hubConnection.on(methodName, (...args) => {
          const data = propertyNames.reduce((acc, propName, index) => {
            acc[propName] = args[index];
            return acc;
          }, {} as T);
          callback(data);
        });
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