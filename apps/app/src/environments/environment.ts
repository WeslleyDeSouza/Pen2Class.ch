export const environment = {
  production: false,
  apiHost: 'localhost',
  apiPort: 3000,
  apiPeerPath: '/peer-server',
  get apiUrl() {
    return `http://${this.apiHost}:${this.apiPort}`;
  }
};
