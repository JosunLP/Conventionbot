/* eslint-disable no-unused-vars */
import {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	AnyComponentBuilder,
	ModalBuilder,
	ModalActionRowComponentBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import Buyer from "../models/buyer.model.js";
import { BuyerType } from "../enum/buyerType.enum.js";

/**
 * Discord interaction class
 */
export default class DiscordInteraction {

	/**
	 * Creates editable buyer embed
	 * @param buyer
	 * @returns editable buyer embed
	 */
	public static createEditableBuyerEmbed(buyer: Buyer): {
		entry: EmbedBuilder;
		row: ActionRowBuilder<AnyComponentBuilder>;
	} {
		const entry = new EmbedBuilder().setTitle("Buyer").setColor("#0099ff");

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

		const row = new ActionRowBuilder().addComponents(deleteBtn, editBtn);

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

		return { entry, row };
	}

	/**
	 * Creates buyer modal
	 * @returns buyer modal
	 */
	public static createBuyerModal(): ModalBuilder {
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

		return modal;
	}
}
