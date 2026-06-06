const fs = require("fs");
const path = require("path");
const {
  IOSConfig,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} = require("expo/config-plugins");

const PLUGIN_NAME = "align-voip-pushkit";
const VOIP_HEADER_SEARCH_PATH =
  '"$(SRCROOT)/../node_modules/react-native-voip-push-notification/ios/RNVoipPushNotification"';

function unquote(value) {
  return typeof value === "string" ? value.replace(/^"(.*)"$/, "$1") : value;
}

function withoutCommentKeys(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !/_comment$/.test(key))
  );
}

function ensureHeaderSearchPath(project, searchPath) {
  const configurations = withoutCommentKeys(project.pbxXCBuildConfigurationSection());
  const inherited = '"$(inherited)"';

  for (const key of Object.keys(configurations)) {
    const buildSettings = configurations[key].buildSettings;
    if (unquote(buildSettings.PRODUCT_NAME) !== project.productName) continue;

    if (!buildSettings.HEADER_SEARCH_PATHS) {
      buildSettings.HEADER_SEARCH_PATHS = [inherited];
    }
    if (!buildSettings.HEADER_SEARCH_PATHS.includes(searchPath)) {
      buildSettings.HEADER_SEARCH_PATHS.push(searchPath);
    }
  }
}

function ensureArrayValue(values, value) {
  if (!Array.isArray(values)) return [value];
  return values.includes(value) ? values : [...values, value];
}

function upsertGeneratedBlock(source, marker, block, insertionPoint) {
  const begin = `// @generated begin ${PLUGIN_NAME}-${marker}`;
  const end = `// @generated end ${PLUGIN_NAME}-${marker}`;
  const generated = `${begin}\n${block.trimEnd()}\n${end}`;
  const pattern = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`);

  if (pattern.test(source)) {
    return source.replace(pattern, generated);
  }

  return insertionPoint(source, generated);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findIosSourceFile(platformProjectRoot, fileName) {
  const entries = fs.readdirSync(platformProjectRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(platformProjectRoot, entry.name, fileName);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not find iOS ${fileName}`);
}

function patchBridgingHeader(contents) {
  const imports = [
    '#import "RNCallKeep.h"',
    '#import "RNVoipPushNotificationManager.h"',
  ];

  let next = contents;
  for (const importLine of imports) {
    if (!next.includes(importLine)) {
      next = `${next.trimEnd()}\n${importLine}\n`;
    }
  }
  return next;
}

function patchAppDelegate(contents) {
  let next = contents;

  if (!next.includes("import PushKit")) {
    next = next.replace("import React\n", "import React\nimport PushKit\n");
  }

  next = next.replace(
    "class AppDelegate: ExpoAppDelegate {",
    "class AppDelegate: ExpoAppDelegate, PKPushRegistryDelegate {"
  );

  const setupBlock = `
    RNCallKeep.setup([
      "appName": "Align",
      "supportsVideo": false,
      "maximumCallGroups": "1",
      "maximumCallsPerCallGroup": "1",
      "includesCallsInRecents": false
    ])
    RNVoipPushNotificationManager.voipRegistration()
`;

  next = upsertGeneratedBlock(next, "setup", setupBlock, (source, generated) =>
    source.replace(
      "    reactNativeFactory = factory\n",
      `    reactNativeFactory = factory\n\n${indent(generated, 4)}\n`
    )
  );

  const delegateBlock = `
  public func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }

  public func pushRegistry(
    _ registry: PKPushRegistry,
    didInvalidatePushTokenFor type: PKPushType
  ) {
    // APNs will issue a fresh token later. The JS side should treat this as a signal to stop using the old token.
  }

  public func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    let payloadDictionary = payload.dictionaryPayload
    let uuid = payloadDictionary["uuid"] as? String ?? UUID().uuidString
    let handle = payloadDictionary["handle"] as? String ?? "Align"
    let callerName = payloadDictionary["callerName"] as? String ?? "Align"

    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)
    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: handle,
      handleType: "generic",
      hasVideo: false,
      localizedCallerName: callerName,
      supportsHolding: false,
      supportsDTMF: false,
      supportsGrouping: false,
      supportsUngrouping: false,
      fromPushKit: true,
      payload: payloadDictionary,
      withCompletionHandler: completion
    )
  }
`;

  return upsertGeneratedBlock(next, "delegate", delegateBlock, (source, generated) =>
    source.replace("\n}\n\nclass ReactNativeDelegate", `\n${generated}\n}\n\nclass ReactNativeDelegate`)
  );
}

function indent(value, spaces) {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => (line ? `${prefix}${line}` : line))
    .join("\n");
}

const withVoipPushkit = (config, options = {}) => {
  const apsEnvironment = options.apsEnvironment ?? "development";

  config = withInfoPlist(config, (config) => {
    config.modResults.UIBackgroundModes = ensureArrayValue(
      ensureArrayValue(config.modResults.UIBackgroundModes, "voip"),
      "remote-notification"
    );
    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    config.modResults["aps-environment"] = apsEnvironment;
    return config;
  });

  config = withXcodeProject(config, (config) => {
    ensureHeaderSearchPath(config.modResults, VOIP_HEADER_SEARCH_PATH);
    const target = IOSConfig.XcodeUtils.getApplicationNativeTarget({
      project: config.modResults,
      projectName: config.modRequest.projectName,
    });
    config.modResults.addFramework("PushKit.framework", { target: target.uuid });
    return config;
  });

  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const appDelegatePath = findIosSourceFile(config.modRequest.platformProjectRoot, "AppDelegate.swift");
      const bridgingHeaderPath = findIosSourceFile(
        config.modRequest.platformProjectRoot,
        `${config.modRequest.projectName}-Bridging-Header.h`
      );

      fs.writeFileSync(appDelegatePath, patchAppDelegate(fs.readFileSync(appDelegatePath, "utf8")));
      fs.writeFileSync(
        bridgingHeaderPath,
        patchBridgingHeader(fs.readFileSync(bridgingHeaderPath, "utf8"))
      );

      return config;
    },
  ]);

  return config;
};

module.exports = withVoipPushkit;
