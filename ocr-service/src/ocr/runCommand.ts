import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const COMMAND_TIMEOUT_MS = 120_000;
export async function runCommand(command: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout;
  } catch (err) {
    const error = err as NodeJS.ErrnoException & { stderr?: string };

    if (error.code === 'ENOENT') {
      throw new Error(`Command not found: ${command}. Is it installed?`);
    }

    const details = error.stderr?.trim() || error.message;
    throw new Error(`${command} failed: ${details}`);
  }
}