import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageItemInfo
import android.content.pm.ResolveInfo
import android.content.pm.ActivityInfo
import android.os.Bundle

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com"))
        val pm = packageManager
        // ruleid: android-resolve-intent
        val resolveInfo = pm.resolveService(intent, 0)
        // ruleid: android-resolve-intent
        resolveInfo = pm.resolveContentProvider(intent, 0) 
        // ruleid: android-resolve-intent
        resolveInfo = pm.resolveActivity(intent, 0)
        // ruleid: android-resolve-intent
        val componentName = intent.resolveActivity(pm)
        // ruleid: android-resolve-intent
        val activityInfo = intent.resolveActivityInfo(pm)
        // ruleid: android-resolve-intent
        val resolveInfoList = pm.queryBroadcastReceivers(intent, 0)
        // ruleid: android-resolve-intent
        resolveInfoList = pm.queryIntentActivities(intent, 0)
        // ruleid: android-resolve-intent
        resolveInfoList = pm.queryIntentActivityOptions(null, null, intent, 0)
        // ruleid: android-resolve-intent
        resolveInfoList = pm.queryIntentServices(intent, 0)
        // ruleid: android-resolve-intent
        val providerInfoList = pm.queryIntentContentProviders(intent, 0)
    }
}
