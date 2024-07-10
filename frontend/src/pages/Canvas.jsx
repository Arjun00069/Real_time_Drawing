import React, { useContext, useEffect } from 'react'
import {useLayoutEffect,useRef,useState} from "react"
import rough from "roughjs/bundled/rough.esm.js"
import { useHistory } from '../util/cutomhooks.js'
import {createElement,getElementAtPosition,
    getOppositeCoordinate,adjustElementsCoordinates,cursorForPosition,
    drawSelectBox,
    getSvgPathFromStroke,
    drawElements
} from "../util/lines_and_rectangle.js"
import { contextApi } from '../App.js'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { server } from '../index.js'
import './Canvas.css'


const Canvas = () => {

    const [action,setAction]=useState("none");
    const [elements, setelements,undo,redo,save] = useHistory([]);
    const[loading,setLoding]=useState(false);
    const[tools,setTools]=useState("pencil");
    const [selectedelement,setSelectedelement]=useState(null);
    const [selecctedelementbox,setselectedelementbox]=useState(null);
    const canvs=useRef(null);
    const testArearef=useRef();
    const {isLoggedin}=useContext(contextApi);
    const getData = async()=>{
      setLoding(true)
      const config = {
       headers: {
           'Content-Type': 'application/json',
       },
       withCredentials: true, // Send cookies with the request
    };
    await new Promise(resolve => setTimeout(resolve, 1000));

      const {data} = await axios.get(`${server}/draw/user/getelements`,config)
      const elements= data?.elements;

      if(elements) setelements(elements,true);
      setLoding(false);
    }
    useEffect(()=>{
       if(isLoggedin){
         getData();
       }
    },[isLoggedin])
      useLayoutEffect(() => {
        if(elements){
      const context= canvs.current.getContext('2d');
      context.clearRect(0,0,canvs.current.width,canvs.current.height);
       const rc= rough.canvas(canvs.current);
       
        
         elements.forEach((element)=>{
          if(action==='writing' &&selectedelement.id===element.id) {
            console.log("wkjenwk")
            return;
          }
          drawElements(element,context,rc)});
         if(selecctedelementbox){
            drawSelectBox(selecctedelementbox,context);

         }
        }
    },[elements,selecctedelementbox,selectedelement,action]);
     useEffect(()=>{
     
      if(tools!="selection"){
        setselectedelementbox(null);
      }
     },[tools])
     useEffect(()=>{
      const textArea= testArearef.current
      if (action === "writing") {
        setTimeout(() => {
          textArea.focus();
          textArea.value = selectedelement.text;
        }, 0);
      }
     },[action,selectedelement])
    const handleMouseDown =(e)=>{
      if(action==='writing') return ;
        const {clientX:X,clientY:Y} =e;
      if(tools==="") return;
      if(tools==="selection"){
        
        const element = getElementAtPosition(X,Y,elements);
      
          if(element){
            if(element.tools==='pencil'){
             const xOffset=element.points.map(point=>X-point.x);
             const yOffset=element.points.map(point=>Y-point.y);
             setSelectedelement({...element,xOffset,yOffset});
            }else{
              let offSetX=X-element.x1;
              let offSetY=Y-element.y1;
               setSelectedelement({...element,offSetX,offSetY});
               setselectedelementbox({...element,offSetX,offSetY});
            }
           
            setelements(prev=>prev) // redrwing if only clicking in selection tool
            if(element.position==='inside'){
            setAction("moving");}else{
                setAction("resize")
            }
          }else   setselectedelementbox(null);
       
      }
      else{
  
      const {clientX:X,clientY:Y} =e;
      const element = createElement(elements.length,X,Y,X,Y,tools);
      setelements(prev=>[...prev,element]);
      setSelectedelement(element)
      setAction( tools==='text'? "writing":"Drawing"); 
    }
    }
    function updateElements(id,x1,y1,x2,y2,tools,options){
        // For updation of elements when we arre moving see on mouse  move we are calling
        const copy= [...elements];
       switch (tools) {
        case 'line':
        case 'rectangle':
          const element = createElement(id,x1,y1,x2,y2,tools);
        
          copy[id]=element;
          if(action!="Drawing"){setselectedelementbox(element); }
            break;
       case 'pencil':
        copy[id].points=[...copy[id].points,{x:x2,y:y2}]
        // console.log(copy[id].points);
        break;
        case 'text':
          const context= canvs.current.getContext('2d');
          const textWidth = context
                            .measureText(options.text)
                            .width;
                            
          const textHeight =24;               
          copy[id]={
            ...createElement(id,x1,y1,x1+textWidth,y1+textHeight,tools),
            text:options.text
          }
    
     
          break;
        default:
            break;
       }

       setelements(copy,true);
       
    }
    
    const handleMouseMove =(e)=>{
        const {clientX:X,clientY:Y} =e;
        
      if(tools==="selection"){
        const element = getElementAtPosition(e.clientX,e.clientY,elements)
        e.target.style.cursor= element?cursorForPosition(element.position):"default"
      }
      if(action==="Drawing"){
      
      let {x1,y1,id}= elements[elements.length-1];
        updateElements(id,x1,y1,X,Y,tools);
    }
        else if(action==="moving"){

              if(selectedelement.tools==='pencil'){
                
                const {id,tools,xOffset,yOffset,points}=selectedelement;
                const newPoints= points.map((point,index)=>{
                    return{
                      x:X- xOffset[index],
                      y:Y-yOffset[index]
                    }
                })
               const copy=[...elements];
                copy[id]={
                  ...copy[id],
                  points:newPoints
                };
                setelements(copy,true)
              }else{
             const {id,x1,x2,y1,y2,tools,offSetX,offSetY}=selectedelement;
             let width=x2-x1;
             let height=y2-y1;
             const newX1=X-offSetX;
             const newY1=Y-offSetY;
            const options= tools==='text'?{text:selectedelement.text}:{};
             updateElements(id,newX1,newY1,newX1+width,newY1+height,tools,options);}
           
        }else if(action==="resize"){
            const {x1,y1,x2,y2}=getOppositeCoordinate(selectedelement,X,Y);
            updateElements(selectedelement.id,x1,y1,x2,y2,selectedelement.tools);
        }
      
    };
    const adjustmentRequired= (type)=>{
      return ['line','rectangle'].includes(type);
    }

    const handleMouseUp =(e)=>{
      const {clientX:X,clientY:Y} =e;
          // console.log(elements)
          if(selectedelement&&selectedelement.tools==="text"&& X-selectedelement.offSetX===selectedelement.x1
          &&Y-selectedelement.offSetY===selectedelement.y1){
         
            setAction("writing")
            return ;
          }
        if((action==="Drawing"||action==="resize")&&adjustmentRequired(selectedelement.tools)){
            //For resizing to make even coordinates
      
            const index=selectedelement.id;
               
            const element=elements[index];
              //  console.log(element);
            const {x1,y1,x2,y2}=adjustElementsCoordinates(element);
   
            updateElements(element.id,x1,y1,x2,y2,element.tools);
        }
        if(action==="writing") return;
      setAction("none");
      setSelectedelement(null);
    };
    const handleBlur =(event)=>{
      const {id,x1,y1,tools}=selectedelement;
      setAction("none");
      setSelectedelement(null);
      updateElements(id,x1,y1,x1,y1,tools,{text:event.target.value})
    }
 

  return (
    <>
    <div className="tools" style={{position:"fixed"}} onClick={()=>{
      setselectedelementbox(null);
    }}>
    <label htmlFor="line">Line</label>
    <input type="radio"  
    id='line'
    checked={tools==="line"}
    onChange={()=>{
      setTools("line") }}
      /> 
      <label htmlFor="rectangle">rectangle</label>
    <input type="radio"  
    id='rectangle'
    checked={tools==="rectangle"}
    onChange={()=>{
      setTools("rectangle")
    }}
    /> 
      <label htmlFor="selection">selection</label>
  <input type="radio"  
    id='selection'
    checked={tools==="selection"}
    onChange={()=>{
      setTools("selection")
    }}
    /> 
     <label htmlFor="pencil">pencil</label>
    <input type="radio"  
    id='pencil'
    checked={tools==="pencil"}
    onChange={()=>{
      setTools("pencil")
    }}
    /> 
      <label htmlFor="text">text</label>
     <input type="radio"  
    id='text'
    checked={tools==="text"}
    onChange={()=>{
      setTools("text")
    }}
    /> 
    <button onClick={()=>{undo()}} >undo</button>
    <button onClick={()=>{redo()}} >redo</button>

     <button onClick={()=>{
        save();
     }} >Save</button>
    {!isLoggedin&& <button>  <Link to="/login">Login</Link></button>}
   
   </div>

   {action === "writing" ? (
        <textarea
          ref={testArearef}
          onBlur={handleBlur}
          
          style={{
            position: "fixed",
            top: selectedelement.y1 - 2 ,
            left: selectedelement.x1 ,
            font: "24px sans-serif",
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: "auto",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            zIndex: 2,
          }}
        />
      ) : null}
     
       
(<canvas id="canva" className={`${((isLoggedin&&loading))?"pointerNone":""}`} width ={window.innerWidth} height={window.innerHeight} 
   ref={canvs} 
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    style={{ position: "absolute", zIndex: -1 ,fontSmooth:"auto"}}
   >
   </canvas>)

  { (isLoggedin && loading)&& (<div className='loading' style={{position:"fixed"}} >loading .....</div>)}

    </>
  )
}

export default Canvas
