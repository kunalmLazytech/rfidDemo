import React from 'react';
import { Provider as AntProvider } from '@ant-design/react-native';
import FlashMessage from 'react-native-flash-message';
import AppContent from './src/navigation/AppContent';
import { Providers } from './src/providers';

const App: React.FC = () => (
  <Providers>
    <AntProvider>
      <AppContent />
      <FlashMessage position="top" />
    </AntProvider>
  </Providers>
);

export default App;
