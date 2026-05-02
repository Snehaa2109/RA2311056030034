const { sendLogToServer } = require("../services/loggerService");

const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service",
  "auth", "config", "middleware", "utils"
];

const Log = async (level, package, message) => {
  try {
    if (!validLevels.includes(level)) {
      throw new Error("Invalid level");
    }

    if (!validPackages.includes(package)) {
      throw new Error("Invalid package");
    }

    const logData = {
      stack: "backend",
      level,
      package: package,
      message
    };
 // Send log
    const response = await sendLogToServer(logData);
    if(response) {
        console.log("logID :",response.logID)
        console.log(response.message)
    }

  } 
  catch (err) {
    console.error("Logging Error:", err.message);
  }
};

module.exports = { Log };