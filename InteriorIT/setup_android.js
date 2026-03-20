const fs = require('fs');
const path = require('path');

const root = 's:/c4c/InteriorIT/android';

const dirs = [
  'app/src/main/java/com/interiorit/app',
  'app/src/main/java/com/interiorit/app/ui/theme',
  'app/src/main/res/drawable',
  'app/src/main/res/mipmap-hdpi',
  'app/src/main/res/values',
  'app/src/main/res/xml',
  'gradle/wrapper',
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(root, d), { recursive: true });
});

const files = {
  // settings.gradle.kts
  'settings.gradle.kts': `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "InteriorIT"
include(":app")
`,

  // build.gradle.kts (Project level)
  'build.gradle.kts': `plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
}
`,

  // gradlew (Windows bash helper, not strictly needed but good to have)
  'gradlew.bat': `@echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
java %DEFAULT_JVM_OPTS% -classpath "%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
`,

  // app/build.gradle.kts
  'app/build.gradle.kts': `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.interiorit.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.interiorit.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2023.08.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // Excel & PDF (Apache POI, iText)
    implementation("org.apache.poi:poi:5.2.3")
    implementation("org.apache.poi:poi-ooxml:5.2.3")
    implementation("com.itextpdf:itext7-core:7.2.5")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.08.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
`,

  // app/src/main/AndroidManifest.xml
  'app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.InteriorIT"
        android:usesCleartextTraffic="true"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.InteriorIT">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,

  // app/src/main/res/values/strings.xml
  'app/src/main/res/values/strings.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Interior IT</string>
</resources>`,

  // app/src/main/res/values/colors.xml
  'app/src/main/res/values/colors.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primaryRed">#BC1F24</color>
    <color name="black">#232222</color>
    <color name="white">#FFFFFF</color>
</resources>`,

  // app/src/main/res/values/themes.xml
  'app/src/main/res/values/themes.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.InteriorIT" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">@color/primaryRed</item>
    </style>
</resources>`,

  // app/src/main/res/xml/backup_rules.xml
  'app/src/main/res/xml/backup_rules.xml': `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="sharedpref" path="."/>
</full-backup-content>`,

  // app/src/main/res/xml/data_extraction_rules.xml
  'app/src/main/res/xml/data_extraction_rules.xml': `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="sharedpref" path="."/>
    </cloud-backup>
</data-extraction-rules>`,

  // app/src/main/java/com/interiorit/app/MainActivity.kt
  'app/src/main/java/com/interiorit/app/MainActivity.kt': `package com.interiorit.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.interiorit.app.ui.theme.InteriorITTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            InteriorITTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.White
                ) {
                    Greeting("Interior IT App Initializing")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}
`,

  // app/src/main/java/com/interiorit/app/ui/theme/Theme.kt
  'app/src/main/java/com/interiorit/app/ui/theme/Theme.kt': `package com.interiorit.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

val PrimaryRed = Color(0xFFBC1F24)
val DarkGrey = Color(0xFF232222)
val White = Color.White

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryRed,
    secondary = DarkGrey,
    tertiary = White
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryRed,
    secondary = DarkGrey,
    tertiary = White
)

@Composable
fun InteriorITTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
`
};

for (const [relativePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, relativePath), content);
}
console.log('Android project setup complete!');
