import { spawn } from "child_process";
import path from "path";
import fs from "fs-extra";

const __dirname = process.cwd();

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
    hasOutput = true;
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
    hasOutput = true;
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

const cpp = async ({ userId, socket, content, runtime = 10000 }) => {
  const userDir = path.join(__dirname, `codefiles/${userId}`);
  const exists = await fs.pathExists(userDir);

  if (!exists) {
    await fs.mkdir(userDir, { recursive: true });
  }

  const cppFilePath = path.join(userDir, "main.cpp");
  const exeFile = "temp.exe";
  await fs.writeFile(cppFilePath, content);

  const compileProcess = spawn("g++", [
    cppFilePath,
    "-o",
    path.join(userDir, exeFile),
    "-std=c++11",
  ]);

  compileProcess.stdout.on("data", (data) => {
    const output = data.toString();
    socket.emit("execution-result", { result: output });
  });

  compileProcess.stderr.on("data", (data) => {
    const errorOutput = data.toString();
    socket.emit("execution-result", {
      result: `Compilation error: ${errorOutput}`,
    });
  });

  compileProcess.on("close", (code) => {
    if (code === 0) {
      let hasOutput = false;
      const execProcess = spawn(path.join(userDir, exeFile));

      const timeout = setTimeout(() => {
        execProcess.kill("SIGKILL");
        socket.emit("execution-result", { result: "Execution timed out" });
      }, runtime);

      execProcess.stdout.on("data", (data) => {
        hasOutput = true;
        const output = data.toString();
        socket.emit("execution-result", { result: output });
      });

      execProcess.stderr.on("data", (data) => {
        hasOutput = true;
        const output = data.toString();
        socket.emit("execution-result", { result: output });
      });

      execProcess.on("close", () => {
        clearTimeout(timeout);
        fs.unlink(path.join(userDir, exeFile));
        fs.unlink(cppFilePath);

        if (!hasOutput) {
          socket.emit("execution-result", {
            result: "No output or return value from code",
          });
        }
      });
    } else {
      socket.emit("execution-result", { result: "Compilation failed" });
      fs.unlink(path.join(userDir, exeFile));
      fs.unlink(cppFilePath);
    }
  });
};

const execute = { javascript, python, cpp };

export default execute;
