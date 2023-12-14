import BuyerService from "./services/buyer.srvs.js";
import ConfigService from "./services/config.srvs.js";
import Cli from "./services/cli.srvs.js";

/**
 * Hyde bot
 */
class HydeBot {
	private cli = Cli.getInstance();

	constructor() {
		ConfigService.getInstance();
		BuyerService.getInstance();

		this.cli.start().catch((err) => {
			console.error(err);
			process.exit(1);
		});
	}
}

new HydeBot();
