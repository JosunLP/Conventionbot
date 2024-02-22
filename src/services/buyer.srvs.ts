import Cli from "./cli.srvs.js";
import { WebSocketServer } from "ws";
import { BuyerObject } from "../interfaces/buyerObject.interface.js";
import Signer from "../classes/sign.class.js";
import Buyer from "../models/buyer.model.js";

export default class BuyerService {
	private static instance: BuyerService;
	private buyers = [] as Buyer[];
	private wss = new WebSocketServer({ port: 8080 });

	private constructor() {
		this.wss.on("error", (error) => {
			Cli.error("Buyer WebSocket error", error);
		});
		this.wss.on("connection", (ws) => {
			Cli.log("Buyer connected to WebSocket");
			ws.on("upgrade", () => {
				Cli.log("Buyer WebSocket upgraded");
			});
			ws.on("message", (message: BuyerObject) => {
				const buyer = this.checkIfObjectIsBuyer(
					JSON.parse(message.toString()),
				)
					? JSON.parse(message.toString())
					: null;
				if (!buyer) return;

				if (!Signer.verifySignature(buyer, buyer.sign)) {
					Cli.error("Buyer signature is not valid", new Error());
					return;
				}

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

	private checkIfObjectIsBuyer(object: any): object is BuyerObject {
		return (
			typeof object.discord === "string" &&
			typeof object.name === "string" &&
			typeof object.sign === "string"
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
