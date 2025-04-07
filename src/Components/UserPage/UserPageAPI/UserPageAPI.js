import { gql } from "@apollo/client"
export const GET_ALL_USERS = gql`
    query GetUsers{
        users{
            id
            name
            email
            phone
        }
    }
`;
export const DELETE_ONE_USER = gql`
    mutation DeleteUser($id:ID!)
    {
        deleteUser(id:$id)
        {
            id
            name
        }
    }
`
