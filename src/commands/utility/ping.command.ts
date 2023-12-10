/* eslint-disable no-unused-vars */
import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong!"),
	async execute(interaction: { reply: (arg0: string) => any }) {
		await interaction.reply("Pong!");
	},
};
