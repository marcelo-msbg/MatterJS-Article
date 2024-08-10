import { useEffect, useRef } from 'react'
import { Engine, Render, World, Bodies, Runner } from 'matter-js'

function App() {

  const canvas = useRef<HTMLDivElement>(); //Your div element

  //Matter.js references
  const engine = useRef(Engine.create()); 
  const render = useRef();
  const runner = useRef();

  //Mouse position. Will be updated at every move.
  const posX = useRef<number|null>(null);
  const posY = useRef<number|null>(null);

  //Counter used to update colors.
  const colorCounter = useRef<number>(0); //Used for the color

  //Used to keep the mouse interval trigger.
  const mouseIntervalRef = useRef<number|null>(null);

  //This will only run once. It will initialize the Matter.js render and add the mouse listener.
  useEffect(() => {
    initializeRenderer(); //Initialize Matter.js objects
    window.addEventListener("mousemove", updateMousePosition); //Add mouse listener

    return () => { //Done when the component closes. Do the oposite.
      clearRenderer(); //Remove all data from Matter.js
      window.removeEventListener("mousemove", updateMousePosition); //Remove mouse listener.
    }
  },[])

  //Just update the mouse position to the references.
  const updateMousePosition = (event:MouseEvent) => {
    if(!canvas.current) return;
    posX.current = event.clientX - canvas.current.getBoundingClientRect().x;
    posY.current = event.clientY - canvas.current.getBoundingClientRect().y;
  }

  //Initialize everything from Matter.js
  const initializeRenderer = () => {
    if(!canvas.current) return; //It's good to always check if your reference exists.
    
    const height = canvas.current.offsetHeight; //div height
    const width = canvas.current.offsetWidth; //div width

    render.current = Render.create({ //Start renderer, per Matter.js docs.
      element: canvas.current, //Our JSX element
      engine: engine.current, //The engine
      options: {
        width: width,
        height: height,
        wireframes: false, //Just for testing. Remove all colors and details
        background: '#BBBBBB'//Background color
      }
    });

    //Create the ramps in a map operation. It may seem complicated, but 
    //it's just a loop that creates 6 ramps with changing angles and x position.
    const ramps = [0, 0.15, 0.30, 0.45, 0.6, 0.75].map((value, index) => {
      return Bodies.rectangle(
        width*(0.1 + value), height*0.55, width*0.15, 20, //center x, center y, width, height
        {
            isStatic: true, // The ramp should be static so it doesn't fall
            angle: ((index%2 == 0 ? 50 : -50)/180)*Math.PI, // Incline the ramp by setting its angle
            chamfer: 0.5, //Curvy edges
            render: { //Some properties. There are several at the documentation
                fillStyle: '#666666', strokeStyle: '#222222', lineWidth: 5
            }
        }
      )
    })

    // Adding the objects to the engine. 
    World.add(engine.current.world, [
      Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, friction: 10 }), //Floor
      Bodies.rectangle(width+10, height/2, 20, height, { isStatic: true, friction: 10 }), //Right wall
      Bodies.rectangle(-10, height/2, 20, height, { isStatic: true, friction: 10 }), //Left wall
      ...ramps, //All the ramps we made before.
    ])

    // Start the engine, the renderer and the runner. As defined in Matter.js documentation
    Engine.run(engine.current);
    Render.run(render.current);
    runner.current = Runner.create();
    Runner.run(runner.current, engine.current);
  }

  //Remove everything when closed. Self explanatory.
  const clearRenderer = () => {
    if(!render.current) return;
    Render.stop(render.current);
    Runner.stop(runner.current);
    render.current.canvas.remove();

    if(!engine.current) return;
    World.clear(engine.current.world);
    Engine.clear(engine.current);
  }

  //When the mouse is clicked, reset the counter and set the interval to add grains
  //at every 20 ms.
  const handleMouseDown = () => {
    colorCounter.current = 0; //Reset the counter
    mouseIntervalRef.current = setInterval(() => {
      addGrain();
      colorCounter.current++;
    }, 20) //Add a new grain at every 500 ms
  }

  //Just remove the interval and stop adding grains
  const handleMouseUp = () => {
    if(mouseIntervalRef.current) clearInterval(mouseIntervalRef.current);
  }

  //Used to add grains to the renderer. Is the same thing we did when
  //added the rigid objects to the scene before.
  const addGrain = () => {
    World.add(engine.current.world, [
      Bodies.circle(posX.current, posY.current, 5 + Math.random()*8, { //Add a grain to the current mouse position.
        friction: 10, //High friction to maintain then together
        restitution: 0.01, //Low bounce to prevent scattering
        density: 0.001,
        render: { //Just color change
          fillStyle: `rgb(${150 + 50*Math.cos(2*Math.PI*0.01*colorCounter.current)}, 
            ${150 + 50*Math.cos(2*Math.PI*0.05*colorCounter.current)}, ${150})`,
          strokeStyle: '#333333',
          lineWidth: 3
        }}),
    ]);
  }

  //Our JSX is pretty simple. I am using Tailwind, but you don't have to.
  return (
    <div className="fixed w-full h-full bg-slate-700 flex flex-col justify-center items-center">
      <div ref={canvas} 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="bg-white h-[85%] w-[85%] flex justify-center items-center rounded-[12px] border-[3px] border-slate-800 overflow-hidden">
      </div>
    </div>
  )
}

export default App
