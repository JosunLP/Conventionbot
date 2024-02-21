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
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import DataService from "../services/data.srvs.js";
import DiscordService from "../services/discord.srvs.js";
import Buyer from "../models/buyer.model.js";
import { BuyerType } from "../enum/buyerType.enum.js";
import Cli from "../services/cli.srvs.js";

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
				buyers = (await dataService.getBuyers()).filter(
					(buyer) => buyer.type === BuyerType.BUYER,
				);
				break;
			case "potential":
				buyers = (await dataService.getBuyers()).filter(
					(buyer) => buyer.type === BuyerType.POTENTIAL,
				);
				break;
			case "waiting":
				buyers = (await dataService.getBuyers()).filter(
					(buyer) => buyer.type === BuyerType.WAITING,
				);
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

			const potentialBtn = new ButtonBuilder()
				.setCustomId("potential-buyer_" + buyer.Id)
				.setLabel("Potential")
				.setStyle(ButtonStyle.Primary)
				.setEmoji("📝")
				.setDisabled(false);

			const waitingBtn = new ButtonBuilder()
				.setCustomId("waiting-buyer_" + buyer.Id)
				.setLabel("Waiting")
				.setStyle(ButtonStyle.Primary)
				.setEmoji("📝")
				.setDisabled(false);

			const buyedBtn = new ButtonBuilder()
				.setCustomId("buyed-buyer_" + buyer.Id)
				.setLabel("Buyed")
				.setStyle(ButtonStyle.Primary)
				.setEmoji("📝")
				.setDisabled(false);

			const row = new ActionRowBuilder().addComponents(
				deleteBtn,
				editBtn,
			);

			switch (buyer.type) {
				case BuyerType.POTENTIAL:
					row.addComponents(waitingBtn, buyedBtn);
					break;

				case BuyerType.WAITING:
					row.addComponents(potentialBtn, buyedBtn);
					break;

				case BuyerType.BUYER:
					row.addComponents(potentialBtn, waitingBtn);
					break;

				default:
					break;
			}

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

		client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.isButton()) return;

			const id = interaction.customId.split("_")[1];
			const type = interaction.customId.split("_")[0];

			if (type === "delete-buyer") {
				const buyer = await dataService.getBuyer(id);
				if (buyer) {
					dataService.removeBuyer(buyer);
					interaction.deferUpdate();
					interaction.editReply("Buyer deleted");
				} else {
					interaction.deferUpdate();
					interaction.editReply("Buyer not found");
				}
			}

			if (type === "potential-buyer" || type === "waiting-buyer" || type === "buyed-buyer") {
				const buyer = await dataService.getBuyer(id);
				if (buyer) {
					const updatedBuyer = new Buyer(buyer);
					switch (type) {
						case "potential-buyer":
							updatedBuyer.type = BuyerType.POTENTIAL;
							break;
						case "waiting-buyer":
							updatedBuyer.type = BuyerType.WAITING;
							break;

						case "buyed-buyer":
							updatedBuyer.type = BuyerType.BUYER;
							break;

						default:
							break;
					}
					dataService.updateBuyer(buyer, updatedBuyer);
					interaction.deferUpdate();
					interaction.editReply("Buyer " + buyer.name + " updated");
				} else {
					interaction.deferUpdate();
					interaction.editReply("Buyer not found");
				}
			}

			if (type === "edit-buyer") {
				const buyer = await dataService.getBuyer(id);

				if (!buyer) {
					interaction.deferUpdate();
					interaction.editReply("Buyer not found");
					return;
				}

				const editBuyer = new Buyer(buyer);

				const editModal = new ModalBuilder()
					.setTitle("Edit Buyer")
					.setCustomId("edit-buyer");

				const name = new TextInputBuilder()
					.setPlaceholder("Name")
					.setValue(editBuyer.name)
					.setRequired(true)
					.setLabel("Please enter the name of the buyer")
					.setCustomId("name")
					.setStyle(TextInputStyle.Short);

				const email = new TextInputBuilder()
					.setPlaceholder("Email@email.test")
					.setValue(editBuyer.email)
					.setRequired(true)
					.setLabel("Please enter the email of the buyer")
					.setCustomId("email")
					.setStyle(TextInputStyle.Short);

				const discord = new TextInputBuilder()
					.setPlaceholder("Discord")
					.setValue(editBuyer.discord)
					.setRequired(true)
					.setLabel("Please enter the discord name of the buyer")
					.setCustomId("discord")
					.setStyle(TextInputStyle.Short);

				const payed = new TextInputBuilder()
					.setPlaceholder("false")
					.setValue(editBuyer.payed.toString())
					.setRequired(true)
					.setLabel("Please enter the payed status of the buyer")
					.setCustomId("payed")
					.setStyle(TextInputStyle.Short);

				const verifyed = new TextInputBuilder()
					.setPlaceholder("false")
					.setValue(editBuyer.verifyed.toString())
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
						verifyed,
					);
				const fifthActionRow =
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						payed,
					);

				editModal.addComponents(
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
						const name =
							interaction.fields.getTextInputValue("name");
						const email =
							interaction.fields.getTextInputValue("email");
						const discord =
							interaction.fields.getTextInputValue("discord");
						const payed =
							interaction.fields.getTextInputValue("payed");
						const verifyed =
							interaction.fields.getTextInputValue("verifyed");

						const buyer = new Buyer({
							discord: discord,
							name: name,
							email: email,
							payed: payed === "true",
							verifyed: verifyed === "true",
							type: editBuyer.type || BuyerType.POTENTIAL,
						} as Buyer);

						dataService.addBuyer(buyer);
						Cli.log("Potential buyer created: " + buyer.name);

						interaction.deferReply({ ephemeral: true });

						interaction.editReply("Buyer created");

						client.removeAllListeners(Events.InteractionCreate);

						return;
					}
				});

				await interaction.showModal(editModal);
			}
		});
	},
};
