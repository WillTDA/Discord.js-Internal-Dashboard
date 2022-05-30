const Discord = require("discord.js");
const checkEmoji = require("./checkEmoji");

/**
 * Start Embed Options
 * @typedef {Object} StartEmbedOptions
 * @prop {Boolean} [showCategoriesAndDescriptions=true] (OPTIONAL): Determines whether category names and descriptions will be shown in the embed. Defaults to `true`.
 * @prop {Discord.MessageEmbed} [embed=undefined] (OPTIONAL): The embed to show when the dashboard is first opened.
 */

/**
 * Setting Options
 * @typedef {Object} Setting
 * @prop {String} name The name of the setting. Cannot contain underscores.
 * @prop {String} [description=undefined] (OPTIONAL): The description of the setting. Cannot contain newlines.
 * @prop {"textinput" | "textarea"} type The type of setting.
 * @prop {Number} [minLength=undefined] (OPTIONAL): The minimum input length of the textinput/textarea (if used).
 * @prop {Number} [maxLength=undefined] (OPTIONAL): The maximum input length of the textinput/textarea (if used).
 * @prop {Boolean} [required=false] (OPTIONAL): Whether or not entering a new value into the setting is required. Defaults to `false`.
 * @prop {Function} fetch A function that returns the value of the setting.
 * @prop {Function} save A function that takes the value of the setting as a parameter and saves it.
 */

/**
 * Category Options
 * @typedef {Object} Category
 * @prop {String} name The name of the category. Cannot contain emojis or underscores.
 * @prop {String} [emoji=undefined] (OPTIONAL): The emoji to use for the category on the selection menu.
 * @prop {String} description The description of the category.
 * @prop {Setting[]} settings The settings in the category.
 * @prop {Function} [reset=undefined] (OPTIONAL): A function to reset the value of the settings in the category to their default.
 */

/**
 * Internal Dashboard Options
 * @typedef {Object} InternalDashboardOptions
 * @prop {Number} [timeout=150000] (OPTIONAL): Time of inactivity in milliseconds until the dashboard closes. Defaults to `150000` (2.5 minutes).
 * @prop {StartEmbedOptions} [startEmbed=undefined] (OPTIONAL): Options for the embed that shows when the dashboard is first opened.
 * @prop {Discord.MessageEmbed} [categoryEmbed=undefined] (OPTIONAL): The embed to show when a category is selected.
 * @prop {Discord.MessageEmbed} [closeEmbed=undefined] (OPTIONAL): The embed to show when the dashboard buttons and selection menus timeout.
 * @prop {Category[]} categories The categories to show in the internal dashboard.
 */

/**
 * Create an Internal Dashboard. 
 * @param {Discord.Message | Discord.CommandInteraction} input The Message or Slash Command Sent by the User.
 * @param {InternalDashboardOptions} options The Options for the Internal Dashboard.
 * @returns The Internal Dashboard.
 */

