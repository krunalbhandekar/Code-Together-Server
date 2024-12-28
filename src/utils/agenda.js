import { Agenda } from "agenda";
import logger from "./logger.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let agenda = null;

const jobs = () => {
  agenda.define("check_inactivity", async () => {
    try {
      const res = await axios.get(process.env.SERVER_URL);
      logger.info("check_render_server_inactivity", res.data);
    } catch (err) {
      logger.error("check_render_server_inactivity", err.message);
    }
  });
};

const agendaInit = async () => {
  agenda = new Agenda({
    db: { address: process.env.MONGO_URL, collection: "jobSchedules" },
  });
  jobs();

  await agenda.start();

  const timezone = { timezone: "Asia/Kolkata" };

  // to avoid spin down run every hour
  await agenda.every("0 * * * *", "check_inactivity", {}, timezone);
};

export default agendaInit;
