//variable declaration
let palette, tc;
let x,y;
let chosenColor;
let drawing = false;

//Sequences to be played later

//main background music
let theme = ["c#5","d#5","f5","g#5",["f5","f#5","f5"]];
//reseting the background sequence
let reset = [["c6","b5","a#5","a5","f#5","f5","e5","d#5","d5","c#5","c5"]];

//synth for the background music and reset
let synth = new Tone.Synth({
  oscillator: {
    type: 'sine'
  },
  envelope :
  {
    attack: .1,
    decay: 0.5,
    sustain: .75,
    release: .1,
  }
});

//polysnth for picking colors
let polysynth = new Tone.PolySynth({
  oscillator: {
    type: 'sawtooth'
  },
  envelope :
  {
    attack: .1,
    decay: 0.5,
    sustain: .75,
    release: .1,
  }
}).toDestination();

//distortion filter
let dist = new Tone.Distortion(.3);
synth.connect(dist);
dist.toDestination();


//Setting up the two sequences
let bgm = new Tone.Sequence (function (time,note){
  synth.triggerAttackRelease(note,0.8);
}, theme, "4n");

let resetSequence = new Tone.Sequence (function (time,note){
  synth.triggerAttackRelease(note,0.8);
}, reset, "4n");

//starting the transport to play sequences
Tone.Transport.start();
Tone.Transport.bpm.value = 100;
Tone.Transport.timeSignature = [3,4];


function setup() {
  //rectangular, wide canvas
  createCanvas(800, 400);
  
  //default values for variables
  chosenColor = color('black');
  x=800;
  y=400;
  
  //array of color_palettes
  palette = [
    new color_palette(5,5,color('red'), 'c5'),
    new color_palette(5,30,color('orange'), 'c#5'),
    new color_palette(5,55,color('yellow'), 'd5'),
    new color_palette(5,80,color('green'), 'd#5'),
    new color_palette(5,105,color('cyan'), 'e5'),
    new color_palette(5,130,color('blue'), 'f5'),
    new color_palette(5,155,color('magenta'), 'f#5'),
    new color_palette(5,180,color('brown'), 'g5'),
    new color_palette(5,205,color('white'), 'a5'),
    new color_palette(5,230,color('black'), 'b5'),
  ]

  //I added a trashcan button that resets the canvas
  tc = new trashcan(0,height-50);

  //buttons to start and stop music
  musicStartButton = createButton("Play music");
  musicStartButton.position(5,height-110);
  musicStartButton.mousePressed(() => bgm.start());

  musicStartButton = createButton("Stop music");
  musicStartButton.position(5,height-80);
  musicStartButton.mousePressed(() => bgm.stop());

}

//main draw function
function draw()
{
  
  //draws palette
  for (let i=0; i < palette.length; i++)
    {
      palette[i].draw();
    }
  
  //draws trashcan
  tc.draw();
  
  //if the cursor is drawing(clicked) and not over the palette or the trashcan
  //slight buffer given to the color palette, so that the palette stays clean
  if (!(x <=40 && y <=260) && !(x <= 40 && y >= 350) && drawing)
    {
      //push() isolates the style of this section, so that changing strokeWeight doesn't affect other lines
      //the line will draw from the last mouse position to the current x and y
      push();
      stroke(chosenColor);
      strokeWeight(10);
      line (x,y,pmouseX,pmouseY);
      console.log(x,y,pmouseX,pmouseY);
      pop();
    }
}

//whenever the mouse is pressed
function mousePressed()
{
  //2 booleans to check if there was a color selected or a reset of the canvas
  let paletteClicked = false;
  let resetClicked = false;
  
  //checks if any of the color_palettes in the array were clicked
  //if they were clicked, mark that the click was a color selection and change the choseColor
  for (let i=0; i < palette.length; i++)
    {
      if (palette[i].clicked(mouseX,mouseY))
        {
          chosenColor = palette[i].fill;
          paletteClicked = true;
          polysynth.triggerAttackRelease(palette[i].note, "0.3"); //plays a note upon sellection
        }
    }
  
  //checks if the trashcan was clicked. If it was, mark the resetClicked as true and reset canvas
  if (tc.clicked(mouseX,mouseY))
  {
    resetClicked = true;
    resetSequence.start();
    resetSequence.stop("+0.5"); //quickly plays a sequence
    background(255);
  }
  
  //if the click isn't on the palette or trashcan, indicate that the click is for drawing/dragging
  if (!paletteClicked && !resetClicked) 
  {
    drawing = true;
    x = mouseX;
    y = mouseY;
  } 
  
}

//change the drawing status back to default (false)
function mouseReleased()
{
  drawing = false;
}

//while dragging the mouse, check to see if the user is drawing i.e. not selecting a color or resetting canvas
//if drawing, update the mouse position
function mouseDragged()
{
  if (drawing)
  {
    x += mouseX - pmouseX;
    y += mouseY - pmouseY;
  }
}

//class for colors on the palette
//individual objects have: x and y coordinates and a given color
//functions to draw and to check if object has been clicked i.e. selected by user
class color_palette
{
  constructor (x,y,fill,note)
  {
    this.x = x;
    this.y = y;
    this.fill = fill;
    this.note = note;
  }
  
  //drawing the palette square acording to given color
  draw()
  {
    fill(this.fill);
    noStroke();
    square(this.x,this.y,20);
  }
  
  //checking to see if the color_palette has been clicked
  clicked(x,y)
  {
    return (x >= this.x && x <= this.x + 20) && 
            (y >= this.y && y <= this.y + 20);
  }
}

//class for a trashcan object
//allows user to reset the canvas upon being clicked
//requires x and y coordinates, draws down and right like square() or rect()
class trashcan
{
  constructor(x,y)
  {
    this.x = x;
    this.y = y;
  }
  
  //drawing the trashcan
  draw()
  {
    //outline rectangle. the "button"
    fill(color('white'));
    rect(this.x,this.y,40,50);
    
    //the lid
    fill(color('black'));
    noStroke();
    rect(this.x+2,this.y+10,37,7,2);
    
    //the handle
    stroke(color('black'));
    fill(color('white'));
    rect(this.x+10,this.y+3,20,7,2);
    
    //the trashcan
    fill(color('black'));
    quad(this.x+7,this.y+20,
         this.x+33,this.y+20,
         this.x+30,this.y+45,
         this.x+10,this.y+45
        );
    
    //lines on the trashcan
    strokeWeight(3);
    stroke(color('white'));
    line(this.x+15,this.y+25,this.x+15,this.y+40); 
    line(this.x+25,this.y+25,this.x+25,this.y+40); 
  }
  
  //checking to see if the trashcan was clicked
  clicked(x,y)
  {
    return (x >= this.x && x <= this.x + 40) && 
            (y >= this.y && y <= this.y + 50);
  }
  
}