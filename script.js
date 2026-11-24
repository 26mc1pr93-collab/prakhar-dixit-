

const c=document.getElementById("graph"), ctx=c.getContext("2d");
let scale=40, funcs=[], colors=["blue","red","green","purple"];

function calc(expr,x){
    if(!/^[0-9x+\-*/().%\s^a-z]+$/i.test(expr)) throw Error("Invalid function");
    let e=expr.replace(/\^/g,"**");
    if(!/^[0-9x+\-*/().%\s^a-z]+$/i.test(e)) throw Error("Invalid function");
    if(/\b(?!sin|cos|tan|sqrt|abs|log|exp|pi|e|x\b)[a-z]+\b/i.test(e)) throw Error("Unknown function");
    e=e.replace(/\b(pi|e)\b/gi,m=>m.toLowerCase()==="pi"?"Math.PI":"Math.E")
       .replace(/\b(sin|cos|tan|sqrt|abs|log|exp)\b/gi,"Math.$1");
    let y=Function("x",`"use strict";return (${e})`)(x);
    return Number.isFinite(y)?y:NaN;
}

function axes(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.strokeStyle="#ddd";
    for(let x=0;x<c.width;x+=scale)
      {ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}
    for(let y=0;y<c.height;y+=scale)
      {ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}
    ctx.strokeStyle="black";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,250);ctx.lineTo(850,250);
    ctx.moveTo(425,0);ctx.lineTo(425,500);ctx.stroke();
    ctx.lineWidth=2;
}

function draw(){
    axes();
    funcs.forEach(f=>{
        ctx.strokeStyle=f.color;ctx.beginPath();
        let start=false;
        for(let px=0;px<=c.width;px++){
            let x=(px-425)/scale,y=calc(f.expr,x),py=250-y*scale;
            if(!Number.isFinite(py)||Math.abs(py)>2500){start=false;continue;}
            if(!start){ctx.moveTo(px,py);start=true;}
            else ctx.lineTo(px,py);
        }
        ctx.stroke();
    });
    document.getElementById("list").textContent=funcs.map(f=>f.expr).join(" | ");
}

function plot(){
    try{
        let expr=document.getElementById("fn").value.trim();
        if(!expr) throw Error("Enter a function");
        calc(expr,0);
        if(funcs.some(f=>f.expr===expr)) throw Error("Already plotted");
        funcs.push({expr,color:colors[funcs.length%4]});
        draw();result.textContent="Graph plotted!";
    }catch(e){result.textContent=e.message;}
}

function zoom(n){scale=Math.max(5,Math.min(200,scale*n));draw();}
function clearGraph(){funcs=[];draw();result.textContent="Cleared";}
function save(){
    let a=document.createElement("a");
    a.download="graph.png";a.href=c.toDataURL();a.click();
}
function roots(){
    if(!funcs.length){result.textContent="Plot a graph first";return;}
    let f=funcs[funcs.length-1],r=[];
    for(let x=-10;x<10;x+=.01){
        let y=calc(f.expr,x),z=calc(f.expr,x+.01);
        if(Number.isFinite(y)&&Number.isFinite(z)&&y*z<0)
            r.push((x-y*.01/(z-y)).toFixed(3));
    }
    result.textContent=r.length?"Roots: "+[...new Set(r)].join(", "):"No crossing roots detected";
}
draw();
