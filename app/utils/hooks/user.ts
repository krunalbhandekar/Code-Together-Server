import { ObjectId } from "mongoose";
import User from "../../models/user";

const afterCreate = async (_id: ObjectId) => {
  const user = await User.findOne({ _id });
  if (!user) return false;
};

const UserHook = { afterCreate };

export default UserHook;
