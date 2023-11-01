import { getOctokit } from '../octokit';
import { getOrganizations } from '../enterprise-queries';

const {program} = require('commander');
program.name('enterprise-organizations');
program.version(require('../../package.json').version);

program.requiredOption('-t, --token <token>', 'GitHub access token');
program.requiredOption('-e, --enterprise <enterpriseSlug>', 'GitHub Enterprise slug');
program.option('-x, --proxy', 'optional proxy URI');
program.option('--proxy-pass <proxyPassword>', 'optional proxy password');
program.option('--proxy-user <proxyUser>', 'optional proxy username');
program.option('-o --output-file <outputFile>', 'output data to a file');
program.option('--pretty-print', 'pretty print JSON output to console');

program.parse(process.argv);
const opts = program.opts();

const octokit = getOctokit(opts.token, opts.proxy, opts.proxyUser, opts.proxyPass);

async function execute(octokit) {
  try {
    const allOrgs = await getOrganizations(octokit, opts.enterprise);

    if (opts.prettyPrint) {
      console.log(JSON.stringify(allOrgs, null, 2));
    } else {
      console.log(`All organizations for ${opts.enterprise}:`);

      if (opts.outputFile) {
        const fs = require('fs');
        const path = require('path');

        const resolvedFile = path.resolve(opts.outputFile);
        fs.writeFileSync(resolvedFile, JSON.stringify(allOrgs, null, 2));
        console.log(`results written to file '${resolvedFile}'`);
      } else {
        console.log(JSON.stringify(allOrgs));
      }
    }
  } catch (err: any) {
    console.log(err.stack);
    console.error(err.message);
    console.error();
    program.help({error: true});
  }
}

execute(octokit);