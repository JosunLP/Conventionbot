/* eslint-disable no-unused-vars */
import {
	ModalBuilder,
	SlashCommandBuilder,
	Interaction,
} from "discord.js";
import DiscordInteraction from "../classes/discordInteraction.class.js";

export default {
	data: new SlashCommandBuilder()
		.setName("create-buyer")
		.setDescription("Creates a new Form for buyer creation."),
	async execute(
		interaction: {
			showModal(modal: ModalBuilder): unknown;
		} & Interaction,
	) {

		const modal = DiscordInteraction.createBuyerModal();

		await interaction.showModal(modal);
	},
};
