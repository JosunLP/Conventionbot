/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder, User } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import UserService from "../../services/user.srvs.js";
import { UserRole } from "../../enum/userRole.enum.js";
import Cli from "../../services/cli.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("add-user")
		.setDescription(
			"Adding a new user to the database. This command is only available for the bot owner and admins.",
		)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"The user to add to the database. This is the Discord user.",
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("role")
				.setDescription(
					"The role of the user. This is the Discord user role.",
				)
				.setRequired(true)
				.addChoices(
					{ name: "User", value: "user" },
					{ name: "Admin", value: "admin" },
				),
		),
	async execute(interaction: {
		[x: string]: any;
		reply: (arg0: string) => any;
		fetchReply: () => any;
		deferReply: (arg0: { ephemeral: boolean }) => any;
		editReply: (arg0: any) => any;
	}) {
		const discordService = DiscordService.getInstance();
		const userService = UserService.getInstance();

		discordService.checkPermission(
			interaction as Interaction,
			(interaction) => {
				(interaction as any).reply({
					content: "You are not authorized to use this command!",
					ephemeral: true,
				});
				return;
			},
			true
		);

		await interaction.deferReply({ ephemeral: true });

		const discordUser = interaction.options.getUser("user") as User;
		const role = interaction.options.getString("role") as UserRole;

		const user = await userService.getUser(discordUser.id);

		if (user) {
			interaction.editReply(
				`User ${user.username} already exists in the database.`,
			);
			return;
		}

		await userService
			.createUser(discordUser.id, discordUser.username, role)
			.then(() => {
				interaction.editReply(
					`User ${discordUser.username} added to the database.`,
				);
			})
			.catch((err) => {
				interaction.editReply(
					`User ${discordUser.username} could not be added to the database.`,
				);
				Cli.error(
					`User ${discordUser.username} could not be added to the database.`,
					err,
				);
			});
	},
};
