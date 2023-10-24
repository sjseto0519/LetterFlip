export interface EventHandler<T> {
    (data: T): void; 
}