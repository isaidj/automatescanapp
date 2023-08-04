import { StyleSheet, Text, View } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
export const OnboardingScreen = ({ onFinish }) => {
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
});
