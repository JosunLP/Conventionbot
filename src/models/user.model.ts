import { UserRole } from "../enum/userRole.enum";
import { IModel } from "../interfaces/model.interface";

export class User implements IModel {
	Id: string;
	discordId: string;
	username: string;
	role: UserRole;

	constructor(
		Id: string,
		discordId: string,
		username: string,
		role: UserRole,
	) {
		this.Id = Id;
		this.discordId = discordId;
		this.username = username;
		this.role = role;
	}
}
