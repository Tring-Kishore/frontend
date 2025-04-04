import { gql } from '@apollo/client';
export const GET_JOB_ALL_POSTS_QUERY = gql`
    query GetJobPosts {
      allJobPosts{
        id
        job_title
        category
        openings
        experience
        description
        package
        language
        skills
        organization_id
        organization_name
      }
    }`
  ;

  export const GET_JOB_POSTS_QUERY = gql`
  query GetJobPosts($input: GetAllJobPostByOrganizationInput!) {
    jobPosts(input: $input) {
      id
      job_title
      category
      openings
      experience
      description
      package
      language
      skills
      organization_id
    }
  }
`;

export const COUNT_ORGANIZATIONS = gql`
  query CountOrganizations {
    countOrganizations
  }
`;

export const COUNT_USERS = gql`
  query CountUsers {
    countUsers
  }
`;

export const COUNT_JOB_POSTS = gql`
  query CountJobPosts {
    countJobPosts
  }
`;

export const COUNT_USER_APPLICATIONS = gql`
  query CountUserApplications($input: UserIdInput!) {
    countUserApplications(input: $input)
  }
`;

export const COUNT_ORGANIZATION_APPLICATIONS = gql`
  query CountOrganizationApplications($input: OrganizationIdInput!) {
    countOrganizationApplications(input: $input)
  }
`;

export const COUNT_ORGANIZATION_JOB_POSTS = gql`
  query CountOrganizationJobPosts($input: OrganizationIdInput!) {
    countOrganizationJobPosts(input: $input)
  }
`;