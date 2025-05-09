package com.scatterlink;

import android.os.AsyncTask;
import android.util.Log;

import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.List;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.zebra.rfid.api3.Antennas;
import com.zebra.rfid.api3.ENUM_TRANSPORT;
import com.zebra.rfid.api3.ENUM_TRIGGER_MODE;
import com.zebra.rfid.api3.FILTER_ACTION;
import com.zebra.rfid.api3.HANDHELD_TRIGGER_EVENT_TYPE;
import com.zebra.rfid.api3.INVENTORY_STATE;
import com.zebra.rfid.api3.IRFIDLogger;
import com.zebra.rfid.api3.InvalidUsageException;
import com.zebra.rfid.api3.LOCK_DATA_FIELD;
import com.zebra.rfid.api3.LOCK_PRIVILEGE;
import com.zebra.rfid.api3.MEMORY_BANK;
import com.zebra.rfid.api3.OperationFailureException;
import com.zebra.rfid.api3.PreFilters;
import com.zebra.rfid.api3.RFIDReader;
import com.zebra.rfid.api3.ReaderDevice;
import com.zebra.rfid.api3.Readers;
import com.zebra.rfid.api3.RfidEventsListener;
import com.zebra.rfid.api3.RfidReadEvents;
import com.zebra.rfid.api3.RfidStatusEvents;
import com.zebra.rfid.api3.SESSION;
import com.zebra.rfid.api3.SL_FLAG;
import com.zebra.rfid.api3.START_TRIGGER_TYPE;
import com.zebra.rfid.api3.STATE_AWARE_ACTION;
import com.zebra.rfid.api3.STATUS_EVENT_TYPE;
import com.zebra.rfid.api3.STOP_TRIGGER_TYPE;
import com.zebra.rfid.api3.TARGET;
import com.zebra.rfid.api3.TRUNCATE_ACTION;
import com.zebra.rfid.api3.TagAccess;
import com.zebra.rfid.api3.TagData;
import com.zebra.rfid.api3.TriggerInfo;
import com.zebra.rfid.api3.BatteryStatistics;
import com.zebra.scannercontrol.DCSSDKDefs;
import com.zebra.scannercontrol.DCSScannerInfo;
import com.zebra.scannercontrol.FirmwareUpdateEvent;
import com.zebra.scannercontrol.IDcsSdkApiDelegate;
import com.zebra.scannercontrol.SDKHandler;
import android.bluetooth.BluetoothAdapter;
import android.content.Intent;
import android.provider.Settings;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;


import java.util.ArrayList;

