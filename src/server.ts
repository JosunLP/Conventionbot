import BuyerService from "./services/buyer.srvs.js";
import ConfigService from "./services/config.srvs.js";
import Cli from "./services/cli.srvs.js";
import DatabaseService from "./services/database.srvs.js";
import DiscordService from "./services/discord.srvs.js";
import { ActionRowBuilder, Events, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import DataService from "./services/data.srvs.js";
import Buyer from "./models/buyer.model.js";
import { BuyerType } from "./enum/buyerType.enum.js";

/**
 * Hyde bot
 */
class HydeBot {

	/**
	 * Cli service
	 */
	private cli = Cli.getInstance();

	/**
	 * Constructor
	 */
	constructor() {
		ConfigService.getInstance();
		DatabaseService.getInstance();
		BuyerService.getInstance();

		this.cli.start().catch((err) => {
			console.error(err);
			process.exit(1);
		});

		this.setListeners();
	}

	/**
	 * Set listeners
	*/
	private async setListeners() {
		const dataService = DataService.getInstance();
		const discordService = DiscordService.getInstance();
		const client = discordService.getClient();

		// Buttons
		client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.isButton()) return;

			const id = interaction.customId.split("_")[1];
			const type = interaction.customId.split("_")[0];

			// #region Delete Buyer
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
			// #endregion

			// #region Change Buyer Type
			if (
				type === "potential-buyer" ||
				type === "waiting-buyer" ||
				type === "buyed-buyer"
			) {
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
					interaction.editReply("Buyer " + buyer.name + " updated");
				} else {
					interaction.editReply("Buyer not found");
				}
			}
			// #endregion

			// #region Edit Buyer
			if (type === "edit-buyer") {
				const buyer = await dataService.getBuyer(id);

				if (!buyer) {
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

				await interaction.showModal(editModal);
			}
			// #endregion
		});

		// Modals
		client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.isModalSubmit()) return;

			const id = interaction.customId.split("_")[1];

			const buyer = await dataService.getBuyer(id);

			if (!buyer) {
				interaction.editReply("Buyer not found");
				return;
			}

			const editBuyer = new Buyer(buyer);

			if (interaction.customId === "edit-buyer") {
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
					type: editBuyer.type || BuyerType.POTENTIAL,
				} as Buyer);

				dataService.addBuyer(buyer);
				Cli.log("Buyer Updated: " + buyer.name);

				interaction.editReply("Buyer Updated");

				return;
			}

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

				interaction.editReply("Buyer created");

				return;
			}
		});
	}
}

new HydeBot();
