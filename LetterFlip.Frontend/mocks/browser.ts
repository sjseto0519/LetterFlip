import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker();

const startWorker = () => {
    worker.start();
    worker.use(...handlers);
}

export { startWorker }