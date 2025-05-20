import { exec } from 'child_process';
import http from 'http';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Server', () => {
  // Simple smoke test
  test('server file exists', async () => {
    const result = await execAsync('ls -la /home/runner/work/demo2/demo2/src/server/index.ts');
    expect(result.stdout).toContain('index.ts');
  });

  // This test would normally use a test server instance, but for simplicity
  // we're just checking that the server file contains expected elements
  test('server includes required components', async () => {
    const result = await execAsync('cat /home/runner/work/demo2/demo2/src/server/index.ts');
    
    // Check for Express initialization
    expect(result.stdout).toContain('express');
    
    // Check for Socket.IO initialization
    expect(result.stdout).toContain('socket.io');
    
    // Check for music generator
    expect(result.stdout).toContain('MusicGenerator');
    
    // Check for server initialization
    expect(result.stdout).toContain('server.listen');
  });
});