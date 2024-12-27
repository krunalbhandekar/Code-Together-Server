import { Agenda } from "agenda";
import logger from "./logger.js";

let agenda = null;

const jobs = () => {
  agenda.define("check_inactivity", () => {
    logger.info("check_render_server_inactivity");
  });
};

const agendaInit = async () => {
  agenda = new Agenda({
    db: { address: process.env.MONGO_URL, collection: "jobSchedules" },
  });
  jobs();

  await agenda.start();

  const timezone = { timezone: "Asia/Kolkata" };

  // to avoid spin down
  await agenda.every("14 minutes", "check_inactivity", {}, timezone);
};

export default agendaInit;
