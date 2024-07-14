import rough from "roughjs/bundled/rough.esm.js"
import { getStroke } from 'perfect-freehand';
export function createElement (id,x1,y1,x2,y2,tools){
    const generator=rough.generator();

    // let  element = tools==="line"? generator.line(x1,y1,x2,y2):generator.rectangle(x1,y1,x2-x1,y2-y1);
    // return {id,x1,y1,x2,y2,element,tools};
    switch (tools) {
        case "line":
        case "rectangle":
            const roughElement =tools==="line"? generator.line(x1,y1,x2,y2):generator.rectangle(x1,y1,x2-x1,y2-y1);
            return {id,x1,y1,x2,y2,roughElement,tools};
        case "pencil":
            return {id,points:[{x:x1,y:y1}],tools};
        case "text":
          return {id,x1,y1,x2,y2,tools,text:""}
        default:
            throw new Error(`Type not reconizes:${tools}`)
            break;
    }
  

}
export const drawElements=(element,context,roughCanvas)=>{
  const type=element.tools;

     switch (type) {
      case 'line':
      case 'rectangle':
          roughCanvas.draw(element.roughElement)
          break;
     case 'pencil':
      const outlinePoints = getStroke(element.points,{
        size: 8,
        thinning:0.5 ,
        smoothing: 0.5,
        streamline: 0.5,
      })
      const pathData = getSvgPathFromStroke(outlinePoints)
      const myPath = new Path2D(pathData)

      context.fill(myPath)
      break;
     case 'text':
      context.textBaseline = "top"
      context.font = "24px sans-serif"
      context.stroke();
      context.fillText(element.text, element.x1, element.y1)
     
      default:
          break;
     }
}
export const nearPoint=(X,Y,x1,y1,name)=>{
      return Math.abs(X-x1)<7&&Math.abs(Y-y1)<7?name:null;
}
export function positionOfElementAtPosition(x,y,element){
   const {tools}=element;
  if(tools==="rectangle"||tools==="text"){
    const {x1,y1,x2,y2}=element;
     const topLeft= nearPoint(x,y,x1,y1,"tl")
     const topRight= nearPoint(x,y,x2,y1,"tr")
     const bottomLeft= nearPoint(x,y,x1,y2,"bl")
     const bottomRight= nearPoint(x,y,x2,y2,"br");
     let inside = x>=x1&&y>=y1&&x<=x2&&y<=y2 ? "inside":null;
     if(tools==='text') return inside;
     return topLeft||topRight||bottomLeft||bottomRight||inside;

  }else if(tools==="line"){
    const {x1,y1,x2,y2}=element;
   const a= distance(x1,y1,x,y);
   const b=distance(x2,y2,x,y);
   const c= distance(x1,y1,x2,y2);
   const start = nearPoint(x,y,x1,y1,"start");
   const  end = nearPoint(x,y,x2,y2,"end");
  const inside = Math.abs(c-(a+b))<1  ? "inside":null;
   return start||end||inside;
  }else if(tools==="pencil"){
    const betweenPoints = element.points.some((point,index)=>{
      const nextpoint = element.points[index+1];
      if(!nextpoint) return false;
      const a= distance(point.x,point.y,x,y);
      const b=distance(nextpoint.x,nextpoint.y,x,y);
      const c= distance(point.x,point.y,nextpoint.x,nextpoint.y);
      const inside = Math.abs(c-(a+b))<5  ? "inside":null;
     return inside;
    })
    const onPath= betweenPoints?"inside":null
      return onPath;
  }
}
export function distance(x1,y1,x2,y2){
  return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
}
export function getElementAtPosition(X,Y,elements){
   return elements
   .map(element=>({...element,position:positionOfElementAtPosition(X,Y,element)}))
   .find(element=>element.position!=null)
}
export const getOppositeCoordinate =(element,X,Y)=>{
 
  const {x1,y1,x2,y2,position}=element;
  switch (position) {
      case "tl":
      case "start":
          return {x1:X,y1:Y,x2,y2};
      case  "br":
      case "end":
          return {x1,y1,x2:X,y2:Y};
     case "tr":
      return {x1,y1:Y,x2:X,y2};
      case "bl":
          return {x1:X,y1,x2,y2:Y}
     
      default:
          return {x1,y1,x2,y2};
         
     }
}

export function adjustElementsCoordinates(element){
  
  // if(!element) return {};
  const {tools,x1,y1,x2,y2}=element;
  if(tools==='rectangle'){
      const minX= Math.min(x1,x2);
      const maxX=Math.max(x1,x2);
      const miniY =Math.min(y1,y2);
      const maxY =Math.max(y1,y2);
 return {x1:minX,y1:miniY,x2:maxX,y2:maxY};

  }else if(tools==='line'){
    if(x1<x2&&(x1===x2||y1<y2)){
      return {x1,y1,x2,y2};
    }else return {x1:x2,y1:y2,x2:x1,y2:y1};
  }
}
export const cursorForPosition =(position)=>{

 switch (position) {
  case "tl":
  case  "br":
  case  "start":
  case "end":
      return "nwse-resize"
  
 case "tr":
  case "bl":
      return "nesw-resize"
  default:
      return "move"
     
 }
}
export const drawSelectBox =(element,context)=>{
       const {x1,y1,x2,y2,tools}=element;
       if(tools==='rectangle'){
       context.lineWidth = 0.6;
       context.beginPath();
       context.rect(x1-7,y1-7,7,7);
       context.stroke();
       context.beginPath();
       context.rect(x2,y2,7,7);
       context.stroke();
       context.beginPath();
       context.rect(x1-7,y2,7,7);
       context.stroke();
       context.beginPath();
       context.rect(x2,y1-7,7,7);
       context.stroke();}
       else if(tools==='line'){
          context.beginPath();
       context.rect(x1-7,y1-7,7,7);
       context.stroke();
       context.beginPath();
       context.rect(x2,y2,7,7);
       context.stroke();
       }

}
const average = (a, b) => (a + b) / 2
export function getSvgPathFromStroke(points, closed = true) {
    const len = points.length
  
    if (len < 4) {
      return ``
    }
  
    let a = points[0]
    let b = points[1]
    const c = points[2]
  
    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
      2
    )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
      b[1],
      c[1]
    ).toFixed(2)} T`
  
    for (let i = 2, max = len - 1; i < max; i++) {
      a = points[i]
      b = points[i + 1]
      result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
        2
      )} `
    }
  
    if (closed) {
      result += 'Z'
    }
  
    return result
  }




  export function customMousePointer (points,context){
    const outlinePoints = getStroke(points,{
      size: 8,
      thinning:0.5 ,
      smoothing: 0.5,
      streamline: 0.5,
    })
    const pathData = getSvgPathFromStroke(outlinePoints)
    const myPath = new Path2D(pathData)

    context.fill(myPath)
  }