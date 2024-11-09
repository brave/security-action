import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageItemInfo;
import android.content.pm.ResolveInfo;
import android.content.pm.ActivityInfo
import android.os.Bundle;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com"));
        PackageManager pm = getPackageManager();
        // ruleid: android-resolve-intent
        ResolveInfo resolveInfo = pm.resolveService(intent, 0);
        // ruleid: android-resolve-intent
        resolveInfo = pm.resolveContentProvider(intent, 0);
        // ruleid: android-resolve-intent
        resolveInfo = pm.resolveActivity(intent, 0);
        // ruleid: android-resolve-intent
        ComponentName componentName = intent.resolveActivity(pm);
        // ruleid: android-resolve-intent
        ActivityInfo activityInfo = intent.resolveActivityInfo(pm);
        // ruleid: android-resolve-intent
        List<ResolveInfo> resolveInfoList = pm.queryBroadcastReceivers(intent,0);
        // ruleid: android-resolve-intent
        resolveInfoList = pm.queryIntentActivities(intent,0);
        // ruleid: android-resolve-intent
        resolveInfoList = pm.queryIntentActivityOptions(null,null,intent,0);
        // ruleid: android-resolve-intent
        resolveInfoList = pm.queryIntentServices(intent,0);
        // ruleid: android-resolve-intent
        List<ProviderInfo> providerInfoList = pm.queryIntentContentProviders(intent,0);
    }
}