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
		botMode: string;
	};
	server: {
		guild_id: string;
		max_buyers: number;
		authorized_users: string[];
		authorized_admin_users: string[];
		authorized_roles: string[];
	};
	database: {
		host: string;
		username: string;
		password: string;
		databasename: string;
		collections: string[];
	};
};
