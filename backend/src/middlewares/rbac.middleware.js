export const studentSpecificRoute = async (req, res, next) => {
    try {
        // Check if the user is a student
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Access denied. This route is for students only.' });
        }
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in studentSpecificRoute middleware: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const adminSpecificRoute = async (req, res, next) => { 
    try {
        // Check if the user is an admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. This route is for admins only.' });
        }
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in adminSpecificRoute middleware: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const teacherSpecificRoute = async (req, res, next) => {
    try {
        // Check if the user is a teacher
        if (req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Access denied. This route is for teachers only.' });
        }
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in teacherSpecificRoute middleware: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const teacherOrAdminSpecificRoute = async (req, res, next) => {
    try {
        // Check if the user is a teacher or admin
        if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. This route is for teachers or admins only.' });
        }
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in teacherOrAdminSpecificRoute middleware: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}