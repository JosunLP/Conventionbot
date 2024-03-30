import { BuyerObject } from "../interfaces/buyerObject.interface.js";
import Buyer from "../models/buyer.model.js";
import { BuyerType } from "../enum/buyerType.enum.js";
import DatabaseService from "./database.srvs.js";
import Cli from "./cli.srvs.js";

export default class BuyerService {
	private static instance: BuyerService;
	private databaseService = DatabaseService.getInstance();

	private constructor() {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new BuyerService();
		}
		return this.instance;
	}

	private checkIfObjectIsBuyer(object: any): object is BuyerObject {
		return (
			typeof object.discord === "string" &&
			typeof object.name === "string" &&
			typeof object.sign === "string"
		);
	}

	public async getBuyers(): Promise<Buyer[]> {
		const buyer = this.databaseService.listAllDocuments<Buyer>("buyers");
		return buyer;
	}

	public async setBuyers(buyers: Buyer[]) {
		buyers.forEach((buyer) => {
			const b = this.databaseService.getDocument<Buyer>(
				"buyers",
				buyer.Id,
			);

			if (!b) {
				this.databaseService.createDocument("buyers", buyer);
			} else {
				Cli.warn(
					`Buyer with id ${buyer.Id} already exists in the database.`,
				);
			}
		});
	}

	public addBuyer(buyer: Buyer) {
		const b = this.databaseService.getDocument<Buyer>("buyers", buyer.Id);

		if (!b) {
			this.databaseService.createDocument("buyers", buyer);
		} else {
			Cli.warn(
				`Buyer with id ${buyer.Id} already exists in the database.`,
			);
		}
	}

	public removeBuyer(buyer: Buyer) {
		this.databaseService
			.deleteDocument("buyers", buyer)
			.then(() => {
				Cli.log(`Buyer with id ${buyer.Id} has been removed.`);
			})
			.catch((error) => {
				Cli.error(
					`Error while removing buyer with id ${buyer.Id}.`,
					error,
				);
			});
	}

	public clearBuyers() {
		this.databaseService
			.dropCollection("buyers")
			.then(() => {
				Cli.log("Buyers collection has been cleared.");
				this.databaseService.createCollection("buyers");
			})
			.catch((error) => {
				Cli.error("Error while clearing buyers collection.", error);
			});
	}

	public async getWaitingList(): Promise<Buyer[]> {
		const buyers = await this.getBuyers();
		return buyers.filter((buyer) => buyer.type === BuyerType.WAITING);
	}

	public async getBuyerList(): Promise<Buyer[]> {
		const buyers = await this.getBuyers();
		return buyers.filter((buyer) => buyer.type === BuyerType.BUYER);
	}

	public async getPotentialList(): Promise<Buyer[]> {
		const buyers = await this.getBuyers();
		return buyers.filter((buyer) => buyer.type === BuyerType.POTENTIAL);
	}

	public async getBuyerById(id: string): Promise<Buyer | undefined> {
		return (await this.getBuyers()).find((buyer) => buyer.Id === id);
	}

	public async getBuyerByDiscord(
		discord: string,
	): Promise<Buyer | undefined> {
		return (await this.getBuyers()).find(
			(buyer) => buyer.discord === discord,
		);
	}

	public async getBuyerByName(name: string): Promise<Buyer | undefined> {
		return (await this.getBuyers()).find((buyer) =>
			buyer.name.includes(name),
		);
	}
}
