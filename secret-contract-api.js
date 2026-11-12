import {createRequire as __createRequire} from "node:module"; import {fileURLToPath as __fileURLToPath} from "node:url"; import {dirname as __dirnameOf} from "node:path"; const require=__createRequire(import.meta.url); const __filename=__fileURLToPath(import.meta.url); const __dirname=__dirnameOf(__filename);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// host-sdk-bridge:openclaw/plugin-sdk/channel-secret-basic-runtime
var channel_secret_basic_runtime_exports = {};
import * as channel_secret_basic_runtime_star from "openclaw/plugin-sdk/channel-secret-basic-runtime";
var init_channel_secret_basic_runtime = __esm({
  "host-sdk-bridge:openclaw/plugin-sdk/channel-secret-basic-runtime"() {
    __reExport(channel_secret_basic_runtime_exports, channel_secret_basic_runtime_star);
  }
});

// OpenClaw-Plugins/lark-project/node_modules/openclaw-lark-patched/secret-contract-api.js
var require_secret_contract_api = __commonJS({
  "OpenClaw-Plugins/lark-project/node_modules/openclaw-lark-patched/secret-contract-api.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.secretTargetRegistryEntries = void 0;
    exports.collectRuntimeConfigAssignments = collectRuntimeConfigAssignments2;
    var channel_secret_basic_runtime_1 = (init_channel_secret_basic_runtime(), __toCommonJS(channel_secret_basic_runtime_exports));
    var SECRET_FIELDS = ["appSecret", "encryptKey", "verificationToken"];
    var WEBHOOK_ONLY_FIELDS = ["encryptKey", "verificationToken"];
    exports.secretTargetRegistryEntries = SECRET_FIELDS.flatMap((field) => {
      const acctPath = `channels.feishu.accounts.*.${field}`;
      const topPath = `channels.feishu.${field}`;
      return [
        {
          id: acctPath,
          targetType: acctPath,
          configFile: "openclaw.json",
          pathPattern: acctPath,
          secretShape: "secret_input",
          expectedResolvedValue: "string",
          includeInPlan: true,
          includeInConfigure: true,
          includeInAudit: true
        },
        {
          id: topPath,
          targetType: topPath,
          configFile: "openclaw.json",
          pathPattern: topPath,
          secretShape: "secret_input",
          expectedResolvedValue: "string",
          includeInPlan: true,
          includeInConfigure: true,
          includeInAudit: true
        }
      ];
    });
    function collectRuntimeConfigAssignments2(params) {
      const resolved = (0, channel_secret_basic_runtime_1.getChannelSurface)(params.config, "feishu");
      if (!resolved)
        return;
      const { channel, surface } = resolved;
      (0, channel_secret_basic_runtime_1.collectSimpleChannelFieldAssignments)({
        channelKey: "feishu",
        field: "appSecret",
        channel,
        surface,
        defaults: params.defaults,
        context: params.context,
        topInactiveReason: "no enabled Feishu account inherits this top-level appSecret.",
        accountInactiveReason: "Feishu account is disabled."
      });
      const baseConnectionMode = (0, channel_secret_basic_runtime_1.normalizeSecretStringValue)(channel.connectionMode) === "webhook" ? "webhook" : "websocket";
      const resolveAccountMode = (account) => (0, channel_secret_basic_runtime_1.hasOwnProperty)(account, "connectionMode") ? (0, channel_secret_basic_runtime_1.normalizeSecretStringValue)(account.connectionMode) : baseConnectionMode;
      for (const field of WEBHOOK_ONLY_FIELDS) {
        (0, channel_secret_basic_runtime_1.collectConditionalChannelFieldAssignments)({
          channelKey: "feishu",
          field,
          channel,
          surface,
          defaults: params.defaults,
          context: params.context,
          topLevelActiveWithoutAccounts: baseConnectionMode === "webhook",
          topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, channel_secret_basic_runtime_1.hasOwnProperty)(account, field) && resolveAccountMode(account) === "webhook",
          accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "webhook",
          topInactiveReason: `no enabled Feishu webhook-mode surface inherits this top-level ${field}.`,
          accountInactiveReason: "Feishu account is disabled or not running in webhook mode."
        });
      }
    }
  }
});

// OpenClaw-Plugins/lark-project/node_modules/openclaw-lark-patched/secret-contract-api.js.entry.mjs
var import_secret_contract_api = __toESM(require_secret_contract_api(), 1);
var secretTargetRegistryEntries = import_secret_contract_api.default.secretTargetRegistryEntries;
var collectRuntimeConfigAssignments = import_secret_contract_api.default.collectRuntimeConfigAssignments;
export {
  collectRuntimeConfigAssignments,
  secretTargetRegistryEntries
};
