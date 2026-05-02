require('dotenv').config();
const axios = require('axios');

const LOG_SERVER_URL = 'http://20.207.122.201/evaluation-service/logs'; 
const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";

const getAuthToken = async () => {
  try {
    const res = await axios.post(AUTH_URL, {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    });

    return res.data.access_token;

  } catch (err) {
    console.error("Auth failed:", err.response?.data || err.message);
  }
};

const sendLogToServer = async (logData) => {
try {
    const token = process.env.TOKEN || await getAuthToken();

    const response = await axios.post(
      LOG_SERVER_URL,
      logData,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json"
        }
      }
    );
 console.log("TOKEN USED:", token?.slice(0, 25));
return response.data;
} 
catch (err) {
console.error('API error Logging failed:', err.message);
}
};

module.exports = {
    sendLogToServer
};
