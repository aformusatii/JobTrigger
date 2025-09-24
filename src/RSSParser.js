import xml2js from 'xml2js'

const xmlParser = new xml2js.Parser()

const extractFeedEntries = async function (xmlData, filter) {
  /*
            <?xml version="1.0" encoding="UTF-8"?>
            <feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xml:lang="en-US">
            <id>tag:github.com,2008:https://github.com/aformusatii/docker-media-dl/releases</id>
            <link type="text/html" rel="alternate" href="https://github.com/aformusatii/docker-media-dl/releases"/>
            <link type="application/atom+xml" rel="self" href="https://github.com/aformusatii/docker-media-dl/releases.atom"/>
            <title>Release notes from docker-media-dl</title>
            <updated>2024-11-15T22:15:53Z</updated>
            <entry>
                <id>tag:github.com,2008:Repository/882836714/0.0.29</id>
                <updated>2025-08-28T00:39:23Z</updated>
                <link rel="alternate" type="text/html" href="https://github.com/aformusatii/docker-media-dl/releases/tag/0.0.29"/>
                <title>0.0.29</title>
                <content type="html">&lt;p&gt;Image is uploaded to &lt;a href=&quot;https://gallery.ecr.aws/f3w7h7x2/media_dl&quot; rel=&quot;nofollow&quot;&gt;public repo&lt;/a&gt; on AWS ECR.&lt;/p&gt;</content>
                <author>
                <name>github-actions[bot]</name>
                </author>
                <media:thumbnail height="30" width="30" url="https://avatars.githubusercontent.com/in/15368?s=60&amp;v=4"/>
            </entry>
            <entry>
                <id>tag:github.com,2008:Repository/882836714/0.0.28</id>
                <updated>2025-08-23T00:39:29Z</updated>
                <link rel="alternate" type="text/html" href="https://github.com/aformusatii/docker-media-dl/releases/tag/0.0.28"/>
                <title>0.0.28</title>
                <content type="html">&lt;p&gt;Image is uploaded to &lt;a href=&quot;https://gallery.ecr.aws/f3w7h7x2/media_dl&quot; rel=&quot;nofollow&quot;&gt;public repo&lt;/a&gt; on AWS ECR.&lt;/p&gt;</content>
                <author>
                <name>github-actions[bot]</name>
                </author>
                <media:thumbnail height="30" width="30" url="https://avatars.githubusercontent.com/in/15368?s=60&amp;v=4"/>
            </entry>

            {
                id: [ 'tag:github.com,2008:Repository/882836714/0.0.20' ],
                updated: [ '2025-04-30T23:39:17Z' ],
                link: [ [Object] ],
                title: [ '0.0.20' ],
                content: [ [Object] ],
                author: [ [Object] ],
                'media:thumbnail': [ [Object] ]
            }
        */
  const feedDataRaw = await xmlParser.parseStringPromise(xmlData);

  const feeds = [];

  for (const entry of feedDataRaw.feed.entry) {

    if (filter) {
      if (filter.titlePattern) {
        //console.log('filter.titlePattern', filter.titlePattern);
        const regex = new RegExp(filter.titlePattern.trim(), "i");
        if (!regex.test(entry.title[0])) {
          // title does not match pattern, skip this entry
          continue;
        }
      }
    }

    feeds.push({
      id: entry.id[0],
      updated: entry.updated[0],
      updatedDate: new Date(entry.updated[0]),
      title: entry.title[0],
      content: entry.content[0]._,
      author: entry.author[0].name[0],
    });
  }

  // order descending by updatedDate
  feeds.sort((a, b) => b.updatedDate - a.updatedDate);

  return feeds;
};

// export the function
export { extractFeedEntries };