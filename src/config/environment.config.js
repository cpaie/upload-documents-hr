// Environment Configuration - Auto-detect local vs production
const isLocalhost = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost');

const isFirebase = window.location.hostname.includes('firebaseapp.com') ||
                   window.location.hostname.includes('web.app') ||
                   process.env.NODE_ENV === 'production';

const isDevelopment = process.env.NODE_ENV === 'development';

export const environment = {
  type: isLocalhost ? 'local' : 'production',
  isLocal: isLocalhost,
  isFirebase: isFirebase,
  isDevelopment: isDevelopment,
  useProxy: isLocalhost,
  useDirect: !isLocalhost,
  hostname: window.location.hostname,
  port: window.location.port,
  fullUrl: window.location.href
};

export const oneDriveConfig = {
  local: {
    useProxy: true,
    proxyUrl: 'http://localhost:3001',
    endpoints: {
      token: 'http://localhost:3001/api/onedrive/token',
      upload: 'http://localhost:3001/api/onedrive/upload',
      createFolder: 'http://localhost:3001/api/onedrive/folder'
    }
  },
  production: {
    useProxy: false,
    directUrl: 'https://graph.microsoft.com/v1.0',
    endpoints: {
      token: 'https://graph.microsoft.com/v1.0/me',
      upload: 'https://graph.microsoft.com/v1.0/me/drive/root:',
      createFolder: 'https://graph.microsoft.com/v1.0/me/drive/root:/children'
    }
  }
};

export const getCurrentOneDriveConfig = () => {
  return environment.useProxy ? oneDriveConfig.local : oneDriveConfig.production;
};

export const logEnvironmentInfo = () => {
  console.log('[Environment] Current environment:', {
    type: environment.type,
    isLocal: environment.isLocal,
    isFirebase: environment.isFirebase,
    useProxy: environment.useProxy,
    useDirect: environment.useDirect,
    hostname: environment.hostname,
    port: environment.port,
    fullUrl: environment.fullUrl
  });
};

export const getOneDriveService = async () => {
  logEnvironmentInfo();
  
  if (environment.useProxy) {
    console.log('[Environment] Using PROXY mode for local development');
    return 'proxy';
  } else {
    console.log('[Environment] Using DIRECT mode for production/Firebase');
    return 'direct';
  }
};

export default environment; 