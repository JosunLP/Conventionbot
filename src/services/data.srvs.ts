import Buyer from "../models/buyer.model";

export default class DataService {
	private static instance: DataService;

	private potentialBuyers: Buyer[] = [];

	private waitingList: Buyer[] = [];

	private buyers: Buyer[] = [];

	private constructor() {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new DataService();
		}
		return this.instance;
	}

	public getPotentialBuyers(): Buyer[] {
		return this.potentialBuyers;
	}

	public getWaitingList(): Buyer[] {
		return this.waitingList;
	}

	public getBuyers(): Buyer[] {
		return this.buyers;
	}

	public addPotentialBuyer(buyer: Buyer) {
		this.potentialBuyers.push(buyer);
	}

	public addWaitingList(buyer: Buyer) {
		this.waitingList.push(buyer);
	}

	public addBuyer(buyer: Buyer) {
		this.buyers.push(buyer);
	}

	public removePotentialBuyer(buyer: Buyer) {
		this.potentialBuyers = this.potentialBuyers.filter(
			(b) => b.discord !== buyer.discord,
		);
	}

	public removeWaitingList(buyer: Buyer) {
		this.waitingList = this.waitingList.filter(
			(b) => b.discord !== buyer.discord,
		);
	}

	public removeBuyer(buyer: Buyer) {
		this.buyers = this.buyers.filter((b) => b.discord !== buyer.discord);
	}

	public clearPotentialBuyers() {
		this.potentialBuyers = [];
	}

	public clearWaitingList() {
		this.waitingList = [];
	}

	public clearBuyers() {
		this.buyers = [];
	}
}
