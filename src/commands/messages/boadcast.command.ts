/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder, User } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import UserService from "../../services/user.srvs.js";
import { UserRole } from "../../enum/userRole.enum.js";
import Cli from "../../services/cli.srvs.js";
import BuyerService from "../../services/buyer.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("broadcast")
		.setDescription(
			"A command to send a broadcast message to all users in the database. This command is only available for the bot owner and admins.",
		)
		.addStringOption((option) =>
			option
				.setName("type")
				.setDescription(
					"The type of the broadcast message. This is the type of the message.",
				)
				.setRequired(true)
				.addChoices(
					{ name: "All", value: "all" },
					{ name: "Waiting List", value: "wlist" },
					{ name: "Please Pay List", value: "plist" },
					{ name: "Paid List", value: "paidlist" },
					{ name: "Unpaid warning List", value: "unpaidwlist" },
				),
		),
	async execute(interaction: {
		[x: string]: any;
		reply: (arg0: string) => any;
		fetchReply: () => any;
		deferReply: (arg0: { ephemeral: boolean }) => any;
		editReply: (arg0: any) => any;
	}) {
		const discordService = DiscordService.getInstance();
		const buyerService = BuyerService.getInstance();

		discordService.checkPermission(
			interaction as Interaction,
			(interaction) => {
				(interaction as any).reply({
					content: "You are not authorized to use this command!",
					ephemeral: true,
				});
				return;
			},
		);

		const type = interaction.options.getString("type");
		const waitingList = await buyerService.getWaitingList();
		const buyerList = await buyerService.getBuyerList();

		switch (type) {
			case "all":
				buyerList.forEach((buyer) => {
					discordService.sendDirectMessage(
						buyer.discord,
						"Hello, this is a broadcast message to all buyers.",
					);
				});
				break;
			case "wlist":
				waitingList.forEach((buyer) => {
					discordService.sendDirectMessage(
						buyer.discord,
						"Hello, this is a broadcast message to all buyers on the waiting list.",
					);
				});
				break;
			case "plist":
				buyerList.forEach((buyer) => {
					if (!buyer.payed) {
						discordService.sendDirectMessage(
							buyer.discord,
							"Hello, this is a broadcast message to all buyers on the please pay list.",
						);
					}
				});
				break;
			case "paidlist":
				buyerList.forEach((buyer) => {
					if (buyer.payed) {
						discordService.sendDirectMessage(
							buyer.discord,
							"Hello, this is a broadcast message to all buyers on the paid list.",
						);
					}
				});
				break;
			case "unpaidwlist":
				waitingList.forEach((buyer) => {
					if (!buyer.payed) {
						discordService.sendDirectMessage(
							buyer.discord,
							"Hello, this is a broadcast message to all buyers on the unpaid warning list.",
						);
					}
				});
				break;
			default:
				break;
		}
	},
};
