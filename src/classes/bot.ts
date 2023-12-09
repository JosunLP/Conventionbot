import ConfigService from "../services/config.srvs.js";
import Cli from "./cli.js";

export default class HydeBot {
	private cli = Cli.getInstance();

	constructor() {
		ConfigService.getInstance();

		this.cli.start().catch((err) => {
			console.error(err);
			process.exit(1);
		});
	}
}
