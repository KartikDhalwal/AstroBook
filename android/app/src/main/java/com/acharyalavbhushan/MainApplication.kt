package com.acharyalavbhushan

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        val packages = PackageList(this).packages.apply {
            // Manually add packages that can't be autolinked
            add(ReactNativeFirebaseAppPackage())
        }

        getDefaultReactHost(
            context = applicationContext,
            packageList = packages,
        )
    }

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
    }
}
