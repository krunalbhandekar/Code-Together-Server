import User from "../../models/user.js";
import Invitation from "../../models/invitation.js";

const afterCreate = async (_id) => {
  const user = await User.findOne({ _id });
  if (!user) {
    return false;
  }

  // Update invitations of users who previously didn't have accounts.
  // Links these invitations to the newly created user's account.
  await Invitation.updateMany(
    { receiverEmail: user.email, receiver: null },
    { $set: { receiver: user._id } },
    { multi: true }
  );
};

const UserHook = { afterCreate };

export default UserHook;
