import User from '../models/user.model.js'

const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ accountStatus: "Pending" });
        res.json(users);
    } catch (error) {
        console.log("Error in getPendingUsers: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

const verifyUser = async (req, res) => {
    const { userId } = req.params;
    const { isVerified } = req.body;

    console.log(isVerified);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.accountStatus = isVerified ? "Verified" : "Rejected";
        await user.save();
        return res.status(200).json({ message: "User verified successfully" });
    }catch(error){
        console.log("Error in verifyUser: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}
        


export const adminRoutes = {
    getPendingUsers,
    verifyUser
}