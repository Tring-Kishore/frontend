import { gql } from '@apollo/client';

export const GET_USER_DETAILS_QUERY = gql`
  query GetUserDetails($input: UserIdInput!) {
    user(input: $input) {
      id
      name
      email
      phone
        age
        experience
        skills
        description
        resumeKey
      }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input:$input) {
      id
      name
      email
      phone
        age
        experience
        skills
        description
    }
  }
`;


export const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($input: UploadPdfInput!) {
    generateUploadUrl(input: $input) {
      presignedUrl
      key
      publicUrl
    }
  }
`;


export const GET_DOWNLOAD_RESUME_URL = gql`
  query GenerateDownloadUrl($input: DownloadPdfInput!) {
    generateDownloadUrl(input: $input) {
      downloadUrl
      expiresAt
    }
  }
`;

// Delete Resume Mutation (keep this the same or update if needed)
export const DELETE_RESUME_MUTATION = gql`
  mutation DeleteResume($input: UserIdInput!) {
    deleteResume(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_USER_RESUME_MUTATION = gql`
  mutation UpdateUserResume($input: UploadResumeInput!) {
    uploadResume(input: $input) {
      id
      resumeKey
    }
  }
`;




