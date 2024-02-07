import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerGlobals } from '@livekit/react-native';
import { RoomPage } from './livekit';
import React, { useRef } from 'react';

registerGlobals();

interface FunctionalProps {
  roomId: string;
  accessToken: string;
  onEvent?: (event: any) => void;
}

export default function Functional(props: FunctionalProps) {
  const { roomId, accessToken, onEvent } = props;
  const webViewRef = useRef(null);

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    //receive message from the web page. working here until here
    const data = JSON.parse(event.nativeEvent.data);

    if (onEvent) onEvent(data);
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
      <RoomPage url="url" token="token" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
