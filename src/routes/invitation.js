import express from "express";
import HttpStatus from "http-status";
import lodash from "lodash";
import File from "../models/file.js";
import User from "../models/user.js";
import Invitation from "../models/invitation.js";
import Status from "../utils/enums/status.js";
import ErrorMessages from "../utils/enums/error-messages.js";
import InvitationHook from "../utils/hooks/invitation.js";

const { has } = lodash;

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filters = JSON.parse(req.get("X-API-Filters") || "{}");

    const query = {};
    if (has(filters, "status")) {
      const value = filters.status;
      query.status = { $in: value };
    }
    if (has(filters, "file")) {
      const value = filters.file;
      query.file = { $in: value };
    }
    if (has(filters, "receiver")) {
      const value = filters.receiver;
      query.receiver = { $in: value };
    }

    const invitations = await Invitation.find(query).populate([
      { path: "receiver", select: { name: true, email: true } },
      { path: "sender", select: { name: true } },
      { path: "file", select: { name: true } },
    ]);

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, invitations });
  } catch (err) {
    if (err instanceof Error) {
      console.log("[get-invitations]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1001 });
  }
});

router.post("/", async (req, res) => {
  try {
    const { fileId, receiverEmail } = req.body;

    // only file admin can send invitation
    const file = await File.findOne({ _id: fileId, createdBy: req.user._id });
    if (!file) {
      return res.status(HttpStatus.OK).send({
        status: Status.ERROR,
        error:
          "File does not exists or you are not allow to invite collaborator",
      });
    }

    // check if the user is already a collaborator
    const isAlreadyCollaborator = await Invitation.findOne({
      status: "Accepted",
      file: fileId,
      receiverEmail,
    });
    if (isAlreadyCollaborator) {
      return res.status(HttpStatus.OK).send({
        status: Status.ERROR,
        error: `${receiverEmail} is already a collaborator of this file`,
      });
    }

    // delete previous invitatios of same email
    await Invitation.deleteMany({
      status: ["Pending", "Rejecteds"],
      file: fileId,
      receiverEmail,
    });

    const user = await User.findOne({ email: receiverEmail });

    const invitation = await Invitation.create({
      file: fileId,
      sender: req.user._id,
      receiver: user ? user._id : null,
      receiverEmail,
      status: "Pending",
    });

    if (user) {
      // send real-time notification if user exixts
    }

    // send email notification on receiver email
    await InvitationHook.afterCreate(invitation._id);

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS, invitation });
  } catch (err) {
    if (err instanceof Error) {
      console.log("[create-invitation]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.put(":id", async (req, res) => {
  const _id = req.params.id;
  const { status } = req.body;
  try {
    const invitation = await Invitation.findOne({
      _id,
      receiver: req.user._id,
      status: "Pending",
    });
    if (!invitation) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Invitation not found" });
    }
    const result = await Invitation.updateOne({ _id }, { $set: { status } });
    if (result.modifiedCount > 0) {
      return res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
    }

    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1004 });
  } catch (err) {
    if (err instanceof Error) {
      console.log("[update-invitation]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1004 });
  }
});

export default router;
