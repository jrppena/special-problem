import connectDB from "./mongodb.js"; // Adjust path if needed
import Config from "../models/config.model.js"; // Adjust path if needed

const initializeConfig = async () => {
  try {
    await connectDB(); // Reuse your existing DB connection setup

    // Optional: Prevent duplicate config entries
    const existing = await Config.findOne({});
    if (existing) {
      console.log("⚠️ Config already exists:", existing);
      return;
    }

    // Create the initial Config document
    const config = new Config({
      currentSchoolYear: "2024-2025",
      schoolYears: ["2023-2024", "2024-2025"]
    });

    await config.save();
    console.log("✅ Config initialized:", config);
  } catch (err) {
    console.error("❌ Failed to initialize config:", err);
  } finally {
    // Optional: Close connection after script completes
    process.exit(0);
  }
};

initializeConfig();
