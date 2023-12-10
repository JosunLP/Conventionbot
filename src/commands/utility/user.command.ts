/* eslint-disable no-unused-vars */
import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Provides information about the user."),
	async execute(interaction: {
		reply: (arg0: string) => any;
		user: { username: any };
		member: { joinedAt: any };
	}) {
		await interaction.reply(
			`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`,
		);
	},
};
