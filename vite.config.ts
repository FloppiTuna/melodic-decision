import { attachWebSocket } from '$lib/server/remote_management/ws';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const webSocketDev = {
  name: 'broadcast-management-dev',
  configureServer(server: any) {
    if (server.httpServer) {
      attachWebSocket(server.httpServer);
    }
  }
};

export default defineConfig({
	plugins: [sveltekit(), webSocketDev],
	server: {
		allowedHosts: ["melodic"]
	}
});
