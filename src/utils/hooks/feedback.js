import Feedback from "../../models/feedback.js";

const afterCreate = async (_id) => {
  const feedback = await Feedback.findOne({ _id });
  if (!feedback) {
    return false;
  }

  //send thank-you email
};

const FeedbackHook = { afterCreate };

export default FeedbackHook;
