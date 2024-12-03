import OS from "../helper/os";

const javascript = [
  "run",
  "--rm",
  `--memory=${OS.memory}m`, // Dynamic memory limit
  `--memory-swap=${OS.memory}m`, // no extra momory use
  `--cpus=${OS.cpu}`, // Dynamic CPU limit
  "--network=none",
  "-i",
  "node:latest",
  "node",
];

const java = [
  "run",
  "--rm",
  `--memory=${OS.memory}m`,
  `--memory-swap=${OS.memory}m`,
  `--cpus=${OS.cpu}`,
  "--network=none",
  "-i",
  "openjdk",
  "/bin/bash",
  "-c",
  "javac Main.java && java Main",
];

const python = [
  "run",
  "--rm",
  `--memory=${OS.memory}m`,
  `--memory-swap=${OS.memory}m`,
  `--cpus=${OS.cpu}`,
  "--network=none",
  "-i",
  "python:latest",
  "python",
];

const ruby = [
  "run",
  "--rm",
  `--memory=${OS.memory}m`,
  `--memory-swap=${OS.memory}m`,
  `--cpus=${OS.cpu}`,
  "--network=none",
  "-i",
  "ruby:latest",
  "ruby",
];

const go = [
  "run",
  "--rm",
  `--memory=${OS.memory}m`,
  `--memory-swap=${OS.memory}m`,
  `--cpus=${OS.cpu}`,
  "--network=none",
  "-i",
  "golang",
  "/bin/bash",
  "-c",
  "go run main.go",
];

const DOCKER_CMD = { javascript, java, python, ruby, go };

export default DOCKER_CMD;
