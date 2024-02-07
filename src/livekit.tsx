import { Room } from 'livekit-client';
import { AudioSession } from '@livekit/react-native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export const RoomPage = ({ url, token }: { url: string; token: string }) => {
  // Setup Room state
  const [room] = useState(() => new Room());

  // Connect to Room
  useEffect(() => {
    const connect = async () => {
      await AudioSession.startAudioSession();
      await room.connect(url, token, {});
    };
    connect();

    return () => {
      room.disconnect();
      AudioSession.stopAudioSession();
    };
  }, [url, token, room]);

  return <View />;
};
