<div align="center">
  <img id="top" src="https://share.valhalladev.org/u/ValkyrieCore.png" width="100%" alt="ValkyrieCore Banner">

# 🤖 ValkyrieCore: Your Gateway to Bot Development! 🚀

  <p>
    <a href="https://discord.gg/Q3ZhdRJ"><img src="https://img.shields.io/discord/495602800802398212.svg?colorB=5865F2&logo=discord&logoColor=white&style=for-the-badge" alt="Discord"></a>
    <a href="https://github.com/Valhalla-Development/ValkyrieCore/stargazers"><img src="https://img.shields.io/github/stars/Valhalla-Development/ValkyrieCore.svg?style=for-the-badge&color=yellow" alt="Stars"></a>
    <a href="https://github.com/Valhalla-Development/ValkyrieCore/network/members"><img src="https://img.shields.io/github/forks/Valhalla-Development/ValkyrieCore.svg?style=for-the-badge&color=orange" alt="Forks"></a>
    <a href="https://github.com/Valhalla-Development/ValkyrieCore/issues"><img src="https://img.shields.io/github/issues/Valhalla-Development/ValkyrieCore.svg?style=for-the-badge&color=red" alt="Issues"></a>
    <a href="https://github.com/Valhalla-Development/ValkyrieCore/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Valhalla-Development/ValkyrieCore.svg?style=for-the-badge&color=blue" alt="License"></a>
    <br>
    <a href="https://app.codacy.com/gh/Valhalla-Development/ValkyrieCore/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://img.shields.io/codacy/grade/35dc6923982948059450c3365912d1a1?style=for-the-badge&color=brightgreen" alt="Codacy"></a>
    <a href="#"><img src="https://img.shields.io/badge/Powered%20by-discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Powered by discord.js"></a>
    <a href="#"><img src="https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Made with TypeScript"></a>
  </p>

  <p><em>A robust foundation for creating powerful Discord bots with modern features and best practices!</em></p>
</div>

---
## 🌟 Welcome to the ValkyrieCore, a Discord Bot Template!

This project provides a solid foundation for creating a Discord bot using [discordx](https://discord-x.js.org/) and [discord.js v14](https://discord.js.org/), designed with scalability and ease of use in mind.

## 🎮 Features That Power Your Bot

<table>
  <tr>
    <td width="50%">
      <h3>📊 Bot Info Dashboard</h3>
      <p>Detailed startup metrics showing users, guilds, commands, and system specs.</p>
    </td>
    <td width="50%">
      <h3>🛡️ Robust Error Handling</h3>
      <p>Comprehensive error tracking with console and Discord channel logging.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📝 Command Logging</h3>
      <p>Track command usage with formatted embeds sent to your designated channel.</p>
    </td>
    <td width="50%">
      <h3>🔄 Hybrid Sharding</h3>
      <p>Efficient sharding system using worker threads for better scalability and performance.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚡ Performance Optimized</h3>
      <p>Built with efficiency in mind to handle commands quickly and reliably.</p>
    </td>
    <td width="50%">
      <h3>❓ Interactive Help Menu</h3>
      <p>Dynamic help command with slash command links for intuitive user experience.</p>
    </td>
  </tr>
</table>

## 🚀 Requirements

- [Bun](https://bun.sh/)
- [Discord Account](https://discord.com/)

## 🛠️ Setup Guide

1. [Download](https://github.com/Valhalla-Development/ValkyrieCore/releases) the latest release (click on 'Source code (zip)').

2. Extract and move the files to your desired location.

3. Install Bun:
   - Mac/Linux:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```
   - Windows:
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```

4. Navigate to your project folder:
    ```bash
    cd /path/to/your/extracted/source
    ```

5. Rename `.env.example` to `.env` and fill in your bot's details:
   - [Bot Token Guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
   - [Owner ID Guide](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)

6. Install dependencies:
    ```bash
    bun install
    ```

7. Start the bot:
    ```bash
    bun start
    ```

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <strong>Bot Info</strong><br>
        <img src="https://share.valhalladev.org/u/BotStartupInfo.png" width="400px" alt="Bot Info">
      </td>
      <td align="center" width="50%">
        <strong>Error Handling</strong><br>
        <img src="https://share.valhalladev.org/u/BotErrorHandler.png" width="400px" alt="Error Handler">
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <strong>Command Logging</strong><br>
        <img src="https://share.valhalladev.org/u/BotCommandLogging.png" width="400px" alt="Command Logger">
      </td>
      <td align="center" width="50%">
        <strong>Help Command</strong><br>
        <em>Automatically enables pagination when multiple command categories exist</em><br>
        <img src="https://share.valhalladev.org/u/BotHelpCommandDiscord.png" width="400px" alt="Help Command">
      </td>
    </tr>
  </table>
</div>

## 🤝 Contributing

We welcome contributions to improve this template! If you'd like to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them with a clear, descriptive message:
   ```bash
   git commit -m 'Add feature: brief description of your changes'
   ```
4. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request against the main repository's `main` branch

Please ensure your code adheres to the project's coding standards and include tests for new features or bug fixes where applicable. We appreciate detailed descriptions in your Pull Request to help with the review process.

## 📜 License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details. (It's mostly "Share the love, and keep it open!")

## 🙏 Acknowledgements

- [discord.js](https://discord.js.org/) for the powerful Discord API wrapper
- [discordx](https://discord-x.js.org/) for the decorator-based command framework
- [Bun](https://bun.sh/) for the blazing fast JavaScript runtime
- All our contributors and supporters who help improve this template

## 📬 Support & Community

Got questions or need help? Join our [Discord server](https://discord.gg/Q3ZhdRJ) for support and to connect with other bot developers!

---

<div align="center">

💻 Crafted with ❤️ by [Valhalla-Development](https://github.com/Valhalla-Development)

[🐛 Spotted an issue?](https://github.com/Valhalla-Development/ValkyrieCore/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml&title=%5BBUG%5D+Short+Description) | [💡 Got an idea?](https://github.com/Valhalla-Development/ValkyrieCore/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yml&title=%5BFeature%5D+Short+Description) | [🤔 Need help?](https://discord.gg/Q3ZhdRJ)

<a href="#top">🔝 Back to Top</a>
</div>
