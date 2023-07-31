import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { playSound } from "./helpers/Sounds";
import { Vibration } from "react-native";
import { io } from "socket.io-client";
import { Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [socket, setSocket] = useState(null);

  const [ipScaning, setIpScaning] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  useEffect(() => {
    const getStoredIP = async () => {
      try {
        const storedIP = await AsyncStorage.getItem("scannedIP");
        if (storedIP) {
          setSocket(io(`http://${storedIP}:3002`));
        }
      } catch (error) {
        console.log("Error while retrieving stored IP:", error);
      }
    };

    getStoredIP();
  }, []);

  const automateScanCode = (data) => {
    socket.emit("scan", { data: data });
  };

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("conectado");
        alert("conectado");
      });

      socket.on("disconnect", () => {
        console.log("desconectado");
        alert("desconectado");
      });
    }
  }, [socket]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // playSound();
    const duration = 150;
    Vibration.vibrate(duration);

    if (ipScaning) {
      console.log("ip escaneada: " + data);
      AsyncStorage.setItem("scannedIP", data)
        .then(() => {
          setSocket(io(`http://${data}:3002`));
          setIpScaning(false);
        })
        .catch((error) => console.log("Error while storing IP:", error));
    } else {
      if (socket) {
        console.log("codigo escaneado: " + data);
        automateScanCode(data);
      } else {
        console.log("socket no definido");
      }
    }
  };

  const onIpScan = () => {
    setIpScaning(true);
    setSocket(null);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {socket === null ? (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Escanea el QR de la PC</Text>
          <Text style={styles.subTitle}>
            Abre la aplicacion en el PC y escanea el QR
          </Text>
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Escanea el codigo de barras</Text>
          <Text style={styles.subTitle}> {socket.io.uri}</Text>
        </View>
      )}
      <View style={styles.camera}>
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          type={"back"}
        />
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgain}
            onPress={() => setScanned(false)}
          >
            <Text>Escanear de nuevo</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.buttons}>
        <Button title={"Escanear PC"} onPress={() => onIpScan()} />
        <Button title={"socket"} onPress={() => console.log(socket)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: "80%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 15,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  scanAgain: {
    position: "absolute",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
});
