import { spawn } from "child_process";
import DOCKER_CMD from "../constants/docker";
import { Socket } from "socket.io";

interface IRunDocker {
  socket: Socket;
  language: "javascript" | "java" | "python" | "ruby" | "go";
  content: string;
}

const runDocker = ({ socket, language, content }: IRunDocker) => {
  const docker = spawn("docker", DOCKER_CMD[language]);

  let hasOutput = false; // Flag to track if ther's any output

  // Write the user's code to Docker's STDIN
  docker.stdin.write(content);
  docker.stdin.end();

  // Stream real-time output from Docker to the client
  docker.stdout.on("data", (result) => {
    hasOutput = true; // Set flag to true if there's any output
    const resultStr = result.toString();
    socket.emit("execution-result", { result: resultStr });
  });

  // Stream error output from Docker to the client
  docker.stderr.on("data", (error) => {
    const errorMsg = error.toString();
    if (errorMsg.includes("out of memory")) {
      socket.emit("execution-result", {
        result: "Memory limit exceeded, execution failed.",
      });
    } else {
      socket.emit("execution-result", { result: errorMsg });
    }
  });

  const timeout = setTimeout(() => {
    docker.kill("SIGKILL"); // Stop the container if it exceeds allowed time
    socket.emit("execution-result", { result: "Execution timed out" });
  }, 5000);

  docker.on("close", () => {
    // If no output was emmited, send a default message
    if (!hasOutput) {
      socket.emit("execution-result", {
        result: "No output or return value from code",
      });
    }
    clearTimeout(timeout);
  });
};

export default runDocker;
