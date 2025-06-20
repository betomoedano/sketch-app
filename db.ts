import { init } from "@instantdb/react-native";

import schema from "./instant.schema";

if (!process.env.EXPO_PUBLIC_INSTANT_APP_ID) {
  throw new Error("EXPO_PUBLIC_INSTANT_APP_ID is not set");
}

const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID,
  schema: schema,
});

export default db;
