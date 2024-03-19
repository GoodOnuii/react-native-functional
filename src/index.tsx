import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerGlobals, useParticipant } from '@livekit/react-native';
import { useAudioRoom } from './room';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

registerGlobals();

interface FunctionalProps {
  roomId: string;
  accessToken: string;
  value?: {
    lessonStarted?: boolean;
    homeworkSubmitted?: boolean;
    isAnswerOpen?: boolean;
    appToken?: string;
  };
  readonly?: boolean;
  onEvent?: (event: any) => void;
}

export function Functional(props: FunctionalProps) {
  const { roomId, accessToken, readonly, value, onEvent } = props;
  const webViewRef = useRef<WebView>(null);
  const [defaultMic, setDefaultMic] = useState(false);
  const [defaultValue, setDefaultValue] = useState({
    init: true,
    readonly: false,
    lessonStarted: false,
    homeworkSubmitted: false,
    isAnswerOpen: false,
    appToken: '',
  });

  const { room, connect, disconnect } = useAudioRoom();

  const { microphonePublication } = useParticipant(room.localParticipant);

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    // receive message from the web page. working here until here
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
    if (!defaultValue.init) {
      setDefaultValue({
        init: true,
        lessonStarted: !!value?.lessonStarted,
        homeworkSubmitted: !!value?.homeworkSubmitted,
        isAnswerOpen: !!value?.isAnswerOpen,
        appToken: value?.appToken ?? '',
        readonly: !!readonly,
      });
    }
  }, [defaultValue, value, readonly]);

  useLayoutEffect(() => {
    handleDefaultValues();

    if (!webViewRef.current) return;

    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'app.value.changed',
        data: {
          readonly: readonly,
          lessonStarted: value?.lessonStarted,
          homeworkSubmitted: value?.homeworkSubmitted,
          isAnswerOpen: value?.isAnswerOpen,
          appToken: value?.appToken,
        },
      })
    );
  }, [handleDefaultValues, value, readonly]);

  const params = new URLSearchParams({
    room_id: roomId,
    access_token: accessToken,
    readonly: `${defaultValue.readonly}`,
    lesson_started: `${defaultValue.lessonStarted}`,
    homework_submitted: `${defaultValue.homeworkSubmitted}`,
    is_answer_open: `${defaultValue.isAnswerOpen}`,
    app_token: defaultValue.appToken,
  });

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.container}
        originWhitelist={['*']}
        source={{
          uri: `https://draw.seoltab.com/whiteboard?${params}`,
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
