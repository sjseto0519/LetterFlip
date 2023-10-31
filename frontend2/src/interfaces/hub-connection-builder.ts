import { DataType } from "@builders/real-hub-connection-builder";

export interface IHubConnectionBuilder {

    start(): Promise<void>;
    invoke(methodName: string, ...params: any[]): Promise<any>;

    // Strongly typed callback registration
    on<T>(methodName: string, callback: (data: T) => void, dataType: DataType): void;

    // Lifecycle event handlers
    onReconnecting(callback: () => void): void;
    onReconnected(callback: () => void): void;
    onClose(callback: () => void): void;

}