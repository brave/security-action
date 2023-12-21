const Severity = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
}

export default async function dependabotDismiss({
    org,
    minlevel = Severity.low,
    debug = false,
    hotwords = [' dos ', 'denial of service', 'redos', 'denial-of-service', 'memory explosion'],
    githubToken = null,
    github = null,
    actor = 'security-action',
}) {
    let watermark = "The following alerts were dismissed because they contained hotwords:\n\n";
    let message = '';

    if (!github && githubToken) {
        const { Octokit } = await import("octokit");

        github = new Octokit({ auth: githubToken })
    }

    if (!github && !githubToken) {
        throw new Error('either githubToken or github is required!');
    }

    debug = debug === 'true' || debug === true;
    
    if (typeof severity === 'string') {
        severity = Severity[severity];
    }

    const alerts = Array.from(await github.paginate('GET /orgs/{org}/dependabot/alerts', {
        org: org,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        },
        sort: 'updated',
        state: 'open',
        severity: Object.keys(Severity).filter(s => Severity[s] >= minlevel)
    })).filter(a => hotwords.some(h => a.security_advisory.summary.toLowerCase().includes(h)));

    for (const a of alerts) {
        // get the first hotword that matches the summary
        const hotword = hotwords.find(h => a.security_advisory.summary.toLowerCase().includes(h)).trim();
        
        message += `- [${a.security_advisory.summary} in \`${org}/${a.repository.name}\`](${a.html_url})\n`

        if (debug) {
            console.log(`Dismissing alert ${a.number} in ${a.repository.name} because it contains the hotword "${hotword}"`);
            console.log(`Summary: ${a.security_advisory.summary}`);
            continue;
        }

        await github.request('PATCH /repos/{org}/{repo}/dependabot/alerts/{alert_number}', {
            org: org,
            repo: a.repository.name,
            alert_number: a.number,
            dismissed_reason: 'tolerable_risk',
            dismissed_comment: `Dismissed by ${actor} because the alert summary contains the hotword "${hotword}"`,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
            state: 'dismissed',
        });
    }

    if (message.length > 0) {
        return watermark + message;
    }
}