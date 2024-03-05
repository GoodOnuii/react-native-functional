import React from 'react';

import { StyleSheet, View } from 'react-native';
import { Functional } from 'react-native-functional';

export default function App() {
  return (
    <View style={styles.container}>
      <Functional
        roomId={'id'}
        accessToken={'token'}
        readonly={false}
        onEvent={(event) => {
          console.log('event: ', event);
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
