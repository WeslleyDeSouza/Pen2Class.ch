export const environment = {
  production: false,
  apiHost: 'localhost',
  apiPort: 3000,
  get apiUrl() {
    return `http://${this.apiHost}:${this.apiPort}`;
  }
};