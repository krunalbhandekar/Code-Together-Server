import Invitation from "../../models/invitation.js";
import sendEmailNotification from "../services/nodemailser.js";
import getEmailTemplate from "../email-templates.js";

const afterCreate = async (_id) => {
  const invitation = await Invitation.findOne({ _id }).populate([
    { path: "sender", select: { name: true } },
  ]);
  if (!invitation) {
    return false;
  }

  let emailTemplate = await getEmailTemplate({ template_id: "collab_invite" });
  if (emailTemplate) {
    emailTemplate = emailTemplate
      .replace("{{SENDER}}", invitation.sender.name)
      .replace("{{LOGIN_LINK}}", `${process.env.REACT_APP_URL}/login`);

    await sendEmailNotification({
      to: invitation.receiverEmail,
      subject: "Collaboration Invitation",
      html: emailTemplate,
    });
  }
};

const InvitationHook = { afterCreate };

export default InvitationHook;
