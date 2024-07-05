import React, { useEffect } from 'react'
import {useLayoutEffect,useRef,useState} from "react"
import rough from "roughjs/bundled/rough.esm.js"
import { useHistory } from '../util/cutomhooks.js'
import {createElement,getElementAtPosition,
    getOppositeCoordinate,adjustElementsCoordinates,cursorForPosition,
    drawSelectBox,
    getSvgPathFromStroke,
    drawElements
} from "../util/lines_and_rectangle.js"
import getStroke from 'perfect-freehand'


const Canvas = () => {

    const [action,setAction]=useState("none");
    const [elements, setelements,undo,redo,save] = useHistory([]);
    const[tools,setTools]=useState("pencil");
    const [selectedelement,setSelectedelement]=useState(null);
    const [selecctedelementbox,setselectedelementbox]=useState(null);
    const canvs=useRef(null);
    const testArearef=useRef();
      useLayoutEffect(() => {
      const context= canvs.current.getContext('2d');
      context.clearRect(0,0,canvs.current.width,canvs.current.height);
       const rc= rough.canvas(canvs.current);
        //  elements.forEach((ele)=>{
        //   const {element}=ele;
        //   rc.draw(element);
        //  })
         elements.forEach((element)=>drawElements(element,context,rc));
         if(selecctedelementbox){
            drawSelectBox(selecctedelementbox,context);

         }
   
    },[elements,selecctedelementbox]);
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
      console.log(X,Y);
      setAction( tools==='text'? "writing":"Drawing"); 
    }
    }
    function updateElements(id,x1,y1,x2,y2,tools){
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
            
             updateElements(id,newX1,newY1,newX1+width,newY1+height,tools);}
           
        }else if(action==="resize"){
            const {x1,y1,x2,y2}=getOppositeCoordinate(selectedelement,X,Y);
            updateElements(selectedelement.id,x1,y1,x2,y2,selectedelement.tools);
        }
      
    };
    const adjustmentRequired= (type)=>{
      return ['line','rectangle'].includes(type);
    }

    const handleMouseUp =()=>{
  
          // console.log(elements)
   
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
 
   
   </div>

   {action === "writing" ? (
        <textarea
          ref={testArearef}
  
          style={{
            position: "fixed",
            top:selectedelement.y1 - 2 ,
            left: selectedelement.x1 ,
            
          }}
        />
      ) : null}
     
       

   <canvas id="canva" width ={window.innerWidth} height={window.innerHeight} 
   ref={canvs} 
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
   >
   </canvas>

    </>
  )
}

export default Canvas
