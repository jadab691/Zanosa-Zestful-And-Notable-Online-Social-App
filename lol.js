import { useEffect, useState } from "react";
import BASE_URL from "@/config/api";

const [name, setName] = useState("");

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/profile`);
      const data = await response.json(); // parse JSON automatically
      setName(data.name); // set the name from backend
    } catch (err) {
      console.log("Error fetching profile:", err);
    }
  };

  fetchProfile();
}, []);