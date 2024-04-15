import { Room } from 'livekit-client';
import { AudioSession, useParticipant } from '@livekit/react-native';
import { useCallback, useEffect, useState } from 'react';

export const useAudioRoom = () => {
  // Setup Room state
  const [room] = useState(() => {
    return new Room({
      reconnectPolicy: {
        nextRetryDelayInMs: () => 3000,
      },
    });
  });

  const { microphonePublication } = useParticipant(room.localParticipant);

  const connect = useCallback(
    async ({ url, token }: { url: string; token: string }) => {
      await AudioSession.getAudioOutputs();
      await AudioSession.setAppleAudioConfiguration({
        audioMode: 'default',
        audioCategory: 'playAndRecord',
        audioCategoryOptions: ['mixWithOthers'],
      });
      await AudioSession.startAudioSession();
      await room.connect(url, token, {});
      await room.localParticipant.setMicrophoneEnabled(true);
    },
    [room]
  );

  const disconnect = useCallback(() => {
    room.disconnect();
    AudioSession.stopAudioSession();
  }, [room]);

  useEffect(() => {
    // connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    room,
    connect,
    disconnect,
    microphonePublication,
  };
};
