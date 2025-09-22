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
            try {
                const response = await axios.get(feed.url);
                // convert response.data to an object
                const feedEntries = await extractFeedEntries(response.data);
                this.processFeed(feed, feedEntries);
            } catch (error) {
                console.error(`Error fetching feed ${feed.url}:`, error);
            }
        }
    }

    async processFeed(feed, feedEntries) {
        // console.log(feed, feedEntries);
        
        for (const feedEntry of feedEntries) {

            let listnerCalled = false;

            // if this is the first time we see this feed, mark it as seen but do not process entries
            const firstTimeFeed = typeof (await this.db.get(feed.url + '|firstTimeFeed')) === 'undefined';
            if (firstTimeFeed) {
                await this.db.put(feed.url + '|firstTimeFeed', true);
            }

            const id = feedEntry.id;
            const updated = feedEntry.updated;
            // Check if the entry is already in the database
            const feedEntryKey = feed.url + '|' + id;
            const existing = await this.db.get(feedEntryKey);

            if (typeof existing === 'undefined') {
                // If not, add it to the database
                await this.db.put(feedEntryKey, feedEntry);
                console.log(`New entry added to database`, id);

                if (!firstTimeFeed && !listnerCalled) {
                    // Call listener only once per feed check
                    listnerCalled = true;

                    // Process the new entry (e.g., send a notification)
                    if (feed.delaySeconds) {
                        // execute after delay
                        setTimeout(async () => {
                            await feed.listner(feed, feedEntry);
                        }, feed.delaySeconds * 1000);
                        
                    } else {
                        // execute immediately
                        await feed.listner(feed, feedEntry);
                    }
                }
            }
        }
    }

    registerNewFeedAndListener(url, delaySeconds, listener) {
        this.feeds.push({
            url: url,
            delaySeconds: delaySeconds,
            listner: listener
        });
    }

}