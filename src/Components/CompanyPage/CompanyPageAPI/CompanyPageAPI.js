import { gql } from '@apollo/client';


export const GET_ALL_ORGANIZATIONS = gql`
  query GetAllOrganizations {
    getAllOrganizations {
      id
      website
      description
      status
      location
      created_at
      updated_at
      deleted_at
      organization_id
      update_password_state
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;




export const UPDATE_ORGANIZATION_STATUS = gql`
  mutation UpdateOrganizationStatus($input: UpdateOrganizationStatusInput!) {
    updateOrganizationStatus(input: $input) {
      id
      status
    }
  }
`;

export const DELETE_ONE_ORGANIZATION = gql`
  mutation DeleteOrganization($input: DeleteOrganizationInput!) {
    deleteOrganization(input: $input) {
      id
    }
  }
`
