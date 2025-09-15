import jenkins from 'jenkins'

export default class JenkinsClient {

    constructor(username, password, host, port) {
        this.jenkinsClient = new jenkins({
            baseUrl: `http://${username}:${password}@${host}:${port}`,
            crumbIssuer: true,
            promisify: true
        });
    }

    async runJob(jobName, parameters) {
        /// build with parameters
        const buildId = await this.jenkinsClient.job.build({ name: jobName, parameters: parameters });
        return buildId;
    }

}