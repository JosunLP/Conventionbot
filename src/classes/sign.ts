import crypto from "crypto";
import { Buyer } from "../types/buyer.type";
import { BuyerObject } from "../types/buyerObject.type";
import ConfigService from "../services/config.srvs.js";

export default class Signer {
	constructor() {}

	public static signObject(obj: Buyer): any {
		const signedObj = { ...obj, sign: Signer.generateSiganature(obj) };
		return signedObj as BuyerObject;
	}

	// a method that gets a object and a key and returns a sign for the object
	private static generateSiganature(obj: object): string {
		const sign = crypto.createSign("RSA-SHA256");
		const config = ConfigService.getInstance().getConfig();

		sign.update(JSON.stringify(obj));

		const privateKey = config.secrets.signature_key_private || "";

		if (
			privateKey === "" ||
			privateKey === undefined ||
			privateKey === null
		) {
			throw new Error("No signature key found");
		}

		const signature = sign.sign(privateKey.replace(/\\n/g, "\n"), "hex");

		return signature;
	}

	public static verifySignature(obj: BuyerObject, sign: string): boolean {
		const buyer = {
			name: obj.name,
			discord: obj.discord,
		};

		const verify = crypto.createVerify("RSA-SHA256");
		const config = ConfigService.getInstance().getConfig();

		verify.update(JSON.stringify(buyer));

		const publicKey = config.secrets.signature_key_public || "";

		if (publicKey === "" || publicKey === undefined || publicKey === null) {
			throw new Error("No signature key found");
		}

		const verified = verify.verify(
			publicKey.replace(/\\n/g, "\n"),
			sign,
			"hex",
		);

		return verified;
	}
}
