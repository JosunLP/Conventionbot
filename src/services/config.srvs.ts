import * as fs from "fs";
import { Config } from "../types/config.type";

export default class ConfigService {
	private static instance: ConfigService;
	private config: Config = {} as Config;

	private constructor() {
		this.config = this.load();
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new ConfigService();
		}
		return this.instance;
	}

	private load(): Config {
		const config = fs.readFileSync("./dist/config/config.json", "utf8");
		return JSON.parse(config) as Config;
	}

	public getConfig(): Config {
		return this.config;
	}
}
