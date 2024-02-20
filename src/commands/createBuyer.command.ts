/* eslint-disable no-unused-vars */
import {
	ActionRowBuilder,
	Events,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	Interaction,
} from "discord.js";
import DataService from "../services/data.srvs.js";
import DiscordService from "../services/discord.srvs.js";
import Buyer from "../models/buyer.model.js";
import Cli from "../services/cli.srvs.js";
import { BuyerType } from "../enum/buyerType.enum.js";

export default {
	data: new SlashCommandBuilder()
		.setName("create-buyer")
		.setDescription("Creates a new Form for buyer creation."),
	async execute(
		interaction: {
			awaitModalSubmit(arg0: {
				filter: (interaction: { customId: string }) => boolean;
				time: number;
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

		const modal = new ModalBuilder()
			.setCustomId("create-buyer")
			.setTitle("Create Buyer");

		const name = new TextInputBuilder()
			.setPlaceholder("Name")
			.setRequired(true)
			.setLabel("Please enter the name of the buyer")
			.setCustomId("name")
			.setStyle(TextInputStyle.Short);

		const email = new TextInputBuilder()
			.setPlaceholder("Email@email.test")
			.setRequired(true)
			.setLabel("Please enter the email of the buyer")
			.setCustomId("email")
			.setStyle(TextInputStyle.Short);

		const discord = new TextInputBuilder()
			.setPlaceholder("Discord")
			.setRequired(true)
			.setLabel("Please enter the discord name of the buyer")
			.setCustomId("discord")
			.setStyle(TextInputStyle.Short);

		const payed = new TextInputBuilder()
			.setPlaceholder("false")
			.setRequired(true)
			.setLabel("Please enter the payed status of the buyer")
			.setCustomId("payed")
			.setStyle(TextInputStyle.Short);

		const verifyed = new TextInputBuilder()
			.setPlaceholder("false")
			.setRequired(true)
			.setLabel("Please enter the verifyed status of the buyer")
			.setCustomId("verifyed")
			.setStyle(TextInputStyle.Short);

		const firstActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				name,
			);
		const secondActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				discord,
			);
		const thirdActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				email,
			);
		const fourthActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				payed,
			);
		const fifthActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				verifyed,
			);

		modal.addComponents(
			firstActionRow,
			secondActionRow,
			thirdActionRow,
			fourthActionRow,
			fifthActionRow,
		);

		const client = discordService.getClient();

		client.on(Events.InteractionCreate, (interaction) => {
			if (!interaction.isModalSubmit()) return;

			if (interaction.customId === "create-buyer") {
				const name = interaction.fields.getTextInputValue("name");
				const email = interaction.fields.getTextInputValue("email");
				const discord = interaction.fields.getTextInputValue("discord");
				const payed = interaction.fields.getTextInputValue("payed");
				const verifyed =
					interaction.fields.getTextInputValue("verifyed");

				const buyer = new Buyer({
					discord: discord,
					name: name,
					email: email,
					payed: payed === "true",
					verifyed: verifyed === "true",
					type: BuyerType.POTENTIAL,
				} as Buyer);

				dataService.addBuyer(buyer);
				Cli.log("Potential buyer created: " + buyer.name);

				interaction.deferReply({ ephemeral: true });

				interaction.editReply("Buyer created");

				client.removeAllListeners(Events.InteractionCreate);

				return;
			}
		});

		await interaction.showModal(modal);
	},
};
