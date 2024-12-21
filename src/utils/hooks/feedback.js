import Feedback from "../../models/feedback.js";
import sendEmailNotification from "../services/nodemailser.js";

const afterCreate = async (_id) => {
  const feedback = await Feedback.findOne({ _id }).populate([
    { path: "createdBy", select: { name: true, email: true } },
  ]);
  if (!feedback) {
    return false;
  }

  //send thank-you email
  await sendEmailNotification({
    to: feedback.createdBy.email,
    subject: "Thank You!",
    text: `${feedback.createdBy.name} Thank You, for your feedback`,
  });
};

const FeedbackHook = { afterCreate };

export default FeedbackHook;
