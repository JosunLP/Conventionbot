/* eslint-disable no-unused-vars */
import { SlashCommandBuilder } from "discord.js";
import CSVImporter from "../classes/csv.js";

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
		reply: (arg0: string) => any;
		fetchReply: () => any;
		deferReply: (arg0: { ephemeral: boolean }) => any;
		editReply: (arg0: any) => any;
	}) {
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
			const data = await handleUpload(file);
			console.log(JSON.stringify(data));

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
