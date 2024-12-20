import Invitation from "../../models/invitation.js";

const afterCreate = async (_id) => {
  const invitation = await Invitation.findOne({ _id });
  if (!invitation) {
    return false;
  }

  // send email notification
};

const InvitationHook = { afterCreate };

export default InvitationHook;
