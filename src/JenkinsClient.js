import jenkins from 'jenkins'

export default class JenkinsClient {

    constructor(config) {
        this.config = config;

        this.jenkinsClient = new jenkins({
            baseUrl: `http://${config.username}:${config.password}@${config.host}:${config.port}`,
            crumbIssuer: true,
            promisify: true
        });
    }

    async runJob(jobName) {
        const buildId = await this.jenkinsClient.job.build(jobName);
        return buildId;
    }

}