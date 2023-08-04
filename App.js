import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Badge } from "./components/Badge";
import { Audio } from "expo-av";
import AppIntroSlider from "react-native-app-intro-slider";

const OnboardingScreen = ({ onFinish }) => {
  const slides = [
    {
      key: "1",
      title: "Bienvenido a Gscanner",
      text: "Escanea códigos de barras y QR con facilidad y envia los datos a tu pc",
      backgroundColor: "#59b2ab",
    },
    {
      key: "2",
      title: "Descarga Gscanner en la pc",
      text: "Descarga la app de Gscanner en la pc escanea el codigo qr para conectar movil con pc",
      backgroundColor: "#febe29",
    },
    {
      key: "3",
      title: "Resultados del escaneo",
      text: "Visualiza la información del código escaneado en la siguiente pantalla.",
      backgroundColor: "#22bcb5",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={onFinish}
      showSkipButton
      onSkip={onFinish}
    />
  );
};

const port = 5000;
export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [socketUri, setSocketUri] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionData, setConnectionData] = useState(null);
  const [ipScaning, setIpScaning] = useState(false);
  const [sound, setSound] = React.useState();
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");

      // Check if the user has completed onboarding from AsyncStorage
      const onboardingStatus = await AsyncStorage.getItem(
        "hasCompletedOnboarding"
      );
      setShowOnboarding(onboardingStatus !== "true" ? true : false); // If onboardingStatus is null or 'false', it means the user is new and onboarding should be shown.
    })();
  }, []);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setShowOnboarding(false);
    } catch (error) {
      console.log("Error saving onboarding completion status:", error);
    }
  };

  useEffect(() => {
    const getStoredIP = async () => {
      try {
        const storedIP = await AsyncStorage.getItem("scannedIP");
        if (storedIP) {
          setSocketUri(`http://${storedIP}:` + port);
        }
      } catch (error) {
        console.log("Error while retrieving stored IP:", error);
      }
    };

    getStoredIP();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (socketUri !== null) {
        console.log("socket uri " + socketUri);
        // Envuelve la llamada a axios.get dentro de un bloque try-catch

        axios
          .get(`${socketUri}/status`)
          .then((response) => {
            console.log("Respuesta del servidor:", response.status);
            if (response.status === 200) {
              setConnectionStatus(true);
              setConnectionData(response.data);
              console.log(response.data);
            }
          })
          .catch((error) => {
            console.log("Error en la solicitud al servidor:", error);
            setConnectionStatus(false);
            setConnectionData(null);
          });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [socketUri]);

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/store-scanner.mp3")
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }
  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const automateScanCode = (data) => {
    axios
      .post(`${socketUri}/scan`, { data })
      .then((response) => {
        console.log("Respuesta del servidor:", response.status);
        // alert("Respuesta del servidor:" + response.status);
      })
      .catch((error) => {
        console.log("Error en la solicitud al servidor:", error);
        alert("No hay conexion con el computador");
      });
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    playSound();
    const duration = 150;
    Vibration.vibrate(duration);

    if (ipScaning) {
      console.log("ip escaneada: " + data);
      AsyncStorage.setItem("scannedIP", data)
        .then(() => {
          setSocketUri(`http://${data}:` + port);
          setIpScaning(false);
        })
        .catch((error) => console.log("Error while storing IP:", error));
    } else {
      if (socketUri) {
        console.log("codigo escaneado: " + data);
        automateScanCode(data);
      } else {
        console.log("socketUri no definido");
      }
    }
  };

  const onIpScan = () => {
    setIpScaning(true);
    setSocketUri(null);
    setScanned(false);
    setConnectionStatus(null);
    setConnectionData(null);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleFinishOnboarding} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {socketUri === null ? (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Escanea el QR de la PC</Text>
          <Text style={styles.subTitle}>
            Abre la aplicacion en el PC y escanea el QR
          </Text>
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Escanea el codigo de barras</Text>
          {connectionStatus === null ? (
            <Badge value={"Cargando..."} status={"primary"} />
          ) : connectionStatus ? (
            <Badge value={"Conectado"} status={"success"} />
          ) : (
            <Badge value={"Desconectado"} status={"error"} />
          )}
          {connectionData ? (
            <Text style={styles.subTitle}>
              Computador: {connectionData.hostname}
            </Text>
          ) : (
            <Text style={styles.subTitle}>No hay conexion</Text>
          )}
        </View>
      )}
      <View style={styles.camera}>
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          type={"back"}
        />

        {scanned && (
          <>
            <View style={styles.focused}></View>
            <TouchableOpacity
              style={styles.scanAgain}
              onPress={() => setScanned(false)}
            >
              <Text>Escanear de nuevo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.buttons}>
        {socketUri === null ? (
          <TouchableOpacity
            onPress={() => onIpScan()}
            style={[{ backgroundColor: "#0070fa" }, styles.scan_or_clear]}
          >
            <Text style={styles.scan_or_clear_text}>Escanea un computador</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              onIpScan();
            }}
            style={[
              { backgroundColor: "rgb(255, 81, 71)" },
              styles.scan_or_clear,
            ]}
          >
            <Text style={styles.scan_or_clear_text}>
              Escanea otro computador
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#20272F",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  camera: {
    width: "100%",
    height: "80%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  focused: {
    position: "absolute",
    flex: 1,
    width: "100%",
    height: "100%",
    borderWidth: 2,
    // borderColor: "white",
    backgroundColor: "#000000b0",
  },

  titleContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "white",
  },
  subTitle: {
    fontSize: 15,
    marginBottom: 20,
    color: "white",
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
    bottom: 110,
  },
  scan_or_clear: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  scan_or_clear_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },

  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
