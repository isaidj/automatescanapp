import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  Alert,
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
const profiles = ["general", "fomplus"];

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [socketUri, setSocketUri] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionData, setConnectionData] = useState(null);
  const [ipScaning, setIpScaning] = useState(false);
  const [sound, setSound] = React.useState();
  const [count_scans, setCount_scans] = useState(0);
  const [cursor_status, setCursor_status] = useState(false);
  const [profileScan, setProfileScan] = useState("general");

  useEffect(() => {
    //--------------------Permiso para usar la camara-----------------------------------
    const getBarCodeScannerPermissions = async () => {
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
    //----------Almacena la IP escaneada en el almacenamiento local---------------------
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
    const getStoredProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem("profileScan");
        if (storedProfile) {
          setProfileScan(storedProfile);
        }
      } catch (error) {
        console.log("Error while retrieving stored IP:", error);
      }
    };
    getStoredProfile();
    getStoredIP();
  }, []);

  useEffect(() => {
    //--------------------Verifica el estado de la conexion----------------------
    const interval = setInterval(() => {
      if (socketUri !== null) {
        console.log("socket uri " + socketUri);
        // Envuelve la llamada a axios.get dentro de un bloque try-catch

        axios
          .get(`${socketUri}/status`)
          .then((response) => {
            console.log("Respuesta estatus: ", response.status);
            console.log("Respuesta data: ", response.data);
            if (response.status === 200) {
              setConnectionStatus(true);
              setConnectionData(response.data.ip);
              setCursor_status(response.data.cursor === false ? true : false); //Si el keyboard focus está activo
              console.log(response.data);
            }
          })
          .catch((error) => {
            console.log("Error en la solicitud al servidor:", error);
            setConnectionStatus(false);
            setConnectionData(null);
          });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [socketUri]);

  async function playSound() {
    //--------------------Reproduce el sonido de escaneo-----------------------------
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
    //--------------------Envia el codigo escaneado al servidor--------------------
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
    //--------------------Maneja el escaneo del codigo QR---------------------------
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
        profileScanHandler(data);
      } else {
        alert("No hay conexion con el computador");
      }
    }
  };
  const profileScanHandler = (data) => {
    console.log("perfil de escaneo: " + profileScan);
    if (profileScan === "general") {
      console.log("codigo escaneado: " + data);
      automateScanCode(data);
      setCount_scans(count_scans + 1);
    }

    if (profileScan === "fomplus") {
      if (cursor_status) {
        console.log("codigo escaneado: " + data);
        automateScanCode(data);
        setCount_scans(count_scans + 1);
      }
    }
  };
  const onIpScan = () => {
    //--------------------Activa el escaneo de la IP--------------------
    setIpScaning(true);
    setSocketUri(null);
    setScanned(false);
    setConnectionStatus(null);
    setConnectionData(null);
  };
  const resetCount = () => {
    //--------------------Reinicia el conteo de productos escaneados--------------------
    Alert.alert(
      "Se han escaneado " + count_scans + " productos",
      "¿Desea reiniciar el conteo?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Reiniciar",
          onPress: () => {
            setCount_scans(0);
          },
        },
      ],
      { cancelable: false }
    );
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

          {connectionData ? (
            <Text style={styles.subTitle}>
              Computador: {connectionData.hostname}
            </Text>
          ) : (
            <Text style={styles.subTitle}>No hay conexion</Text>
          )}
          <Badge
            value={
              connectionStatus === null
                ? "Cargando..."
                : connectionStatus
                ? "Conectado"
                : "Desconectado"
            }
            status={
              connectionStatus === null
                ? "primary"
                : connectionStatus
                ? "success"
                : "error"
            }
            containerStyle={{
              position: "absolute",
              left: 0,
              bottom: 0,
              marginLeft: 5,
              marginBottom: 5,
            }}
          />
        </View>
      )}
      <View style={styles.camera}>
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          type={"back"}
          ratio="16:9"
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
        {cursor_status === false && profileScan === "fomplus" && (
          <View style={styles.cursor_alert}>
            <Text style={styles.cursor_alert_text}>
              Error: El cursor no se encuentra en el campo de texto
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.count_scans}
          onPress={() => {
            resetCount();
          }}
        >
          <Text style={styles.count_scans_text}>N°: {count_scans}</Text>
        </TouchableOpacity>
        <View
          style={{
            width: "100%",
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            justifyContent: "space-around",
            flexDirection: "row",
          }}
        >
          <Button
            title="Modo General"
            onPress={() => setProfileScan("general")}
          />
          <Button
            title="Modo Fomplus"
            onPress={() => setProfileScan("fomplus")}
          />
        </View>
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
  count_scans: {
    zIndex: 3,
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,

    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  count_scans_text: {
    fontSize: 18,
    fontWeight: "bold",
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
  cursor_alert: {
    position: "absolute",
    backgroundColor: "orange",
    padding: 20,
    width: "100%",
  },
  cursor_alert_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
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
