import { useEffect, useRef, useState } from 'react'
import { Engine, Render, World, Bodies, Runner } from 'matter-js'

function App() {
  const [count, setCount] = useState(0)

  const window = useRef();
  const engine = useRef(Engine.create());
  const render = useRef();
  const runner = useRef();

  const initializeRenderer = () => {
    if(!window.current) return;
    
    // Height and width of the screen that will be used for matterJs
    const height = window.current.offsetHeight;
    const width = window.current.offsetWidth;

    console.log(height + " " + width);

    render.current = Render.create({
      element: window.current, 
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
      Bodies.rectangle(width / 2, height/2, 20, 20, { friction: 0.00001, restitution: 0.7, density: 0.1 }),
      Bodies.rectangle(width / 2, height, width, 20, { isStatic: true }), //Floor
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


  useEffect(() => {
    console.log("Initilizing");
    initializeRenderer();

    return () => {
      clearRenderer();
    }
  },[])

  return (
    <div className="fixed w-full h-full bg-slate-700 flex justify-center items-center">
      <div ref={window} className="bg-white h-[85%] w-[85%] flex justify-center items-center rounded-[12px] border-[3px] border-slate-800">
        
      </div>
    </div>
  )
}

export default App
