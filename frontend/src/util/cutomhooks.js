import { useState } from "react";



export const useHistory = initialState => {
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);
  
    const setState = (action, overwrite = false) => {
      const newState = typeof action === "function" ? action(history[index]) : action;
      if (overwrite) {
    
        const historyCopy = [...history];
        historyCopy[index] = newState;
        setHistory(historyCopy);
      } else {
        const updatedState = [...history].slice(0, index + 1);
        setHistory([...updatedState, newState]);
        setIndex(prevState => prevState + 1);
      }
      
    };
  
    const undo = () =>{
        if(index>0) setIndex(prevIndex=>prevIndex-1);
    };
    const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);
     const save =()=>{
        let newHistory =[];
        newHistory.push(history[index]);
          setIndex(0);
          setHistory(newHistory);
     }
    return [history[index], setState, undo, redo,save];
  };