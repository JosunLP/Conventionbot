import DiscordService from "../services/discord.srvs.js";

export default class Cli {
	private static instance: Cli;
	private isRunning = false;
	private discordService = DiscordService.getInstance();
	private commands = [
		{
			command: "help",
			description: "Lists all available commands.",
			execute: () => {
				Cli.renderHelp();
			},
		},
		{
			command: "exit",
			description: "Exits the bot.",
			execute: () => {
				console.log("Exiting...");
				this.isRunning = false;
				process.exit(0);
			},
		},
		{
			command: "connection",
			description: "Lists the bot's connection status.",
			execute: () => {
				Cli.log(
					`Logged in as ${this.discordService.getClient().user
						?.tag}!`,
				);
			},
		},
		{
			command: "send",
			description: "Sends a message to all buyers.",
			execute: () => {
				this.discordService.sendMessagesToBuyers();
			},
		},
	];

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
		this.isRunning = true;
		while (this.isRunning) {
			const input = await Cli.getInput();
			await Cli.handleInput(input);
		}
	}

	public async stop() {
		this.isRunning = false;
	}

	public static async getInput(): Promise<string> {
		return new Promise<string>((resolve) => {
			this.renderLine();
			console.log("Enter a command:");
			const stdin = process.openStdin();
			stdin.addListener("data", (data) => {
				const input = data.toString().trim();
				resolve(input);
			});
		});
	}

	public static async handleInput(input: string) {
		const command = this.instance.commands.find(
			(command) => command.command === input,
		);
		if (command) {
			command.execute();
		} else {
			this.renderUnknownCommand();
		}
	}

	public static renderHeader() {
		console.log("HydeBot v0.0.1");
		console.log("Running in CLI mode.");
		this.renderSpacers();
		console.log("Type 'help' for a list of commands.");
	}

	public static renderHelp() {
		Cli.renderSpacers();
		console.log("Available commands:");
		this.instance.commands.forEach((command) => {
			console.log(` - ${command.command}: ${command.description}`);
		});
		this.renderSpacers();
	}

	public static renderUnknownCommand() {
		console.log("Unknown command. Type 'help' for a list of commands.");
	}

	public static renderError(error: Error) {
		console.log("An error occured:");
		console.log(error);
	}

	public static renderSpacers() {
		console.log("\n");
	}

	public static renderLine() {
		console.log("--------------------------------------------------");
	}

	public static renderDivider() {
		console.log("==================================================");
	}

	public static renderList(list: string[]) {
		list.forEach((item) => {
			console.log(" - " + item);
		});
		this.renderSpacers();
	}

	public static renderObject(object: object) {
		console.log(JSON.stringify(object, null, 2));
		this.renderSpacers();
	}

	public static renderTable(table: any[]) {
		console.table(table);
		this.renderSpacers();
	}

	public static log(message: string) {
		const timeStamp = new Date().toLocaleString();
		console.log(timeStamp + ": " + message);
	}
}
