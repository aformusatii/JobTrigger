import { Level } from 'level'

const db = new Level('db_feeds', { valueEncoding: 'json' })

for await (const [key, value] of db.iterator()) {
  console.log(key, value) // 2
}

const id = 'https://github.com/aformusatii/docker-media-dl/releases.atom|tag:github.com,2008:Repository/882836714/0.0.30';
db.del(id);