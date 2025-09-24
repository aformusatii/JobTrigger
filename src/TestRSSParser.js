import axios from 'axios'
import { extractFeedEntries } from './RSSParser.js'

const test = async function(url, filter) {
    const response = await axios.get(url);
    // convert response.data to an object
    const feedEntries = await extractFeedEntries(response.data, filter);
    console.log('feedEntries:', feedEntries.map(item => item.title));
}

test('https://github.com/portainer/portainer/releases.atom', {titlePattern: "^(Release\\s+[\\d\\.]+(?:\\s+\\w+)?\\s+)LTS$"});
//test('https://github.com/portainer/portainer/releases.atom');