import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerGlobals } from '@livekit/react-native';
import React from 'react';

registerGlobals();

export function Functional() {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{
          uri: `https://m.exam4you.com/login`,
          method: 'POST',
          body: JSON.stringify({
            userId: 'besttutor',
            passwd: '12eb67e9020f6533adebf4b4692b48f5',
          }),
          headers: { 'Content-Type': 'application/json' },
        }}
      />
      <WebView
        style={styles.container}
        originWhitelist={['*']}
        source={{
          uri: `https://m.exam4you.com`,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
