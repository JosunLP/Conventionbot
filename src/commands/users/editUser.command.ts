/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder, User } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import UserService from "../../services/user.srvs.js";
import DiscordInteraction from "../../classes/discordInteraction.class.js";
import Cli from "../../services/cli.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("edit-user")
		.setDescription(
			"Editing a user in the database. This command is only available for the bot owner and admins.",
		)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"The user to edit in the database. This is the Discord user.",
				)
				.setRequired(true),
		),
	async execute(interaction: {
		[x: string]: any;
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
			true,
		);

		const discordUser = interaction.options.getUser("user") as User;

		const user = await userService.getUser(discordUser.id);

		if (!user) {
			interaction.reply({
				content: "User not found!",
				ephemeral: true,
			});
			Cli.log("User not found!");
			return;
		}

		const modal = DiscordInteraction.editUserModal(user);

		interaction.showModal(modal);
	},
};
