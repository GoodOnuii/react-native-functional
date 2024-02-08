import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerGlobals } from '@livekit/react-native';
import { useAudioRoom } from './room';
import React, { useRef } from 'react';

registerGlobals();

interface FunctionalProps {
  roomId: string;
  accessToken: string;
  onEvent?: (event: any) => void;
}

export function Functional(props: FunctionalProps) {
  const { roomId, accessToken, onEvent } = props;
  const webViewRef = useRef(null);

  const { connect, disconnect, microphonePublication } = useAudioRoom();

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    //receive message from the web page. working here until here
    const data = JSON.parse(event.nativeEvent.data);

    if (onEvent) onEvent(data);

    switch (data.type) {
      case 'app.event.join':
        connect({
          url: data.data.url,
          token: data.data.token,
        });
        break;

      case 'app.event.left':
        disconnect();
        break;

      case 'app.event.mute':
        microphonePublication?.handleMuted();
        break;

      case 'app.event.unmute':
        microphonePublication?.handleUnmuted();
        break;

      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.container}
        originWhitelist={['*']}
        source={{
          uri: `https://draw.seoltab.com/whiteboard?room_id=${roomId}&access_token=${accessToken}`,
        }}
        allowsInlineMediaPlayback={true}
        onMessage={onMessage}
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
