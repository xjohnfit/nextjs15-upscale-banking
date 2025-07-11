'use client';

// Suppress React 19 compatibility warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
        // Skip React 19 ref warnings
        if (args[0] && typeof args[0] === 'string') {
            const message = args[0];
            if (
                message.includes(
                    'Accessing element.ref was removed in React 19'
                ) ||
                message.includes('ref is now a regular prop') ||
                message.includes('will be removed from the JSX Element type')
            ) {
                return;
            }
        }
        originalConsoleWarn(...args);
    };

    // Also suppress error messages related to React 19 ref warnings
    const originalConsoleError = console.error;
    console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string') {
            const message = args[0];
            if (
                message.includes(
                    'Accessing element.ref was removed in React 19'
                ) ||
                message.includes('ref is now a regular prop') ||
                message.includes('will be removed from the JSX Element type')
            ) {
                return;
            }
        }
        originalConsoleError(...args);
    };
}

export {};
