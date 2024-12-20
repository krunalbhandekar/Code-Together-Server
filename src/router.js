const routerInit = (app) => {
  app.get("/", async (_, res) => {
    res.send({ status: "success" });
  });
};

export default routerInit;
