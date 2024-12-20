import User from "../../models/user.js";

const afterCreate = async (_id) => {
  const user = await User.findOne({ _id });
  if (!user) return false;
};

const UserHook = { afterCreate };

export default UserHook;
