import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [totalusers, setTotalUsers] = useState(0);
  const [totalposts, setTotalPosts] = useState(0);
  const [totalreports, setTotalReports] = useState(0);
  const [userReported, setUserReported] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  //here just get the totoal users , totoal post  . ar bakita use korsi na . 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5700/api/admin/total-users"
        );
        setTotalUsers(response.data.totalUsers);
        setTotalPosts(response.data.totalPosts);
        setTotalReports(response.data.totalReports);
        console.log(response.data.totalUsers);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  //get the fusers full info  .
  useEffect(() => {
    axios.get("http://localhost:5700/api/admin/users-data")
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
  }, []);

  //too see teh posts and the poster name
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5700/api/admin/posts"
        );

        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user and all of their posts?")) {
      try {
        await axios.delete(`http://localhost:5700/api/admin/users/${userId}`);
        const deletedUser = users.find((user) => user._id === userId);
        if (deletedUser) {
          setTotalPosts((prev) => Math.max(0, prev - deletedUser.postCount));
        }
        setUsers(users.filter((user) => user._id !== userId));
        setPosts(posts.filter((post) => post.user?._id !== userId && post.user !== userId));
        setTotalUsers((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user.");
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:5700/api/admin/posts/${postId}`);
        setPosts(posts.filter((post) => post._id !== postId));
        setTotalPosts((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to delete post:", err);
        alert("Failed to delete post.");
      }
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={(user) => {
      setIsLoggedIn(true);
      setAdminUser(user);
    }} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-8">Zanosa Admin</h1>

        <nav className="space-y-3">
          <button
            onClick={() => setPage("dashboard")}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("users")}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Users
          </button>

          <button
            onClick={() => setPage("posts")}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Posts
          </button>

          <button
            onClick={() => setPage("reports")}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold capitalize">
            {page}
          </h2>

          <button
            onClick={() => {
              setIsLoggedIn(false);
              setAdminUser(null);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Dashboard */}
        {page === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500">Users</h3>
              <p className="text-2xl font-bold">{totalusers}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500">Posts</h3>
              <p className="text-2xl font-bold">{totalposts}</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500">Reports</h3>
              <p className="text-2xl font-bold">0</p>
            </div>

          </div>
        )}

        {/* Users */}
        {page === "users" && (
          <div className="bg-white p-5 rounded shadow">

            <h3 className="text-lg font-semibold mb-4">
              All Users ({users.length})
            </h3>

            <div className="space-y-4">

              {users.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center border p-4 rounded bg-white shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Profile Image */}
                      <img
                        src={user.profilePic}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      {/* Info */}
                      <div>
                        <h2 className="font-bold text-lg text-gray-800">
                          {user.name}
                        </h2>

                        <p className="text-sm text-gray-600">
                          {user.email}
                        </p>

                        <p className="text-xs text-gray-500 italic mt-1">
                          {user.bio}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span>Posts: {user.postCount}</span>
                          <span>Followers: {user.followers?.length || 0}</span>
                          <span>Following: {user.following?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                ))
              )}

            </div>
          </div>
        )}

        {/* Posts */}
        {page === "posts" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-gray-500">No posts found</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="flex justify-between items-center border p-4 rounded bg-white shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={post.user?.profilePic}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="profile"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {post.user?.name || "Unknown User"}
                      </h3>
                      <p className="mt-1 text-gray-700">{post.caption}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reports */}
        {page === "reports" && (
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-lg font-semibold mb-3">Reports</h3>
            <p className="text-gray-500">Reported content will appear here</p>
          </div>
        )}

      </div>
    </div>
  );
}