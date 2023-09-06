import * as WebBrowser from "expo-web-browser";
export const webBrowserNavigation = async (url) => {
  await WebBrowser.openBrowserAsync(url);
};
export default webBrowserNavigation;
