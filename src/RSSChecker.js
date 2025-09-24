import axios from 'axios'
import { Level } from 'level'
import { extractFeedEntries } from './RSSParser.js'

export default class RSSChecker {

    constructor(checkIntervalSeconds) {
        this.checkIntervalSeconds = checkIntervalSeconds;
        this.db = new Level('db_feeds', { valueEncoding: 'json' })
        this.feeds = [];
    }

    start() {
        console.log(`Starting RSS Checker with interval ${this.checkIntervalSeconds} seconds`);
        setInterval(this.checkFeeds.bind(this), this.checkIntervalSeconds * 1000);
        this.checkFeeds();
    }

    async checkFeeds() {
        for (const feed of this.feeds) {
            const feedConfig = feed.config;
            
            try {
                const response = await axios.get(feedConfig.url);
                // convert response.data to an object
                const feedEntries = await extractFeedEntries(response.data);
                this.processFeed(feed, feedEntries);
            } catch (error) {
                console.error(`Error fetching feed ${feedConfig.url}:`, error);
            }
        }
    }

    async processFeed(feed, feedEntries) {
        // console.log(feed, feedEntries);
        const feedConfig = feed.config;
        let listnerCalled = false;

        // if this is the first time we see this feed, mark it as seen but do not process entries
        const feedKey = feedConfig.url + (feedConfig.version ? ('|' + feedConfig.version) : '') + '|feed';
        const firstTimeFeed = typeof (await this.db.get(feedKey)) === 'undefined';
        if (firstTimeFeed) {
            await this.db.put(feedKey, true);
        }

        for (const feedEntry of feedEntries) {
            // Check if the entry is already in the database
            const id = feedEntry.id;
            const feedEntryKey = feedKey + '|' + id;
            const existing = await this.db.get(feedEntryKey);

            if (typeof existing === 'undefined') {
                // If not, add it to the database
                await this.db.put(feedEntryKey, feedEntry);
                console.log(`New entry added to database`, feedEntryKey);

                // prevent multiple calls to listener for multiple new entries in one feed check
                if (!firstTimeFeed && !listnerCalled) {
                    // Call listener only once per feed check
                    listnerCalled = true;

                    // Process the new entry (e.g., send a notification)
                    if (feedConfig.delaySeconds) {
                        // execute after delay
                        setTimeout(async () => {
                            await feed.listener(feed, feedEntry);
                        }, feedParams.delaySeconds * 1000);
                        
                    } else {
                        // execute immediately
                        await feed.listener(feed, feedEntry);
                    }
                }
            }
        }
    }

    registerNewFeedAndListener(feedConfig, listener) {
        this.feeds.push({
            config: feedConfig,
            listener: listener
        });
    }

}