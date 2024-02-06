/* eslint-disable no-unused-vars */
import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("csvimport")
		.setDescription(
			"Imports A CSV file, and converts it to JSON. Then it add the data to the data list.",
		),
	async execute(interaction: { reply: (arg0: string) => any }) {
		await interaction.reply("Pong!");
	},
};
