import { gql } from "@apollo/client";

export const GET_ALL_APPLICATIONS = gql`
  query jobApplied($input: GetJobAppliedApplicationsInput!) {
    jobApplied(input: $input) {
      id
      jobpost_id
      organization_id
      user_id
      status
      name
      email
      job_title
      category
      company
      openings
      skills
      resumeKey
    }
  }
`;

export const GET_ALL_USER_APPLICATIONS = gql`
  query getUserJobApplied($input: JobAppliedByUserInput!) {
    getUserJobApplied(input: $input) {
      id
      jobpost_id
      organization_id
      user_id
      status
      name
      email
      job_title
      category
      company
      openings
      skills
    }
  }
`;

export const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($input: UpdatJobAppliedStatusInput!) {
    updateApplicationStatus(input: $input) {
      id
      status
    }
  }
`;

export const WITHDRAW_APPLICATION = gql`
  mutation withdrawApplication($input: WithdrawApplicationInput!)
  {
    withdrawApplication(input:$input)
    {
      id
    }
  }
`
