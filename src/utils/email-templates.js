import path from "path";
import fs from "fs-extra";

const __dirname = process.cwd();

const templateIds = ["otp", "feedback_reply"]; // here ids means email template file name

const templatePaths = templateIds.reduce((acc, id) => {
  acc[id] = path.join(__dirname, `/src/assets/email-templates/${id}.html`);
  return acc;
}, {});

const getEmailTemplate = async ({ template_id }) => {
  const currentYear = new Date().getFullYear();

  let template = null;

  if (templatePaths[template_id]) {
    template = await fs.readFile(templatePaths[template_id], "utf-8");
    template = template.replace("{{YEAR}}", currentYear);
  }

  return template;
};

export default getEmailTemplate;
