import Feedback from "../../models/feedback.js";
import sendEmailNotification from "../services/nodemailser.js";
import getEmailTemplate from "../email-templates.js";

const afterCreate = async (_id) => {
  const feedback = await Feedback.findOne({ _id }).populate([
    { path: "createdBy", select: { email: true } },
  ]);
  if (!feedback) {
    return false;
  }

  let emailTemplate = await getEmailTemplate({ template_id: "feedback_reply" });
  if (emailTemplate) {
    await sendEmailNotification({
      to: feedback.createdBy.email,
      subject: "Thank You for your feedback!",
      html: emailTemplate,
    });
  }
};

const FeedbackHook = { afterCreate };

export default FeedbackHook;
