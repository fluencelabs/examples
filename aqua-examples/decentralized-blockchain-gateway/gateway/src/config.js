import fs from 'fs';

export function readConfig(path) {
    const rawdata = fs.readFileSync(path);
    return JSON.parse(rawdata);
}
