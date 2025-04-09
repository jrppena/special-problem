import mongoose from "mongoose";


const configSchema = new mongoose.Schema({
    currentSchoolYear: {
        type: String,
        required: true,
    },
    schoolYears:{type: [String], required: true},
});


const Config = mongoose.model("Config", configSchema);
export default Config;

