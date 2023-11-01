export async function getOrganizationAdmins(octokit: any, name: string) {
  //@ts-ignore
  const users = await octokit.paginate('GET /orgs/{org}/members', {
    org: name,
    role: 'admin',
    per_page: 100
  });

  return users.map((user) => { return user.login });
}

export async function getOrganizations(octokit: any, enterpriseSlug: string) {
  const results = await octokit.graphql.paginate(
    `
      query($enterpriseSlug: String!, $cursor: String) {
        enterprise(slug: $enterpriseSlug) {
          name

          organizations(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }

            nodes {
              login
              name
            }
          }
        }
      }
    `,
    {
      enterpriseSlug: enterpriseSlug,
      cursor: undefined
    }
  );

  const allOrgs = results.enterprise.organizations.nodes.map((data) => {
    return {
      org: data.login,
      name: data.name
    }
  });

  return {
    enterprise: results.enterprise.name,
    organiations: allOrgs
  }
}