import { spawn } from "child_process";

const getExecutionCommand = ({ language, content }) => {
  switch (language) {
    case "javascript":
      return { cmd: "node", args: [] };
    case "python":
      return { cmd: "python", args: ["-u", "-c", content] };
    default:
      throw new Error("Unsupported language");
  }
};

const executeCode = ({ socket, language, content }) => {
  const execution = getExecutionCommand({ language, content });

  const process = spawn(execution.cmd, execution.args, {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let hasOutput = false;

  if (language === "javascript") {
    process.stdin.write(content);
    process.stdin.end();
  }

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
  }, 10000);

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

export default executeCode;
