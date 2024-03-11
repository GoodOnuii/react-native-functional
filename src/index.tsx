import { StyleSheet, View, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerGlobals } from '@livekit/react-native';
import React from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

registerGlobals();

const downloadFile = async (fileUrl: string) => {
  try {
    const respInfo = await fetch(fileUrl);
    const contentDisposition = respInfo.headers.get('content-disposition');
    if (!contentDisposition) throw new Error('Not found contentDisposition');

    const matchContentDisposition = contentDisposition.match(
      /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/
    );
    if (!matchContentDisposition)
      throw new Error('Not found matchContentDisposition');

    const filename = matchContentDisposition.at(1);
    if (!filename) throw new Error('Not found filename');

    const matchFilename = filename.match(/[^\\]*\.(\w+)$/);
    if (!matchFilename) throw new Error('Not found matchFilename');

    const [name, ext] = matchFilename;
    const {
      dirs: { DownloadDir, DocumentDir },
    } = RNFetchBlob.fs;
    const isIOS = Platform.OS === 'ios';
    const aPath = Platform.select({ ios: DocumentDir, android: DownloadDir });
    const iosPath = `${aPath}/${name}.${ext}`;
    const configOptions = Platform.select({
      ios: {
        fileCache: true,
        path: iosPath,
        appendExt: ext,
      },
      android: {
        fileCache: true,
        path: iosPath,
        appendExt: ext,
        addAndroidDownloads: {
          path: `${aPath}/${name}`,
          useDownloadManager: true,
          description: 'Downloading...',
          mime: `application/unknown`,
          mediaScannable: false,
          notification: true,
        },
      },
    });
    if (!configOptions) throw new Error('Not found configOptions');

    if (isIOS) {
      await RNFetchBlob.config(configOptions).fetch('GET', fileUrl);
      await Share.open({
        urls: [`file://${iosPath}`],
      });
      await RNFS.unlink(iosPath);
      return;
    }

    await RNFetchBlob.config(configOptions).fetch('GET', fileUrl);
    Alert.alert('다운로드가 완료되었습니다.');
  } catch (error) {
    console.log('shareContent -> error', error);
  }
};

const onShouldStartLoadWithRequest = (meta: any) => {
  const isAndroid = Platform.OS === 'android';
  if (!isAndroid) return true;

  if (
    meta.url.includes('/downloadContentsFile') ||
    meta.url.includes('/downloadBbsContents')
  ) {
    downloadFile(meta.url);
    return false;
  }

  return true;
};

export function Functional() {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{
          uri: `https://m.exam4you.com/login`,
        }}
        injectedJavaScriptBeforeContentLoaded={`fetch("https://m.exam4you.com/login", { method: "POST", body: JSON.stringify({ "userId": "besttutor", "passwd": "12eb67e9020f6533adebf4b4692b48f5" }), headers: { 'Content-Type': 'application/json' } })`}
      />
      <WebView
        style={styles.container}
        originWhitelist={['*']}
        mixedContentMode="always"
        source={{
          uri: `https://m.exam4you.com`,
        }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onFileDownload={({ nativeEvent: { downloadUrl } }) => {
          if (downloadUrl) downloadFile(downloadUrl);
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
