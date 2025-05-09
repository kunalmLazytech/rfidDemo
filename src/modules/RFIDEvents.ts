import {NativeModules, NativeEventEmitter} from 'react-native';

const {RFIDControllerModule} = NativeModules;
const eventEmitter = new NativeEventEmitter(RFIDControllerModule);

const TAG_DATA_EVENT = 'TagData';
const TRIGGER_EVENT = 'TriggerEvent';
const BLUETOOTH_STATE_EVENT = 'BluetoothStateChanged';
const READER_APPEARED_EVENT = 'ReaderAppeared';
const READER_DISAPPEARED_EVENT = 'ReaderDisappeared';

const listeners = {
  tagListener: null as any,
  triggerListener: null as any,
  readerAppearedListener: null as any,
  readerDisappearedListener: null as any,
};

export const RFIDEvents = {
  addBluetoothStateListener: (callback: (state: string) => void) => {
    return eventEmitter.addListener(BLUETOOTH_STATE_EVENT, callback);
  },

  addReaderAppearedListener: (callback: (deviceName: string) => void) => {
    listeners.readerAppearedListener = eventEmitter.addListener(
      READER_APPEARED_EVENT,
      callback,
    );
  },

  addReaderDisappearedListener: (callback: (deviceName: string) => void) => {
    listeners.readerDisappearedListener = eventEmitter.addListener(
      READER_DISAPPEARED_EVENT,
      callback,
    );
  },

  removeListener: (subscription: any) => {
    subscription?.remove?.();
  },

  registerTagDataListener: (onTagReceived: (tag: any) => void) => {
    listeners.tagListener = eventEmitter.addListener(TAG_DATA_EVENT, event => {
      if (event && Array.isArray(event.tags) && event.tags.length > 0) {
        const latestTag = event.tags[0];
        onTagReceived(latestTag);
      } else {
        console.warn('Invalid tag event received:', event);
      }
    });
  },

  registerMultiTagDataListener: (onTagReceived: (tag: any) => void) => {
    listeners.tagListener = eventEmitter.addListener(TAG_DATA_EVENT, event => {
      if (event && Array.isArray(event.tags) && event.tags.length > 0) {
        onTagReceived(event.tags);
      } else {
        console.warn('Invalid tag event received:', event);
      }
    });
  },

  registerTriggerListener: (onTrigger: (pressed: boolean) => void) => {
    listeners.triggerListener = eventEmitter.addListener(
      TRIGGER_EVENT,
      pressed => {
        onTrigger(pressed);
      },
    );
  },

  removeRFIDListeners: () => {
    listeners.tagListener?.remove?.();
    listeners.triggerListener?.remove?.();
    listeners.readerAppearedListener?.remove?.();
    listeners.readerDisappearedListener?.remove?.();

    listeners.tagListener = null;
    listeners.triggerListener = null;
    listeners.readerAppearedListener = null;
    listeners.readerDisappearedListener = null;
  },
};
