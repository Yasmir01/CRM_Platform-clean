import { processAutopayRules } from "../services/autopay";
import { pathToFileURL } from "url";

async function run() {
  const count = await processAutopayRules();
  // eslint-disable-next-line no-console
  console.log("Processed autopay rules:", count);
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
    return import.meta.url === entry;
  } catch {
    return false;
  }
})();

if (isMain) {
  run()
    .then(() => process.exit(0))
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
}
