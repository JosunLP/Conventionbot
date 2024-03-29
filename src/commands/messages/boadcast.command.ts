/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder, User } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import UserService from "../../services/user.srvs.js";
import { UserRole } from "../../enum/userRole.enum.js";
import Cli from "../../services/cli.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("broadcast")
		.setDescription(
			"A command to send a broadcast message to all users in the database. This command is only available for the bot owner and admins.",
		)
		.addStringOption((option) =>
			option
				.setName("type")
				.setDescription(
					"The type of the broadcast message. This is the type of the message.",
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
		);

	},
};
