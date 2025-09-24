class ReleaseTitleTester {
  constructor() {
    // Adjust the regex as needed for your expectations
    const pattern = "^(Release\\s+[\\d\\.]+(?:\\s+\\w+)?\\s+)LTS$";

    this.regex = new RegExp(pattern, "i");
    this.variations = [
      'Release 2.27.9 LTS',
      'Release 1.0 LTS',
      'Release 10.15.3-beta LTS',
      'Release 3.2.1 RC LTS',
      'Release 99.88.77 alpha LTS',
      'release 2.27.9 lts',
      'RELEASE 2.27.9 LTS',
      'RELEASE 2.5.0-ALPHA lts',
      'RelEaSe 1.2.3 lTs',

      // almost-good but should fail
      'Relese 2.27.9 LTS',          // typo in "Release"
      'Release2.27.9 LTS',          // no space after Release
      'Release 2.27.9LTS',          // no space before LTS
      'Release 2.27.9  LTS',        // double space before LTS (should match!)
      'Release 2.27.9  RC  LTS',    // extra spaces (should match!)
      'release 2.27.9lts',          // no space before LTS
      ' Release 2.27.9 LTS',        // leading space (should fail)
      'Release 2.27.9 LTS ',        // trailing space (should fail)
      'Release 2.27.9 LTF',         // wrong suffix

      // testing more variations
      'Release 123.456.789 LTS',
      'Release 1.2 LTS',
      'Release 0.99.9 pre LTS',
      'release 0.1.0 beta LTS',
      'release 7.3.8 rc LTS',
      'release 12.0.0 LTS',
      'release 2.3.1 RELEASE LTS',

      // outliers: should fail
      'Just a random string',
      'Release version 2.27.9 LTS', // extra word
      'ReLease 12.0.0 ltS1',        // suffix is wrong
      'Release 001.002.003 LTS some extra', // extra words after LTS
      'Release 2.27.9 LTSrc',       // Stuff attached to LTS
    ];
  }

  test() {
    this.variations.forEach(str => {
      const result = this.regex.test(str);
      console.log(`"${str}" => ${result ? "MATCH" : "NO MATCH"}`);
    });
  }
}

const tester = new ReleaseTitleTester();
tester.test();