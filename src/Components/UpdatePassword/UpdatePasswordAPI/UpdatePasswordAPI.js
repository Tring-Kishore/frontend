import { gql } from '@apollo/client';


export const UPDATE_ORGANIZATION_PASSWORD = gql`
  mutation UpdateOrganizationPassword($input: UpdateOrganizationPasswordInput!) {
    updateOrganizationPassword(input: $input) {
      update_password_state
    }
  }
`;