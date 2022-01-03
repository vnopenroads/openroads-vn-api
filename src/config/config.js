var environment = process.env.MACROCOSM_ENV || "local";
module.exports.config = require(`./${environment}`);

