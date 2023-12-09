import { contributor } from "./contributer.type";

export type Config = {
	meta: {
		name: string;
		version: string;
		description: string;
		contributors: contributor[];
		license: string;
	};
	secrets: {
		app_id: string;
		app_public_key: string;
		app_token: string;
	};
	messages: {
		buyer: string;
	};
};
