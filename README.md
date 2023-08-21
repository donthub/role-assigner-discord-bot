# Role assigner discord bot

## Setup

* Create bot: https://discord.com/developers/applications

* OAuth2:
  * Scopes:
    * `applications.commands`
    * `bot`
  * Bot permissions:
    * Manage Roles

* `config.json`:
  * `token`: Bot > Token
  * `clientId`: [Discord Developer Portal](https://discord.com/developers/applications) > General Information > Application ID
  * `guildId`: [Enable developer modde](https://support.discord.com/hc/en-us/articles/206346498) > Right click server > Copy Server ID
  * `roles`: List of roles
    * `id`: Right click role > Copy Role ID
    * `name`: Role name
    * `alternatives`: List of alternative names

* Server configuration:
  * Bot role should be higher than roles it would assign

* `npm install`: Install dependencies

## Usage

* `node deploy-commands.js`: Deploy commands
* `node index.js`: Process user interaction

## Example

![Example](example.apng)