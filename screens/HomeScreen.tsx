import * as React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import WebView from 'react-native-webview';
import { take } from 'rxjs';
import { Text, View } from '../components/Themed';
import firebaseApi from '../servicses/apis/firebaseApi';
import { RootTabScreenProps } from '../types';
import DropDownPicker from 'react-native-dropdown-picker'
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { getDocumentAsync } from 'expo-document-picker'



// import base64 from 'base-64';
// import utf8 from 'utf8';
// import { Buffer } from 'buffer';

enum actionEnum {
  Delete,
  Edit
}

export default function HomeScreen({ route, navigation }: RootTabScreenProps<'Home'>) {
  // const defaultUri = 'https://firebasestorage.googleapis.com/v0/b/morbargig-a81d2.appspot.com/o/CV%2Fno-photo-available.png?alt=media&token=27b382af-7a35-4551-ade9-5edb5271df6b'
  // const [fileName, setFileName] = React.useState(route?.params?.fileName || '')

  const fileName: string = route?.params?.fileName || ''
  const [fileUri, setFileUri] = React.useState('https://firebasestorage.googleapis.com/v0/b/morbargig-a81d2.appspot.com/o/CV%2Fno-photo-available.png?alt=media&token=27b382af-7a35-4551-ade9-5edb5271df6b')
  React.useEffect(() => {
    firebaseApi.getPdf()?.pipe(take(1))?.subscribe(res => {
      setFileUri((res?.data as any)?.[fileName])
    })
  }, [])
  // !!fileName && !!firebaseApi?.pdf && (fileName !== firebaseApi?.pdf?.language) && (fileUri !== defaultUri) && console.log(1) // firebaseApi?.updatePdf({ ...firebaseApi?.pdf, language: fileName })

  // const iframeEl = (fileUri: string) => `<iframe src=${fileUri}
  // width="100%"
  // height="1500px"
  // min="100%"
  // frameborder="0" allow="autoplay; encrypted-media" allowfullscreen
  // allowFullScreen>
  // </iframe>`

  const [isOpen, setIsOpen] = React.useState(false)
  // const [value, setValue] = React.useState(null)
  const colorScheme = useColorScheme();
  const onValueChange = (getValFunc: () => actionEnum) => {
    const actionType = getValFunc()
    switch (actionType) {
      case actionEnum.Delete:
        firebaseApi?.deletePdf(fileName as any)
        break;
      case actionEnum.Edit:
        getDocumentAsync({
          type: '*/*',
        })?.then(async (x: any) => {
          console.log(x?.uri)
          // const t = await FileSystem.getContentUriAsync(x?.url)
          new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              // return the blob
              resolve(xhr.response);
            };

            xhr.onerror = function () {
              // something went wrong
              reject(new Error('uriToBlob failed'));
            };
            // this helps us get a blob
            xhr.responseType = 'blob';
            xhr.open('GET', x?.uri, true);

            xhr.send(null);
          })?.then(res => console.log(res))
          // new Blob([new Uint8Array((apiResponse.data.ArrayBuffer))], {type: 'application/pdf'})
          // const blob = await response.blob();
          // var ref = firebase.storage().ref().child("my-image");
          // return ref.put(blob);

          // console.log(response)
          // const file = await FileSystemFileEntry.s((x as any)?.uri);
          // const bytes = utf8.encode(file);
          // const encoded = base64.encode(bytes);

          // //
          // const base64Image = new Buffer(file, 'binary').toString('base64');
          // console.log(x)
          // firebaseApi.uploadPdf(x as any)?.pipe(take(1)).subscribe(res => {
          //   console.log(res)
          // })
        })

      default:
        break;
    }

  }
  return (
    <View style={styles.container}>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View style={styles.header}>
        <DropDownPicker
          open={isOpen}
          style={{ width: 55, alignSelf: 'flex-start', }}
          placeholder=""
          placeholderStyle={{ display: 'none' }}
          value={null}
          setOpen={setIsOpen}
          zIndex={10000}
          zIndexInverse={10000}
          ArrowUpIconComponent={() => <TabBarIcon name='ellipsis-h' color={'black'} size={20} />}
          ArrowDownIconComponent={() => <TabBarIcon name='ellipsis-h' color={'black'} size={20} />}
          setValue={onValueChange}
          rtl={false}
          items={[
            { label: actionEnum?.[actionEnum.Edit], value: actionEnum.Edit, icon: () => <TabBarIcon name='edit' size={20} color={'black'} /> },
            { label: actionEnum?.[actionEnum.Delete], value: actionEnum.Delete, icon: () => <TabBarIcon name='trash' size={20} color={'black'} /> },
          ]}
          textStyle={{ fontSize: 15 }}
          // arrowIconContainerStyle={{ flexDirection: 'row', justifyContent: 'center' }}
          containerStyle={{ height: 100, width: 100, marginLeft: -120, marginBottom: -50 }}
          dropDownContainerStyle={{ position: 'absolute' }}
        />
        <Text style={styles.title}>{fileName}</Text>
        <Pressable
          onPress={() => navigation.navigate('Modal')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}>
          <FontAwesome
            name="info-circle"
            size={25}
            color={Colors[colorScheme].text}
            style={{ marginRight: 15 }}
          />
        </Pressable>
      </View>
      {
        <WebView
          scalesPageToFit={true}
          style={{ height: 900, width: 375 }}
          nativeID={fileName}
          source={{
            uri: fileUri,
          }}
          // source={{
          //   html: `
          //         <!DOCTYPE html>
          //         <html>
          //           <head></head>
          //           <body style="width=100vw; height="100%">
          //       ${iframeEl(fileUri)}
          //           </body>
          //         </html>
          //   `,
          // }}
          automaticallyAdjustContentInsets={true}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // width : '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    zIndex: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    justifyContent: 'space-around'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginTop: 100,
    height: 1,
    width: '80%',
  },
});

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number
}) {
  return <FontAwesome style={{ marginBottom: -3 }} size={30} {...props} />;
}
