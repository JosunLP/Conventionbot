import { BuyerObject } from "../interfaces/buyerObject.interface";
import { BaseBuyer } from "../types/baseBuyer.type";

export default class Buyer implements BaseBuyer {
	public readonly id!: string;
	public discord!: string;
	public name!: string;
	public email!: string;
	public payed!: boolean;
	public verifyed!: boolean;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	constructor(buyer: BaseBuyer | BuyerObject) {
		this.id = buyer.id || crypto.randomUUID();
		this.discord = buyer.discord;
		this.name = buyer.name;
		this.email = buyer.email;
		this.payed = buyer.payed;
		this.verifyed = buyer.verifyed;
		this.createdAt = buyer.createdAt || new Date();
		this.updatedAt = buyer.updatedAt || new Date();
	}
}
