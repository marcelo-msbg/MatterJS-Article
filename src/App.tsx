import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react'
import { Engine, Render, World, Bodies, Runner, Composite, Composites } from 'matter-js'

function App() {
  const [count, setCount] = useState(0)

  const canvas = useRef<HTMLDivElement>();
  const engine = useRef(Engine.create());
  const render = useRef();
  const runner = useRef();
  const posX = useRef<number|null>(null);
  const posY = useRef<number|null>(null);

  const colorCounter = useRef<number>(0); //Used for the color

  const mouseTimeoutRef = useRef<number|null>(null);

  const initializeRenderer = () => {
    if(!canvas.current) return;
    
    // Height and width of the screen that will be used for matterJs
    const height = canvas.current.offsetHeight;
    const width = canvas.current.offsetWidth;

    console.log(height + " " + width);

    render.current = Render.create({
      element: canvas.current, 
      engine: engine.current,
      options: {
        width: width,
        height: height,
        wireframes: false, //Just for testing. Remove all colors and details
        background: '#001010'
      }
    });

    // Defining boddies. The order is: x, y, height, width. (y is from top to down)
    World.add(engine.current.world, [
      Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, friction: 10 }), //Floor
      Bodies.rectangle(width+10, height/2, 20, height, { isStatic: true, friction: 10 }), //RightSide
      Bodies.rectangle(-10, height/2, 20, height, { isStatic: true, friction: 10 }), //LeftSide

      Bodies.rectangle(
        width*0.4, height*0.5, width*0.3, 20,
        {
            isStatic: true, // The ramp should be static so it doesn't fall
            angle: (40/180)*Math.PI, // Incline the ramp by setting its angle
            chamfer: 0.5,
            render: {
                fillStyle: '#AAAAAA' // Color of the ramp
            }
        }
    )
    ])

    // run the engine
    Engine.run(engine.current);
    Render.run(render.current);

    runner.current = Runner.create();
    Runner.run(runner.current, engine.current);
  }

  const clearRenderer = () => {
    if(!render.current) return;

    Render.stop(render.current);
    Runner.stop(runner.current);
    World.clear(engine.current.world);
    Engine.clear(engine.current);
    render.current.canvas.remove();
    render.current.canvas = null;
    render.current.context = null;
    render.current.textures = {};
  }

  const handleMouseDown = () => {

    colorCounter.current = 0; //Reset the counter;

    mouseTimeoutRef.current = setInterval(() => {
      addGrain();
      colorCounter.current++;
    }, 20) //Add a new grain at every 500 ms
  }

  const handleMouseUp = () => {
    if(mouseTimeoutRef.current) clearInterval(mouseTimeoutRef.current);
  }

  const addGrain = () => {
    //Add a new grain at the current position.
    World.add(engine.current.world, [
      //Bodies.rectangle(posX.current, posY.current, 25, 25, { 
      Bodies.circle(posX.current, posY.current, 5 + Math.random()*8, { 
        friction: 10, //High friction to maintain then together
        restitution: 0.01, //Low bounce to prevent scattering
        density: 0.001,
        //chamfer: 0.2,
        render: {
          fillStyle: `rgb(${150 + 50*Math.cos(2*Math.PI*0.01*colorCounter.current)}, 
            ${150 + 50*Math.cos(2*Math.PI*0.05*colorCounter.current)}, ${150})`,
          strokeStyle: '#444444',
          lineWidth: 1
        }}),
    ]);
  }

  //Just update the mouse position.
  const updateMousePosition = (event:MouseEvent) => {
    if(!canvas.current) return;
    posX.current = event.clientX - canvas.current.getBoundingClientRect().x;
    posY.current = event.clientY - canvas.current.getBoundingClientRect().y;
  }

  useEffect(() => {
    console.log("Initilizing");
    initializeRenderer();

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      clearRenderer();
      window.removeEventListener("mousemove", updateMousePosition);
    }
  },[])

  return (
    <div className="fixed w-full h-full bg-slate-700 flex flex-col justify-center items-center">
      <div className="w-full h-[10%] flex flex-row justify-center items-center">
        <button className="bg-slate-200 px-[8px] py-[4px] rounded-[5px]"
          onClick={() => {
            clearRenderer();
            initializeRenderer();
          }}
        >
          Clear Canvas
        </button>
      </div>
      <div ref={canvas} 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="bg-white h-[85%] w-[85%] flex justify-center items-center rounded-[12px] border-[3px] border-slate-800 overflow-hidden">
      </div>
    </div>
  )
}

export default App
