import { StyleSheet, Text, View } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
export const OnboardingScreen = ({ onFinish }) => {
  const slides = [
    {
      key: "1",
      title: "Bienvenido a Gscanner",
      text: "Escanea códigos de barras y QR con facilidad y envía los datos a tu PC.",
      backgroundColor: "#20272F",
    },
    {
      key: "2",
      title: "Descarga Gscanner pc",
      text: "Descarga la app Gscanner en tu PC y acepta los permisos de firewall.",
      backgroundColor: "#579AE6",
    },
    {
      key: "3",
      title: "Escanea para la conexión",
      text: "Escanea el código QR de la app de PC y espera el estado de conectado  ",
      backgroundColor: "#99BAE0",
    },
    {
      key: "4",
      title: "Resultados del escaneo",
      text: "Visualiza la información del código escaneado en cualquier campo de texto en tu PC",
      backgroundColor: "#254161",
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
      renderNextButton={() => (
        <Text style={styles.buttonSlider}>Siguiente</Text>
      )}
      renderSkipButton={() => <Text style={styles.buttonSlider}>Omitir</Text>}
      renderDoneButton={() => (
        <Text style={styles.buttonSliderDone}>Listo</Text>
      )}
    />
  );
};

const styles = StyleSheet.create({
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
  buttonSlider: {
    color: "white",
    fontSize: 18,
    marginTop: 11,
  },
  buttonSliderDone: {
    color: "white",
    fontSize: 18,
    marginTop: 11,
    marginRight: 11,
  },
});
