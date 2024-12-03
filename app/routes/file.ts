import express, { Request, Response } from "express";
import HttpStatus from "http-status";
import Status from "../types/enums/status";
import ErrorMessages from "../types/enums/error-messages";
import File from "../models/file";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const files = await File.find({ createdBy: req.user._id });
    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, files });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[getFiles]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.get("/collab", async (req: Request, res: Response) => {
  try {
    const files = await File.find({ createdBy: req.user._id });
    res
      .status(HttpStatus.OK)
      .send({ status: Status.SUCCESS, collabFiles: files });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[getCollabFiles]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const _id: string = req.params.id;
  try {
    const file = await File.findOne({ _id }).populate([
      { path: "createdBy", select: { name: true, email: true } },
    ]);
    if (!file) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "File does not exists" });
      return;
    }
    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, file });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[getFile]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, language } = req.body;
    const file = await File.create({
      name,
      language,
      content: "",
      createdBy: req?.user ? req.user._id : null,
    });
    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, file });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[createFile]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const _id: string = req.params.id;
  try {
    const file = await File.findOne({ _id, createdBy: req.user._id });
    if (!file) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "File not found" });
      return;
    }

    const result = await File.deleteOne({ _id });
    if (result.deletedCount > 0) {
      res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
      return;
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: "Unable to delete the file" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[deleteFile]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

export default router;
