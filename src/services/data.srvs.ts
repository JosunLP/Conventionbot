import Buyer from "../models/buyer.model.js";
import DatabaseService from "../services/database.srvs.js";

export default class DataService {
	private static instance: DataService;
	private databaseService: DatabaseService = DatabaseService.getInstance();

	private buyersLabel: string = "buyers";

	private constructor() {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new DataService();
		}
		return this.instance;
	}

	public getBuyers(): Buyer[] | Promise<Buyer[]> {
		const buyers = this.databaseService
			.listAllDocuments<Buyer>(this.buyersLabel)
			.catch((err) => {
				console.error(err);
				return [];
			});

		return buyers;
	}

	public getBuyer(id: string): Promise<Buyer | null> {
		const buyer = this.databaseService
			.getDocument<Buyer>(this.buyersLabel, id)
			.catch((err) => {
				console.error(err);
				return null;
			});

		return buyer;
	}

	public addBuyer(buyer: Buyer) {
		this.databaseService.createDocument(this.buyersLabel, buyer);
	}

	public removeBuyer(buyer: Buyer) {
		this.databaseService.deleteDocument(this.buyersLabel, buyer);
	}

	public updateBuyer(buyer: Buyer, updatedBuyer: Buyer) {
		this.databaseService.updateDocument(this.buyersLabel, buyer, updatedBuyer);
	}

	public clearBuyers() {
		this.databaseService.dropCollection(this.buyersLabel);
		this.databaseService.createCollection(this.buyersLabel);
	}
}
