import Buyer from "../models/buyer.model.js";

export type SaveData = {
	id: string;
	date: string;
	potentialBuyers: Buyer[];
	waitingList: Buyer[];
	buyers: Buyer[];
};
