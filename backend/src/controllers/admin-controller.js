import User from '../models/user.model.js'

const getPendingUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, showAll = false, role } = req.query;
        
        console.log("Query Params: ", req.query);
        con
        // Build the query
        const query = { accountStatus: "Pending" };
        
        // Add role filter if provided
        if (role && (role === "Student" || role === "Teacher")) {
            query.role = role;
        }
        
        // Get total count for pagination
        const totalCount = await User.countDocuments(query);
        
        // If showAll is true, don't apply pagination
        let users;
        if (showAll === "true") {
            users = await User.find(query).sort({ createdAt: -1 });
        } else {
            // Apply pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            users = await User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
        }
        
        // Return users and total count
        res.json({
            users,
            totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit))
        });
    } catch (error) {
        console.log("Error in getPendingUsers: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

const verifyUser = async (req, res) => {
    const { userId } = req.params;
    const { isVerified } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.accountStatus = isVerified ? "Verified" : "Rejected";
        await user.save();
        return res.status(200).json({ message: "User verified successfully" });
    } catch(error) {
        console.log("Error in verifyUser: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

export const adminRoutes = {
    getPendingUsers,
    verifyUser
}