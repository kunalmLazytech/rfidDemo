//MainApplication.kt
package com.scatterlink

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.scatterlink.ZebraRFIDPackage // ✅ Make sure this import exists
//import com.zebra.scannercontrol.SDKHandler

class MainApplication : Application(), ReactApplication {

 // companion object {
 //       var sdkHandler: SDKHandler? = null // Make it nullable and accessible
 //   }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> {
          val packages = PackageList(this).packages.toMutableList()
          packages.add(ZebraRFIDPackage())
          return packages
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load() // ✅ Required for new architecture
    }
   // try {
   //     sdkHandler = SDKHandler(this)
   //     Log.d("ZebraRFIDModule", "SDKHandler initialized successfully.")
   // } catch (e: Exception) {
   //     Log.e("ZebraRFIDModule", "Error initializing SDKHandler: ", e)
   // }
  }
}
