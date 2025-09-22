export const environment = {
  production: true,
  apiHost: 'app.pen2class.ch',
  apiPort: 443,
  apiPeerPath: '/peer-server',
  get apiUrl() {
    return `https://${this.apiHost}`;
  }
};
