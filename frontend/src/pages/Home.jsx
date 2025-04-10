import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/auth/home", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) setUsername(response.data.user.username);
    } catch (error) {
      navigate("/login");
      console.log(error);
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:3000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  const addTask = async () => {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:3000/api/tasks",
      { title, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle("");
    setDescription("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:3000/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchUser();
    fetchTasks();
  }, []);

  return (
    <div className="p-4">
      <div className="flex  items-center mb-2">
        <h2 className="text-2xl mb-4">Welcome, {username}!</h2>
        <button
          onClick={handleLogout}
          className=" mr-2 ml-auto bg-red-500 text-white py-2 px-4 rounded cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Task Title"
          className="border px-2 py-1 mr-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          className="border px-2 py-1 mr-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={addTask} className="bg-blue-500 text-white px-4 py-1 cursor-pointer">
          Add Task
        </button>
      </div>
      {tasks.length>0 && <p className="text-2xl mb-3">List of Pending Tasks</p>}
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="mb-2 border p-2 flex justify-between items-center"
          >
            <div>
              <h4 className="font-bold">{task.title}</h4>
              <p>{task.description}</p>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
