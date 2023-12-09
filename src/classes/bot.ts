import Cli from "./cli.js";

export default class HydeBot {
	private cli = Cli.getInstance();

	constructor() {
		this.cli.start();
	}
}
