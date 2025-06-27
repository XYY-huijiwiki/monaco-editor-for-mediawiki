import log from "loglevel";
import prefix from "loglevel-plugin-prefix";

prefix.reg(log);
prefix.apply(log, { format: () => "[ME4M]" });
log.setLevel(import.meta.env.DEV ? "debug" : "info");

export default log;
