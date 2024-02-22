import { BuyerType } from "../enum/buyerType.enum.js";

export type BaseBuyer = {
	Id: string;
	discord: string;
	name: string;
	email: string;
	payed: boolean;
	verifyed: boolean;
	type: BuyerType;
	createdAt: Date;
	updatedAt: Date;
};
