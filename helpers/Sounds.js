import { Audio } from "expo-av";
export async function playSound() {
  console.log("Loading Sound");
  const { sound } = await Audio.Sound.createAsync(
    require("../assets/store-scanner.mp3")
  );

  console.log("Playing Sound");
  await sound.playAsync();
  React.useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
}
