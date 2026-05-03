# Steam Finder

Steam Finder is an Expo/React Native mobile app where users can:

- search Steam games
- open a detailed game view
- add or remove favorites
- get recommendations based on favorite games
- use the app with Firebase authentication

This app was built as a final project for Haaga-Helia's mobile programming course.

## Main Features

- Steam game search using the Steam Store API
- Game detail page (name, image, description, genre, price, release date, developer/publisher)
- Favorites stored in Firebase Realtime Database
- Recommendation view based on favorites
- Theme support (light/dark)
- Consistent navigation to the detail page from all tabs

## Local Steam proxy

When running the app in a web browser, direct requests to the Steam Store API can be blocked by CORS. For local development and web builds this repository includes a proxy you can run which forwards requests to Steam and adds CORS headers.

## Technologies

- Expo + React Native
- TypeScript
- Expo Router
- Firebase Authentication
- Firebase Realtime Database
- Steam Store API
- react-native-safe-area-context

