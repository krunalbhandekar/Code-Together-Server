import { ObjectId } from "mongoose";

interface IFile {
  _id: ObjectId;
  name: string;
  language: string;
  content: string;
  createdBy: ObjectId;
}
