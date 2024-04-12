const jwt = require('jsonwebtoken');

const verifyUser = async (req, res, next)=>{
    try {
        const authorizationHeader = req.header("Authorization");
    
        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            throw new Error("Not Authorized. Please provide a valid Bearer token.");
        }
    
        const accessToken = authorizationHeader.split(" ")[1];
    
        if (!accessToken) {
            throw new Error("Not Authorized. Please log in properly.");
        }
    
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
    
        req.user = payload;
    
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Token has expired' });
        } else {
            res.status(401).json({ error: error.message });
        }
    }
    
}

module.exports = verifyUser