public class RFIDControllerModule extends ReactContextBaseJavaModule 
    implements IDcsSdkApiDelegate, Readers.RFIDReaderEventHandler {

    private final static String TAG = "RFIDControllerModule";
    private Readers readers;
    private ArrayList<ReaderDevice> availableRFIDReaderList;
    private RFIDReader reader;
    private EventHandler eventHandler;
    private SDKHandler sdkHandler;
    private ArrayList<DCSScannerInfo> scannerList;
    private int scannerID;
    private int MAX_POWER = 0;
    private String readerName = "RFD4031-G10B700-US"; // Change as needed
    private Promise connectPromise;
    private Promise inventoryPromise;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

//    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private HandlerThread rfidHandlerThread;
    private Handler rfidHandler;


    public RFIDControllerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        scannerList = new ArrayList<>();
        // InitSDK();

        rfidHandlerThread = new HandlerThread("RFIDHandlerThread");
        rfidHandlerThread.start();
        rfidHandler = new Handler(rfidHandlerThread.getLooper());

            // Register Bluetooth state receiver
    IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
    reactContext.registerReceiver(bluetoothReceiver, filter);
    }

    @Override
    public String getName() {
        Log.d(TAG, "getName() called");
        return "RFIDControllerModule";
    }

    private final BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(intent.getAction())) {
            int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
            String stateStr;

            switch (state) {
                case BluetoothAdapter.STATE_OFF:
                    stateStr = "off";
                    break;
                case BluetoothAdapter.STATE_ON:
                    stateStr = "on";
                    break;
                default:
                    return;
            }

            WritableMap params = Arguments.createMap();
            params.putString("state", stateStr);

            if (getReactApplicationContext().hasActiveCatalystInstance()) {
                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("BluetoothStateChanged", params);
            }
        }
    }
};

    // React Native Methods
    @ReactMethod
    public void connect(Promise promise) {
        rfidHandler.post(() -> {
            String result = connectInternal();
            mainHandler.post(() -> {
                WritableMap response = Arguments.createMap();
                if (result.startsWith("Connected")) {
                    response.putBoolean("success", true);
                    response.putString("message", result);
                    response.putString("deviceName", result.replace("Connected: ", ""));
                } else {
                    response.putBoolean("success", false);
                    response.putString("message", result);
                }
                promise.resolve(response);
            });
        });
    }


    @ReactMethod
    public void setPower(int power, Promise promise) {
        try {
            if (reader != null) {
                // Set the power using Antennas.AntennaRfConfig
                Antennas.AntennaRfConfig config = reader.Config.Antennas.getAntennaRfConfig(1); // Assuming antenna 1

                // Ensure power is within valid range
                int[] powerLevels = reader.ReaderCapabilities.getTransmitPowerLevelValues();
                if (power >= 0 && power < powerLevels.length) {
                    config.setTransmitPowerIndex(power);
                    reader.Config.Antennas.setAntennaRfConfig(1, config);
                    promise.resolve("Power set to " + powerLevels[power]);
                } else {
                    promise.reject("Error", "Power level out of range");
                }
            } else {
                promise.reject("Error", "Reader not initialized");
            }
        } catch (InvalidUsageException | OperationFailureException e) {
            e.printStackTrace();
            promise.reject("Error", "Failed to set power: " + e.getMessage());
        }
    }

    @ReactMethod
    public void disconnect(Promise promise) {
        disconnectInternal();
        promise.resolve("Disconnected");
    }

    // @ReactMethod
    // public void connect(Promise promise) {
    //     connectInternal();
    //     promise.resolve("Connected");
    // }

    @ReactMethod
    public void sdkConnect(Promise promise) {
      executorService.execute(() -> {
        String result = connectInternal();
        boolean success = result.startsWith("Connected");
    
        WritableMap response = Arguments.createMap();
        response.putBoolean("success", success);
        response.putString("message", result);
    
        mainHandler.post(() -> {
          promise.resolve(response);
        });
      });
    }

    @ReactMethod
    public void startInventory(Promise promise) {
        inventoryPromise = promise;
        performInventory();
    }

    @ReactMethod
    public void stopInventory(Promise promise) {
        stopInventoryInternal();
        promise.resolve("Inventory stopped");
    }

    @ReactMethod
    public void scanBarcode(Promise promise){
        scanCode();
        promise.resolve("Barcode scan command sent");
    }

    @ReactMethod
    public void testFunction(){
        setPreFilters();
    }

    @ReactMethod
    public void setDefaults(Promise promise) {
        String result = Defaults();
        promise.resolve(result);
    }

    @ReactMethod
    public void test1(Promise promise) {
        String result = Test1();
        promise.resolve(result);
    }
    @ReactMethod
    public void test2(Promise promise) {
        String result = Test2();
        promise.resolve(result);
    }


    // RFID SDK Methods
    // @ReactMethod
    // public void InitSDK() {
    //     Log.d(TAG, "InitSDK");
    //     if (readers == null) {
    //         new CreateInstanceTask().execute();
    //     } else {
    //         connectReader();
    //     }
    // }
    private Promise initSDKPromise;
    @ReactMethod
    public void InitSDK(Promise promise) {
        Log.d(TAG, "InitSDK");
        initSDKPromise = promise; // ✅ Save it to resolve later in ConnectionTask.onPostExecute()

        if (readers == null) {
        Log.d(TAG, "CreateInstanceTask");
            new CreateInstanceTask().execute();
        } else {
        Log.d(TAG, "connectReader");
            connectReader();
        }
    }

    private class CreateInstanceTask extends AsyncTask<Void, Void, Void> {
        private InvalidUsageException invalidUsageException = null;

        @Override
        protected Void doInBackground(Void... voids) {
            Log.d(TAG, "CreateInstanceTask");
            try {
                readers = new Readers(getReactApplicationContext(), ENUM_TRANSPORT.SERVICE_USB);
                availableRFIDReaderList = readers.GetAvailableRFIDReaderList();
                if (availableRFIDReaderList == null || availableRFIDReaderList.isEmpty()) {
                    readers.setTransport(ENUM_TRANSPORT.BLUETOOTH);
                    availableRFIDReaderList = readers.GetAvailableRFIDReaderList();
                }
                if (availableRFIDReaderList.isEmpty()) {
                    readers.setTransport(ENUM_TRANSPORT.SERVICE_SERIAL);
                    availableRFIDReaderList = readers.GetAvailableRFIDReaderList();
                }
                if (availableRFIDReaderList.isEmpty()) {
                    readers.setTransport(ENUM_TRANSPORT.RE_SERIAL);
                    availableRFIDReaderList = readers.GetAvailableRFIDReaderList();
                }
            } catch (InvalidUsageException e) {
                invalidUsageException = e;
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(Void aVoid) {
            super.onPostExecute(aVoid);
            if (invalidUsageException != null) {
                sendEvent("Error", invalidUsageException.getInfo());
                readers = null;
            } else if (availableRFIDReaderList.isEmpty()) {
                sendEvent("Error", "No Available Readers to proceed");
                readers = null;
            } else {
                connectReader();
            }
        }
    }

    private synchronized void connectReader() {
        Log.d(TAG, "isReaderConnected"+ isReaderConnected());
        if (!isReaderConnected()) {
            new ConnectionTask().execute();
        }else{
            GetAvailableReader();
        }
    }

    private class ConnectionTask extends AsyncTask<Void, Void, String> {
        @Override
        protected String doInBackground(Void... voids) {
            Log.d(TAG, "ConnectionTask");
            GetAvailableReader();
            if (reader != null)
                return connectInternal();
            return "Failed to find or connect reader";
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);
            if (connectPromise != null) {
                if (result.startsWith("Connected")) {
                    connectPromise.resolve(result);
                } else {
                    connectPromise.reject("ConnectionError", result);
                }
                connectPromise = null;
            }
        }
    }

    //  private synchronized void GetAvailableReader() {
    //     Log.d(TAG, "GetAvailableReader");
    //     if (readers != null) {
    //         readers.attach(this);
    //         try {
    //             ArrayList<ReaderDevice> availableReaders = readers.GetAvailableRFIDReaderList();
    //             if (availableReaders != null && !availableReaders.isEmpty()) {
    //                 availableRFIDReaderList = availableReaders;
    //                 Log.d(TAG, "Available RFID reader list size: " + availableRFIDReaderList.size());
    //                 if (availableRFIDReaderList.size() == 1) {
    //                     reader = availableRFIDReaderList.get(0).getRFIDReader();
    //                     Log.d(TAG, "Selected single available reader: " + reader.getHostName());
    //                 } else if (readerName != null && !readerName.isEmpty()) {
    //                     for (ReaderDevice device : availableRFIDReaderList) {
    //                         if (device.getName().startsWith(readerName)) {
    //                             reader = device.getRFIDReader();
    //                             Log.d(TAG, "Selected reader by name (" + readerName + "): " + reader.getHostName());
    //                             break;
    //                         }
    //                     }
    //                     if (reader == null) {
    //                         Log.w(TAG, "No reader found with the specified name: " + readerName + ". Connecting to the first available.");
    //                         reader = availableRFIDReaderList.get(0).getRFIDReader();
    //                         Log.d(TAG, "Connecting to the first available reader: " + reader.getHostName());
    //                     }
    //                 } else if (!availableRFIDReaderList.isEmpty()) {
    //                     reader = availableRFIDReaderList.get(0).getRFIDReader();
    //                     Log.d(TAG, "Connecting to the first available reader (no specific name): " + reader.getHostName());
    //                 } else {
    //                     Log.e(TAG, "No readers found in the list.");
    //                     reader = null;
    //                 }
    //             } else {
    //                 Log.e(TAG, "No readers were found by the SDK.");
    //                 reader = null;
    //             }
    //         } catch (InvalidUsageException ie) {
    //             ie.printStackTrace();
    //             Log.e(TAG, "InvalidUsageException in getAvailableReader: ", ie);
    //             reader = null;
    //         }
    //     } else {
    //         Log.e(TAG, "readers was null in GetAvailableReader.");
    //         reader = null;
    //     }
    // }

    @Override
    public void RFIDReaderAppeared(ReaderDevice readerDevice) {
        Log.d(TAG, "RFIDReaderAppeared " + readerDevice.getName());
        sendEvent("ReaderAppeared", readerDevice.getName());
        connectReader();
    }

    @Override
    public void RFIDReaderDisappeared(ReaderDevice readerDevice) {
        Log.d(TAG, "RFIDReaderDisappeared " + readerDevice.getName());
        sendEvent("ReaderDisappeared", readerDevice.getName());
        if (reader != null && readerDevice.getName().equals(reader.getHostName())) {

            disconnectInternal();
        }
    }

    // private synchronized void GetAvailableReader() {
    //     Log.d(TAG, "GetAvailableReader");
    //     if (readers != null) {
    //         readers.attach(this);
    //         try {
    //             ArrayList<ReaderDevice> availableReaders = readers.GetAvailableRFIDReaderList();
    //             if (availableReaders == null || availableReaders.isEmpty()) {
    //                 Log.e(TAG, "No readers found");
    //                 return;
    //             }
    //             if (availableReaders != null && !availableReaders.isEmpty()) {
    //                 availableRFIDReaderList = availableReaders;
    //                 if (availableRFIDReaderList.size() == 1) {
    //                     reader = availableRFIDReaderList.get(0).getRFIDReader();
    //                 } else {
    //                     for (ReaderDevice device : availableRFIDReaderList) {
    //                         if (device.getName().startsWith(readerName)) {
    //                             reader = device.getRFIDReader();
    //                         }
    //                     }
    //                 }
    //             } else{
    //                 Log.e(TAG, "no readers where found");
    //             }
    //         } catch (InvalidUsageException ie) {
    //             ie.printStackTrace();
    //             Log.e(TAG, "InvalidUsageException in getAvailableReader: ", ie);
    //         }
    //     } else {
    //         Log.e(TAG, "readers was null");
    //     }
    // }

    // @Override
    // public void RFIDReaderAppeared(ReaderDevice readerDevice) {
    //     Log.d(TAG, "RFIDReaderAppeared " + readerDevice.getName());
    //     sendEvent("ReaderAppeared", readerDevice.getName());
    //     connectReader();
    // }

    // @Override
    // public void RFIDReaderDisappeared(ReaderDevice readerDevice) {
    //     Log.d(TAG, "RFIDReaderDisappeared " + readerDevice.getName());
    //     sendEvent("ReaderDisappeared", readerDevice.getName());
    //     if (reader != null && readerDevice.getName().equals(reader.getHostName())) {
    //         disconnectInternal();
    //     }
    // }

    private void sendEvent(String eventName, Object data) {
        mainHandler.post(() -> {
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, data);
        });
    }

    private synchronized String connectInternal() {
    Log.d(TAG, "connectInternal: attempting connection");
    if (reader == null) {
        Log.d(TAG, "Reader was null. Trying to fetch available readers...");
        GetAvailableReader();
    }
    Log.d(TAG, "reader: " + reader);


    if (reader != null) {
        try {
            if (!reader.isConnected()) {
                Log.d(TAG, "connecting: " );
                reader.connect();
                ConfigureReader();
                Handler mainHandler = new Handler(Looper.getMainLooper());
                mainHandler.post(() -> {
                    setupScannerSDK();
                });
                
                if (reader.isConnected()) {
                    Log.d(TAG, "connectInternal: connection successful");
                    if (initSDKPromise != null) {
                        initSDKPromise.resolve("Connected: " + reader.getHostName()); // Resolve the promise
                    }
                    return "Connected: " + reader.getHostName();
                } else {
                    if (initSDKPromise != null) {
                        initSDKPromise.reject("Connection failed", "Unknown reason after connect()");
                    }
                    return "Connection failed: unknown reason after connect().";
                }
            } else {
                Log.d(TAG, "connecting ?? " );

                if (initSDKPromise != null) {
                    initSDKPromise.resolve("Connected1: " + reader.getHostName()); // Resolve if already connected
                }
                Log.d(TAG, "Connected: " + reader.getHostName());
                return "Connected: " + reader.getHostName(); // already connected
            }
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, "connectInternal: Exception during connection: ", e);
            if (initSDKPromise != null) {
                initSDKPromise.reject("Connection failed", e.getMessage()); // Reject on error
            }
            return "Connection failed: " + e.getMessage();
        }
    } else {
        GetAvailableReader();
    }

    if (initSDKPromise != null) {
        initSDKPromise.reject("Connection failed", "Reader was null"); // Reject if reader is null
    }
    return "Reader was null";
}

    private synchronized void GetAvailableReader() {
        Log.d(TAG, "GetAvailableReader");

        if (readers != null) {
            readers.attach(this);
            try {
                ArrayList<ReaderDevice> availableReaders = readers.GetAvailableRFIDReaderList();

                if (availableReaders == null) {
                    Log.e(TAG, "GetAvailableReader: Reader list returned null.");
                    availableRFIDReaderList = new ArrayList<>();
                    reader = null;
                    return;
                }

                if (!availableReaders.isEmpty()) {
                    availableRFIDReaderList = availableReaders;
                    Log.d(TAG, "Available RFID reader list size: " + availableRFIDReaderList.size());

                    if (availableRFIDReaderList.size() == 1) {
                        reader = availableRFIDReaderList.get(0).getRFIDReader();
                        Log.d(TAG, "Selected single available reader: " + reader.getHostName());
                    } else if (readerName != null && !readerName.isEmpty()) {
                        for (ReaderDevice device : availableRFIDReaderList) {
                            if (device.getName().startsWith(readerName)) {
                                reader = device.getRFIDReader();
                                Log.d(TAG, "Selected reader by name (" + readerName + "): " + reader.getHostName());
                                break;
                            }
                        }

                        if (reader == null) {
                            Log.w(TAG, "No reader found with the specified name: " + readerName + ". Using first available.");
                            reader = availableRFIDReaderList.get(0).getRFIDReader();
                        }
                    } else {
                        reader = availableRFIDReaderList.get(0).getRFIDReader();
                        Log.d(TAG, "Defaulted to first available reader: " + reader.getHostName());
                    }
                } else {
                    Log.e(TAG, "GetAvailableReader: availableReaders is empty.");
                    reader = null;
                }

            } catch (InvalidUsageException ie) {
                ie.printStackTrace();
                Log.e(TAG, "InvalidUsageException in GetAvailableReader: ", ie);
                availableRFIDReaderList = new ArrayList<>();
                reader = null;
            }
        } else {
            Log.e(TAG, "GetAvailableReader: readers is null.");
            availableRFIDReaderList = new ArrayList<>();
            reader = null;
        }
    }


    private void ConfigureReader() {
        Log.d(TAG, "ConfigureReader " + reader.getHostName());
        IRFIDLogger.getLogger("SDKSAmpleApp").EnableDebugLogs(true);
        if (reader.isConnected()) {
            TriggerInfo triggerInfo = new TriggerInfo();
            triggerInfo.StartTrigger.setTriggerType(START_TRIGGER_TYPE.START_TRIGGER_TYPE_IMMEDIATE);
            triggerInfo.StopTrigger.setTriggerType(STOP_TRIGGER_TYPE.STOP_TRIGGER_TYPE_IMMEDIATE);
            try {
                if (eventHandler == null)
                    eventHandler = new EventHandler();
                reader.Events.addEventsListener(eventHandler);
                reader.Events.setHandheldEvent(true);
                reader.Events.setTagReadEvent(true);
                reader.Events.setAttachTagDataWithReadEvent(false);
                reader.Config.setTriggerMode(ENUM_TRIGGER_MODE.RFID_MODE, true);
                reader.Config.setStartTrigger(triggerInfo.StartTrigger);
                reader.Config.setStopTrigger(triggerInfo.StopTrigger);
                MAX_POWER = reader.ReaderCapabilities.getTransmitPowerLevelValues().length - 1;
                Antennas.AntennaRfConfig config = reader.Config.Antennas.getAntennaRfConfig(1);
                config.setTransmitPowerIndex(MAX_POWER);
                config.setrfModeTableIndex(0);
                config.setTari(0);
                reader.Config.Antennas.setAntennaRfConfig(1, config);
                Antennas.SingulationControl s1_singulationControl = reader.Config.Antennas.getSingulationControl(1);
                s1_singulationControl.setSession(SESSION.SESSION_S0);
                s1_singulationControl.Action.setInventoryState(INVENTORY_STATE.INVENTORY_STATE_A);
                s1_singulationControl.Action.setSLFlag(SL_FLAG.SL_ALL);
                reader.Config.Antennas.setSingulationControl(1, s1_singulationControl);
                reader.Actions.PreFilters.deleteAll();
            } catch (InvalidUsageException | OperationFailureException e) {
                e.printStackTrace();
            }
        }
    }

    @ReactMethod
    public void getDeviceInfo(Promise promise) {
        executorService.execute(() -> {
            WritableMap deviceInfo = getDeviceInfoInternal();
            mainHandler.post(() -> {
                if (deviceInfo != null) {
                    promise.resolve(deviceInfo);
                } else {
                    promise.reject("DEVICE_INFO_ERROR", "Could not retrieve device information.");
                }
            });
        });
    }

    private WritableMap getDeviceInfoInternal() {
        WritableMap map = Arguments.createMap();
        if (reader != null && reader.isConnected()) {
            map.putString("deviceName", reader.getHostName());
            map.putBoolean("isConnected", true);

            try {
                if (reader.Config != null) {
                    BatteryStatistics batteryStats = reader.Config.getBatteryStats();

                    map.putInt("batteryLevel", batteryStats.getPercentage());
                    map.putString("batteryStatus", String.valueOf(batteryStats.getChargeStatus()));
                    map.putString("batteryHealth", batteryStats.getHealthState());
                    map.putInt("batteryTemperature", batteryStats.getTemperature());
                } else {
                    map.putInt("batteryLevel", -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                map.putInt("batteryLevel", -1);
            }
        } else {
            map.putString("deviceName", "No Reader");
            map.putBoolean("isConnected", false);
            map.putInt("batteryLevel", -1);
        }
        return map;
    }

    private boolean isRfd8500LikeDevice() {
        return reader != null && reader.ReaderCapabilities != null && reader.ReaderCapabilities.getModelName().contains("RFD8500");
    }

    // public void setupScannerSDK() {
    //     if (sdkHandler == null) {
    //         sdkHandler = new SDKHandler(getReactApplicationContext());
    //         sdkHandler.dcssdkSetOperationalMode(DCSSDKDefs.DCSSDK_MODE.DCSSDK_OPMODE_USB_CDC);
    //         sdkHandler.dcssdkSetOperationalMode(DCSSDKDefs.DCSSDK_MODE.DCSSDK_OPMODE_BT_LE);
    //         sdkHandler.dcssdkSetOperationalMode(DCSSDKDefs.DCSSDK_MODE.DCSSDK_OPMODE_BT_NORMAL);
    //         sdkHandler.dcssdkSetDelegate(this);
    //         int notifications_mask = DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SCANNER_APPEARANCE.value |
    //                 DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SCANNER_DISAPPEARANCE.value |
    //                 DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_BARCODE.value |
    //                 DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SESSION_ESTABLISHMENT.value |
    //                 DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SESSION_TERMINATION.value;
    //         sdkHandler.dcssdkSubsribeForEvents(notifications_mask);
    //     }
    //     // if (sdkHandler != null) {
    //     //     ArrayList<DCSScannerInfo> availableScanners = (ArrayList<DCSScannerInfo>) sdkHandler.dcssdkGetAvailableScannersList();
    //     //     scannerList.clear();
    //     //     if (availableScanners != null) {
    //     //         scannerList.addAll(availableScanners);
    //     //     }
    //     // }
    //     if (sdkHandler != null) {
    //        ArrayList<DCSScannerInfo> availableScanners = (ArrayList<DCSScannerInfo>) sdkHandler.dcssdkGetAvailableScannersList();
    //        if (scannerList != null) {
    //            scannerList.clear();
    //            if (availableScanners != null) {
    //                scannerList.addAll(availableScanners);
    //            }
    //        }
    //     }
    //     if (reader != null) {
    //         for (DCSScannerInfo device : scannerList) {
    //             if (device.getScannerName().contains(reader.getHostName())) {
    //                 try {
    //                     sdkHandler.dcssdkEstablishCommunicationSession(device.getScannerID());
    //                     scannerID = device.getScannerID();
    //                 } catch (Exception e) {
    //                     e.printStackTrace();
    //                 }
    //             }
    //         }
    //     }
    // }

    public void setupScannerSDK() {
        if (sdkHandler == null) {
            sdkHandler = new SDKHandler(getReactApplicationContext());
            sdkHandler.dcssdkSetOperationalMode(DCSSDKDefs.DCSSDK_MODE.DCSSDK_OPMODE_USB_CDC);
            sdkHandler.dcssdkSetOperationalMode(DCSSDKDefs.DCSSDK_MODE.DCSSDK_OPMODE_BT_LE);
            sdkHandler.dcssdkSetOperationalMode(DCSSDKDefs.DCSSDK_MODE.DCSSDK_OPMODE_BT_NORMAL);
            sdkHandler.dcssdkSetDelegate(this);
            int notifications_mask = DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SCANNER_APPEARANCE.value |
                    DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SCANNER_DISAPPEARANCE.value |
                    DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_BARCODE.value |
                    DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SESSION_ESTABLISHMENT.value |
                    DCSSDKDefs.DCSSDK_EVENT.DCSSDK_EVENT_SESSION_TERMINATION.value;
            sdkHandler.dcssdkSubsribeForEvents(notifications_mask);
        }

        if (sdkHandler != null) {
            List<DCSScannerInfo> availableScanners = sdkHandler.dcssdkGetAvailableScannersList();
            // Initialize scannerList if it's null (shouldn't happen if initialized in constructor)
            if (scannerList == null) {
                scannerList = new ArrayList<>();
            } else {
                scannerList.clear();
            }

            if (availableScanners != null) {
                scannerList.addAll(availableScanners);
            }
        }

        if (reader != null && scannerList != null) { // Ensure scannerList is not null before iterating
            for (DCSScannerInfo device : scannerList) {
                if (device.getScannerName().contains(reader.getHostName())) {
                    try {
                        sdkHandler.dcssdkEstablishCommunicationSession(device.getScannerID());
                        scannerID = device.getScannerID();
                        Log.d(TAG, "Established scanner session with: " + device.getScannerName() + " (ID: " + scannerID + ")");
                        break; // Assuming one scanner per reader
                    } catch (Exception e) {
                        e.printStackTrace();
                        Log.e(TAG, "Error establishing scanner session: " + e.getMessage());
                    }
                }
            }
        }
    }

    @ReactMethod
public void isBluetoothEnabled(Promise promise) {
    BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    if (bluetoothAdapter == null) {
        promise.reject("NO_BT", "Bluetooth not supported");
    } else {
        promise.resolve(bluetoothAdapter.isEnabled());
    }
}

@ReactMethod
public void requestEnableBluetooth() {
    Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
    enableBtIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getReactApplicationContext().startActivity(enableBtIntent);
}

@ReactMethod
public void openBluetoothSettings() {
    Intent intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getReactApplicationContext().startActivity(intent);
}

    private synchronized void disconnectInternal() {
        Log.d(TAG, "Disconnect");
        try {
            if (reader != null) {
                if (eventHandler != null)
                    reader.Events.removeEventsListener(eventHandler);
                if (sdkHandler != null) {
                    sdkHandler.dcssdkTerminateCommunicationSession(scannerID);
                    scannerList = null;
                }
                reader.disconnect();
                reader = null;
            }
        } catch (InvalidUsageException | OperationFailureException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private synchronized void dispose() {
        disconnectInternal();
        try {
            if (readers != null) {
                readers.Dispose();
                readers = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private synchronized void performInventory() {
        try {
            reader.Actions.Inventory.perform();
        } catch (InvalidUsageException | OperationFailureException e) {
            e.printStackTrace();
            if (inventoryPromise != null) {
                inventoryPromise.reject("InventoryError", e.getMessage());
                inventoryPromise = null;
            }
        }
    }

    private synchronized void stopInventoryInternal() {
        try {
            reader.Actions.Inventory.stop();
        } catch (InvalidUsageException | OperationFailureException e) {
            e.printStackTrace();
        }
    }

    public void scanCode() {
        String in_xml = "<inArgs><scannerID>" + scannerID + "</scannerID></inArgs>";
        new MyAsyncTask(scannerID, DCSSDKDefs.DCSSDK_COMMAND_OPCODE.DCSSDK_DEVICE_PULL_TRIGGER, null).execute(in_xml);
    }

    private class MyAsyncTask extends AsyncTask<String, Integer, Boolean> {
        int scannerId;
        StringBuilder outXML;
        DCSSDKDefs.DCSSDK_COMMAND_OPCODE opcode;

        public MyAsyncTask(int scannerId, DCSSDKDefs.DCSSDK_COMMAND_OPCODE opcode, StringBuilder outXML) {
            this.scannerId = scannerId;
            this.opcode = opcode;
            this.outXML = outXML;
        }

        @Override
        protected Boolean doInBackground(String... strings) {
            return executeCommand(opcode, strings[0], outXML, scannerId);
        }
    }

    public boolean executeCommand(DCSSDKDefs.DCSSDK_COMMAND_OPCODE opCode, String inXML, StringBuilder outXML, int scannerID) {
        if (sdkHandler != null) {
            if (outXML == null) {
                outXML = new StringBuilder();
            }
            DCSSDKDefs.DCSSDK_RESULT result = sdkHandler.dcssdkExecuteCommandOpCodeInXMLForScanner(opCode, inXML, outXML, scannerID);
            Log.d(TAG, "execute command returned " + result.toString());
            return result == DCSSDKDefs.DCSSDK_RESULT.DCSSDK_RESULT_SUCCESS;
        }
        return false;
    }

    public class EventHandler implements RfidEventsListener {
        public void eventReadNotify(RfidReadEvents e) {
            TagData[] myTags = reader.Actions.getReadTags(100);
            if (myTags != null) {
                mainHandler.post(() -> {
                    WritableArray tagArray = Arguments.createArray();
                    for (TagData tag : myTags) {
                        WritableMap tagMap = Arguments.createMap();
                        tagMap.putString("tagId", tag.getTagID());
                        tagMap.putInt("rssi", tag.getPeakRSSI());
                        tagArray.pushMap(tagMap);
                    }
                    // sendEvent("TagData", tagArray);
                    WritableMap eventMap = Arguments.createMap();
                    eventMap.putArray("tags", tagArray);
                    sendEvent("TagData", eventMap);
                });
            }
        }

        public void eventStatusNotify(RfidStatusEvents rfidStatusEvents) {
            Log.d(TAG, "Status Notification: " + rfidStatusEvents.StatusEventData.getStatusEventType());

            // Handle trigger press
            if (rfidStatusEvents.StatusEventData.getStatusEventType() == STATUS_EVENT_TYPE.HANDHELD_TRIGGER_EVENT) {
                boolean pressed = rfidStatusEvents.StatusEventData.HandheldTriggerEventData.getHandheldEvent() == HANDHELD_TRIGGER_EVENT_TYPE.HANDHELD_TRIGGER_PRESSED;
                Log.d(TAG, "Handheld Trigger Pressed: " + pressed);
                sendEvent("TriggerEvent", pressed);

                // Start inventory when trigger is pressed
                if (pressed) {
                    performInventory();
                }else{
                    stopInventoryInternal();
                }
            }

            // Handle other status events (e.g., disconnection)
            if (rfidStatusEvents.StatusEventData.getStatusEventType() == STATUS_EVENT_TYPE.DISCONNECTION_EVENT) {
                disconnectInternal();
            }
        }
    }

    private class AsyncDataUpdate extends AsyncTask<TagData[], Void, Void> {
        @Override
        protected Void doInBackground(TagData[]... params) {
            WritableArray tagArray = Arguments.createArray();
            for (TagData tag : params[0]) {
                WritableMap tagMap = Arguments.createMap();
                tagMap.putString("tagId", tag.getTagID());
                tagMap.putInt("rssi", tag.getPeakRSSI());
                tagArray.pushMap(tagMap);
            }
            sendEvent("TagData", tagArray);
            return null;
        }
    }

        public String Test1() {
        // check reader connection
        if (!isReaderConnected())
            return "Not connected";
        // set antenna configurations - reducing power to 200
        try {
            Antennas.AntennaRfConfig config = null;
            config = reader.Config.Antennas.getAntennaRfConfig(1);
            config.setTransmitPowerIndex(100);
            config.setrfModeTableIndex(0);
            config.setTari(0);
            reader.Config.Antennas.setAntennaRfConfig(1, config);
        } catch (InvalidUsageException e) {
            e.printStackTrace();
        } catch (OperationFailureException e) {
            e.printStackTrace();
            return e.getResults().toString() + " " + e.getVendorMessage();
        }
        return "Antenna power Set to 220";
    }

    public String Test2() {
        // check reader connection
        if (!isReaderConnected())
            return "Not connected";
        // Set the singulation control to S2 which will read each tag once only
        try {
            Antennas.SingulationControl s1_singulationControl = reader.Config.Antennas.getSingulationControl(1);
            s1_singulationControl.setSession(SESSION.SESSION_S2);
            s1_singulationControl.Action.setInventoryState(INVENTORY_STATE.INVENTORY_STATE_A);
            s1_singulationControl.Action.setSLFlag(SL_FLAG.SL_ALL);
            reader.Config.Antennas.setSingulationControl(1, s1_singulationControl);
        } catch (InvalidUsageException e) {
            e.printStackTrace();
        } catch (OperationFailureException e) {
            e.printStackTrace();
            return e.getResults().toString() + " " + e.getVendorMessage();
        }
        return "Session set to S2";
    }

    public String Defaults() {
        // check reader connection
        if (!isReaderConnected())
            return "Not connected";;
        try {
            // Power to 100
            Antennas.AntennaRfConfig config = null;
            config = reader.Config.Antennas.getAntennaRfConfig(1);
            config.setTransmitPowerIndex(100);
            config.setrfModeTableIndex(0);
            config.setTari(0);
            reader.Config.Antennas.setAntennaRfConfig(1, config);
            // singulation to S0
            Antennas.SingulationControl s1_singulationControl = reader.Config.Antennas.getSingulationControl(1);
            s1_singulationControl.setSession(SESSION.SESSION_S0);
            s1_singulationControl.Action.setInventoryState(INVENTORY_STATE.INVENTORY_STATE_A);
            s1_singulationControl.Action.setSLFlag(SL_FLAG.SL_ALL);
            reader.Config.Antennas.setSingulationControl(1, s1_singulationControl);
        } catch (InvalidUsageException e) {
            e.printStackTrace();
        } catch (OperationFailureException e) {
            e.printStackTrace();
            return e.getResults().toString() + " " + e.getVendorMessage();
        }
        return "Default settings applied";
    }

    private boolean isReaderConnected() {
        return reader != null && reader.isConnected();
    }

    public void setPreFilters() {
        Log.d("setPrefilter", "setPrefilter...");
        PreFilters.PreFilter[] preFilterArray = new PreFilters.PreFilter[4];

        PreFilters filters = new PreFilters();
        PreFilters.PreFilter filter = filters.new PreFilter();
        filter.setAntennaID((short) 1);
        filter.setTagPattern("000000000000000000000282");
        filter.setTagPatternBitCount(96);
        filter.setBitOffset(32);
        filter.setMemoryBank(MEMORY_BANK.MEMORY_BANK_EPC);
        filter.setFilterAction(FILTER_ACTION.FILTER_ACTION_STATE_AWARE);
        filter.StateAwareAction.setTarget(TARGET.TARGET_SL);
        filter.StateAwareAction.setStateAwareAction(STATE_AWARE_ACTION.STATE_AWARE_ACTION_ASRT_SL);
        filter.setTruncateAction(TRUNCATE_ACTION.TRUNCATE_ACTION_DO_NOT_TRUNCATE);
        preFilterArray[0] = filter;

        PreFilters filters1 = new PreFilters();
        PreFilters.PreFilter filter1 = filters1.new PreFilter();
        filter1.setAntennaID((short) 1);
        filter1.setTagPattern("010000000000000000000296");
        filter1.setTagPatternBitCount(96);
        filter1.setBitOffset(32);
        filter1.setMemoryBank(MEMORY_BANK.MEMORY_BANK_EPC);
        filter1.setFilterAction(FILTER_ACTION.FILTER_ACTION_STATE_AWARE);
        filter1.StateAwareAction.setTarget(TARGET.TARGET_SL);
        filter1.StateAwareAction.setStateAwareAction(STATE_AWARE_ACTION.STATE_AWARE_ACTION_ASRT_SL);
        filter1.setTruncateAction(TRUNCATE_ACTION.TRUNCATE_ACTION_DO_NOT_TRUNCATE);
        preFilterArray[1] = filter1;

        PreFilters filters2 = new PreFilters();
        PreFilters.PreFilter filter2 = filters2.new PreFilter();
        filter2.setAntennaID((short) 1);
        filter2.setTagPattern("101010101010444455556666");
        filter2.setTagPatternBitCount(96);
        filter2.setBitOffset(32);
        filter2.setMemoryBank(MEMORY_BANK.MEMORY_BANK_EPC);
        filter2.setFilterAction(FILTER_ACTION.FILTER_ACTION_STATE_AWARE);
        filter2.StateAwareAction.setTarget(TARGET.TARGET_SL);
        filter2.StateAwareAction.setStateAwareAction(STATE_AWARE_ACTION.STATE_AWARE_ACTION_ASRT_SL);
        filter2.setTruncateAction(TRUNCATE_ACTION.TRUNCATE_ACTION_DO_NOT_TRUNCATE);
        preFilterArray[2] = filter2;

        PreFilters filters3 = new PreFilters();
        PreFilters.PreFilter filter3 = filters3.new PreFilter();
        filter3.setAntennaID((short) 1);
        filter3.setTagPattern("03000000000000000000029A");
        filter3.setTagPatternBitCount(96);
        filter3.setBitOffset(32);
        filter3.setMemoryBank(MEMORY_BANK.MEMORY_BANK_EPC);
        filter3.setFilterAction(FILTER_ACTION.FILTER_ACTION_STATE_AWARE);
        filter3.StateAwareAction.setTarget(TARGET.TARGET_SL);
        filter3.StateAwareAction.setStateAwareAction(STATE_AWARE_ACTION.STATE_AWARE_ACTION_ASRT_SL);
        filter3.setTruncateAction(TRUNCATE_ACTION.TRUNCATE_ACTION_DO_NOT_TRUNCATE);
        preFilterArray[3] = filter3;

        try {
            Log.d("setSingulationControl", "SingulationControl...");
            Antennas.SingulationControl singulationControl = new Antennas.SingulationControl();
            singulationControl.setSession(SESSION.SESSION_S2);
            singulationControl.setTagPopulation((short) 32);
            singulationControl.Action.setSLFlag(SL_FLAG.SL_FLAG_ASSERTED);
            singulationControl.Action.setInventoryState(INVENTORY_STATE.INVENTORY_STATE_AB_FLIP);
            reader.Actions.PreFilters.deleteAll();
            reader.Actions.PreFilters.add(preFilterArray, null);
            reader.Config.setUniqueTagReport(true);
        } catch (InvalidUsageException | OperationFailureException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void dcssdkEventScannerAppeared(DCSScannerInfo dcsScannerInfo) {}
    @Override
    public void dcssdkEventScannerDisappeared(int i) {}
    @Override
    public void dcssdkEventCommunicationSessionEstablished(DCSScannerInfo dcsScannerInfo) {}
    @Override
    public void dcssdkEventCommunicationSessionTerminated(int i) {}
    @Override
    public void dcssdkEventBarcode(byte[] barcodeData, int barcodeType, int fromScannerID) {
        sendEvent("BarcodeData", new String(barcodeData));
    }
    @Override
    public void dcssdkEventImage(byte[] bytes, int i) {}
    @Override
    public void dcssdkEventVideo(byte[] bytes, int i) {}
    @Override
    public void dcssdkEventBinaryData(byte[] bytes, int i) {}
    @Override
    public void dcssdkEventFirmwareUpdate(FirmwareUpdateEvent firmwareUpdateEvent) {}
    @Override
    public void dcssdkEventAuxScannerAppeared(DCSScannerInfo dcsScannerInfo, DCSScannerInfo dcsScannerInfo1) {}



    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (rfidHandlerThread != null) {
            rfidHandlerThread.quitSafely();
        }
    }
}