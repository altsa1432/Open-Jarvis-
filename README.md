# Open Jarvis — Android starter project

A premium dark-mode Android voice assistant starter written in Kotlin. It has a custom animated orb UI, Hindi/English device-locale speech input, spoken responses, a text command box, shortcut cards, app launching, flashlight, media volume, battery status, time/date, and shortcuts to system settings.

## Build with Android Studio

1. Extract `OpenJarvisAndroid.zip`.
2. Open the extracted `OpenJarvisAndroid` folder in Android Studio.
3. Allow Gradle sync and install Android SDK Platform 36 if Android Studio asks.
4. Connect your Android phone with USB debugging enabled, or select an emulator.
5. Select **app** and press **Run**.

The project uses Android Gradle Plugin 8.13.2, Gradle 8.13, Kotlin 2.2.21, compileSdk 36, minSdk 26. No third-party runtime libraries are used.

## Build an APK

After Gradle sync, from the project folder run:

```bash
./gradlew assembleDebug
```

On Windows, use `gradlew.bat assembleDebug`. The debug APK is normally written to `app/build/outputs/apk/debug/app-debug.apk`.

## Commands included

- `open YouTube`, `open WhatsApp`, `open Chrome`, `open Maps`, `open Gmail`, `open gallery`
- `torch on`, `torch off`, `flashlight`
- `volume up`, `volume down`, `mute volume`
- `open settings`, `open Wi-Fi`, `open Bluetooth`, `brightness settings`
- `open camera`, `open calculator`, `open messages`, `open contacts`, `open alarm`
- `battery status`, `what time is it`, `today's date`, `search for ...`
- Some Hindi commands such as `टॉर्च चालू`, `टॉर्च बंद`, `आवाज़ बढ़ाओ`, `सेटिंग खोलो`, `यूट्यूब खोलो`

## Android permissions and limitations

- The app requests microphone permission only after you tap the orb. Speech input is provided by the speech-recognition activity available on the phone; that service may use internet access.
- The app requests camera permission only when you ask to operate the flashlight (Android's torch API is guarded by camera permission on many devices).
- Android intentionally prevents normal apps from silently toggling some radios or controlling every other app. Wi-Fi/internet and Bluetooth commands open the relevant system panel/settings so the user can confirm the change.
- Calls are not placed automatically; the dialer opens so the user can review and confirm. Lock screen, reboot, silent screenshot capture, unrestricted cross-app taps, and always-on background listening are not implemented.
- Actual behavior depends on the device's manufacturer, installed apps, and speech service. This starter is not a claim of unrestricted OS control.

## Before publishing

Use a current target SDK required by Google Play, add privacy/permission disclosures appropriate to your distribution, test on real devices, and create a release signing key. The included configuration targets SDK 34 for broad local-build compatibility; it may need a target-SDK update before Play Store submission.

### Optional system navigation controls

Commands such as `go home`, `back`, `recent apps`, `open notifications`, and `quick settings` use the included optional Accessibility Service. The app opens Android Accessibility Settings and the user must explicitly enable **Open Jarvis navigation controls**. The service does not request screen-content access, inspect other apps, or generate taps; it only calls Android's supported global navigation actions. You can leave it disabled and all other features continue to work.

See `START_HERE_HINGLISH.md` for phone/cloud-workspace setup steps. The source was statically reviewed here, but this environment did not have the Android SDK or a usable Gradle installation/network, so an APK build could not be executed or certified in this session.
