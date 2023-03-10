import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import axios from "axios";

import { BASE_URL } from "../API";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import Dropdown from "./Dropdown";
import Todo from "./Todo";
import AddTodo from "./AddTodo";
import { paginate } from "../utils/paginate";
import Pagination from "./common/Pagination";

const cookies = new Cookies();
const categories = [
  {
    name: "All",
    id: 1
  },
  {
    name: "Social",
    id: 2
  },
  {
    name: "Work",
    id: 3
  },
  {
    name: "Entertainment",
    id: 4
  },
  {
    name: "Family",
    id: 5
  }
];

const Todos = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [todoId, setTodoId] = useState(null);
  const [selected, setSelected] = useState("Entertainment");
  const [category, setCategory] = useState(categories[0].name);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setOpenModal] = useState(false);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const pageSize = 4;

  let filteredTodos = todos.filter(todo => {
    if (category === "Work") {
      return todo.category === "Work";
    } else if (category === "Social") {
      return todo.category === "Social";
    } else if (category === "Family") {
      return todo.category === "Family";
    } else if (category === "Entertainment") {
      return todo.category === "Entertainment";
    } else if (category === "All") {
      return todo;
    }
  });

  const keys = ["title", "description", "category"];

  const search = data => {
    return data.filter(item =>
      keys.some(key => item[key].toLowerCase().includes(query))
    );
  };

  const todoData = paginate(search(filteredTodos), pageSize, currentPage);

  const closeModal = () => {
    setTodoId(null);
    setDescription("");
    setTitle("");
    setOpenModal(false);
  };

  const changePage = page => {
    setCurrentPage(page);
  };

  const fetchAllTodos = async () => {
    const cookie = cookies.get("auth_token");

    await axios
      .get(`${BASE_URL}/api/todos`, {
        headers: {
          Authorization: `Bearer ${cookie}`
        }
      })
      .then(res => setTodos(res.data))
      .catch(err => console.log(err));
  };

  const addTodo = async e => {
    e.preventDefault();
    const cookie = cookies.get("auth_token");

    await axios
      .post(
        `${BASE_URL}/api/todos`,
        { title, description, category: selected },
        {
          headers: {
            Authorization: `Bearer ${cookie}`
          }
        }
      )
      .then(res => {
        setTodos(res.data);
      })
      .catch(err => console.log(err));
    setTitle("");
    setDescription("");
    setSelected("Entertainment");
    setOpenModal(false);
  };

  const editTodo = async todo => {
    setDescription(todo.description);
    setTitle(todo.title);
    setTodoId(todo.id);
    setSelected(todo.category);
    setOpenModal(true);
  };

  const updateTodo = async e => {
    e.preventDefault();
    const cookie = cookies.get("auth_token");

    await axios
      .put(
        `${BASE_URL}/api/todos/${todoId}`,
        { title, description, category: selected },
        {
          headers: {
            Authorization: `Bearer ${cookie}`
          }
        }
      )
      .then(res => {
        setTodos(res.data);
      })
      .catch(err => console.log(err));
    setTitle("");
    setDescription("");
    setSelected("Entertainment");
    setTodoId(null);
    setOpenModal(false);
  };

  const deleteTodo = async id => {
    const cookie = cookies.get("auth_token");

    await axios
      .delete(`${BASE_URL}/api/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${cookie}`
        }
      })
      .then(res => setTodos(res.data));
  };

  useEffect(() => {
    fetchAllTodos();
    setIsLoadingTodos(false);
  }, []);

  const count = todos.length;

  return (
    <React.Fragment>
      {" "}
      {isLoadingTodos ? (
        <div className="flex items-center justify-center h-screen">
          <div className="w-16 h-16 border-b-2 border-gray-900 rounded-full animate-spin"></div>
          <span className="ml-2">Loading Todos....</span>
        </div>
      ) : (
        <section className="bg-bgcolor w-full h-max bg-cover bg-center">
          {modalOpen && (
            <div className="modalBackground w-full px-4 lg:p-0 bg-center">
              <AddTodo
                addTodo={addTodo}
                title={title}
                description={description}
                setDescription={setDescription}
                setTitle={setTitle}
                closeModal={closeModal}
                updateTodo={updateTodo}
                selected={selected}
                setSelected={setSelected}
                categories={categories}
                id={todoId}
              />
            </div>
          )}
          <div className="lg:w-4/5 xl:w-3/5 h-full mx-auto px-5 lg:px-0 ">
            <h1 className="text-xl md:text-3xl pt-8 pb-5 font-sans">
              Welcome back, {user.username}
            </h1>
            <p className="text-base font-light md:text-lg mb-10">
              You currently have {todos.length} todos.
            </p>

            <div className="form-check my-2 mb-10">
              <input
                type="checkbox"
                className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-grey-600 checked:border-grey-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                onClick={() => setOpenModal(true)}
                defaultChecked
              />{" "}
              Add a new todo....
            </div>
            <div>
              <section className="flex my-4">
                <input
                  type="text"
                  required
                  className="search-input md:text-light focus:outline-none focus:border-gray-400 focus:rounded-md"
                  onChange={e => setQuery(e.target.value)}
                />
                <button className="flex justify-center items-center search-button">
                  <MagnifyingGlassIcon className="w-4 h-4 text-base cursor-pointer" />
                </button>
              </section>
              <Dropdown
                categories={categories}
                category={category}
                setCategory={setCategory}
              />

              <ul className="w-full">
                {todoData.map(todo => (
                  <Todo
                    todo={todo}
                    key={todo.id}
                    deleteTodo={deleteTodo}
                    editTodo={editTodo}
                  />
                ))}
              </ul>
              <Pagination
                todosCount={count}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={changePage}
                prevPage={() => setCurrentPage(currentPage - 1)}
                nextPage={() => setCurrentPage(currentPage + 1)}
              />
            </div>
          </div>
        </section>
      )}
    </React.Fragment>
  );
};

export default Todos;
