import express from "express";
import HttpStatus from "http-status";
import File from "../models/file.js";
import Status from "../utils/enums/status.js";
import logger from "../utils/logger.js";
import ErrorMessages from "../utils/enums/error-messages.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const files = await File.find({ createdBy: req.user._id });
    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, files });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[get-files]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1001 });
  }
});

router.get("/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const file = await File.findOne({ _id }).populate([
      { path: "createdBy", select: { name: true, email: true } },
    ]);
    if (!file) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "File does not exists" });
    }

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, file });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[get-File]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1001 });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, language } = req.body;

    const file = await File.create({
      name,
      language,
      content: "",
      createdBy: req?.user ? req.user._id : null,
    });

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, file });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[create-file]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.delete("/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const file = await File.findOne({ _id, createdBy: req.user._id });
    if (!file) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "File does not exists" });
    }

    const result = await File.deleteOne({ _id });
    if (result.deletedCount > 0) {
      return res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
    }

    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1004 });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[delete-file]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1004 });
  }
});

export default router;
