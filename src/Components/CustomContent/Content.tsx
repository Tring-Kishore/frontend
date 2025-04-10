import React, { useState, useEffect } from "react";
import welcomebar from "../../asserts/images/welcomeBarImg.svg";
import "./Content.scss";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from "@mui/material";
import { GET_JOB_ALL_POSTS_QUERY, GET_JOB_POSTS_QUERY } from "../JobPostPage/JobPostPageAPI/JobPostPageAPI";
import { useQuery } from "@apollo/client";
import { GET_ALL_ORGANIZATIONS } from "../CompanyPage/CompanyPageAPI/CompanyPageAPI";
import { jwtDecode } from "jwt-decode";
import { COUNT_ORGANIZATIONS, COUNT_USERS, COUNT_JOB_POSTS, COUNT_USER_APPLICATIONS, COUNT_ORGANIZATION_APPLICATIONS, COUNT_ORGANIZATION_JOB_POSTS } from "./ContentAPI/ContentAPI";
import Lottie from "lottie-react";
import LottieBuilding from "../../asserts/lottie/building.json";
import Loader from "../Loader/Loader";

type UserRole = "user" | "admin" | "organization";

type CountCard = {
  id: string;
  title: string;
  count: number;
  role: UserRole[];
};

const CountCards: CountCard[] = [
  {
    id: "jobPostForUser",
    title: "Job Post for user",
    count: 0,
    role: ["user"],
  },
  {
    id: "companyCountForAdmin",
    title: "Company Count",
    count: 0,
    role: ["admin"],
  },
  {
    id: "userCountForAdmin",
    title: "User Count",
    count: 0,
    role: ["admin"],
  },
  {
    id: "jobPostForCompany",
    title: "Job Post by company",
    count: 0,
    role: ["organization"],
  },
  {
    id: "jobPostForAdmin",
    title: "Total Job Posted by all company",
    count: 0,
    role: ["admin"],
  },
  {
    id: "jobAppliedCountForUsr",
    title: "My Application",
    count: 0,
    role: ["user"],
  },
  {
    id: "totalAppcationForCompany",
    title: "Total application received",
    count: 0,
    role: ["organization"],
  },
];

interface JobPost {
  id: string;
  job_title: string;
  category: string;
  openings: number;
  experience: number;
  organization_id: string;
  organization_name?: string;
  status?:string
}

interface Company {
  id: string;
  user: {
    name: string;
    email: string;
  };
  website: string;
}

