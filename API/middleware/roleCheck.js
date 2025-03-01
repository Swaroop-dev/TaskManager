const roleCheck = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Not authorized for this action' });
      }
      
      next();
    };
  };
  
  module.exports = roleCheck;