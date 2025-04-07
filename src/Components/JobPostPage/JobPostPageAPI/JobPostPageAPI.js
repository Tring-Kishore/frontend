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
        status
      }
    }`
  ;

  

// export const GET_JOB_POSTS_QUERY = gql`
//   query GetJobPosts($organization_id: ID) {
//     jobPosts(organization_id: $organization_id) {
//       id
//       job_title
//       category
//       openings
//       experience
//       description
//       package
//       language
//       skills
//       organization_id
//     }
//   }
// `;

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
      status
    }
  }
`;



export const ADD_JOB_POST_MUTATION = gql`
  mutation AddJobPost($input: AddJobPostInput!) {
    addJobPost(input: $input) {
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

export const UPDATE_JOB_POST_MUTATION = gql`
  mutation UpdateJobPost($input: UpdateJobPostInput!) {
    updateJobPost(input: $input) {
      id
      job_title
      category
      openings
      experience
      description
      package
      language
      skills
    }
  }
`;

export const APPLY_FOR_JOB_MUTATION = gql`
  mutation ApplyForJob($input: JobApplyInput!) {
    applyForJob(input: $input) {
      id
      jobpost_id
      user_id
      organization_id
      status
    }
  }
`;

export const GET_ADMIN_JOB_POSTS_QUERY = gql`
  query GetAdminJobPosts($status: String) {
    adminJobPosts(status: $status) {
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
  }
`;

export const UPDATE_JOB_POST_STATUS_MUTATION = gql`
  mutation UpdateJobPostStatus($input: UpdateJobPostStatusInput!) {
    updateJobPostStatus(input: $input) {
      id
      status
    }
  }
`;
