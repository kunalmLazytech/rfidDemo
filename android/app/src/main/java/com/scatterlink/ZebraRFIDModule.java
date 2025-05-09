package com.scatterlink;

import android.Manifest;
import android.app.ProgressDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.app.Activity;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.*;
import com.zebra.rfid.api3.*;
import com.zebra.scannercontrol.DCSSDKDefs;
import com.zebra.scannercontrol.DCSScannerInfo;

import java.lang.reflect.Method;
import java.util.*;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class ZebraRFIDModule extends ReactContextBaseJavaModule {
// public class RFIDControllerModule extends ReactContextBaseJavaModule implements IDcsSdkApiDelegate, Readers.RFIDReaderEventHandler {
    private static final String TAG = "ZebraRFIDModule";

    private RFIDReader reader;
    private List<String> tagList = new ArrayList<>();
    private BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    private ArrayList<BluetoothDevice> mDeviceList = new ArrayList<>();
    private IntentFilter filter;
    private Promise scanPromise;
    private Promise connectPromise;
    private Promise pairPromise;
    private ProgressDialog progressDialog;

    public ZebraRFIDModule(ReactApplicationContext reactContext) {
        super(reactContext);
        filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(mReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            reactContext.registerReceiver(mReceiver, filter);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "ZebraRFIDModule";
    }

    // Define IScanConnectHandlers interface
    public interface IScanConnectHandlers {
        void scanTaskDone(ReaderDevice device);
        void cancelScanProgressDialog();
        void disconnect(int scannerId);
        DCSSDKDefs.DCSSDK_RESULT connect(int scannerId);
        void reInit();
    }

    @ReactMethod
public void getAppVersion(Promise promise) {
    try {
        Context context = getReactApplicationContext();
        String versionName = context
                .getPackageManager()
                .getPackageInfo(context.getPackageName(), 0)
                .versionName;

        promise.resolve(versionName);
    } catch (Exception e) {
        promise.reject("VERSION_ERROR", "Failed to get app version", e);
    }
}

    // Define AvailableScanner class
    public static class AvailableScanner {
        private DCSScannerInfo scannerInfo;
        private boolean connected;

        public AvailableScanner(DCSScannerInfo scannerInfo) {
            this.scannerInfo = scannerInfo;
            this.connected = false;
        }

        public String getScannerName() {
            return scannerInfo.getScannerName();
        }

        public String getScannerAddress() {
            return String.valueOf(scannerInfo.getScannerID()); // Using scannerID as address
        }

        public int getScannerId() {
            return scannerInfo.getScannerID();
        }

        public boolean isAutoReconnection() {
            // No direct method, implement or return a default
            return false;
        }

        public boolean isConnected() {
            return connected;
        }

        public void setConnected(boolean connected) {
            this.connected = connected;
        }
    }

    //Define Application class.
    public static class Application{
        public static com.zebra.scannercontrol.SDKHandler sdkHandler;
        public static String TAG = "ZebraRFIDModule";
        public static String currentScannerName;
        public static String currentScannerAddress;
        public static boolean currentAutoReconnectionState;
        public static int currentScannerId;
        public static int currentConnectedScannerID;
        public static DCSScannerInfo currentConnectedScanner;
        public static AvailableScanner curAvailableScanner;

    }

    //Define RFIDController class.
    public static class RFIDController{
        public static Object mConnectedReader;
    }

    public class ScanConnectTask extends AsyncTask<Void, String, Boolean> {

        private ReaderDevice connectingDevice;
        private String prgressMsg;
        private OperationFailureException ex;
        private String password;
        private String scannerName;
        private String scannerAddress;
        private String scannerSerialNumber;
        private List<DCSScannerInfo> availablescannerList;
        private List<DCSScannerInfo> activescannerList;
        Activity activity;
        private IScanConnectHandlers scanTaskHandlers;
        private AvailableScanner curAvailableScanner;

        ScanConnectTask(Activity mActivity, ReaderDevice toConnectDevice, String prgressMsg, String Password, IScanConnectHandlers handlers) {
            this.connectingDevice = toConnectDevice;
            scanTaskHandlers = handlers;
            this.prgressMsg = prgressMsg;
            password = Password;
            scannerName = connectingDevice.getName();
            scannerSerialNumber = toConnectDevice.getSerialNumber();
            scannerAddress = connectingDevice.getAddress();
            activity = mActivity;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected Boolean doInBackground(Void... a) {
            try {
                availablescannerList = Application.sdkHandler.dcssdkGetAvailableScannersList();
                activescannerList = Application.sdkHandler.dcssdkGetActiveScannersList();

                for (DCSScannerInfo device : activescannerList) {
                    String scnName = device.getScannerName();
                    if (scnName.equalsIgnoreCase(scannerName)) {
                        AvailableScanner availableScanner = new AvailableScanner(device);
                        curAvailableScanner = availableScanner;
                        curAvailableScanner.setConnected(true);
                        Application.currentScannerName = availableScanner.getScannerName();
                        Application.currentScannerAddress = availableScanner.getScannerAddress();
                        Application.currentAutoReconnectionState = availableScanner.isAutoReconnection();
                        Application.currentScannerId = availableScanner.getScannerId();
                        Application.currentConnectedScannerID = availableScanner.getScannerId();
                        Application.currentConnectedScanner = device;
                        return true;
                    }
                }

                for (DCSScannerInfo device : availablescannerList) {
                    String scnName = device.getScannerName();
                    if ((scnName.startsWith("RFD8500")) || (scnName.startsWith("RFD40+"))
                            || (scnName.startsWith("RFD40P"))
                            || (scnName.startsWith("RFD90+")))
                        scnName = scnName + "::EA";

                    Log.d(Application.TAG, " scannerName-barcode = " + scnName);
                    Log.d(Application.TAG, " scannerName-zeti = " + scannerName + "::EA");

                    if (scnName.equalsIgnoreCase(scannerName + "::EA")) {
                        AvailableScanner availableScanner = new AvailableScanner(device);

                        if (availableScanner != null) {
                            if (!availableScanner.isConnected()) {
                                if ((curAvailableScanner != null) && (!availableScanner.getScannerAddress().equals(curAvailableScanner.getScannerAddress()))) {
                                    if (curAvailableScanner.isConnected())
                                        scanTaskHandlers.disconnect(curAvailableScanner.getScannerId());
                                }
                                DCSSDKDefs.DCSSDK_RESULT result = DCSSDKDefs.DCSSDK_RESULT.DCSSDK_RESULT_SUCCESS;

                                if (!availableScanner.isConnected()) {
                                    result = scanTaskHandlers.connect(availableScanner.getScannerId());
                                }
                                if (result == DCSSDKDefs.DCSSDK_RESULT.DCSSDK_RESULT_SUCCESS) {
                                    Application.sdkHandler.dcssdkEnableAutomaticSessionReestablishment(false, availableScanner.getScannerId());
                                    curAvailableScanner = availableScanner;
                                    curAvailableScanner.setConnected(true);
                                    Application.currentConnectedScannerID = availableScanner.getScannerId();
                                    Application.currentScannerId = availableScanner.getScannerId();
                                    Application.currentConnectedScanner = device;
                                    return true;
                                } else {
                                    curAvailableScanner = null;
                                    return false;
                                }
                            }
                        } else {
                            curAvailableScanner = availableScanner;
                            Application.currentScannerName = availableScanner.getScannerName();
                            Application.currentScannerAddress = availableScanner.getScannerAddress();
                            Application.currentAutoReconnectionState = availableScanner.isAutoReconnection();
                            Application.currentScannerId = availableScanner.getScannerId();
                        }
                        break;
                    }
                }
            } catch (Exception e) {
            Log.e(TAG, "ScanConnectTask error: ", e);
            return false; // Indicate failure
            }
            return true;
        }

        @Override
        protected void onPostExecute(Boolean result) {
            try {
                 super.onPostExecute(result);
                scanTaskHandlers.reInit();
                scanTaskHandlers.cancelScanProgressDialog();
                Application.curAvailableScanner = curAvailableScanner;
                if (curAvailableScanner == null && RFIDController.mConnectedReader != null) {
                }
                scanTaskHandlers.scanTaskDone(connectingDevice);
            } catch (Exception e) {
            Log.e(TAG, "ScanConnectTask onPostExecute error: ", e);
            }
           
        }

        @Override
        protected void onCancelled() {
            scanTaskHandlers.scanTaskDone(connectingDevice);
            super.onCancelled();
        }

        public ReaderDevice getConnectingDevice() {
            return connectingDevice;
        }
    }

    @ReactMethod
    public void scanBluetoothDevices(Promise promise) {
        if (ActivityCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_ERROR", "Bluetooth or location permissions not granted.");
            return;
        }

        scanPromise = promise;
        mDeviceList.clear();
        mBluetoothAdapter.startDiscovery();
    }

    @ReactMethod
    public void pairDevice(String address, Promise promise) {
        pairPromise = promise;

        BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
        if (device.getBondState() == BluetoothDevice.BOND_BONDED) {
            promise.resolve("Already paired");
            connectToDevice(device);
        } else {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("ACTIVITY_ERROR", "Current activity is not available.");
                return;
            }
            new PairTask(currentActivity, address).execute();
        }
    }

    @ReactMethod
    public void connectReader(String address, Promise promise) {
        try {
            connectPromise = promise;

            Log.d(TAG, "🔍 Attempting to connect to scanner with address: " + address);
            BluetoothDevice targetDevice = null;

            Set<BluetoothDevice> bondedDevices = mBluetoothAdapter.getBondedDevices();
            for (BluetoothDevice device : bondedDevices) {
            Log.d(TAG, "🔗 Found bonded device: " + device.getName() + " (" + device.getAddress() + ")");
            if (device.getAddress().equals(address)) {
                targetDevice = device;
                break;
            }
            }

            if (targetDevice == null) {
            Log.e(TAG, "❌ Device not found in bonded list");
            promise.reject("CONNECTION_ERROR", "Device not bonded or not found");
            return;
            }

            ReaderDevice readerDevice = new ReaderDevice(targetDevice.getName(), targetDevice.getAddress());

            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
            promise.reject("ACTIVITY_NULL", "Current activity is null");
            return;
            }

            ScanConnectTask scanConnectTask = new ScanConnectTask(
                currentActivity,
                readerDevice,
                "Connecting...",
                null,
                new IScanConnectHandlers() {
                    @Override
                    public void scanTaskDone(ReaderDevice device) {
                        Log.d(TAG, "✅ scanTaskDone for: " + device.getName());
                        if (connectPromise != null) {
                            connectPromise.resolve("Connected to " + device.getName());
                            connectPromise = null;
                        }
                    }

                    @Override
                    public void cancelScanProgressDialog() {
                        Log.d(TAG, "Progress dialog canceled.");
                    }

                    @Override
                    public void disconnect(int scannerId) {
                        Log.d(TAG, "Disconnecting scanner: " + scannerId);
                        Application.sdkHandler.dcssdkTerminateCommunicationSession(scannerId);
                    }

                    @Override
                    public DCSSDKDefs.DCSSDK_RESULT connect(int scannerId) {
                        Log.d(TAG, "Connecting to scanner: " + scannerId);
                        return Application.sdkHandler.dcssdkEstablishCommunicationSession(scannerId);
                    }

                    @Override
                    public void reInit() {
                        Log.d(TAG, "Reinitializing handler.");
                    }
                }
            );

            scanConnectTask.execute();
        } catch (Exception e) {
            Log.e(TAG, "connectReader error: ", e);
            promise.reject("CONNECTION_ERROR", e.getMessage());
        }
    }

    private void connectToDevice(BluetoothDevice device) {
        try {
            Log.d(TAG, "🚀 Connecting to device: " + device.getAddress());
            reader = new RFIDReader(device.getAddress(), 0, "BLUETOOTH");
            reader.connect();

            reader.Events.addEventsListener(new ReaderEventsListener());
            reader.Events.setHandheldEvent(true);
            reader.Events.setTagReadEvent(true);
            reader.Events.setReaderDisconnectEvent(true);
            reader.Events.setReaderExceptionEvent(true);

            Log.d(TAG, "✅ Connected to reader: " + reader.getHostName());
            if (connectPromise != null) {
                connectPromise.resolve("Connected to: " + reader.getHostName());
                connectPromise = null;
            }
        } catch (InvalidUsageException | OperationFailureException e) {
            Log.e(TAG, "❌ Connection error: ", e);
            if (connectPromise != null) {
                connectPromise.reject("CONNECTION_ERROR", e.getMessage());
                connectPromise = null;
            }
        }
    }

    private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                if (isRFIDReader(device) && !mDeviceList.contains(device)) {
                    mDeviceList.add(device);
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                WritableArray devicesArray = Arguments.createArray();
                for (BluetoothDevice dev : mDeviceList) {
                    WritableMap deviceMap = Arguments.createMap();
                    deviceMap.putString("name", dev.getName());
                    deviceMap.putString("address", dev.getAddress());
                    devicesArray.pushMap(deviceMap);
                }
                if (scanPromise != null) {
                    scanPromise.resolve(devicesArray);
                    scanPromise = null;
                }
            } else if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                int prevState = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, BluetoothDevice.ERROR);

                Log.d(TAG, "📶 Bond state changed: " + prevState + " -> " + state);

                if (prevState == BluetoothDevice.BOND_BONDING) {
                    if (pairPromise != null) {
                        if (state == BluetoothDevice.BOND_BONDED) {
                            Log.d(TAG, "✅ Device paired successfully");
                            pairPromise.resolve("Device Paired");
                            connectToDevice(device);
                        } else {
                            Log.e(TAG, "❌ Pairing failed");
                            pairPromise.reject("PAIRING_ERROR", "Pairing Failed");
                        }
                        pairPromise = null;
                    }
                }
            }
        }
    };

    private class PairTask extends AsyncTask<Object, Void, String> {
        private final String mMacAddress;
        private final Activity activity;

        public PairTask(Activity activity, String macAddress) {
            this.activity = activity;
            this.mMacAddress = macAddress;
        }

        @Override
        protected void onPreExecute() {
            if (activity != null) {
                progressDialog = new ProgressDialog(activity);
                progressDialog.setMessage("Pairing...");
                progressDialog.setCancelable(false);
                progressDialog.show();
            }
        }

        @Override
        protected String doInBackground(Object... params) {
            try {
                BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(mMacAddress);
                Method method = device.getClass().getMethod("createBond", (Class[]) null);
                method.invoke(device, (Object[]) null);
            } catch (Exception e) {
                Log.e(TAG, "❌ Pairing error: ", e);
                return "Pairing failed: " + e.getMessage();
            }
            return null;
        }

        @Override
        protected void onPostExecute(String errorCode) {
            if (progressDialog != null && progressDialog.isShowing()) {
                progressDialog.dismiss();
            }
            if (errorCode != null && pairPromise != null) {
                pairPromise.reject("PAIRING_ERROR", errorCode);
                pairPromise = null;
            }
        }
    }

    public boolean isRFIDReader(BluetoothDevice device) {
        if (device == null || device.getName() == null) return false;
        return device.getName().startsWith("RFD8500") ||
                device.getName().startsWith("RFD40") ||
                device.getName().startsWith("RFD40P") ||
                device.getName().startsWith("RFD90");
    }

    private class ReaderEventsListener implements RfidEventsListener {
        @Override
        public void eventReadNotify(RfidReadEvents rfidReadEvents) {
            TagData tagData = rfidReadEvents.getReadEventData().tagData;
            if (tagData != null) {
                String tagId = tagData.getTagID();
                if (!tagList.contains(tagId)) {
                    tagList.add(tagId);
                    Log.d(TAG, "📥 New Tag: " + tagId);
                }
            }
        }

        @Override
        public void eventStatusNotify(RfidStatusEvents rfidStatusEvents) {
            Log.d(TAG, "📶 Status: " + rfidStatusEvents.StatusEventData.getStatusEventType());
        }
    }

    @ReactMethod
    public void listBondedDevices(Promise promise) {
        WritableArray devices = Arguments.createArray();
        for (BluetoothDevice device : mBluetoothAdapter.getBondedDevices()) {
            WritableMap map = Arguments.createMap();
            map.putString("name", device.getName());
            map.putString("address", device.getAddress());
            devices.pushMap(map);
        }
        promise.resolve(devices);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
    }
}