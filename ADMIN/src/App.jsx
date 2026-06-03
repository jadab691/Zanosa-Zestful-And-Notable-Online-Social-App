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
  const [donations, setDonations] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("adminLoggedIn") === "true";
  });
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });

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

  // Get all donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get("http://localhost:5700/api/admin/donations");
        setDonations(res.data);
      } catch (err) {
        console.log("Failed to fetch donations:", err);
      }
    };
    fetchDonations();
  }, []);

  const handleUpdateDonationStatus = async (donationId, status) => {
    if (window.confirm(`Are you sure you want to mark this donation as ${status}?`)) {
      try {
        await axios.patch(`http://localhost:5700/api/admin/donations/${donationId}`, { status });
        setDonations(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
      } catch (err) {
        console.error("Failed to update status:", err);
        alert("Failed to update donation status.");
      }
    }
  };

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

  const totalDonationAmount = donations
    .filter((d) => d.status === "success")
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (!isLoggedIn) {
    return <Login onLogin={(user) => {
      setIsLoggedIn(true);
      setAdminUser(user);
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminUser", JSON.stringify(user));
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

          <button
            onClick={() => setPage("donations")}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Donations
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
              localStorage.removeItem("adminLoggedIn");
              localStorage.removeItem("adminUser");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Dashboard */}
        {page === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

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

            <div className="bg-white p-5 rounded shadow border-l-4 border-green-500">
              <h3 className="text-gray-500">Total Donation</h3>
              <p className="text-2xl font-bold text-green-600">{totalDonationAmount} ৳</p>
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

        {/* Donations */}
        {page === "donations" && (
          <div className="bg-white p-5 rounded shadow overflow-x-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Donation History & Verification</h3>
              <div className="bg-green-50 text-green-800 px-4 py-2 rounded font-semibold text-sm">
                Total Revenue: {totalDonationAmount} ৳
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">No donations found</td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div>{donation.userName}</div>
                        <div className="text-xs text-gray-500">{donation.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{donation.amount} ৳</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{donation.trxID}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {donation.paymentMethod === "online" ? "Online Gateway" : "bKash Manual"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          donation.status === "success" ? "bg-green-100 text-green-800" :
                          donation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          donation.status === "cancelled" ? "bg-gray-100 text-gray-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {donation.status === "pending" && donation.paymentMethod === "manual_bkash" && (
                          <>
                            <button
                              onClick={() => handleUpdateDonationStatus(donation._id, "success")}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateDonationStatus(donation._id, "failed")}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}