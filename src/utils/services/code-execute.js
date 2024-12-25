import { spawn } from "child_process";

const javascript = ({ socket, content, runtime = 10000 }) => {
  const process = spawn("node", [], { stdio: ["pipe", "pipe", "pipe"] });

  let hasOutput = false;

  process.stdin.write(content);
  process.stdin.end();

  process.stdout.on("data", (result) => {
    hasOutput = true;
    const output = result.toString();
    socket.emit("execution-result", { result: output });
  });

  process.stderr.on("data", (error) => {
    const output = error.toString();
    if (output.includes("out of memory")) {
      socket.emit("execution-result", {
        result: "Memory limit exceeded, execution failed.",
      });
    } else {
      socket.emit("execution-result", { result: output });
    }
  });

  const timeout = setTimeout(() => {
    process.kill("SIGKILL"); // Stop the container if it exceeds allowed time
    socket.emit("execution-result", { result: "Execution timed out" });
  }, runtime);

  process.on("close", () => {
    // If no output was emmited, send a default message
    if (!hasOutput) {
      socket.emit("execution-result", {
        result: "No output or return value from code",
      });
    }

    clearTimeout(timeout);
  });
};

const python = ({ socket, content, runtime = 10000 }) => {
  const process = spawn("python", ["-u", "-c", content], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let hasOutput = false;

  process.stdout.on("data", (result) => {
    hasOutput = true;
    const output = result.toString();
    socket.emit("execution-result", { result: output });
  });

  process.stderr.on("data", (error) => {
    const output = error.toString();
    if (output.includes("out of memory")) {
      socket.emit("execution-result", {
        result: "Memory limit exceeded, execution failed.",
      });
    } else {
      socket.emit("execution-result", { result: output });
    }
  });

  const timeout = setTimeout(() => {
    process.kill("SIGKILL"); // Stop the container if it exceeds allowed time
    socket.emit("execution-result", { result: "Execution timed out" });
  }, runtime);

  process.on("close", () => {
    // If no output was emmited, send a default message
    if (!hasOutput) {
      socket.emit("execution-result", {
        result: "No output or return value from code",
      });
    }

    clearTimeout(timeout);
  });
};

const execute = { javascript, python };

export default execute;
