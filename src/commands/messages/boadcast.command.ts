/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder, User } from "discord.js";
import DiscordService from "../../services/discord.srvs.js";
import BuyerService from "../../services/buyer.srvs.js";
import ConfigService from "../../services/config.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("broadcast")
		.setDescription(
			"A command to send a broadcast message. This command is only available for the bot owner and admins.",
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
					{ name: "Waiting List", value: "waitinglist" },
					{ name: "Please Pay List", value: "paylist" },
					{ name: "Paid List", value: "paidlist" },
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
		const configService = ConfigService.getInstance();

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
		const config = ConfigService.getInstance().getConfig();

		switch (type) {
			case "all":
				break;
			case "waitinglist":
				waitingList.forEach((buyer) => {
					discordService.sendDirectMessage(
						buyer.discord,
						config.messages.waitingList,
					);
				});
				break;
			case "paylist":
				buyerList.forEach((buyer) => {
					if (!buyer.payed) {
						discordService.sendDirectMessage(
							buyer.discord,
							config.messages.payReminder,
						);
					}
				});
				break;
			case "paidlist":
				buyerList.forEach((buyer) => {
					if (buyer.payed) {
						discordService.sendDirectMessage(
							buyer.discord,
							config.messages.payedConfirmation,
						);
					}
				});
				break;
			default:
				break;
		}
	},
};
