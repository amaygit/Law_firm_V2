import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Test SMS function
const testSMS = async () => {
  console.log("🧪 Testing AWS SNS SMS Configuration...\n");

  // 1. Check environment variables
  console.log("1️⃣ Checking environment variables...");
  if (!process.env.AWS_ACCESS_KEY_ID_SMS) {
    console.error("❌ AWS_ACCESS_KEY_ID not found in .env");
    return;
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY_SMS) {
    console.error("❌ AWS_SECRET_ACCESS_KEY not found in .env");
    return;
  }
  console.log("✅ AWS credentials found\n");

  // 2. Initialize SNS Client
  console.log("2️⃣ Initializing AWS SNS Client...");
  const snsClient = new SNSClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_SMS,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SMS,
    },
  });
  console.log("✅ SNS Client initialized\n");

  // 3. Prompt for phone number
  console.log("3️⃣ Test phone number:");
  const testPhoneNumber = process.argv[2] || "+919799129167"; // Pass as argument or use default
  console.log(`📱 Using: ${testPhoneNumber}\n`);

  // 4. Send test SMS
  console.log("4️⃣ Sending test SMS...");
  try {
    const message = `🧪 Test SMS from SAAJNA Legal

This is a test message to verify SMS functionality.

Time: ${new Date().toLocaleString("en-IN")}

If you received this, SMS is working correctly! ✅`;

    const params = {
      Message: message,
      PhoneNumber: testPhoneNumber,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "SAAJNA",
        },
      },
    };

    const command = new PublishCommand(params);
    const result = await snsClient.send(command);

    console.log("✅ SMS sent successfully!");
    console.log(`📬 Message ID: ${result.MessageId}`);
    console.log(`\n💡 Check your phone: ${testPhoneNumber}`);
    console.log("\n🎉 SMS configuration is working correctly!\n");
  } catch (error) {
    console.error("❌ Failed to send SMS:");
    console.error(`Error: ${error.message}`);
    console.error(`\nTroubleshooting:`);
    console.error(`1. Check AWS credentials are correct`);
    console.error(`2. Verify IAM user has SNS permissions`);
    console.error(`3. Check phone number format (must start with +)`);
    console.error(`4. Verify AWS region is correct\n`);
  }
};

// Run test
testSMS();
