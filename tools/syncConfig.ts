import * as fs from "fs";
import * as dotenv from "dotenv";

if (!fs.existsSync("./.env")) {
	console.error("No .env file found");
	fs.writeFileSync("./.env", "APP_ID=\nAPP_PUBLIC_KEY=\nAPP_TOKEN=\n");
}

dotenv.config();

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const config = JSON.parse(fs.readFileSync("./src/config/config.json", "utf8"));

config.meta.name = pkg.name;
config.meta.version = pkg.version;
config.meta.description = pkg.description;
// config.meta.homepage_url = pkg.homepage;
// config.meta.author = pkg.author;
// config.meta.contributors = pkg.contributors;
config.meta.license = pkg.license;
// config.meta.repository = pkg.repository.url;
// config.meta.homepage = pkg.homepage;
// config.meta.bugs = pkg.bugs.url;

fs.writeFileSync("./src/config/config.json", JSON.stringify(config, null, 2));

// ensure that the dist folder exists
if (!fs.existsSync("./dist/config")) {
	fs.mkdirSync("./dist/config");
}

fs.copyFileSync("./src/config/config.json", "./dist/config/config.json");

const distConfig = JSON.parse(
	fs.readFileSync("./dist/config/config.json", "utf8"),
);

distConfig.secrets = {};

distConfig.secrets.app_id = process.env.APP_ID;
distConfig.secrets.app_public_key = process.env.APP_PUBLIC_KEY;
distConfig.secrets.app_token = process.env.APP_TOKEN;
distConfig.secrets.signature_key_private = process.env.SIGNATURE_KEY_PRIVATE;
distConfig.secrets.signature_key_public = process.env.SIGNATURE_KEY_PUBLIC;

fs.writeFileSync(
	"./dist/config/config.json",
	JSON.stringify(distConfig, null, 2),
);
