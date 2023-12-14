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
		signature_key_private: string;
		signature_key_public: string;
	};
	messages: {
		buyer: string;
	};
	server: {
		guild_id: string;
		max_buyers: number;
	};
};
