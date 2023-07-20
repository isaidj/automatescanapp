import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Audio } from "expo-av";
import { Vibration } from "react-native";
import { io } from "socket.io-client";

const url = "http://192.168.1.79:3002";
export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [socket, setSocket] = useState(null);
  const [sound, setSound] = React.useState();
  const [url, setUrl] = useState(null);
  const [modoEscaneo, setModoEscaneo] = useState("ipDesconocida");
  //------------------socket--------------------------------------
  const automateScanCode = (data) => {
    socket.emit("scan", { data: data });
  };

  useEffect(() => {
    if (!socket) {
      setSocket(io(url));
    }
  }, [socket]);
  //------------------camera-------------------------------------
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (modoEscaneo === "ipDesconocida") {
      setUrl("http://" + data + ":3002");
      setModoEscaneo("escaneando");
    }
    playSound();
    const duration = 150;
    Vibration.vibrate(duration);
    automateScanCode(data);

    setScanned(true);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  //------------------sound-------------------
  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/store-scanner.mp3")
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }
  React.useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  //------------------condicional rendering-------------------
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        {modoEscaneo === "ipDesconocida" ? (
          <Text>Escanea el código QR de la caja</Text>
        ) : (
          <Text>Escaneando...</Text>
        )}
      </View>
      <View>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <Button
            title={"Tap to Scan Again"}
            onPress={() => setScanned(false)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    color: "#ffd58f",
    fontSize: 20,
  },
});
