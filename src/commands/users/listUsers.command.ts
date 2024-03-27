/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import UserService from "../../services/user.srvs.js";
import Cli from "../../services/cli.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("list-users")
		.setDescription(
			"Lists all users in the database. This command is only available for the bot owner and admins.",
		),
	async execute(interaction: {
		[x: string]: any;
		reply: (arg0: { embeds?: [{}]; ephemeral: boolean; content:string }) => any;
		fetchReply: () => any;
		deferReply: (arg0: { ephemeral: boolean }) => any;
		editReply: (arg0: any) => any;
	}) {
		await interaction.deferReply({ ephemeral: true });
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

		const users = await userService.getUsers();

		if (users === undefined || users.length === 0) {
			interaction.editReply({ ephemeral: true, content: "No users found" });
			return;
		}

		interaction.editReply({ ephemeral: true, content: "Listing all users..." });

		users.forEach((user) => {
			const embed = {
				title: `User ${user.username}`,
				description: `ID: ${user.Id}\nRole: ${user.role}`,
			};
			interaction.followUp({ embeds: [embed], ephemeral: true });
		});
		Cli.log(`Listed all users`);
	},
};