module.exports = async function (input, options = {}) {
    if (!input) return console.log("Discord.js Internal Dashboard Error: Message or CommandInteraction was not Provided.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
    if (!input.client) return console.log("Discord.js Internal Dashboard Error: Message or CommandInteration Provided was Invalid.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
    if (!input.guild) return console.log("Discord.js Internal Dashboard Error: Cannot be used in Direct Messages.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");

    let inputData = {};
    try {
        inputData.client = input.client,
            inputData.guild = input.guild,
            inputData.author = input.author ? input.author : input.user,
            inputData.channel = input.channel
    } catch {
        return console.log("Discord.js Internal Dashboard Error: Failed to Parse Input for Use.\nJoin Our Discord Server for Support at 'https://discord.gg/P2g24jp'");
    }

    if (!options.timeout) options.timeout = 150000; // 2.5 minutes

    for (let i = 0; i < options.categories.length; i++) { // Validate category properties
        if (!options.categories[i].name) return console.log("Discord.js Internal Dashboard Error: One or more categories are missing names.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (typeof options.categories[i].name !== "string") return console.log("Discord.js Internal Dashboard Error: One or more categories' names are not of type \"string\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (checkEmoji(options.categories[i].name)) return console.log("Discord.js Internal Dashboard Error: One or more categories' names contain emojis.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (options.categories[i].name.includes("_")) return console.log("Discord.js Internal Dashboard Error: One or more categories' names contain underscore characters, which are reserved for parsing interaction responses.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (options.categories[i].name.length > 40) return console.log("Discord.js Internal Dashboard Error: One or more categories' names are longer than 40 characters.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!options.categories[i].description) return console.log("Discord.js Internal Dashboard Error: One or more categories are missing descriptions.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (typeof options.categories[i].description !== "string") return console.log("Discord.js Internal Dashboard Error: One or more categories' descriptions are not of type \"string\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (options.categories[i].emoji) { // Validate emoji
            if (!checkEmoji(options.categories[i].emoji)) return console.log("Discord.js Internal Dashboard Error: One or more categories' emoji are invalid.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        }
    }

    // Validate and build startEmbed
    if (!options.startEmbed.embed) {
        options.startEmbed.embed = new Discord.MessageEmbed()
            .setTitle(`${inputData.client.user.username} Settings Menu`)
            .setDescription(`Welcome to the ${inputData.client.user.username} Settings Menu!\nUse the selection menu below to find and configure ${inputData.client.user.username}'s settings.`)
            .setThumbnail(inputData.guild?.iconURL({ dynamic: true }))
            .setColor("RANDOM")
    }
    options.startEmbed.showCategoriesAndDescriptions = options.startEmbed.showCategoriesAndDescriptions || true;
    const startEmbed = options.startEmbed.embed;
    if (options.startEmbed.showCategoriesAndDescriptions) {
        for (let i = 0; i < options.categories.length; i++) {
            startEmbed.addField(`${options.categories[i].emoji} ${options.categories[i].name}`, options.categories[i].description);
        }
    }

    // Create closeEmbed if not provided
    if (!options.closeEmbed) {
        options.closeEmbed = new Discord.MessageEmbed()
            .setTitle(`Settings Menu Closed`)
            .setDescription(`The ${inputData.client.user.username} Settings Menu has been closed.`)
            .setThumbnail(inputData.guild?.iconURL({ dynamic: true }))
            .setColor("RANDOM")
    }

    // Validate options.category
    if (options.categories.length > 25) return console.log("Discord.js Internal Dashboard Error: Cannot have more than 25 Categories.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
    if (options.categories.length === 0) return console.log("Discord.js Internal Dashboard Error: No Categories have been Provided.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
    // Check for existence of category names and duplicate category names
    let categoryNames = [];
    for (let i = 0; i < options.categories.length; i++) {
        if (categoryNames.includes(options.categories[i].name.toLowerCase())) return console.log("Discord.js Internal Dashboard Error: One or more categories have duplicate names.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        categoryNames.push(options.categories[i].name.toLowerCase());
    }

    // Validate options.categories.settings
    for (let i = 0; i < options.categories.length; i++) {
        if (options.categories[i].settings.length > 5) return console.log("Discord.js Internal Dashboard Error: Cannot have more than 5 Options per Category.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (options.categories[i].settings.length === 0) return console.log("Discord.js Internal Dashboard Error: Cannot have 0 Options per Category.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (options.categories[i].reset) {
            if (typeof options.categories[i].reset !== "function") return console.log("Discord.js Internal Dashboard Error: One or more settings' reset functions are not of type \"function\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        }
        // Check for duplicate settings and validate setting fields
        let settings = [];
        for (let j = 0; j < options.categories[i].settings.length; j++) {
            if (!options.categories[i].settings[j].name) return console.log("Discord.js Internal Dashboard Error: One or more settings are missing names.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (typeof options.categories[i].settings[j].name !== "string") return console.log("Discord.js Internal Dashboard Error: One or more settings' names are not of type \"string\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (options.categories[i].settings[j].name.includes("_")) return console.log("Discord.js Internal Dashboard Error: One or more settings' names contain underscore characters, which are reserved for parsing interaction responses.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (options.categories[i].settings[j].name.length > 40) return console.log("Discord.js Internal Dashboard Error: One or more settings' names are longer than 40 characters.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if ((options.categories[i].settings[j].description) && (options.categories[i].settings[j].description.includes("\n"))) return console.log("Discord.js Internal Dashboard Error: One or more settings' descriptions contain newline characters, which are reserved for updating the category embed with new data.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if ((options.categories[i].settings[j].description) && (typeof options.categories[i].settings[j].description !== "string")) return console.log("Discord.js Internal Dashboard Error: One or more settings' descriptions are not of type \"string\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (!options.categories[i].settings[j].type) return console.log("Discord.js Internal Dashboard Error: One or more settings are missing setting types.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            options.categories[i].settings[j].type = options.categories[i].settings[j].type.toLowerCase();
            if (!["textinput", "textarea"].includes(options.categories[i].settings[j].type)) return console.log("Discord.js Internal Dashboard Error: One or more setting types are invalid.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            options.categories[i].settings[j].required = options.categories[i].settings[j].required || false;
            if (typeof options.categories[i].settings[j].required !== "boolean") return console.log("Discord.js Internal Dashboard Error: One or more settings' \"required\" fields are not of type \"boolean\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (options.categories[i].settings[j].minLength) {
                if (typeof options.categories[i].settings[j].minLength !== "number") return console.log("Discord.js Internal Dashboard Error: One or more settings' \"minLength\" fields are not of type \"number\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
                if (options.categories[i].settings[j].minLength <= 0) return console.log("Discord.js Internal Dashboard Error: One or more settings' \"minLength\" fields are less than or equal to 0.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
                if (options.categories[i].settings[j].minLength > 4000) return console.log("Discord.js Internal Dashboard Error: One or more settings' \"minLength\" fields are greater than 4000.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
                if ((options.categories[i].settings[j].maxLength) && (options.categories[i].settings[j].maxLength < options.categories[i].settings[j].minLength)) return console.log("Discord.js Internal Dashboard Error: One or more settings' \"maxLength\" fields are less than their \"minLength\" fields.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            }
            if (options.categories[i].settings[j].maxLength) {
                if (typeof options.categories[i].settings[j].maxLength !== "number") return console.log("Discord.js Internal Dashboard Error: One or more settings' \"maxLength\" fields are not of type \"number\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
                if (options.categories[i].settings[j].maxLength <= 0) return console.log("Discord.js Internal Dashboard Error: One or more settings' \"maxLength\" fields are less than or equal to 0.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
                if (options.categories[i].settings[j].maxLength > 4000) return console.log("Discord.js Internal Dashboard Error: One or more settings' \"maxLength\" fields are greater than 4000.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            }
            if (!options.categories[i].settings[j].fetch) return console.log("Discord.js Internal Dashboard Error: One or more settings are missing fetch functions.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (typeof options.categories[i].settings[j].fetch !== "function") return console.log("Discord.js Internal Dashboard Error: One or more settings' fetch functions are not of type \"function\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (!options.categories[i].settings[j].save) return console.log("Discord.js Internal Dashboard Error: One or more settings are missing save functions.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (typeof options.categories[i].settings[j].save !== "function") return console.log("Discord.js Internal Dashboard Error: One or more settings' save functions are not of type \"function\".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            if (settings.includes(options.categories[i].settings[j].name.toLowerCase())) return console.log("Discord.js Internal Dashboard Error: One or more categories have duplicate settings.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
            settings.push(options.categories[i].settings[j].name.toLowerCase());
        }
    }

    // Create MessageEmbeds, Modals, etc. for each category
    let categoryData = {};

    for (let i = 0; i < options.categories.length; i++) {
        let categoryEmbed;
        // Create MessageEmbed
        if (!options.categoryEmbed) {
            categoryEmbed = new Discord.MessageEmbed()
                .setTitle(`${options.categories[i].name}`)
                .setDescription(options.categories[i].description)
                .setThumbnail(inputData.guild?.iconURL({ dynamic: true }))
                .setColor("RANDOM")
        } else { categoryEmbed = JSON.parse(JSON.stringify(options.categoryEmbed)) } // Clone the categoryEmbed. Weird bug occurs if I just defined "categoryEmbed" directly with "options.categoryEmbed", but this somehow fixes it.
        for (let j = 0; j < options.categories[i].settings.length; j++) {
            let settingValue = String((await (options.categories[i].settings[j].fetch()) || "Unconfigured")).replace(/\n/g, " ");
            if (settingValue.length > 100) settingValue = settingValue.substring(0, 100) + "...";
            options.categories[i].settings[j].description = (options.categories[i].settings[j].description || "") + "\n" + "Currently: **" + settingValue + "**";
            categoryEmbed.fields.push({ name: `${options.categories[i].settings[j].name}`, value: `${options.categories[i].settings[j].description}` });
        }

        // Create category data
        categoryData[options.categories[i].name] = {
            embed: categoryEmbed,
            buttons: () => {
                // Create buttons
                let categoryButtons = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId(`${options.categories[i].name}_edit`)
                            .setLabel('Edit...')
                            .setEmoji('📝')
                            .setStyle('SUCCESS')
                    );
                if (options.categories[i].reset) {
                    categoryButtons.addComponents(
                        new Discord.MessageButton()
                            .setCustomId(`${options.categories[i].name}_reset`)
                            .setLabel('Reset to Default...')
                            .setEmoji('🗑')
                            .setStyle('DANGER')
                    );
                }
                return categoryButtons;
            },
            modal: async (id) => {
                // Create modals
                let categorySettings = [];
                for (let j = 0; j < options.categories[i].settings.length; j++) {
                    switch (options.categories[i].settings[j].type) {
                        case "textinput":
                            let textinputData = await options.categories[i].settings[j].fetch() || `Enter ${options.categories[i].settings[j].name}...`;
                            if (textinputData.length > 100) textinputData = textinputData.substring(0, 96) + "...";
                            const textinputComponent = new Discord.TextInputComponent()
                                .setLabel(`${options.categories[i].settings[j].name}`)
                                .setCustomId(`${options.categories[i].name}_${options.categories[i].settings[j].name}`)
                                .setPlaceholder(`${textinputData}`)
                                .setStyle("SHORT")
                                .setRequired(options.categories[i].settings[j].required);

                            if (options.categories[i].settings[j].minLength) textinputComponent.setMinLength(options.categories[i].settings[j].minLength);
                            if (options.categories[i].settings[j].maxLength) textinputComponent.setMaxLength(options.categories[i].settings[j].maxLength);
                            categorySettings.push(
                                new Discord.MessageActionRow().addComponents(textinputComponent)
                            )
                            break;
                        case "textarea":
                            let textareaData = await options.categories[i].settings[j].fetch() || `Enter ${options.categories[i].settings[j].name}...`;
                            if (textareaData.length > 100) textareaData = textareaData.substring(0, 96) + "...";
                            const textareaComponent = new Discord.TextInputComponent()
                                .setLabel(`${options.categories[i].settings[j].name}`)
                                .setCustomId(`${options.categories[i].name}_${options.categories[i].settings[j].name}`)
                                .setPlaceholder(`${textareaData}`)
                                .setStyle("PARAGRAPH")
                                .setRequired(options.categories[i].settings[j].required);

                            if (options.categories[i].settings[j].minLength) textareaComponent.setMinLength(options.categories[i].settings[j].minLength);
                            if (options.categories[i].settings[j].maxLength) textareaComponent.setMaxLength(options.categories[i].settings[j].maxLength);
                            categorySettings.push(
                                new Discord.MessageActionRow().addComponents(textareaComponent)
                            )
                            break;
                    }
                }

                let categoryModal = new Discord.Modal()
                    .setTitle(`${options.categories[i].name}`)
                    .setCustomId(`${options.categories[i].name}_edit_${id}`)
                    .addComponents(categorySettings);

                return categoryModal;
            }
        }
    }

    // Create MessageSelectMenu for categories
    let categorySelectMenu = new Discord.MessageSelectMenu()
        .setCustomId('category_select')
        .setPlaceholder('Select a Category to Configure...')
        .addOptions(
            options.categories.map(category => {
                let opt = {
                    label: category.name,
                    description: category.description,
                    value: category.name,
                }
                if (category.emoji) opt.emoji = category.emoji;
                return opt;
            })
        );

    let categorySelector = new Discord.MessageActionRow()
        .addComponents(categorySelectMenu);

    // All necessary data for the menu has been created!

    // Initialize the menu
    let dashboardMessage;

    if ((input.commandName) && (!input.replied) && (!input.deferred)) { // check if it's a slash command and hasn't been replied or deferred
        dashboardMessage = await input.reply({ embeds: [startEmbed], components: [categorySelector] });
    } else {
        dashboardMessage = await input.channel.send({ embeds: [startEmbed], components: [categorySelector] });
    }

    // Collector for interactions for the internal dashboard
    const menuFilter = (i) => {
        if (i.user.id === inputData.author.id) {
            return true;
        } else {
            i.deferUpdate();
            return false
        }
    }
    const collector = await dashboardMessage.createMessageComponentCollector({
        filter: menuFilter,
        time: options.timeout
    });

    collector.on('collect', async (i) => {
        collector.resetTimer();

        if (i.isSelectMenu()) { // If the user selects a category, switch to it
            await i.deferUpdate();
            await i.editReply({
                embeds: [categoryData[i.values[0].split("_")[0]].embed],
                components: [categoryData[i.values[0].split("_")[0]].buttons(), categorySelector],
            });
        }

        if (i.isButton()) { // If the user clicks a button
            switch (i.customId.split("_")[1]) {
                case "edit":
                    const modalID = (Math.floor(Math.random() * 900000) + 100000).toString();
                    i.showModal(await categoryData[i.customId.split("_")[0]].modal(modalID));
                    // Collect the modal submission
                    const modalFilter = (m) => (m.user.id === inputData.author.id) && (m.customId === `${i.customId}_${modalID}`);
                    const modalData = await i.awaitModalSubmit({ filter: modalFilter, time: 300000 }).catch((e) => { });
                    if (modalData) {
                        collector.resetTimer();
                        await modalData.deferUpdate();
                        const categoryToSave = options.categories.find(category => category.name === modalData.customId.split("_")[0]);
                        for (let j = 0; j < categoryToSave.settings.length; j++) {
                            const valueToSave = modalData.fields.getTextInputValue(`${categoryToSave.name}_${categoryToSave.settings[j].name}`);
                            if (valueToSave != (await categoryToSave.settings[j].fetch())) {
                                await categoryToSave.settings[j].save(valueToSave);
                            }
                        }

                        // Refresh the embed
                        categoryData[i.customId.split("_")[0]].embed.fields = [];
                        for (let j = 0; j < categoryToSave.settings.length; j++) {
                            let settingValue = String((await (categoryToSave.settings[j].fetch()) || "Unconfigured")).replace(/\n/g, " ");
                            if (settingValue.length > 100) settingValue = settingValue.substring(0, 100) + "...";
                            categoryToSave.settings[j].description = categoryToSave.settings[j].description.split("\n")[0] + "\n" + "Currently: **" + settingValue + "**";
                            categoryData[i.customId.split("_")[0]].embed.fields.push({ name: `${categoryToSave.settings[j].name}`, value: `${categoryToSave.settings[j].description}` });
                        }
                        await i.editReply({
                            embeds: [categoryData[i.customId.split("_")[0]].embed],
                            components: [categoryData[i.customId.split("_")[0]].buttons(), categorySelector]
                        });
                    }
                    break;
                case "reset":
                    const categoryToReset = options.categories.find(category => category.name === i.customId.split("_")[0]);
                    await categoryToReset.reset();

                    // Refresh the embed
                    categoryData[i.customId.split("_")[0]].embed.fields = [];
                    for (let j = 0; j < categoryToReset.settings.length; j++) {
                        let settingValue = String((await (categoryToReset.settings[j].fetch()) || "Unconfigured")).replace(/\n/g, " ");
                        if (settingValue.length > 100) settingValue = settingValue.substring(0, 100) + "...";
                        categoryToReset.settings[j].description = categoryToReset.settings[j].description.split("\n")[0] + "\n" + "Currently: **" + settingValue + "**";
                        categoryData[i.customId.split("_")[0]].embed.fields.push({ name: `${categoryToReset.settings[j].name}`, value: `${categoryToReset.settings[j].description}` });
                    }
                    await i.deferUpdate();
                    await i.editReply({
                        embeds: [categoryData[i.customId.split("_")[0]].embed],
                        components: [categoryData[i.customId.split("_")[0]].buttons(), categorySelector]
                    });
                    break;
            }
        }
    });

    collector.on('end', async () => dashboardMessage.edit({ embeds: [options.closeEmbed], components: [] }).catch(() => { }));
}