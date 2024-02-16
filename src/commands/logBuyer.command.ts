/* eslint-disable no-unused-vars */
import { EmbedBuilder, ModalBuilder, SlashCommandBuilder } from "discord.js";
import DataService from "../services/data.srvs.js";
import DiscordService from "../services/discord.srvs.js";
import Buyer from "../models/buyer.model.js";

export default {
	data: new SlashCommandBuilder()
		.setName("list-buyers")
		.setDescription("Lists all buyers, based on the type of buyer.")
		.addStringOption((option) =>
			option
				.setName("type")
				.setDescription("The type of buyer")
				.setRequired(true)
				.addChoices(
					{ name: "buyed", value: "buyed" },
					{ name: "potential buyer", value: "potential" },
					{ name: "waiting list", value: "waiting" },
				),
		),
	async execute(interaction: {
		followUp(arg0: { ephemeral: boolean; embeds: any[] }): unknown;
		showModal(modal: ModalBuilder): unknown;
		reply: (arg0: string) => any;
		fetchReply: () => any;
		deferReply: (arg0: { ephemeral: boolean }) => any;
		editReply: (arg0: any) => any;
	}) {
		const dataService = DataService.getInstance();
		const discordService = DiscordService.getInstance();

		await interaction.deferReply({ ephemeral: true });

		//@ts-ignore
		const type = interaction.options.getString("type");

		let buyers: Buyer[] = [];

		switch (type) {
			case "buyed":
				buyers = await dataService.getBuyers();
				break;
			case "potential":
				buyers = await dataService.getPotentialBuyers();
				break;
			case "waiting":
				buyers = await dataService.getWaitingList();
				break;
		}

		if (buyers.length === 0) {
			await interaction.editReply("No buyers found.");
			return;
		}

		interaction.editReply(type + " buyers" + buyers.length + " found.");

		buyers.forEach((buyer) => {
			const entry = new EmbedBuilder()
				.setTitle("Buyer")
				.setColor("#0099ff");
			entry.addFields(
				{
					name: "Name",
					value: buyer.name,
					inline: true,
				},
				{
					name: "Email",
					value: buyer.email,
					inline: true,
				},
				{
					name: "Discord",
					value: buyer.discord,
					inline: true,
				},
			);
			interaction.followUp({ ephemeral: true, embeds: [entry] });
		});
	},
};
