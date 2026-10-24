// Standard Jest setup for React Native & native libraries

const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    SafeAreaInsetsContext: React.createContext(inset),
    SafeAreaFrameContext: React.createContext(frame),
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => false),
    Screen: ({ children, ...props }: any) => React.createElement(View, props, children),
    ScreenContainer: ({ children, ...props }: any) => React.createElement(View, props, children),
    NativeScreen: ({ children, ...props }: any) => React.createElement(View, props, children),
    NativeScreenContainer: ({ children, ...props }: any) => React.createElement(View, props, children),
    ScreenStack: ({ children, ...props }: any) => React.createElement(View, props, children),
    ScreenStackHeaderConfig: ({ children, ...props }: any) => React.createElement(View, props, children),
    ScreenStackHeaderSubview: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    createNativeStackNavigator: () => {
      const Navigator = ({ children }: any) => React.createElement(View, null, children);
      const Screen = ({ component: Component, children }: any) =>
        Component ? React.createElement(Component, null) : children || null;
      return { Navigator, Screen };
    },
  };
});

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    focusManager: {
      setFocused: jest.fn(),
    },
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name, size, color, ...props }: any) =>
    React.createElement(Text, { ...props, style: [{ fontSize: size, color }, props.style] }, name);
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name, size, color, ...props }: any) =>
    React.createElement(Text, { ...props, style: [{ fontSize: size, color }, props.style] }, name);
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name, size, color, ...props }: any) =>
    React.createElement(Text, { ...props, style: [{ fontSize: size, color }, props.style] }, name);
});
