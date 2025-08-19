import { Question } from "../types/quiz";

export const QUESTIONS: Question[] = [
  {
    question: "What does `useState` hook do in React?",
    options: ["Manages state in functional components", "Sets the initial state of a class component", "Handles side effects", "Updates the DOM directly"],
    correct: 0
  },
  {
    question: "Which of the following is used to render a React component?",
    options: ["render() method", "ReactDOM.render()", "useEffect() hook", "createElement() function"],
    correct: 1
  },
  {
    question: "What is the purpose of the `useEffect` hook in React?",
    options: ["To manage state", "To handle side effects in functional components", "To render UI", "To create components"],
    correct: 1
  },
  {
    question: "What is a controlled component in React?",
    options: ["A component that controls its own state", "A component that does not manage its state", "A component that does not re-render", "A component that manages its props"],
    correct: 0
  },
  {
    question: "Which method is used to update state in React class components?",
    options: ["setState()", "useState()", "useEffect()", "updateState()"],
    correct: 0
  },
  {
    question: "What is JSX in React?",
    options: ["A syntax extension for JavaScript", "A build tool", "A state management library", "A testing framework"],
    correct: 0
  },
  {
    question: "Which hook is used for side effects in React functional components?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correct: 1
  },
  {
    question: "What is the virtual DOM in React?",
    options: ["A real DOM representation", "A JavaScript representation of the DOM", "A CSS framework", "A testing tool"],
    correct: 1
  },
  {
    question: "Which of the following is NOT a React hook?",
    options: ["useState", "useEffect", "useComponent", "useContext"],
    correct: 2
  },
  {
    question: "What is the purpose of keys in React lists?",
    options: ["To style elements", "To help React identify which items have changed", "To add animations", "To handle events"],
    correct: 1
  }
];
