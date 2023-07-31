import { StyleSheet, Text, View } from "react-native";

//react native
export const Badge = ({
  value,
  status,
  containerStyle,
  textStyle,
  badgeStyle,
}) => {
  const badgeBackgroundColor =
    status === "success"
      ? "#00B761"
      : status === "error"
      ? "#FF0000"
      : status === "warning"
      ? "#FFC700"
      : status === "primary"
      ? "#00A8FF"
      : status === "secondary"
      ? "#F7F8FA"
      : status === "info"
      ? "#4863FF"
      : "transparent";
  const badgeColor =
    status === "secondary" || status === "info" ? "#000" : "#fff";

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.badge,
          { backgroundColor: badgeBackgroundColor },
          badgeStyle,
        ]}
      >
        <Text style={[styles.text, { color: badgeColor }, textStyle]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 10,
  },
  text: {
    fontWeight: "bold",
  },
});
