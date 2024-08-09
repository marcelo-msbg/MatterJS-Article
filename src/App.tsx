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
        wireframes: false, //Just for testing
        background: 'transparent'
      }
    });

    // Defining boddies. The order is: x, y, height, width. (y is from top to down)
    World.add(engine.current.world, [
      Bodies.rectangle(width / 2, height, width, 20, { isStatic: true, friction: 1 }), //Floor
      Bodies.rectangle(width, height/2, 20, height, { isStatic: true, friction: 0.1 }), //RightSide
      Bodies.rectangle(0, height/2, 20, height, { isStatic: true, friction: 0.1 }), //LeftSide
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

    mouseTimeoutRef.current = setInterval(() => {
      addGrain();
    }, 50) //Add a new grain at every 500 ms
  }

  const handleMouseUp = () => {
    if(mouseTimeoutRef.current) clearInterval(mouseTimeoutRef.current);
  }

  const addGrain = () => {
    //Add a new grain at the current position.
    World.add(engine.current.world, [
      Bodies.rectangle(posX.current, posY.current, 25, 25, { 
        friction: 1, restitution: 1, density: 0.5,
        chamfer: 0.2,
        angle: Math.PI*Math.random(),
        render: {
          fillStyle: '#ff5555',
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
    <div className="fixed w-full h-full bg-slate-700 flex justify-center items-center">
      <div ref={canvas} 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      
      className="bg-white h-[85%] w-[85%] flex justify-center items-center rounded-[12px] border-[3px] border-slate-800">
        
      </div>
    </div>
  )
}

export default App
