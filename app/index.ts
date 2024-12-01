import server from "./server";

const port = process.env.SERVER_PORT;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
