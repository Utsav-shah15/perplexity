const mongoose=require("mongoose");
const Message = require("../models/message.model");

async function runMigration() {
  try {
    const messagesToMigrate = await Message.find({
      imageBase64: { $ne: null },
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });
    
    if (messagesToMigrate.length > 0) {
      console.log(`[Migration] Found ${messagesToMigrate.length} messages to migrate.`);
      for (const msg of messagesToMigrate) {
        msg.images = [
          {
            base64: msg.imageBase64,
            mimeType: msg.imageMimeType || "image/jpeg"
          }
        ];
        await msg.save();
      }
      console.log("[Migration] Migration completed successfully!");
    }
  } catch (error) {
    console.error("[Migration] Error running migration:", error);
  }
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");
    await runMigration();
  } catch (error) {
    console.log("Database Error:", error);
    process.exit(1);
  }
};

module.exports=connectDB;