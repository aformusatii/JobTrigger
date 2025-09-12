import RSSChecker from "./RSSChecker.js"
import JenkinsClient from "./JenkinsClient.js"
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

const rssChecker = new RSSChecker(config.rss);
rssChecker.start();

const jenkinsClient = new JenkinsClient(config.jenkins);

rssChecker.on('newFeed', async (feed, feedEntry) => {
    console.log('New feed entry detected:', feed, feedEntry);
    
    if (feed.jenkinsJobName) {
        try {
            const buildId = await jenkinsClient.runJob(feed.jenkinsJobName);
            console.log(`Triggered Jenkins job ${feed.jenkinsJobName} with build ID: ${buildId}`);
        } catch (error) {
            console.error(`Error triggering Jenkins job ${feed.jenkinsJobName}:`, error);
        }
    }
});
