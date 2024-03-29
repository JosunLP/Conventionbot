/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder, User } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import UserService from "../../services/user.srvs.js";
import Cli from "../../services/cli.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("remove-user")
		.setDescription(
			"Deleting a user to the database. This command is only available for the bot owner and admins.",
		)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"The user to remove from the database. This is the Discord user.",
				)
				.setRequired(true),
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

		console.log(discordUser);

		const user = await userService.getUser(discordUser.id);
		console.log(user);

		if (!user) {
			interaction.editReply(
				`User ${discordUser.username} does not exist in the database.`,
			);
			return;
		}

		if (interaction.user.id === discordUser.id) {
			interaction.editReply(
				`You cannot remove yourself from the database.`,
			);
			return;
		}

		await userService
			.deleteUser(discordUser.id)
			.then(() => {
				interaction.editReply(
					`User ${discordUser.username} has been removed from the database.`,
				);
			})
			.catch((error) => {
				interaction.editReply(
					`An error occurred while removing user ${discordUser.username} from the database.`,
				);
				Cli.error(
					`An error occurred while removing user ${discordUser.username} from the database.`,
					error,
				);
			});
	},
};
