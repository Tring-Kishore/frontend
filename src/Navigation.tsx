import SignIn from './Pages/Auth/SignIn/SignIn';
import SignUp from './Pages/Auth/SignUp/SignUp';
import Dashboard from './Pages/Dashboard/Dashboard';
import JobPostPage from './Components/JobPostPage/JobPostPage';
import CompanyPage from './Components/CompanyPage/CompanyPage';
import ApplicationsPage from './Components/ApplicationsPage/ApllicationsPage';
import UserPage from './Components/UserPage/UserPage';
import Content from './Components/CustomContent/Content';

// Public Routes (Accessible without authentication)
export const publicRoutes = [
  { path: "/signin", component: SignIn },
  { path: "/signup", component: SignUp },
];

// Private Routes (Require authentication)
export const privateRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/dashboard/jobposts", component: JobPostPage },
  { path: "/dashboard/companies", component: CompanyPage },
  { path: "/dashboard/applications", component: ApplicationsPage },
  { path: "/dashboard/users", component: UserPage },
  { path: "/dashboard/content", component: Content },
];