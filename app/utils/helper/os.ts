import os from "os";

// Get system memory and CPU info
const totalMemory = os.totalmem(); //in bytes
const cpuCount = os.cpus().length;

// Set dynamic limits (e.g. 25% of total memory and 1 cpu core)
const memoryLimitInMB = Math.floor((totalMemory * 0.025) / (1024 * 1024));
const cpuLimit = Math.min(cpuCount, 2);

const OS = { memory: memoryLimitInMB, cpu: cpuLimit };

export default OS;
