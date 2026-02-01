

export const sleep = (
    ms: number, 
    signal?: AbortSignal
): Promise<void> => {
    return new Promise((resolve, reject) => {
        
        if (signal?.aborted) return reject(new Error('Aborted'));

        const timeoutId = setTimeout(() => {
            if (signal) {
                signal.removeEventListener('abort', onAbort);
            } 
            resolve();
        }, ms);

        const onAbort = () => {
            clearTimeout(timeoutId);
            reject(new Error('Aborted'));
        };

        if (signal) {
            signal.addEventListener('abort', onAbort, { once: true });
        }
    });
};