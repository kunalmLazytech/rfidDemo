export type RootStackParamList = {
    AreaScreen: { preloadedAreas?: Area[] };
    LocationScreen: {
      selectedZoneArea: string;
      selectedZoneName: string;
      preloadedLocations: null;
    };
    CycleCount: {
      selectedZoneLocation: string;
      selectedZoneAName: string;
      selectedZoneLName: string;
    };
  };
  
  export interface Area {
    zoneId: string;
    name: string;
  }
  