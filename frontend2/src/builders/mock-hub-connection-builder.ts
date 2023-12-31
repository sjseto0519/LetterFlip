import { IHubConnectionBuilder } from "../interfaces/hub-connection-builder";

export interface InvokeMessagesResponse {
    messages: { messageName: string, delay: number }[]
}

export class MockHubConnectionBuilder implements IHubConnectionBuilder {

    private callbacks: { [key: string]: ((data: any) => void)[]} = {};
    private reconnectingCallbacks: (() => void)[] = [];
    private reconnectedCallbacks: (() => void)[] = [];
    private closeCallbacks: (() => void)[] = [];

    async start() {
        // simulate initial startup time
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    async invoke(methodName: string, ...params: any[]) {
        const messagesResponse: InvokeMessagesResponse = await fetch(`/hub/invoke/${methodName}`, {
            method: 'POST',
            body: JSON.stringify({ params }),
        }).then(res => res.json());
        for (const { messageName, delay } of messagesResponse.messages)
        {
            setTimeout(async () => {
                const response = await fetch(`/hub/invoke/${messageName}`, {
                    method: 'POST',
                    body: JSON.stringify({ params })
                })
                .then(res => res.json());

                this.triggerCallbacks(messageName, response);
            }, delay);
        }
    }

    on<T>(methodName: string, callback: (data: T) => void) {
        if (!this.callbacks[methodName]) {
            this.callbacks[methodName] = [];
        }
        this.callbacks[methodName].push(callback);
    }

    onReconnecting(callback: () => void): void {
        this.reconnectingCallbacks.push(callback);
    }

    onReconnected(callback: () => void): void {
        this.reconnectedCallbacks.push(callback);
    }

    onClose(callback: () => void): void {
        this.closeCallbacks.push(callback);
    }

    simulateReconnecting() {
        for (const callback of this.reconnectingCallbacks)
        {
            callback();
        }
    }

    simulateReconnected() {
        for (const callback of this.reconnectedCallbacks)
        {
            callback();
        }
    }

    simulateClose() {
        for (const callback of this.closeCallbacks)
        {
            callback();
        }
    }

    private triggerCallbacks(methodName: string, response: any) {
        const callbacks = this.callbacks[methodName] || [];
        callbacks.forEach(callback => {
            callback(response);
        });
    }
}