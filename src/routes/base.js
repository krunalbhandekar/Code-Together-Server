import express from "express";
import HttpStatus from "http-status";

const router = express.Router();

router.get("/", async (_, res) => {
  res.status(HttpStatus.OK).send({ status: "success" });
});

export default router;
