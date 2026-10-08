# SeeIt Mobile (React Native / Expo)

Same API as the website and the desktop app. Nothing is stored in the app except your login token and the server address.

## Part A: Start the server so the phone can reach it (on the PC)

1. In your SeeIt server project, open `.env` and add this line:
       HOST=0.0.0.0
2. Start the server (not the Electron app):
       npm start
3. Allow it through the Windows firewall (PowerShell as Administrator, once):
       netsh advfirewall firewall add rule name="SeeIt" dir=in action=allow protocol=TCP localport=3000
4. Find the PC address:
       ipconfig
   Look for "IPv4 Address", for example 192.168.1.10
5. Test from the phone browser (same Wi-Fi): http://192.168.1.10:3000/api/health
   It must show {"status":"ok"}. If not, the problem is the server, firewall or Wi-Fi, not the app.

## Part B: Create and run the app

1. Create a fresh Expo project (this picks the Expo version that matches the Expo Go app):
       npx create-expo-app@latest SeeItMobile --template blank
2. Copy these items from the zip into the new SeeItMobile folder, replacing files when asked:
       App.js   app.json   src (the whole folder)
3. Install the libraries (inside SeeItMobile):
       npx expo install react-native-webview expo-secure-store react-native-safe-area-context @expo/vector-icons expo-build-properties
4. Open src/config.js and put your PC address:
       export const DEFAULT_SERVER = 'http://192.168.1.10:3000';
   (You can also change it inside the app: Home > profile button > Server address.)
5. Start:
       npx expo start
   Install "Expo Go" on the phone and scan the QR code. Phone and PC must be on the same Wi-Fi.
   If Expo Go asks you to sign in, sign in with the same Expo account in the terminal (npx expo login) and in the app.

## What is inside
Home (hero slider, genres, movies, series, programs, cartoons, game videos, live, coming soon), Search, Live,
Coming Soon with reminders, Watchlist, Login/Signup, title details, trailer and live-stream player.
Browsing the home screen is public; details, videos, search, watchlist and reminders ask you to log in (same rules as the server).

## Build an installable Android .apk (later)
       npm install -g eas-cli
       eas login
       eas build:configure
   In eas.json, under build > preview, add:  "android": { "buildType": "apk" }
       eas build -p android --profile preview
The app uses plain http to reach your PC; app.json already allows that.
