import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerGlobals, useParticipant } from '@livekit/react-native';
import { useAudioRoom } from './room';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

registerGlobals();

interface FunctionalProps {
  roomId: string;
  accessToken: string;
  readonly?: boolean;
  onEvent?: (event: any) => void;
}

export function Functional(props: FunctionalProps) {
  const { roomId, accessToken, readonly, onEvent } = props;
  const webViewRef = useRef<WebView>(null);
  const [defaultMic, setDefaultMic] = useState(false);
  const [defaultReadonly, setDefaultReadonly] = useState(false);

  const { room, connect, disconnect } = useAudioRoom();

  const { microphonePublication } = useParticipant(room.localParticipant);

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
        setDefaultMic(false);
        break;

      case 'app.event.unmute':
        setDefaultMic(true);
        break;

      default:
        break;
    }
  };

  useLayoutEffect(() => {
    if (defaultMic) microphonePublication?.handleUnmuted();
    else microphonePublication?.handleMuted();
  }, [defaultMic, microphonePublication]);

  const handleDefaultValues = useCallback(() => {
    if (!defaultReadonly) setDefaultReadonly(!!readonly);
  }, [defaultReadonly, readonly]);

  useLayoutEffect(() => {
    handleDefaultValues();

    if (!webViewRef.current) return;

    webViewRef.current.postMessage(
      JSON.stringify({ type: 'app.readonly.changed', data: { readonly } })
    );
  }, [readonly, handleDefaultValues]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.container}
        originWhitelist={['*']}
        source={{
          uri: `https://draw.seoltab.com/whiteboard?room_id=${roomId}&access_token=${accessToken}&readonly=${defaultReadonly}`,
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
