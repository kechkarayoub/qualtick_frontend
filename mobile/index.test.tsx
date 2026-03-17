const mockRegisterComponent = jest.fn();

jest.mock('react-native', () => ({
  AppRegistry: {
    registerComponent: mockRegisterComponent,
  },
}));

function MockApp() {
  return null;
}

jest.mock('./App', () => ({
  __esModule: true,
  default: MockApp,
}));

describe('index.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('registers app component with app name', () => {
    const { name } = require('./app.json');

    jest.isolateModules(() => {
      require('./index');
    });

    expect(mockRegisterComponent).toHaveBeenCalledTimes(1);
    expect(mockRegisterComponent).toHaveBeenCalledWith(name, expect.any(Function));
  });

  it('registers a factory that returns App component', () => {
    jest.isolateModules(() => {
      require('./index');
    });

    const [, appFactory] = mockRegisterComponent.mock.calls[0];
    expect(appFactory()).toBe(MockApp);
  });
});
