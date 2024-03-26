/* eslint-disable no-unused-vars */
import { Interaction, SlashCommandBuilder } from "discord.js";
import CSVImporter from "../classes/csv.class.js";
import Buyer from "../models/buyer.model.js";
import DataService from "../services/data.srvs.js";
import DiscordService from "../services/discord.srvs.js";

export default {
	data: new SlashCommandBuilder()
		.setName("import")
		.setDescription(
			"Imports file. Then the data is addet to the data list.",
		)
		.addStringOption((option) =>
			option
				.setName("category")
				.setDescription("The File category")
				.setRequired(true)
				.addChoices(
					{ name: "csv", value: "csv" },
					{ name: "json", value: "json" },
				),
		)
		.addAttachmentOption((option) =>
			option
				.setName("file")
				.setDescription("The file to import")
				.setRequired(true),
		),
	async execute(interaction: {
		[x: string]: any;
		reply: (arg0: string) => any;
		fetchReply: () => any;
		deferReply: (arg0: { ephemeral: boolean }) => any;
		editReply: (arg0: any) => any;
	}) {
		const discordService = DiscordService.getInstance();

		discordService.checkPermission(
			interaction as Interaction,
			(interaction: Interaction) => {
				(interaction as any).reply({
					content: "You are not authorized to use this command!",
					ephemeral: true,
				});
				return;
			},
		);

		async function handleUpload<T>(attachment: {
			attachment: string | URL | Request;
		}) {
			//@ts-ignore
			const url = attachment.attachment.attachment;
			const response = await fetch(url);
			const data = await response.text();
			let result: [] | {} | T;

			result = JSON.parse(data) as T;

			//@ts-ignore
			if (attachment.attachment.name.endsWith(".csv")) {
				result = CSVImporter.importCSV<T>(data);
			}

			return result;
		}

		const dataService = DataService.getInstance();

		await interaction.deferReply({ ephemeral: true });

		//@ts-ignore
		const file = interaction.options.get("file");
		//@ts-ignore
		const category = interaction.options.get("category");

		// Check if the file is a csv
		if (
			(file.attachment.name.endsWith(".csv") &&
				category.value === "csv") ||
			(file.attachment.name.endsWith(".json") &&
				category.value === "json")
		) {
			const data = (await handleUpload(file)) as Buyer[];

			// check if the data is an array
			if (!Array.isArray(data)) {
				await interaction.editReply("The data must be an array");
				return;
			}

			// check if the data is empty
			if (data.length === 0) {
				await interaction.editReply("The data is empty");
				return;
			}

			// check if the data is an array of buyers
			if (!data.every((buyer) => Buyer.check(buyer))) {
				await interaction.editReply(
					"The data must be an array of buyers",
				);
				return;
			}

			data.forEach((buyer) => {
				const newBuyer = new Buyer(buyer);
				dataService.addBuyer(newBuyer);
			});

			await interaction.editReply(file.attachment.name + " imported");
		}

		// If the file is not a csv or json
		if (
			!file.attachment.name.endsWith(".csv") &&
			!file.attachment.name.endsWith(".json")
		) {
			await interaction.editReply("The file must be a csv or json file");
			return;
		}
	},
};
