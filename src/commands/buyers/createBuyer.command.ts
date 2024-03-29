/* eslint-disable no-unused-vars */
import { ModalBuilder, SlashCommandBuilder, Interaction } from "discord.js";
import DiscordInteraction from "../../classes/discordInteraction.class.js";
import DiscordService from "../../services/discord.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("create-buyer")
		.setDescription("Creates a new Form for buyer creation."),
	async execute(
		interaction: {
			showModal(modal: ModalBuilder): unknown;
		} & Interaction,
	) {
		const discordService = DiscordService.getInstance();

		discordService.checkPermission(interaction, (interaction) => {
			(interaction as any).reply({
				content: "You are not authorized to use this command!",
				ephemeral: true,
			});
			return;
		});

		const modal = DiscordInteraction.createBuyerModal();

		await interaction.showModal(modal);
	},
};
