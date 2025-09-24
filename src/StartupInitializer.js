import JenkinsClient from "./JenkinsClient.js"
import JenkinsJob from './JenkinsJob.js';
import RSSChecker from "./RSSChecker.js";

export default class StartupInitializer {

    constructor(config) {
        this.rssChecker = new RSSChecker(config.rssGlobal.checkIntervalSeconds);
        this.jenkinsClient = new JenkinsClient(
            config.jenkins.username, 
            config.jenkins.password, 
            config.jenkins.host, 
            config.jenkins.port);
        this.createJenkinsJobs(config);
    }

    createJenkinsJobs(config) {
        const jobs = [];

        // iterate config.jenkins properties, this is not an array
        for (const [name, jobConfig] of Object.entries(config.jenkins.jobs)) {
            const job = new JenkinsJob(
                this.jenkinsClient, 
                name,
                jobConfig.jobName,
                jobConfig.parameters);

            if (jobConfig.triggers && jobConfig.triggers.rssFeed) {
                this.rssChecker.registerNewFeedAndListener(
                    jobConfig.triggers.rssFeed,
                    (feed, feedEntry) => job.trigger(feed, feedEntry)
                );
            }

            jobs.push(job);
        }
        return jobs;
    }

    start() {
        this.rssChecker.start();
    }

}