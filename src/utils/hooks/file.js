import Gemini from "../../models/gemini.js";
import Invitation from "../../models/invitation.js";

const afterDelete = async (_id) => {
  //delete relevant documents
  await Invitation.deleteMany({ file: _id }, { multi: true });
  await Gemini.deleteMany({ file: _id }, { multi: true });
};

const FileHook = { afterDelete };

export default FileHook;
