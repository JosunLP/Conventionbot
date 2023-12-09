import Cli from "./cli.js";

export default class HydeBot {
	private cli = Cli.getInstance();

	constructor() {
		this.start();
	}

	public async start() {
		await this.cli.start();
	}
}
