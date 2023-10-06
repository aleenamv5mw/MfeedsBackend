const pino = require("pino");

module.exports = pino({
  bindings: (bindings) => {
    return {
      pid: bindings.pid,
      host: bindings.hostname,
      node_version: process.version,
    };
  }, //bind pid and hostname
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`, //customize time
});
