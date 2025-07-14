// Utility function for robust authentication redirects
export const forceRedirectAfterAuth = async (maxAttempts = 5) => {
    let attempts = 0;

    const checkAndRedirect = async () => {
        attempts++;

        try {
            // Check if we have a session by calling a simple auth check
            const response = await fetch('/api/auth-status', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.authenticated && data.user) {
                    window.location.href = '/';
                    return;
                }
            }

            if (attempts < maxAttempts) {
                setTimeout(checkAndRedirect, 300);
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            if (attempts < maxAttempts) {
                setTimeout(checkAndRedirect, 300);
            } else {
                window.location.href = '/';
            }
        }
    };

    // Start checking immediately
    checkAndRedirect();
};

// Simple immediate redirect (backup option)
export const simpleRedirectAfterAuth = () => {
    setTimeout(() => {
        window.location.href = '/';
    }, 100);
};
