# Open Jarvis — shuru kaise karein

## Android Studio / PC
1. `OpenJarvisAndroid.zip` ko extract karein.
2. Android Studio mein extracted `OpenJarvisAndroid` folder **Open** karein.
3. Gradle sync complete hone dein. SDK Platform 36 maange to SDK Manager se install karein. JDK/Gradle ke liye JDK 17 select karein.
4. Phone USB se connect karke USB debugging on karein, ya emulator choose karein.
5. **Run ▶** dabayein, ya Terminal mein:

```bash
./gradlew assembleDebug
```

APK yahan milega: `app/build/outputs/apk/debug/app-debug.apk`

## Phone se CodePhase / cloud workspace par
1. ZIP download karke apne project workspace/repository mein extract ya upload karein. `app`, `gradle`, `gradlew`, `settings.gradle.kts` aur `build.gradle.kts` project root par hone chahiye.
2. Terminal available ho to run karein:

```bash
chmod +x gradlew
./gradlew assembleDebug
```

3. Workspace ko Android SDK Platform 36 aur JDK 17 support karna hoga. Build pass hone ke baad `app/build/outputs/apk/debug/app-debug.apk` ko download karein.
4. APK phone par install karte waqt, Android prompt aaye to jis app se APK khol rahe hain uske liye **Allow install unknown apps** enable karein.

Agar CodePhase Android SDK install/build support nahi karta, to sirf ZIP upload karne se APK generate nahi hoga; Android Studio ya Android SDK ke saath koi cloud build environment chahiye.

## Pehli baar chalana
- Orb tap karein aur microphone permission allow karein; ya command box mein type karein.
- `torch on` par camera permission allow karein.
- `go home` / `quick settings` ke liye Accessibility Settings mein **Open Jarvis navigation controls** ko aapko khud enable karna hoga. Yeh optional hai.
