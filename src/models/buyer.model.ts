import { BuyerType } from "../enum/buyerType.enum.js";
import { BuyerObject } from "../interfaces/buyerObject.interface.js";
import { IModel } from "../interfaces/model.interface.js";
import { BaseBuyer } from "../types/baseBuyer.type.js";

export default class Buyer implements BaseBuyer, IModel {
	public readonly Id!: string;
	public discord!: string;
	public name!: string;
	public email!: string;
	public payed!: boolean;
	public verifyed!: boolean;
	public type!: BuyerType;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	constructor(buyer: BaseBuyer | BuyerObject) {
		this.Id = buyer.Id || crypto.randomUUID();
		this.discord = buyer.discord;
		this.name = buyer.name;
		this.email = buyer.email;
		this.payed = buyer.payed;
		this.verifyed = buyer.verifyed;
		this.type = buyer.type || BuyerType.POTENTIAL;
		this.createdAt = buyer.createdAt || new Date();
		this.updatedAt = buyer.updatedAt || new Date();
	}

	public static check(object: object): boolean {
		const keys = Object.keys(object);
		const buyerKeys = Object.keys(
			new Buyer({
				Id: "",
				discord: "",
				name: "",
				email: "",
				payed: false,
				verifyed: false,
				type: BuyerType.POTENTIAL,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		return keys.every((key) => {
			if (key === "Id" || key === "createdAt" || key === "updatedAt") {
				return true;
			}

			return buyerKeys.includes(key);
		});
	}
}
