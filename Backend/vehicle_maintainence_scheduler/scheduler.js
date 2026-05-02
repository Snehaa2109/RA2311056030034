require("dotenv").config();
const axios = require("axios");
const { Log } = require("../logging middleware/Handler/loggerMiddleware");

const DEPOT_API = "http://20.207.122.201/evaluation-service/depots";
const VEHICLE_API = "http://20.207.122.201/evaluation-service/vehicles";

const config = {
  headers: {
    Authorization: `Bearer ${process.env.TOKEN}`
}
};
// Logic
const optimizeTasks = (tasks, maxHours) => {
  const n = tasks.length;

  const dp = Array.from({ length: n + 1 }, () =>
    Array(maxHours + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = tasks[i - 1];

    for (let w = 0; w <= maxHours; w++) {
      if (Duration <= w) {
        dp[i][w] = Math.max(
          Impact + dp[i - 1][w - Duration], // take
          dp[i - 1][w]                      
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let w = maxHours;
  const selected = [];

  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(tasks[i - 1].TaskID);
      w -= tasks[i - 1].Duration;
    }
  }

  return {
    totalImpact: dp[n][maxHours],
    selectedTasks: selected.reverse()
  };
};


const runScheduler = async () => {
  try {
    Log("info", "service", "Fetching depots");

    const depotRes = await axios.get(DEPOT_API,config);
    const depots = depotRes.data.depots;

    Log("info", "service", "Fetching vehicles");

    const vehicleRes = await axios.get(VEHICLE_API,config);
    const tasks = vehicleRes.data.vehicles;

   const finalResult = [];

    for (const depot of depots) {
      const maxHours = depot.MechanicHours;

      Log("debug", "service", `Processing depot ${depot.ID}`);

      const { totalImpact, selectedTasks } =
        optimizeTasks(tasks, maxHours);

      finalResult.push({
        depotId: depot.ID,
        totalImpact,
        selectedTasks
      });
    }

    Log("info", "service", "Scheduling completed");

    console.log("FINAL OUTPUT:");
    console.log(JSON.stringify(finalResult, null, 2));

  } catch (error) {
    Log("error", "service", error.message);
  }
};

module.exports = { runScheduler };