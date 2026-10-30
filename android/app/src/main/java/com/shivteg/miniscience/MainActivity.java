package com.shivteg.miniscience;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class MainActivity extends Activity {
    private static final String CHANNEL_ID = "science_lab_notifications";
    private static final String PREFS_NAME = "MiniSciencePrefs";
    private static final String KEY_LAST_NOTIF_TIME = "last_notif_time";
    private static final String POLL_ENDPOINT = "https://os.shivteg.com/api/notifications/poll?since=";

    private WebView webView;
    private ScheduledExecutorService backgroundScheduler;

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void showSystemNotification(final String title, final String message, final String notifId) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    postNotification(title, message, notifId);
                }
            });
        }

        @JavascriptInterface
        public void vibrate(long milliseconds) {
            triggerVibrate(milliseconds);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Remove window title
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // Match status bar color to app theme (#0284c7)
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.setStatusBarColor(Color.parseColor("#0284c7"));

        // Match system navigation bar color to clean white app bottom dock
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setNavigationBarColor(Color.parseColor("#ffffff"));
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            window.getDecorView().setSystemUiVisibility(
                window.getDecorView().getSystemUiVisibility() | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            );
        }

        // Initialize Android notification channel
        initNotificationChannel();

        // Setup full screen WebView filling 100% of device width and height
        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setBackgroundColor(Color.parseColor("#f0f9ff"));

        // Clear web cache on startup (preserve localStorage for notification state)
        webView.clearCache(true);

        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        // Inject Native Javascript Interface for real Android system notifications
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("file:///android_asset/")) {
                    return false;
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                return super.onConsoleMessage(consoleMessage);
            }
        });

        // Load offline asset bundle directly
        webView.loadUrl("file:///android_asset/index.html");

        // Request notification permission AFTER the activity is fully visible (delayed)
        webView.postDelayed(new Runnable() {
            @Override
            public void run() {
                requestNotificationPermission();
            }
        }, 1500);

        // Register device on cloud server
        registerDeviceWithCloud();

        // Start background notification synchronization loop
        startBackgroundPoller();
    }

    private void initNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Mini Science Lab Alerts";
            String description = "Daily experiments, STEM quizzes, and science mission alerts";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setShowBadge(true);
            channel.setLightColor(Color.parseColor("#0284c7"));

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    public void postNotification(String title, String message, String notifId) {
        try {
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager == null) return;

            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, flags);

            int iconRes = getResources().getIdentifier("ic_launcher", "mipmap", getPackageName());
            if (iconRes == 0) iconRes = android.R.drawable.ic_dialog_info;

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(this, CHANNEL_ID);
            } else {
                builder = new Notification.Builder(this);
            }

            String displayTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "🔬 Mini Science Lab";
            String displayMsg = (message != null) ? message.trim() : "New science notification available!";

            builder.setContentTitle(displayTitle)
                   .setContentText(displayMsg)
                   .setStyle(new Notification.BigTextStyle().bigText(displayMsg))
                   .setSmallIcon(iconRes)
                   .setContentIntent(pendingIntent)
                   .setAutoCancel(true)
                   .setPriority(Notification.PRIORITY_HIGH)
                   .setDefaults(Notification.DEFAULT_ALL);

            int idCode = (notifId != null && !notifId.isEmpty()) ? notifId.hashCode() : (int) System.currentTimeMillis();
            notificationManager.notify(idCode, builder.build());
            triggerVibrate(250);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void triggerVibrate(long ms) {
        try {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(ms);
                }
            }
        } catch (Exception ignored) {}
    }

    private void registerDeviceWithCloud() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    String deviceId = prefs.getString("device_unique_id", null);
                    if (deviceId == null) {
                        deviceId = "android_" + (Build.MODEL != null ? Build.MODEL.hashCode() : 0) + "_" + System.currentTimeMillis();
                        prefs.edit().putString("device_unique_id", deviceId).apply();
                    }

                    String deviceName = Build.MANUFACTURER + " " + Build.MODEL;
                    URL url = new URL("https://os.shivteg.com/api/devices/register");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(6000);
                    conn.setReadTimeout(6000);

                    JSONObject body = new JSONObject();
                    body.put("deviceId", deviceId);
                    body.put("name", deviceName);
                    body.put("platform", "Android " + Build.VERSION.RELEASE);
                    body.put("appVersion", "2.3.0");

                    byte[] out = body.toString().getBytes("UTF-8");
                    OutputStream os = conn.getOutputStream();
                    os.write(out);
                    os.flush();
                    os.close();

                    conn.getResponseCode();
                    conn.disconnect();
                } catch (Exception ignored) {}
            }
        }).start();
    }

    private void startBackgroundPoller() {
        if (backgroundScheduler != null && !backgroundScheduler.isShutdown()) {
            return;
        }

        backgroundScheduler = Executors.newSingleThreadScheduledExecutor();
        backgroundScheduler.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                pollCloudNotifications();
            }
        }, 2, 15, TimeUnit.SECONDS);
    }

    private void pollCloudNotifications() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            long lastTime = prefs.getLong(KEY_LAST_NOTIF_TIME, 0L);
            if (lastTime == 0L) {
                // If first app launch, fetch any alerts from past 2 hours
                lastTime = System.currentTimeMillis() - (2 * 60 * 60 * 1000L);
            }

            URL url = new URL(POLL_ENDPOINT + lastTime);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();

                JSONObject res = new JSONObject(sb.toString());
                if (res.optBoolean("success", false)) {
                    JSONArray arr = res.optJSONArray("notifications");
                    if (arr != null && arr.length() > 0) {
                        long maxTimestamp = lastTime;
                        for (int i = 0; i < arr.length(); i++) {
                            JSONObject item = arr.getJSONObject(i);
                            String notifId = item.optString("id", "notif_" + System.currentTimeMillis());
                            String title = item.optString("title", "🔬 Mini Science Lab");
                            String body = item.optString("body", "");
                            long ts = item.optLong("timestamp", System.currentTimeMillis());
                            if (ts > maxTimestamp) {
                                maxTimestamp = ts;
                            }

                            if (ts > lastTime && !body.isEmpty()) {
                                postNotification(title, body, notifId);

                                // Deliver to WebView if active
                                final String jsTitle = title.replace("'", "\\'");
                                final String jsBody = body.replace("'", "\\'");
                                final String jsId = notifId;
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript(
                                                "if (window.handleIncomingNotification) { window.handleIncomingNotification('" + jsTitle + "', '" + jsBody + "', '" + jsId + "'); }",
                                                null
                                            );
                                        }
                                    }
                                });
                            }
                        }

                        if (maxTimestamp > lastTime) {
                            prefs.edit().putLong(KEY_LAST_NOTIF_TIME, maxTimestamp).apply();
                        }
                    }
                }
            }
            conn.disconnect();
        } catch (Exception ignored) {
            // Offline or server unreachable - silent fail, retry next cycle
        }
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1001);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1001) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted — notifications will work
                System.out.println("POST_NOTIFICATIONS permission GRANTED");
            } else {
                // Permission denied — notifications silently fail
                System.out.println("POST_NOTIFICATIONS permission DENIED by user");
            }
        }
    }

    @Override
    protected void onDestroy() {
        if (backgroundScheduler != null) {
            backgroundScheduler.shutdownNow();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
