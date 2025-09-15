import StartupInitializer from './StartupInitializer.js'
import YAML from 'yaml'
import fs from 'fs'

let config;
try {
    const fileContents = fs.readFileSync('configuration.yaml', 'utf8');
    config = YAML.parse(fileContents);
} catch (e) {
    console.error('Error loading configuration:', e);
    process.exit(1);
}

const startupInitializer = new StartupInitializer(config);
startupInitializer.start();
