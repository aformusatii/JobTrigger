
export default class JenkinsJob {
    constructor(jenkinsClient, name, jobName, parameters) {
        this.jenkinsClient = jenkinsClient;
        this.name = name;
        this.jobName = jobName;
        this.parameters = parameters;
        console.log(this.name, `Created Jenkins job for ${this.jobName} with parameters:`, this.parameters);
    }

    async trigger(feed, feedEntry) {
        try {
            const parameters = {
                ...this.parameters,
                FEED_VERSION: this.buildFeedVersion(feed, feedEntry),
                FEED_CONTENT: feedEntry.content
            }
            const buildId = await this.jenkinsClient.runJob(this.jobName, parameters);
            console.log(this.name, `Triggered Jenkins job ${this.jobName} with build ID: ${buildId}`, feed, feedEntry);
        } catch (error) {
            console.error(this.name, `Error triggering Jenkins job ${this.jobName}:`, error);
        }
    }

    buildFeedVersion(feed, feedEntry) {
        return `Title: ${feedEntry.title} Updated: ${feedEntry.updated}`;
    }
}