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

## Technologies

- Expo + React Native
- TypeScript
- Expo Router
- Firebase Authentication
- Firebase Realtime Database
- Steam Store API
- react-native-safe-area-context

## Current Status

Implemented:

- search + debouncing
- game detail page and back navigation
- favorites and recommendations
- theme-aware UI and dark mode transition fixes
