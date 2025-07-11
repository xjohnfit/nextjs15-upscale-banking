// Utility function for robust authentication redirects
export const forceRedirectAfterAuth = async (maxAttempts = 10) => {
    let attempts = 0;
    
    const checkAndRedirect = async () => {
        attempts++;
        
        try {
            // Check if we have a session cookie
            const response = await fetch('/api/debug-production', {
                method: 'GET',
                credentials: 'include',
            });
            
            const data = await response.json();
            
            if (data.cookies?.sessionExists) {
                console.log('Session confirmed, redirecting to dashboard...');
                window.location.replace('/');
                return;
            }
            
            if (attempts < maxAttempts) {
                console.log(`Session not ready, attempt ${attempts}/${maxAttempts}, retrying...`);
                setTimeout(checkAndRedirect, 200);
            } else {
                console.log('Max attempts reached, forcing redirect anyway...');
                window.location.replace('/');
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            if (attempts < maxAttempts) {
                setTimeout(checkAndRedirect, 200);
            } else {
                window.location.replace('/');
            }
        }
    };
    
    checkAndRedirect();
};
