/* eslint-disable no-unused-vars */
import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Provides information about the server."),
	async execute(interaction: {
		reply: (arg0: string) => any;
		guild: { name: any; memberCount: any };
	}) {
		await interaction.reply(
			`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`,
		);
	},
};
