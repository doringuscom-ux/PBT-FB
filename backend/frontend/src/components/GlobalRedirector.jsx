import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

const GlobalRedirector = ({ children }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [hasRedirected, setHasRedirected] = useState(false);
    
    

    useEffect(() => {
        const checkRedirect = async () => {
            try {
                // Use the new efficient check endpoint
                const res = await api.get('/redirects/check', {
                    params: { path: location.pathname }
                });
                
                if (res.data && res.data.isActive) {
                    setHasRedirected(true);
                    window.location.replace(res.data.toUrl);
                } else {
                    setIsChecking(false);
                }
            } catch (err) {
                console.error("Redirect check failed", err);
                setIsChecking(false);
            }
        };

        checkRedirect();
    }, [location.pathname]);

    // During the initial check, return null or a minimal loader to prevent flash
    if (isChecking || hasRedirected) {
        return null; 
    }

    return children;
};

export default GlobalRedirector;
