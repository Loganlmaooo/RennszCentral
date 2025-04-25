export async function notifyCrash(error: Error): Promise<boolean> {
  return discordLog(
    'System Crash',
    `Error: ${error.message}\nStack: ${error.stack}`,
    'crash'
  );
}

export async function discordLog(
  action: string, 
  details: string, 
  category: string
): Promise<boolean> {
  try {
    // In a real-world scenario, you'd make a direct API call to the Discord webhook
    // However, for security reasons, we're logging through the server-side
    // The server will handle the actual webhook sending
    
    // Instead, we'll create a log through our server API
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        details,
        category
      }),
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    console.error("Discord log error:", error);
    return false;
  }
}
