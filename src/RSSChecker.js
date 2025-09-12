import axios from 'axios'
import { Level } from 'level'
import { extractFeedEntries } from './RSSParser.js'

export default class RSSChecker {

    constructor(config) {
        this.config = config
        this.db = new Level('feeds', { valueEncoding: 'json' })
        this.listeners = {};
    }

    start() {
        setInterval(this.checkFeeds.bind(this), this.config.checkIntervalSeconds * 1000);
        this.checkFeeds();
    }

    async checkFeeds() {
        for (const feed of this.config.feeds) {
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

                if (!firstTimeFeed) {
                    // Process the new entry (e.g., send a notification)
                    const newFeedListners = this.listeners['newFeed'] || [];
                    for (const listener of newFeedListners) {
                        await listener(feed, feedEntry);
                    }
                }
            }
        }
    }

    async on(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(listener);
    }

}