/**
 * @name ModerStaffHighlighter
 * @description Модераторская шняга
 * @version 0.1
 * @author Shizik
 * @website https://github.com/Je2iK/ModerStaffHighLighter
 * @source https://raw.githubusercontent.com/Je2iK/ModerStaffHighLighter/main/ModerStaffHighLighter.plugin.js
 */

/*@cc_on
@if (@_jscript)

  // Offer to self-install for clueless users that try to run this directly.
  var shell = WScript.CreateObject("WScript.Shell");
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\Roaming\BetterDiscord\plugins");
  var pathSelf = WScript.ScriptFullName;
  // Put the user at ease by addressing them in the first person
  shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
  if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
    shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
  } else if (!fs.FolderExists(pathPlugins)) {
    shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
  } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
    fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
    // Show the user where to put plugins in the future
    shell.Exec("explorer " + pathPlugins);
    shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
  }
  WScript.Quit();

@else@*/
const config = {
    name: "ModerStaffHighlighter",
    author: "shizik",
    version: "0.1",
    description: "Модерская шняга",
    github: "https://github.com/Je2iK/ModerStaffHighLighter",
    github_raw:
        "https://raw.githubusercontent.com/Je2iK/ModerStaffHighLighter/main/ModerStaffHighLighter.plugin.js",
    changelog: [
        {
        },
    ],
    defaultConfig: [
    ],
    main: "index.js",
};
class Dummy {
    constructor() {
        this._config = config;
    }
    start() {}
    stop() {}
}

if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal(
        "Library Missing",
        `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`,
        {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => {
                require("request").get(
                    "https://betterdiscord.app/gh-redirect?id=9",
                    async (err, resp, body) => {
                        if (err)
                            return require("electron").shell.openExternal(
                                "https://betterdiscord.app/Download?id=9",
                            );
                        if (resp.statusCode === 302) {
                            require("request").get(
                                resp.headers.location,
                                async (error, response, content) => {
                                    if (error)
                                        return require("electron").shell.openExternal(
                                            "https://betterdiscord.app/Download?id=9",
                                        );
                                    await new Promise((r) =>
                                        require("fs").writeFile(
                                            require("path").join(
                                                BdApi.Plugins.folder,
                                                "0PluginLibrary.plugin.js",
                                            ),
                                            content,
                                            r,
                                        ),
                                    );
                                },
                            );
                        } else {
                            await new Promise((r) =>
                                require("fs").writeFile(
                                    require("path").join(
                                        BdApi.Plugins.folder,
                                        "0PluginLibrary.plugin.js",
                                    ),
                                    body,
                                    r,
                                ),
                            );
                        }
                    },
                );
            },
        },
    );
}

function MentionWrapper({ data, UserMention, props }) {   // if userId is set it means the user is cached. Uncached users have userId set to undefined
    if (userId)
        return UserMention

    // Parses the raw text node array data.content into a ReactNode[]: ["<@userid>"]
    const children = (data.content, props);

    return (
        // Discord is deranged and renders unknown user mentions as role mentions
    addEventListener("a", onmouseenter => {
                    const mention = children?.[0]?.props?.children;
                    if (typeof mention !== "string") return;

                    const id = mention 
                    if (!id) return;

                    if (fetching.has(id))
                        return;

                    if (UserStore.getUser(id))
                        return setUserId(id);

                   
                }))
};

