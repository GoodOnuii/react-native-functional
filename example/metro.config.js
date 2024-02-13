const path = require('path');
const escape = require('escape-string-regexp');
const { getDefaultConfig } = require('@expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pak = require('../package.json');
const resolveFrom = require('resolve-from');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pak.peerDependencies });

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  ...defaultConfig,

  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we block them at the root, and alias them to the versions in example's node_modules
  resolver: {
    ...defaultConfig.resolver,

    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      )
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),

    resolveRequest: (context, moduleName, platform) => {
      if (
        // If the bundle is resolving "event-target-shim" from a module that is part of "react-native-webrtc".
        moduleName.startsWith('event-target-shim') &&
        context.originModulePath.includes('react-native-webrtc')
      ) {
        // Resolve event-target-shim relative to the react-native-webrtc package to use v6.
        // React Native requires v5 which is not compatible with react-native-webrtc.
        const eventTargetShimPath = resolveFrom(
          context.originModulePath,
          moduleName
        );

        return {
          filePath: eventTargetShimPath,
          type: 'sourceFile',
        };
      }

      // Ensure you call the default resolver.
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = config;
