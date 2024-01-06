import * as fs from "fs";
import * as path from "path";
import { SaveData } from "../types/saveData.type";
import DataService from "../services/data.srvs";

export default class Save {
	private static savePath = path.join(__dirname, "../data");
	private static fileName =
		crypto.randomUUID() + "_" + new Date().getFullYear() + "_data.json";

	private static dataService = DataService.getInstance();

	/**
	 * Saves the data to a JSON file
	 * @param data Data to save
	 * @param fileName File name
	 */
	static saveData() {
		if (!fs.existsSync(this.savePath)) {
			fs.mkdirSync(this.savePath);
		}

		const data: SaveData = {
			id: crypto.randomUUID(),
			date: new Date().toISOString(),
			potentialBuyers: this.dataService.getPotentialBuyers(),
			waitingList: this.dataService.getWaitingList(),
			buyers: this.dataService.getBuyers(),
		};

		const filePath = path.join(this.savePath, this.fileName);

		fs.writeFileSync(filePath, JSON.stringify(data));
	}
}
