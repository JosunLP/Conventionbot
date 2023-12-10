import Cli from "./cli.srvs.js";
import { Buyer } from "../types/buyer.type.js";
import { WebSocketServer } from "ws";

export default class BuyerService {
	private static instance: BuyerService;
	private buyers = [] as Buyer[];
	private wss = new WebSocketServer({ port: 8080 });

	private constructor() {
		Cli.log("BuyerService initialized");
		this.wss.on("connection", (ws) => {
			Cli.log("Buyer connected to WebSocket");
			ws.on("message", (message) => {
				const buyer = this.checkIfObjectIsBuyer(
					JSON.parse(message.toString()),
				)
					? JSON.parse(message.toString())
					: null;
				if (!buyer) return;
				this.buyers.push(buyer);
				Cli.log(`Buyer ${buyer.name} added`);
			});
		});
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new BuyerService();
		}
		return this.instance;
	}

	private checkIfObjectIsBuyer(object: any): object is Buyer {
		return (
			typeof object.discord === "string" &&
			typeof object.name === "string"
		);
	}

	public getBuyers(): Buyer[] {
		return this.buyers;
	}

	public setBuyers(buyers: Buyer[]) {
		this.buyers = buyers;
	}

	public addBuyer(buyer: Buyer) {
		this.buyers.push(buyer);
	}

	public removeBuyer(buyer: Buyer) {
		this.buyers = this.buyers.filter((b) => b !== buyer);
	}

	public clearBuyers() {
		this.buyers = [];
	}
}
