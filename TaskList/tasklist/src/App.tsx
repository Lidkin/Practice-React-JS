import React, { useState, useEffect } from "react";

import "./App.css";

type Task = {
  title: string;
  priority: string;
  deadline: string;
  completed?: boolean;
  id?: number;
};

type TaskFormProps = {
  addTask: (task: Task) => void;
};

function App() {
  const [expirationTime, setExpirationTime] = useState(24 * 60 * 60 * 1000);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedTimeStamp = localStorage.getItem("tasksTimeStamp");

    if (savedTasks && savedTimeStamp) {
      const now = Date.now();
      const timeStamp = parseInt(savedTimeStamp, 10);

      if (now - timeStamp >= expirationTime) {
        localStorage.removeItem("tasks");
        localStorage.removeItem("tasksTimeStamp");
        return [];
      }
      console.log(savedTasks);
      return JSON.parse(savedTasks);
    }
    return [];
  });

  const [sortType, setSortType] = useState(""); //priority
  const [sortOrder, setSortOrder] = useState("asc"); //desc

  const sortTask = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (sortType === "priority") {
        const priorityOrder = ["High", "Medium", "Low"];
        return sortOrder === "asc"
          ? priorityOrder.indexOf(a.priority) -
              priorityOrder.indexOf(b.priority)
          : priorityOrder.indexOf(b.priority) -
              priorityOrder.indexOf(a.priority);
      } else {
        return sortOrder === "asc"
          ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
    });
  };

  const completedTasks = tasks
    .filter((task) => task.completed)
    .sort((a, b) => {
      const idA = a.id ?? 0;
      const idB = b.id ?? 0;
      return idA - idB;
    });

  const activeTasks = sortTask(tasks.filter((task) => !task.completed));

  const [openSection, setOpenSection] = useState<{ [key: string]: boolean }>({
    taskList: true,
    tasks: !activeTasks,
    completed: !completedTasks,
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("tasksTimeStamp", Date.now().toString());
    console.log(tasks);
  }, [tasks, expirationTime]);

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value, 10);
    if (!isNaN(hours)) setExpirationTime(hours * 60 * 60 * 1000);
  };

  const toggleSection = (section: string) => {
    setOpenSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, { ...task, completed: false, id: Date.now() }]);
  };

  const completedTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: true } : task))
    );
  };

  const deletedTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id != id));
  };

  const toggleSortOrder = (type: string) => {
    if (sortType === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortType(type);
    }
  };

  return (
    <div className="app">
      <div className="expiration-time">
        <p> Set Expiration Time for Stored Tasks (in hours):</p>
        <div className="time-container">
          <label htmlFor="expirationTime">
            {expirationTime / (60 * 60 * 1000)}
          </label>
          <input
            id="expirationTime"
            type="range"
            min="24"
            step="24"
            max="120"
            value={expirationTime / (60 * 60 * 1000)}
            onChange={handleExpirationChange}
          />
        </div>
      </div>
      <div className="task-container">
        <h1>Task List with Priority</h1>
        <button
          className={`close-button ${openSection.taskList && "open"}`}
          onClick={() => toggleSection("taskList")}
        >
          +
        </button>
        {openSection.taskList && <TaskForm addTask={addTask} />}
      </div>

      <div className="task-container">
        <h2>Tasks</h2>
        <button
          className={`close-button ${openSection.tasks && "open"}`}
          onClick={() => toggleSection("tasks")}
        >
          +
        </button>
        {openSection.tasks && (
          <>
            <div className="sort-controls">
              <button
                className={`sort-button ${sortType === "date" && "active"}`}
                onClick={() => toggleSortOrder("date")}
              >
                By Date
                {sortType === "date" &&
                  (sortOrder === "asc" ? " \u2191" : " \u2193")}
              </button>

              <button
                className={`sort-button ${sortType === "priority" && "active"}`}
                onClick={() => toggleSortOrder("priority")}
              >
                By Priority
                {sortType === "priority" &&
                  (sortOrder === "asc" ? " \u2191" : " \u2193")}
              </button>
            </div>

            <TaskList
              activeTasks={activeTasks}
              completedTask={completedTask}
              deletedTask={deletedTask}
            />
          </>
        )}
      </div>

      <div className="completed-task-container">
        <h2>Completed Tasks</h2>
        <button
          className={`close-button ${openSection.completed && "open"}`}
          onClick={() => toggleSection("completed")}
        >
          +
        </button>

        {openSection.completed && (
          <CompletedTaskList
            completedTasks={completedTasks}
            deletedTask={deletedTask}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

const TaskForm = ({ addTask }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Low");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim() && deadline) addTask({ title, priority, deadline });
    setTitle("");
    setPriority("Low");
    setDeadline("");
  };

  return (
    <form className="task-form" action="" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        placeholder="Task title"
        required
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <div className="select">
        <select
          name=""
          id=""
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
          }}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <input
        type="datetime-local"
        value={deadline}
        required
        onChange={(e) => {
          setDeadline(e.target.value);
        }}
      />
      <button type="submit">Add task</button>
    </form>
  );
};

type TaskListProps = {
  activeTasks: Task[];
  completedTask: (id: number) => void;
  deletedTask: (id: number) => void;
};

const TaskList = ({
  activeTasks,
  completedTask,
  deletedTask,
}: TaskListProps) => {
  return (
    <ul className="task-name">
      {activeTasks.map((task, index) => (
        <TaskItem
          key={index}
          task={task}
          completedTask={completedTask}
          deletedTask={deletedTask}
        />
      ))}
    </ul>
  );
};

type TaskItemProps = {
  task: Task;
  completedTask?: (id: number) => void;
  deletedTask: (id: number) => void;
};

const TaskItem = ({ task, completedTask, deletedTask }: TaskItemProps) => {
  const { title, priority, deadline, completed, id } = task;

  return (
    <li className={`task-item ${priority.toLowerCase()}`} key={id}>
      <div className="task-info">
        <div>
          {title} <strong>{priority}</strong>
        </div>
        <div className="task-deadline">
          Due:{" "}
          <strong
            className={`${
              !completed &&
              new Date(Date.now()).getTime() >= new Date(deadline).getTime() &&
              "active"
            }`}
          >
            {new Date(deadline).toLocaleDateString("en-GB")}
          </strong>
        </div>
      </div>
      <div className="task-buttons">
        {!completed && (
          <button
            className="complete-button"
            onClick={() => completedTask && completedTask(id!)}
          >
            Complete
          </button>
        )}
        {
          <button
            className="delete-button"
            onClick={() => deletedTask && deletedTask(id!)}
          >
            Delete
          </button>
        }
      </div>
    </li>
  );
};

type CompletedTaskListProps = {
  completedTasks: Task[];
  deletedTask: (id: number) => void;
};

const CompletedTaskList = ({
  completedTasks,
  deletedTask,
}: CompletedTaskListProps) => {
  console.log(completedTasks);
  return (
    <ul>
      {completedTasks.map((task, index: number) => (
        <TaskItem task={task} key={index} deletedTask={deletedTask} />
      ))}
    </ul>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Technologes and React concepts used: React, TSX, props, useState,
        useEffect, component composition, conditional rendering, array methods
        (map, filter, sort), event handing.
      </p>
    </footer>
  );
};
export default App;
