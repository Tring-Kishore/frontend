import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import toast from 'react-hot-toast';
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});
const errorLink = onError(({ graphQLErrors }) => {
  
  
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message.includes('jwt expired') || err.message.includes('User not found')) {
        logout();
        return;
      }
    }
  }
});
const logout = () => {
    
    toast.error('Login Expired');
    window.location.href = '/signin';
    localStorage.removeItem('token');
};
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;