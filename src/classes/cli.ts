export default class Cli {
	private static instance: Cli;
	private isRunning = false;
	private constructor() {
		this.isRunning = true;
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Cli();
		}
		return this.instance;
	}

	public async start() {
		Cli.renderHeader();
		while (this.isRunning) {
			const input = await Cli.getInput();
			await Cli.handleInput(input);
		}
	}

	public static async getInput() {
		return new Promise<string>((resolve) => {
			const stdin = process.openStdin();
			stdin.addListener("data", (data) => {
				const input = data.toString().trim();
				resolve(input);
			});
		});
	}

	public static async handleInput(input: string) {
		switch (input) {
			case "help":
				Cli.renderHelp();
				break;
			case "exit":
				Cli.renderExit();
				this.instance.isRunning = false;
				process.exit(0);
				break;
			default:
				Cli.renderUnknownCommand();
				break;
		}
	}

	public static renderHeader() {
		console.log("HydeBot v0.0.1");
		console.log("Type 'help' for a list of commands.");
	}

	public static renderHelp() {
		console.log("Available commands:");
		console.log("help");
		console.log("exit");
	}

	public static renderExit() {
		console.log("Exiting...");
	}

	public static renderUnknownCommand() {
		console.log("Unknown command. Type 'help' for a list of commands.");
	}

	public static renderError(error: Error) {
		console.log("An error occured:");
		console.log(error);
	}
}
