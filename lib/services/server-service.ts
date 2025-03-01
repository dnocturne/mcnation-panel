/**
 * Service for interacting with the Minecraft server API
 * 
 * This service provides functions for executing commands on the Minecraft server
 * and is used by the Stripe webhook handler to grant purchases to players
 */

interface ServerConfig {
  host: string;
  port: string;
  apiKey: string;
}

interface CommandResponse {
  success: boolean;
  message: string;
}

/**
 * Get the server configuration from the database
 * @returns The server configuration or null if not found
 */
export async function getServerConfig(): Promise<ServerConfig | null> {
  try {
    const response = await fetch('/api/server/config');
    if (!response.ok) {
      console.error('Failed to fetch server config:', response.statusText);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching server config:', error);
    return null;
  }
}

/**
 * Execute a command on the Minecraft server
 * @param command The command to execute
 * @returns Response from the server API
 */
export async function executeServerCommand(command: string): Promise<CommandResponse> {
  const config = await getServerConfig();
  
  if (!config) {
    throw new Error('Server configuration not found');
  }

  const host = config.host === "0.0.0.0" ? "localhost" : config.host;
  
  try {
    const response = await fetch(`http://${host}:${config.port}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      },
      body: JSON.stringify({ command })
    });
  
    if (!response.ok) {
      throw new Error(`Failed to execute command: ${response.statusText}`);
    }
  
    return await response.json();
  } catch (error) {
    console.error('Error executing server command:', error);
    throw error;
  }
}

/**
 * Grant a package to a Minecraft player
 * @param username The Minecraft username
 * @param packageName The name of the package to grant
 * @returns Response from the server
 */
export async function grantPackageToPlayer(username: string, packageName: string): Promise<CommandResponse> {
  // Sanitize inputs to prevent command injection
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9_]/g, '');
  const sanitizedPackage = packageName.replace(/[^a-zA-Z0-9_ ]/g, '');
  
  // Command to grant the package to the player
  // Adjust this command to match your server's plugin syntax
  const command = `givepermission ${sanitizedUsername} store.package.${sanitizedPackage.toLowerCase().replace(/ /g, '_')}`;
  
  return executeServerCommand(command);
} 