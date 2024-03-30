import BuyerService from "./services/buyer.srvs.js";
import ConfigService from "./services/config.srvs.js";
import Cli from "./services/cli.srvs.js";
import DatabaseService from "./services/database.srvs.js";
import DiscordService from "./services/discord.srvs.js";
import {
	ActionRowBuilder,
	Events,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import DataService from "./services/data.srvs.js";
import Buyer from "./models/buyer.model.js";
import { BuyerType } from "./enum/buyerType.enum.js";
import UserService from "./services/user.srvs.js";
import { User } from "./models/user.model.js";
import { UserRole } from "./enum/userRole.enum.js";

/**
 * Convention bot
 */
class ConventionBot {
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

		// enable this if you want to use the cli
		// this.cli.start().catch((err) => {
		// 	console.error(err);
		// 	process.exit(1);
		// });

		this.setListeners();
	}

	/**
	 * Set listeners
	 */
	private async setListeners() {
		const dataService = DataService.getInstance();
		const discordService = DiscordService.getInstance();
		const userService = UserService.getInstance();
		const client = discordService.getClient();

		// Ready
		client.on(Events.ClientReady, async () => {
			await UserService.getInstance().fixUserNames(client);
		});

		// Buttons
		client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.isButton()) return;

			discordService.checkPermission(interaction, (interaction) => {
				(interaction as any).reply({
					content: "You are not authorized to use this command!",
					ephemeral: true,
				});
				return;
			});

			const id = interaction.customId.split("_")[1];
			const type = interaction.customId.split("_")[0];

			// #region Delete Buyer
			if (type === "delete-buyer") {
				const buyer = await dataService.getBuyer(id);
				if (buyer) {
					dataService.removeBuyer(buyer);
					interaction.reply({
						content: "Buyer deleted",
						ephemeral: true,
					});
				} else {
					interaction.reply({
						content: "Buyer not found",
						ephemeral: true,
					});
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
					interaction.reply({
						content: "Buyer " + buyer.name + " updated",
						ephemeral: true,
					});
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
					.setCustomId("edit-buyer_" + id);

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

			discordService.checkPermission(interaction, (interaction) => {
				(interaction as any).reply({
					content: "You are not authorized to use this command!",
					ephemeral: true,
				});
				return;
			});

			const id = interaction.customId.split("_")[1];
			const type = interaction.customId.split("_")[0];

			if (type === "edit-buyer") {
				const b = await dataService.getBuyer(id);

				if (!b) {
					interaction.reply({
						content: "Buyer not found",
						ephemeral: true,
					});
					return;
				}

				const editBuyer = new Buyer(b);

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

				dataService.updateBuyer(editBuyer, buyer);

				Cli.log("Buyer Updated: " + buyer.name);

				interaction.reply({
					content: "Buyer " + buyer.name + " updated",
					ephemeral: true,
				});

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

				interaction.reply({
					content: "Buyer " + buyer.name + " created",
					ephemeral: true,
				});

				return;
			}

			if (type == "edit-user") {
				const discordName =
					interaction.fields.getTextInputValue("discordName");
				let role = interaction.fields.getTextInputValue("role");

				const user = await userService.getUser(id);

				if (!user) {
					interaction.reply({
						content: "User not found",
						ephemeral: true,
					});
					return;
				}

				if (
					role.toLowerCase() !== UserRole.ADMIN &&
					role.toLowerCase() !== UserRole.USER
				) {
					role = user.role;
				}

				const updatedUser = new User(
					user.Id,
					user.discordId,
					discordName,
					role.toLowerCase() as UserRole,
				);

				userService.updateUser(user, updatedUser);

				interaction.reply({
					content: "User " + user.username + " updated",
					ephemeral: true,
				});

				Cli.log("User Updated: " + user.username);
			}
		});
	}
}

new ConventionBot();
