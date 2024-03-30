/* eslint-disable no-unused-vars */
import {
	CacheType,
	Interaction,
	ModalBuilder,
	SlashCommandBuilder,
} from "discord.js";
import DataService from "../../services/data.srvs.js";
import Buyer from "../../models/buyer.model.js";
import { BuyerType } from "../../enum/buyerType.enum.js";
import DiscordInteraction from "../../classes/discordInteraction.class.js";
import DiscordService from "../../services/discord.srvs.js";

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
		} & Interaction<CacheType>,
	) {
		const discordService = DiscordService.getInstance();

		discordService.checkPermission(interaction, (interaction) => {
			(interaction as any).reply({
				content: "You are not authorized to use this command!",
				ephemeral: true,
			});
			return;
		});

		const dataService = DataService.getInstance();

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
			const result = DiscordInteraction.createEditableBuyerEmbed(buyer);

			interaction.followUp({
				ephemeral: true,
				embeds: [result.entry],
				components: [result.row],
			});
		});
	},
};
