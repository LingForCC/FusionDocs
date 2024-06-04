import {
  contextBridge,
  ipcRenderer,
} from 'electron';

import { AI } from './ai';

const aiProvider: AI = {
    instruct: async (instruction: string): Promise<string> => {
        return await ipcRenderer.invoke('instruct', instruction);
    }
};

contextBridge.exposeInMainWorld("aiProvider", aiProvider);

declare global {
    interface Window {
        aiProvider: AI;
    }
}
