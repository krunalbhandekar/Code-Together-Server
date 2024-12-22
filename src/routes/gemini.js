import express from "express";
import HttpStatus from "http-status";
import lodash from "lodash";
import Gemini from "../models/gemini.js";
import Status from "../utils/enums/status.js";
import logger from "../utils/logger.js";
import ErrorMessages from "../utils/enums/error-messages.js";
import checkGeminiRateLimit from "../utils/middleware/checkGeminiRateLimit.js";
import getGeminiResponse from "../utils/services/gemini.js";
import File from "../models/file.js";

const { has } = lodash;

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filters = JSON.parse(req.get("X-API-Filters") || "{}");
    const query = { user: req.user._id };

    if (has(filters, "file")) {
      const value = filters.file;
      query.file = { $in: value };
    }

    const gemini = await Gemini.find(query);

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, gemini });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[get-gemini]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1001 });
  }
});

router.post("/", async (req, res) => {
  try {
    const rateLimit = await checkGeminiRateLimit();
    if (rateLimit.status === Status.ERROR) {
      return res.status(HttpStatus.OK).send(rateLimit);
    }

    const { prompt, file } = req.body;

    const geminiRes = await getGeminiResponse({ prompt });
    if (geminiRes.status === Status.ERROR) {
      return res.status(HttpStatus.OK).send(geminiRes);
    }

    await Gemini.create({
      file,
      user: req?.user ? req.user._id : null,
      prompt,
      response: geminiRes.response,
    });

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[create-gemini]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ _id: fileId });
    if (!file) {
      return res.status(HttpStatus.OK).send({
        status: Status.ERROR,
        error: "File does not exists",
      });
    }

    const result = await Gemini.deleteMany({
      file: fileId,
      user: req.user._id,
    });
    if (result.deletedCount > 0) {
      return res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
    }

    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1004 });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[delete-gemini]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1004 });
  }
});

export default router;
