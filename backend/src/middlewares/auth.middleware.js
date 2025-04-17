import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    // Logging function to help diagnose issues
    const logUnauthorized = (scenario) => {
        console.log(`Unauthorized access - ${scenario}`);
    };
    
    try {
        // Scenario 0: No cookie
        if (!req.cookies) {
            logUnauthorized('No cookie');
            return res.status(401).json({ message: 'Unauthorized - No Cookie' });
        }
        
        // Get token from cookies
        const token = req.cookies.jwt || req.cookies.token;
       
        // Scenario 1: Empty JWT cookie
        if (!token) {
            logUnauthorized('Empty JWT cookie');
            return res.status(401).json({ message: 'Unauthorized - Empty JWT Cookie' });
        }
        
        let decoded;
        try {
            // Verify the token
            decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS256'], // Restrict to a specific algorithm
                maxAge: '1d' // Optional: set expiration
            });
        } catch (verifyError) {
            // Handle different JWT verification errors
            if (verifyError.name === 'TokenExpiredError') {
                logUnauthorized('Expired token');
                return res.status(401).json({ message: 'Unauthorized - Expired Token' });
            }
            if (verifyError.name === 'JsonWebTokenError') {
                logUnauthorized('Malformed or tampered token');
                return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
            }
            throw verifyError; // Rethrow unexpected errors
        }
        
        // Find the user
        const user = await User.findById(decoded.userId).select("-password");
       
        if (!user) {
            logUnauthorized('Token with fake user ID');
            return res.status(401).json({ message: 'Unauthorized - User Not Found' });
        }
        
        // Set user in request
        req.user = user;
        
        // Get the current route path
        const path = req.path;
        
        // Define the paths that are accessible to all authenticated users regardless of status
        const publicAuthenticatedPaths = ['/check', '/logout'];
        const isPublicAuthenticatedPath = publicAuthenticatedPaths.some(publicPath => 
            path.endsWith(publicPath));
            
        // If not a public authenticated path, check account status
        if (!isPublicAuthenticatedPath && 
            user.accountStatus && 
            (user.accountStatus === "Rejected" || user.accountStatus === "Pending")) {
            return res.status(403).json({ 
                message: 'Access denied. Your account must be verified to access this resource.' 
            });
        }
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

