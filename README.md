<h1 align="center">
    ⚙️ Discord.js Internal Dashboard ⚙️
</h1>

Create a minimal dashboard for your discord bot using select menus, modals and buttons.

[![NPM](https://nodei.co/npm/discord.js-internal-dashboard.png)](https://npmjs.com/package/discord.js-internal-dashboard)

[![Downloads](https://img.shields.io/npm/dt/discord.js-internal-dashboard?logo=npm&style=flat-square)](https://npmjs.com/package/discord.js-internal-dashboard) [![Discord Server](https://img.shields.io/discord/667479986214666272?logo=discord&logoColor=white&style=flat-square)](https://discord.gg/P2g24jp)

## Features

- 🛠️ <b>Fully Customisable</b> | This is your dashboard, and you should be allowed to make it your own. That's why this package allows almost every aspect of the dashboard to be customised!

- 🤔 <b>Intuitive</b> | The user interface is designed to be intuitive, and easy to use!

- 🤖 <b>Slash Command & Message Support</b> | No matter how your bot receives its commands, you can simply pass in a `CommandInteraction` or `Message` and it will work!


## Install Package

<b>Note:</b> Before you can use this package, you will need to make sure you have at least <b>Discord.js <u>13.7</u></b> or later installed in your project.

To install this powerful package, simply type the following command into your terminal:

`npm i discord.js-internal-dashboard --save`

## Getting Started

Once you have installed the package, you should first import it into your project:

```js
const dashboard = require("discord.js-internal-dashboard");
```

To create and show the dashboard, simply listen for a `Message` or `CommandInteraction`, and then pass it to the package itself, followed by the dashboard's options.

Example:

```js
/* Assuming:
    - "client" is a Discord.js Client
    - "options" are the options for the dashboard
*/

client.on("messageCreate", message => {
    dashboard(message, options); // Options are explained below!
});
```

## Dashboard Options Example

Below is a full example of the dashboard's options using a `Discord.Message` as the input, and the options are what are used to bring the dashboard to life.

Copy this and use it as a starting point for your own dashboard if you wish!

```js
/* Assuming:
    - "Discord" is Discord.js imported
    - "client" is a Discord.js Client
    - "message" is a Discord Message
    - "db" is a key-value store, such as a quick.db instance
*/

{
    timeout: 60000, // OPTIONAL, defaults to 150000. Time in milliseconds of inactivity until the dashboard closes.
    startEmbed: {
        showCategoriesAndDescriptions: true, // OPTIONAL, defaults to "true". Whether or not to show category names and descriptions.
        embed: new Discord.MessageEmbed() // OPTIONAL. Design the embed here.
            .setTitle("Start Embed")
            .setDescription("This is the first embed that the user will see when they initiate the internal dashboard!")
            .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }))
            .setColor("GREEN"),
    },
    categoryEmbed: new Discord.MessageEmbed() // OPTIONAL. Design the embed here.
        .setTitle("Category Embed")
        .setDescription("This is the category embed description! It will appear on every category.")
        .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }))
        .setColor("YELLOW"),
    closeEmbed: new Discord.MessageEmbed() // OPTIONAL. Design the embed here.
        .setTitle("Close Embed")
        .setDescription("This embed will be shown when the dashboard buttons and selection menus time out.")
        .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }))
        .setColor("RED"),
    categories: [
        {
            name: "General Settings",
            emoji: "⚙️", // OPTIONAL. The emoji to use for the category on the selection menu.
            description: "The general settings for the bot.",
            settings: [
                {
                    name: "Prefix",
                    description: "The prefix that will be used for commands.",
                    type: "textinput", // or "textarea" for a larger text inputs.
                    maxLength: 5, // OPTIONAL. The MAXIMUM length of the textinput/textarea (if used).
                    required: true, // OPTIONAL, defaults to false. Whether or not entering a new value into the setting is required.
                    fetch: async () => {
                        // Get and return the saved value of the setting here.
                        return await db.get(`${message.guild.id}.general.prefix`) || "!";
                    },
                    save: async (value) => {
                        // Save the value of the setting here.
                        await db.set(`${message.guild.id}.general.prefix`, value);
                    }
                },
                {
                    name: "Language",
                    description: "The language you would like the bot to use.",
                    type: "textinput", // or "textarea" for a larger text inputs.
                    minLength: 4, // OPTIONAL. The MINIMUM length of the textinput/textarea (if used).
                    required: true, // OPTIONAL, defaults to false. Whether or not entering a new value into the setting is required.
                    fetch: async () => {
                        // Get and return the saved value of the setting here.
                        return await db.get(`${message.guild.id}.general.language`) || "English";
                    },
                    save: async (value) => {
                        // Save the value of the setting here.
                        await db.set(`${message.guild.id}.general.language`, value);
                    }
                }
            ],
            reset: async () => {
                // OPTIONAL. Reset the value of the setting to the default here.
                await db.delete(`${message.guild.id}.general`);
            }
        },
        {
            name: "Welcome/Goodbye Message Settings",
            emoji: "👋",
            description: "Customize the Welcome and Goodbye Messages.",
            settings: [
                {
                    name: "Welcome Message",
                    description: "The welcome message that will be sent to new members.",
                    type: "textarea",
                    minLength: 10,
                    maxLength: 150,
                    required: true,
                    fetch: async () => {
                        return await db.get(`${message.guild.id}.greetings.welcomeMessage`);
                    },
                    save: async (value) => {
                        await db.set(`${message.guild.id}.greetings.welcomeMessage`, value);
                    }
                },
                {
                    name: "Goodbye Message",
                    description: "The goodbye message that will be sent to members who have left the server.",
                    type: "textarea",
                    minLength: 10,
                    maxLength: 150,
                    required: false,
                    fetch: async () => {
                        return await db.get(`${message.guild.id}.greetings.goodbyeMessage`);
                    },
                    save: async (value) => {
                        await db.set(`${message.guild.id}.greetings.goodbyeMessage`, value);
                    }
                }
            ],
            reset: async () => {
                await db.delete(`${message.guild.id}.greetings`);
            }
        }
    ]
}
```

## What does it look like?

Below is a GIF showing the dashboard in action using the example above!

![Dashboard GIF Preview](https://i.imgur.com/V8AUX1W.gif)

## Contact Us

- 👋 Need Help? [Join Our Discord Server](https://discord.gg/P2g24jp)!

- 👾 Found a Bug? [Open an Issue](https://github.com/WillTDA/Discord.js-Internal-Dashboard/issues), or Fork and [Submit a Pull Request](https://github.com/WillTDA/Discord.js-Internal-Dashboard/pulls) on our [GitHub Repository](https://github.com/WillTDA/Discord.js-Internal-Dashboard)!