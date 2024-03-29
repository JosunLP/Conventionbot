import { UserRole } from "../enum/userRole.enum.js";
import { User } from "../models/user.model.js";
import ConfigService from "./config.srvs.js";
import DatabaseService from "./database.srvs.js";
import Cli from "./cli.srvs.js";
import { Client } from "discord.js";

export default class UserService {
	private static instance: UserService;
	private configService = ConfigService.getInstance();
	private databaseService = DatabaseService.getInstance();

	private constructor() {
		this.initializeDatabase().catch((err) => {
			Cli.error("Database initialization failed", err);
		});
	}

	public static getInstance(): UserService {
		if (!UserService.instance) {
			UserService.instance = new UserService();
		}

		return UserService.instance;
	}

	private async initializeDatabase() {
		const config = this.configService.getConfig();
		const existingUsers: User[] =
			await this.databaseService.listAllDocuments<User>("users");
		if (!existingUsers) {
			this.databaseService.createCollection("users");
		}
		if (existingUsers.length === 0) {
			const configUsers = config.server.authorized_users;
			const configAdminUsers = config.server.authorized_admin_users;

			const users: User[] = [];

			configUsers.forEach(async (user) => {
				const newUser = new User(
					crypto.randomUUID(),
					user,
					"",
					UserRole.USER,
				);

				if (configAdminUsers.includes(user)) {
					newUser.role = UserRole.ADMIN;
				}

				users.push(newUser);
			});

			console.log(users);

			users.forEach(async (user) => {
				await this.databaseService
					.createDocument<User>("users", user)
					.then(() => {
						Cli.log(`User ${user.username} created`);
					})
					.catch((err) => {
						Cli.error(
							`User ${user.username} could not be created`,
							err,
						);
					});
			});
		}
	}

	public async fixUserNames(client: Client<boolean>) {
		const users =
			await this.databaseService.listAllDocuments<User>("users");
		users.forEach(async (user) => {
			const discordUser = await client.users.fetch(user.discordId);
			if (discordUser) {
				const editedUser = new User(
					user.Id,
					user.discordId,
					discordUser.username,
					user.role,
				);
				await this.databaseService.updateDocument(
					"users",
					user,
					editedUser,
				);
			}
		});
	}

	public async deleteUser(discordId: string) {
		const user = await this.databaseService.getUserByDiscordId(discordId);
		if (!user) {
			Cli.warn(`User with id ${discordId} not found`);
			return;
		}
		await this.databaseService.deleteDocument("users", user);
	}

	public async changeUserType(discordId: string, type: UserRole) {
		const user = await this.databaseService.getUserByDiscordId(discordId);
		if (!user) {
			Cli.warn(`User with id ${discordId} not found`);
			return;
		}
		const editedUser = new User(
			user.Id,
			user.discordId,
			user.username,
			type,
		);
		await this.databaseService.updateDocument("users", user, editedUser);
	}

	public async editUser(user: User) {
		const existingUser = await this.databaseService.getUserByDiscordId(
			user.discordId,
		);
		if (!existingUser) {
			Cli.warn(`User with id ${user.Id} not found`);
			return;
		}

		const editedUser = new User(
			existingUser.Id,
			existingUser.discordId,
			existingUser.username,
			existingUser.role,
		);
		await this.databaseService.updateDocument(
			"users",
			existingUser,
			editedUser,
		);
	}

	public doesUserExist(discordId: string): boolean {
		const user = this.databaseService.getUserByDiscordId(discordId);
		return user !== undefined;
	}

	public getUser(discordId: string) {
		const user = this.databaseService.getUserByDiscordId(discordId);
		return user;
	}

	public getUsers() {
		const users = this.databaseService.listAllDocuments<User>("users");
		return users;
	}

	public async createUser(
		discordId: string,
		userName: string,
		role: UserRole,
	) {
		const user = new User(crypto.randomUUID(), discordId, userName, role);

		await this.databaseService.addUser(user);
	}

	public async updateUser(oldUser: User, newUser: User) {
		await this.databaseService.updateDocument("users", oldUser, newUser);
	}

	public async getAdminUsers() {
		const users =
			await this.databaseService.listAllDocuments<User>("users");
		const adminUsers = users.filter((user) => user.role === UserRole.ADMIN);
		return adminUsers;
	}
}
