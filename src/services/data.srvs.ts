import Buyer from "../models/buyer.model.js";
import DatabaseService from "../services/database.srvs.js";

export default class DataService {
	private static instance: DataService;
	private databaseService: DatabaseService = DatabaseService.getInstance();

	private potentialBuyersLabel: string = "potentialBuyers";
	private waitingListLabel: string = "waitingList";
	private buyersLabel: string = "buyers";

	private constructor() {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new DataService();
		}
		return this.instance;
	}

	public getPotentialBuyers(): Buyer[] | Promise<Buyer[]> {
		const buyers = this.databaseService
			.listAllDocuments<Buyer>(this.potentialBuyersLabel)
			.catch((err) => {
				console.error(err);
				return [];
			});

		return buyers;
	}

	public getWaitingList(): Buyer[] | Promise<Buyer[]> {
		const buyers = this.databaseService
			.listAllDocuments<Buyer>(this.waitingListLabel)
			.catch((err) => {
				console.error(err);
				return [];
			});

		return buyers;
	}

	public getBuyers(): Buyer[] | Promise<Buyer[]> {
		const buyers = this.databaseService
			.listAllDocuments<Buyer>(this.waitingListLabel)
			.catch((err) => {
				console.error(err);
				return [];
			});

		return buyers;
	}

	public addPotentialBuyer(buyer: Buyer) {
		this.databaseService.createDocument(this.potentialBuyersLabel, buyer);
	}

	public addWaitingList(buyer: Buyer) {
		this.databaseService.createDocument(this.waitingListLabel, buyer);
	}

	public addBuyer(buyer: Buyer) {
		this.databaseService.createDocument(this.buyersLabel, buyer);
	}

	public removePotentialBuyer(buyer: Buyer) {
		this.databaseService.deleteDocument(this.potentialBuyersLabel, buyer);
	}

	public removeWaitingListBuyer(buyer: Buyer) {
		this.databaseService.deleteDocument(this.waitingListLabel, buyer);
	}

	public removeBuyer(buyer: Buyer) {
		this.databaseService.deleteDocument(this.buyersLabel, buyer);
	}

	public clearPotentialBuyers() {
		this.databaseService.dropCollection(this.potentialBuyersLabel);
		this.databaseService.createCollection(this.potentialBuyersLabel);
	}

	public clearWaitingList() {
		this.databaseService.dropCollection(this.waitingListLabel);
		this.databaseService.createCollection(this.waitingListLabel);
	}

	public clearBuyers() {
		this.databaseService.dropCollection(this.buyersLabel);
		this.databaseService.createCollection(this.buyersLabel);
	}
}
