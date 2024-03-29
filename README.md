# react-native-functional

react-native-functional

## Installation

```sh
npm install react-native-functional
```

This library depends on `@livekit/react-native-webrtc`, which has additional installation instructions found here:

- [iOS Installation Guide](https://github.com/livekit/react-native-webrtc/blob/master/Documentation/iOSInstallation.md)
- [Android Installation Guide](https://github.com/livekit/react-native-webrtc/blob/master/Documentation/AndroidInstallation.md)

---

Once the `@livekit/react-native-webrtc` dependency is installed, one last step is needed to finish the installation:

### Android

In your [MainApplication.java](https://github.com/livekit/client-sdk-react-native/blob/main/example/android/app/src/main/java/com/example/livekitreactnative/MainApplication.java) file:

#### Java

```java
import com.livekit.reactnative.LiveKitReactNative;
import com.livekit.reactnative.audio.AudioType;

public class MainApplication extends Application implements ReactApplication {

  @Override
  public void onCreate() {
    // Place this above any other RN related initialization
    // When AudioType is omitted, it'll default to CommunicationAudioType.
    // Use MediaAudioType if user is only consuming audio, and not publishing.
    LiveKitReactNative.setup(this, new AudioType.CommunicationAudioType());

    //...
  }
}
```

Or in your **MainApplication.kt** if you are using RN 0.73+

#### Kotlin

```kotlin
import com.livekit.reactnative.LiveKitReactNative
import com.livekit.reactnative.audio.AudioType

class MainApplication : Application, ReactApplication() {
  override fun onCreate() {
    // Place this above any other RN related initialization
    // When AudioType is omitted, it'll default to CommunicationAudioType.
    // Use MediaAudioType if user is only consuming audio, and not publishing.
    LiveKitReactNative.setup(this, AudioType.CommunicationAudioType())

    //...
  }
}
```

---

### iOS

In your [AppDelegate.m](https://github.com/livekit/client-sdk-react-native/blob/main/example/ios/LivekitReactNativeExample/AppDelegate.mm) file:

```objc
#import "LivekitReactNative.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Place this above any other RN related initialization
  [LivekitReactNative setup];

  //...
}
```

### Expo

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).
> First install the package with yarn, npm, or [`npx expo install`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
npx expo install react-native-webrtc @config-plugins/react-native-webrtc
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["@config-plugins/react-native-webrtc"]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

#### Event Target Shim

> SDK 50 and greater.

React Native uses `event-target-shim@5` which is not compatible with `react-native-webrtc`'s dependency on `event-target-shim@6`. To fix this, you may need to add a redirection in your `metro.config.js` file:

```js
// metro.config.js

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const resolveFrom = require('resolve-from');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
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
};

module.exports = config;
```

### API

The plugin provides props for extra customization. Every time you change the props or plugins, you'll need to rebuild (and `prebuild`) the native app. If no extra properties are added, defaults will be used.

- `cameraPermission` (_string_): Sets the iOS `NSCameraUsageDescription` permission message to the `Info.plist`. Defaults to `Allow $(PRODUCT_NAME) to access your camera`.
- `microphonePermission` (_string_): Sets the iOS `NSMicrophoneUsageDescription` permission message to the `Info.plist`. Defaults to `Allow $(PRODUCT_NAME) to access your microphone`.

`app.config.js`

```ts
export default {
  plugins: [
    [
      '@config-plugins/react-native-webrtc',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
      },
    ],
  ],
};
```

### Important Notes

- For iOS, this plugin disables Bitcodes for all builds (required).
- For Android, this plugin disables desugaring in `gradle.properties`: `android.enableDexingArtifactTransform.desugaring=false` and the [minimum deployment target is changed to `24`](https://github.com/react-native-webrtc/react-native-webrtc/issues/720#issuecomment-552374206) (from `21`) which may break other packages in your app!

### Manual Setup

For bare workflow projects, you can follow the manual setup guides:

- [iOS](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/iOSInstallation.md)
- [Android](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/AndroidInstallation.md)

## Usage

```js
import { Functional } from 'react-native-functional';

// ...

return (
  <Functional
    roomId={'id'}
    accessToken={'token'}
    onEvent={(event) => {
      // ...
    }}
  />
);
```

Config plugin to auto-configure `react-native-webrtc` when the native code is generated (`npx expo prebuild`). [Upstream PR](https://github.com/react-native-webrtc/react-native-webrtc/pull/1013).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