module.exports = !global.ZeresPluginLibrary
    ? Dummy
    : (([Plugin, Api]) => {
          const plugin = (Plugin, Api) => {
              const {
                  WebpackModules,
                  DiscordModules,
                  Patcher,
                  Utilities,
                  Logger,
                  ColorConverter,
              } = Api;
              const { ReactUtils, Utils } = window.BdApi;

              const GuildMemberStore = DiscordModules.GuildMemberStore;
              const SelectedGuildStore = DiscordModules.SelectedGuildStore;
              const ChannelStore = DiscordModules.ChannelStore;
              return class BetterRoleColors extends Plugin {
                  onStart() {
                      Utilities.suppressErrors(
                          this.patchVoiceUsers.bind(this),
                          "voice users patch",
                      )();
                      Utilities.suppressErrors(
                          this.patchMessageContent.bind(this),
                          "message content patch",
                      )();

                      this.promises = {
                          state: { cancelled: false },
                          cancel() {
                              this.state.cancelled = true;
                          },
                      };
                  }

                  onStop() {
                      Patcher.unpatchAll();
                      this.promises.cancel();
                      if (this.unpatchAccountDetails) {
                          this.unpatchAccountDetails();
                          delete this.unpatchAccountDetails;
                      }
                  }

                  getSettingsPanel() {
                      return this.buildSettingsPanel().getElement();
                  }

                  getMember(userId, guild = "") {
                      const guildId = guild || SelectedGuildStore.getGuildId();
                      if (!guildId) return null;
                      const member = GuildMemberStore.getMember(
                          guildId,
                          userId,
                      );
                      if (!guildId) return null;
                      return member;
                  }


                  observer({ addedNodes }) {
                      if (!addedNodes?.length) return;
                      const element = addedNodes[0];
                      if (element.nodeType !== 1) return;
                      this.colorMentions(element);
                  }

                  colorMentions(element) {
                      if (!this.settings.global.mentions) return;
                      if (element.matches(".mention")) element = [element];
                      element = element.querySelectorAll(".mention");
                      if (!element?.length) return;
                      for (const mention of element) {
                          if (
                              mention.className.includes("role") ||
                              mention.className.includes("command")
                          )
                              continue;
                          const instance =
                              ReactUtils.getInternalInstance(mention);
                          if (!instance) continue;
                          const props = Utils.findInTree(
                              instance,
                              (p) => p?.userId || (p?.id && p?.guildId),
                              { walkable: ["memoizedProps", "return"] },
                          );
                          if (!props) continue;
                          const member = GuildMemberStore.getMember(
                              SelectedGuildStore.getGuildId(),
                              props.userId ?? props.id,
                          );
                          if (!member?.roles) continue;
                          if (this.settings.global.saturation)
                              mention.dataset.accessibility = "desaturate"; // Add to desaturation list for Discord
                          if (member.roles.includes("1089890623751999530")) {
                              const colorstring = "#a70000";
                              mention.style.setProperty("color", colorstring);
                              mention.style.setProperty(
                                  "background-color",
                                  `rgb(${ColorConverter.getRGB(colorstring).join(", ")}, 0.1)`,
                              );
                              mention.addEventListener("mouseenter", () =>
                                  mention.style.setProperty(
                                      "background-color",
                                      `rgb(${ColorConverter.getRGB(colorstring).join(", ")}, 0.3)`,
                                  ),
                              );
                              mention.addEventListener("mouseleave", () =>
                                  mention.style.setProperty(
                                      "background-color",
                                      `rgb(${ColorConverter.getRGB(colorstring).join(", ")}, 0.1)`,
                                  ),
                              );
                          }
                          if (!member.roles.includes("1089890623751999530")) {
                              const colorstring = "#00c244";
                              mention.style.setProperty("color", colorstring);
                              mention.style.setProperty(
                                  "background-color",
                                  `rgb(${ColorConverter.getRGB(colorstring).join(", ")}, 0.1)`,
                              );
                              mention.addEventListener("mouseenter", () =>
                                  mention.style.setProperty(
                                      "background-color",
                                      `rgb(${ColorConverter.getRGB(colorstring).join(", ")}, 0.3)`,
                                  ),
                              );
                              mention.addEventListener("mouseleave", () =>
                                  mention.style.setProperty(
                                      "background-color",
                                      `rgb(${ColorConverter.getRGB(colorstring).join(", ")}, 0.1)`,
                                  ),
                              );
                          }
                      }
                  }
              };
          };
          return plugin(Plugin, Api);
      })(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/
