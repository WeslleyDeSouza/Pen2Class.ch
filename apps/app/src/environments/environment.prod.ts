export const environment = {
  production: true,
  apiHost: 'localhost',
  apiPort: 3000,
  get apiUrl() {
    return `http://${this.apiHost}:${this.apiPort}`;
  }
};