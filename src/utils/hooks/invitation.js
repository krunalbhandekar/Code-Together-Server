import Invitation from "../../models/invitation.js";
import sendEmailNotification from "../services/nodemailser.js";

const afterCreate = async (_id) => {
  const invitation = await Invitation.findOne({ _id }).populate([
    { path: "sender", select: { name: true } },
  ]);
  if (!invitation) {
    return false;
  }

  await sendEmailNotification({
    to: invitation.receiverEmail,
    subject: "Invition for collaborator",
    text: `${invitation.sender.name} invited you`,
  });
};

const InvitationHook = { afterCreate };

export default InvitationHook;