const Content: React.FC = () => {
  const token: any = localStorage.getItem("token");
  const decoded: any = jwtDecode(token);
  const userType: UserRole = decoded.role;
  const userName = decoded.name;
  const organizationId = decoded.userId;
  const userId = decoded.userId;
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [countCards, setCountCards] = useState<CountCard[]>(CountCards);

  
  const { data: countOrganizations, loading: loadingCountOrganizations } = useQuery(COUNT_ORGANIZATIONS, { fetchPolicy: "network-only" });
  const { data: countUsers, loading: loadingCountUsers } = useQuery(COUNT_USERS, { fetchPolicy: "network-only" });
  const { data: countJobPosts, loading: loadingCountJobPosts } = useQuery(COUNT_JOB_POSTS, { fetchPolicy: "network-only" });
  const { data: countUserApplications, loading: loadingCountUserApplications } = useQuery(COUNT_USER_APPLICATIONS, {
    fetchPolicy: "network-only",
    variables: {input:{
      id: userId
    } },
  });
  const { data: countOrganizationApplications, loading: loadingCountOrganizationApplications } = useQuery(COUNT_ORGANIZATION_APPLICATIONS, {
    fetchPolicy: "network-only",
    variables: {input:{
      id: organizationId
    }  },
  });
  const { data: countOrganizationJobPosts, loading: loadingCountOrganizationJobPosts } = useQuery(COUNT_ORGANIZATION_JOB_POSTS, {
    fetchPolicy: "network-only",
    variables: {input:{
      id:organizationId
    }  },
  });

  
  const { data: jobPostData, loading: loadingJobPosts } = useQuery(
    userType === "user" ? GET_JOB_ALL_POSTS_QUERY : GET_JOB_POSTS_QUERY,
    {
      fetchPolicy: "network-only",
      variables: userType === "organization" ? {
        input: {
          id: organizationId
        }
      } : undefined,
      skip: userType === "admin",
    }
  );

  
  const { data: companyData, loading: loadingCompanies } = useQuery(
    GET_ALL_ORGANIZATIONS,
    {
      fetchPolicy: "network-only",
      skip: userType !== "admin",
    }
  );

  useEffect(() => {
    const updatedCountCards = CountCards.map((card) => {
      switch (card.id) {
        case "companyCountForAdmin":
          return { ...card, count: countOrganizations?.countOrganizations || 0 };
        case "userCountForAdmin":
          return { ...card, count: countUsers?.countUsers || 0 };
        case "jobPostForAdmin":
          return { ...card, count: countJobPosts?.countJobPosts || 0 };
        case "jobPostForUser":
          return { ...card, count: countJobPosts?.countJobPosts || 0 };
        case "jobPostForCompany":
          return { ...card, count: countOrganizationJobPosts?.countOrganizationJobPosts || 0 };
        case "jobAppliedCountForUsr":
          return { ...card, count: countUserApplications?.countUserApplications || 0 };
        case "totalAppcationForCompany":
          return { ...card, count: countOrganizationApplications?.countOrganizationApplications || 0 };
        default:
          return card;
      }
    });
    setCountCards(updatedCountCards);
  }, [
    countOrganizations,
    countUsers,
    countJobPosts,
    countUserApplications,
    countOrganizationApplications,
    countOrganizationJobPosts,
  ]);

  
  const jobPosts = (userType === "user" 
    ? jobPostData?.allJobPosts?.filter((post: JobPost) => post.status === "approved") 
    : userType === "organization"
      ? jobPostData?.jobPosts 
      : []) || [];
  const companies = userType === "admin" ? companyData?.getAllOrganizations || [] : [];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const paginatedJobPosts = jobPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedCompanies = companies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (
    loadingCountJobPosts ||
    loadingCountOrganizationApplications ||
    loadingCountOrganizationJobPosts ||
    loadingCountOrganizations ||
    loadingCountUserApplications ||
    loadingCountUsers ||
    loadingJobPosts ||
    loadingCompanies
  ) {
    return <Loader />;
  }

  return (
    <div className="borderContent">
      <div className="welcomeBar">
        <div className="content">
          <div className="staticContent">Welcome to Job Find</div>
          <div className="dynamicContent">{userName}</div>
        </div>
        <div className="imageSection">
          <img src={welcomebar} alt="welcome bar image" />
        </div>
      </div>
      
      <div className="countDivs">
        {countCards
          .filter((card) => card.role.includes(userType))
          .map((card) => (
            <div key={card.id} className={card.id}>
              <h4 className="cardTitle">{card.title}</h4>
              <h1 className="cardCount">{card.count}</h1>
            </div>
          ))}
      </div>
      
      <div className="table">
        {(userType === "organization" || userType === "user") && (
          <h1>Recent Job Posts</h1>
        )}
        {userType === "admin" && <h1>List of Companies</h1>}
        
        {(userType === "organization" || userType === "user") && (
          <>
            {jobPosts.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead className="tableHead">
                    <TableRow>
                      <TableCell align="center" width="10%" className="tableHeaderContent">
                        S.No
                      </TableCell>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Job Title
                      </TableCell>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Category
                      </TableCell>
                      {userType === "user" && (
                        <TableCell align="center" width="20%" className="tableHeaderContent">
                          Company
                        </TableCell>
                      )}
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Openings
                      </TableCell>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Experience
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedJobPosts.map((post: JobPost, index: number) => (
                      <TableRow key={post.id}>
                        <TableCell align="center" className="tableBodyConent">
                          {index + 1 + page * rowsPerPage}
                        </TableCell>
                        <TableCell align="center" className="tableBodyConent">
                          {post.job_title}
                        </TableCell>
                        <TableCell align="center" className="tableBodyConent">
                          {post.category}
                        </TableCell>
                        {userType === "user" && (
                          <TableCell align="center" className="tableBodyConent">
                            {post.organization_name || "N/A"}
                          </TableCell>
                        )}
                        <TableCell align="center" className="tableBodyConent">
                          {post.openings}
                        </TableCell>
                        <TableCell align="center" className="tableBodyConent">
                          {post.experience}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={jobPosts.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            ) : (
              <div className="noDataMessage">No job posts found</div>
            )}
          </>
        )}
        
        {userType === "admin" && (
          <>
            {companies.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead className="tableHead">
                    <TableRow>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        S.no
                      </TableCell>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Company
                      </TableCell>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Email
                      </TableCell>
                      <TableCell align="center" width="20%" className="tableHeaderContent">
                        Website
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCompanies.map((company: Company, index: number) => (
                      <TableRow key={company.id}>
                        <TableCell align="center" className="tableBodyConent">
                          {index + 1 + page * rowsPerPage}
                        </TableCell>
                        <TableCell align="center" className="tableBodyConent">
                          {company.user.name}
                        </TableCell>
                        <TableCell align="center" className="tableBodyConent">
                          {company.user.email}
                        </TableCell>
                        <TableCell align="center" className="tableBodyConent">
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {company.website}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={companies.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            ) : (
              <div className="noDataMessage">No companies found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Content;
