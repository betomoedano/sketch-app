# Sketch App - Local-First Drawing with InstantDB 🎨

A simple yet powerful sketching app built with **Expo** and **InstantDB** that demonstrates how to create local-first applications. Draw, create shapes, and see your creations sync seamlessly across devices in real-time.

This project showcases the power of local-first architecture where your app works offline and syncs automatically when online, providing a smooth user experience regardless of network conditions.

## ✨ Features

- **Real-time Collaboration**: Multiple users can draw on the same canvas simultaneously
- **Local-First Architecture**: Works offline, syncs when online
- **Interactive Drawing**: Create and move various shapes (rectangles, circles, triangles, diamonds, stars, hexagons)
- **Touch Gestures**: Drag and drop shapes with smooth animations
- **Color Palette**: Multiple colors to choose from
- **Responsive Design**: Works on iOS, Android, and web

## 🚀 Tech Stack

- **[Expo](https://expo.dev)** - React Native framework for universal apps
- **[InstantDB](https://instantdb.com)** - Local-first database with real-time sync
- **[Bun](https://bun.sh)** - Fast package manager and runtime
- **React Native Reanimated** - Smooth gesture animations
- **React Native Gesture Handler** - Touch gesture management

## 📱 Demo

Watch the video on YouTube → [Build a Local-First Sketch App with Expo, Instant & Reanimated](https://youtu.be/DEJIcaGN3vY)

![InstantDB Tutorial](https://github.com/user-attachments/assets/3aedcf3a-5861-422d-a647-1fa899a8a3e1)


## 🛠️ Setup

### Prerequisites

- **Bun** installed on your machine
- **Expo CLI** (optional, but recommended)
- **InstantDB account** for the app ID

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/betomoedano/sketch-app.git
   cd sketch-app
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```bash
   EXPO_PUBLIC_INSTANT_APP_ID=your_instantdb_app_id
   ```

   Get your InstantDB app ID from [InstantDB Dashboard](https://instantdb.com/dash)

4. **Start the development server**
   ```bash
   bun run start
   ```

## 📖 How It Works

This app demonstrates key local-first principles:

- **Offline-First**: The app works without an internet connection
- **Real-time Sync**: Changes sync across devices when online
- **Conflict Resolution**: InstantDB handles concurrent edits automatically
- **Optimistic Updates**: UI updates immediately, syncs in the background

### Data Model

The app uses a simple schema defined in `instant.schema.ts`:

```typescript
elements: {
  type: string,     // Shape type (rectangle, circle, etc.)
  x: number,        // X position
  y: number,        // Y position
  color: string,    // Shape color
  width?: number,   // Optional width
  height?: number,  // Optional height
  createdAt: number // Timestamp
}
```

## 🎯 Key Learning Points

- **InstantDB Setup**: See `db.ts` for database initialization
- **Real-time Queries**: Check `SketchCanvas.tsx` for `useQuery` usage
- **Optimistic Updates**: Elements update immediately via `db.transact`
- **Schema Definition**: Explore `instant.schema.ts` for data modeling
- **Gesture Handling**: Touch interactions with React Native Gesture Handler

## 🔧 Available Scripts

- `bun run start` - Start the Expo development server
- `bun run android` - Run on Android device/emulator
- `bun run ios` - Run on iOS device/simulator
- `bun run web` - Run in web browser
- `bun run lint` - Run ESLint

## 📚 Learn More

### About InstantDB

- [InstantDB Documentation](https://instantdb.com/docs): Learn about local-first databases
- [InstantDB Examples](https://instantdb.com/examples): More example projects

### About Expo

- [Expo Documentation](https://docs.expo.dev/): Learn fundamentals and advanced topics
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/): Step-by-step tutorial

### About Local-First

- [Local-First Software](https://www.inkandswitch.com/local-first/): The manifesto that started it all
- [Local-First Web Development](https://localfirstweb.dev/): Community resources

## 🤝 Contributing

Feel free to open issues and submit pull requests! This is a learning project and contributions are welcome.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using InstantDB, Expo, and Bun
