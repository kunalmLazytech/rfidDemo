import React, { createContext, useState, useContext } from 'react';
interface DeviceInfo {
    deviceName: string;
    deviceID: string;
    [key: string]: any;
}

interface DeviceInfoContextType {
    deviceInfo: DeviceInfo | null;
    setDeviceInfo: (deviceInfo: DeviceInfo | null) => void;
}

const DeviceInfoContext = createContext<DeviceInfoContextType | undefined>(undefined);

export const DeviceInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

    return (
        <DeviceInfoContext.Provider value={{ deviceInfo, setDeviceInfo }}>
            {children}
        </DeviceInfoContext.Provider>
    );
};

export const useDeviceInfo = (): DeviceInfoContextType => {
    const context = useContext(DeviceInfoContext);
    if (!context) {
        throw new Error('useDeviceInfo must be used within DeviceInfoProvider');
    }
    return context;
};
