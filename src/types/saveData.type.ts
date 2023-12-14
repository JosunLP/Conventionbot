import { Buyer } from "./buyer.type";

export type SaveData = {
	id: string;
	date: string;
	potentialBuyers: Buyer[];
	waitingList: Buyer[];
	buyers: Buyer[];
};
