import express from "express";
import HttpStatus from "http-status";
import Feedback from "../models/feedback.js";
import Status from "../utils/enums/status.js";
import logger from "../utils/logger.js";
import ErrorMessages from "../utils/enums/error-messages.js";
import FeedbackHook from "../utils/hooks/feedback.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate([
      { path: "createdBy", select: { name: true, email: true } },
    ]);
    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, feedbacks });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[get-feedbacks]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1001 });
  }
});

router.post("/", async (req, res) => {
  try {
    const { content } = req.body;

    const feedback = await Feedback.create({
      content,
      createdBy: req?.user ? req.user._id : null,
    });

    await FeedbackHook.afterCreate(feedback._id);

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, feedback });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[create-feedback]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

export default router;
