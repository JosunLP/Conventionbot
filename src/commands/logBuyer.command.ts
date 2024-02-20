/* eslint-disable no-unused-vars */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	EmbedBuilder,
	Events,
	Interaction,
	MessageInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	SlashCommandBuilder,
} from "discord.js";
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
	async execute(
		interaction: {
			followUp(arg0: {
				ephemeral: boolean;
				embeds: any[];
				components: any[];
			}): unknown;
			showModal(modal: ModalBuilder): unknown;
			reply: (arg0: string) => any;
			fetchReply: () => any;
			deferReply: (arg0: { ephemeral: boolean }) => any;
			editReply: (arg0: any) => any;
		} & Interaction,
	) {
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

		interaction.editReply(buyers.length + " " + type + " buyers found.");

		buyers.forEach((buyer) => {
			const entry = new EmbedBuilder()
				.setTitle("Buyer")
				.setColor("#0099ff");

			const deleteBtn = new ButtonBuilder()
				.setCustomId("delete-buyer_" + buyer.Id)
				.setLabel("Delete")
				.setStyle(ButtonStyle.Danger)
				.setEmoji("🗑️")
				.setDisabled(false);

			const editBtn = new ButtonBuilder()
				.setCustomId("edit-buyer_" + buyer.Id)
				.setLabel("Edit")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("📝")
				.setDisabled(false);

			const row = new ActionRowBuilder().addComponents(
				deleteBtn,
				editBtn,
			);

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

			interaction.followUp({
				ephemeral: true,
				embeds: [entry],
				components: [row],
			});
		});

		const client = discordService.getClient();

		client.on(
			Events.InteractionCreate,
			(interaction) => {

				if (!interaction.isButton()) return;

				const id = interaction.customId.split("_")[1];
				const type = interaction.customId.split("_")[0];

				if (type === "delete-buyer") {
					const buyer = dataService.getBuyer(id);
					dataService.deleteBuyer();
					interaction.deferUpdate();
					interaction.editReply("Buyer deleted");
				}

				if (type === "edit-buyer") {
					interaction.deferUpdate();
					interaction.editReply("Buyer edited");
				}
			},
		);
	},
};
