any=a=>true
mapType=(o,m)=>{
    if(typeof(o)!='object'||typeof(m)!='object')throw 'Not an Object at mapType(?,?)'
    let r = true
    m.forEachKey(k=>r=typeof(o[k])!=typeof(m[k])?false:r)
    return r
}
Object.prototype.forEach = function(delegate){
    let i = 0
    for(let k of Object.getOwnPropertyNames(this))
    {
        delegate(k)
        i++
    }
}
Object.prototype.getKeys = function(){
	return Object.keys(this)
}
Object.prototype.forEachKey = function(delegate){
    let i = 0
    for(let k of this.getKeys(this))
        {
        	delegate(k)
        	i++
    	}
}
Object.prototype.iterate= function (delegate) {
	this.forEachKey((k,i)=>delegate(this[k],k,i))
}
Object.prototype.filter= function(delegate){
	let result=[]
	this.iterate((o,k,i)=>{
		if(delegate(o,i))
			result.push(o)
	})
	return result
}
Object.prototype.slice=function(start,end){
	let arr = [...this]
	return arr.slice(start,end)
}
Object.prototype.find=function (delegate){
	let result
	this.iterate((o,i)=>{
		if((delegate(o,i)??false)&&(result==undefined))
			result = o
		
	})
	return result
}
Object.prototype.any=function (delegate){
	let result = false
	this.iterate((o,i)=>{
		if((delegate(o,i)??false))
			result = true
	})
	return result
}
Object.prototype.iterateAll= function (delegate) {
	this.forEach(k=>delegate(this[k],k))
}

Object.prototype.copy=function() {
	let o = {}
	if(typeof(arguments[0])=='object')
		this.iterateAll((p,k)=>{
			arguments[0][k]=p
			o[k]=p
		})
	else 
	{
		this.iterate((p,k)=>{
			o[k]=p
		})
	}
	return o
}

document.onkeydown=function(e){
    
    Engine.keymap[e.key]=true
    Engine.keystate[e.key]=true
}
document.onkeyup=function(e){
    Engine.keystate[e.key]=false
}

canvas = document.querySelector('canvas')
class Engine {
	constructor(){throw "Abstract Class Engine"}
	static ce = document.querySelector('canvas')	
	static offset = {x:0,y:0}
	static keymap=[]
	static keystate=[]
	static frameCount = 0
	static lastCount = Date.now()
	static fps = 5
	static get updateTime(){return 1000/Engine.fps}
	static get idealUpdateTime(){return Engine.updateTime - (Engine.updateOffset)}
	static get updateOffset(){return Engine._updateOffset>0?Engine._updateOffset:0}
	static get _updateOffset(){return Engine.delta - Engine.idealDelta}
	static get delta(){return Date.now()-Engine.lastCount}
	static get idealDelta(){return (Engine.frameCount) * Engine.updateTime}
	static objects=[];
	static stop = false;

	static async Update(){
		Engine.last = new Date().getTime()

		if(Engine.keymap['Escape'])
			return Engine.keymap['Escape'] = !( Engine.stop = true)

		Engine.ctx.clearRect(0,0,screen.width,screen.height)
		
		Engine.objects.iterate((obj,key)=>{
			if(Engine.stop)return;

			if(obj instanceof GameObject)
				obj._update(Engine.ctx,key);
			else
				try{throw "Invalid GameObject"}catch(e){console.log(e)}
		})

		Object.assign(Engine.keymap,Engine.keystate)
		
		if(!Engine.stop)
		{
			Engine.frameCount++
			
			if(Engine.frameCount >= Engine.fps)
			{
				Engine.lastCount = Date.now()
				Engine.frameCount = 0
			}


			setTimeout(
				()=>{
					Engine.Update()
				},
				Engine.idealUpdateTime
			)

		}
	}


	static async Start(fps=24){
		Engine.stop = false
		
		if(fps!=null)
			Engine.fps=fps
		
		Engine.Update()
	}	

	static Stop(){
	Engine.stop = true
	}

	static get ctx(){return Engine.ce.getContext('2d')}

}



class Drawable
{
	constructor(draw){
		if(draw!=null)this.Draw = draw
	}

	Draw(ctx,x,y,key)
	{

	}

	_draw(ctx,x,y,key)
	{
		this.Draw(ctx,Engine.offset.x + x,Engine.offset.y + y,key)
	}
}



class GameObject extends Drawable{
	constructor(DrawableGameObject_Id){
		super(arguments.find(a=>typeof(a)=='function'))

		/*if(DrawableGameObject instanceof GameObject
		|| DrawableGameObject instanceof Drawable )
		*/
		let o = arguments.find(a=>typeof(a)=='object')
		if(o != undefined){
			Object.assign(this,o)
		}

		let numberArr = arguments.filter(a=>typeof(a)=='number')
		if(numberArr.length>=2)
		{
			this.x = numberArr[0]
			this.y = numberArr[1]
			numberArr = numberArr.slice(2)
		}
		this.id = [...arguments.filter(a=>typeof(a)=='string'),...numberArr].find(any)??this.id
	}
	x=0;
	y=0;
	id=Engine.objects.length;
	Update(ctx){
	
	}

	async _update(ctx,key){
	this.Update(ctx,key)
	this._draw(ctx,this.x,this.y,key)
	}
}

class Collision extends GameObject
{
	constructor(){super(...arguments)}
	Collision(){}
	async _update(ctx,key){
	this.Update(ctx,key)
	this.Collision(ctx,key)
	this._draw(ctx,this.x,this.y,key)
	}
}

class Color{
	constructor(value){
		this.value=value??this.value
	}
	value='black'
	valueOf=()=>this.value
}

function signed(i){
	return i<0?-i:i
}

class Vector
{
		constructor(VectorOrXY){
				if(arguments.length>0)
				{
					let vector = arguments.find(a=>typeof(a)=="object")
						if(typeof(vector)=="object" && typeof(vector.x)=="number" && typeof(vector.y)=="number")
							
							vector.copy(this)
						
						else{
							let numberArr=arguments.filter(a=>typeof(a)=="number")
							if(numberArr.length!=2)
								throw "Invalid paramaters at: new Vector(?)"
							this.x=numberArr[0]
							this.y=numberArr[1]
						}
				}
		}
		x=0
		y=0
}

class Counter extends GameObject{
	constructor(){
		super(function(ctx,x,y,key){
			let now = new Date().getTime()
			let deltaT = now - this.last
			if(deltaT >= 1000)
			{
				this.lastcount = this.counter		
				this.counter=0	
				this.last = now	
			}
			this.counter++
			ctx.fillStyle='black'
			ctx.fillText(Math.floor(this.lastcount)+"/fps",5,parseInt(ctx.font.split('px')[0]))	
		})

		this.counter=0	
		this.last= new Date().getTime()

	}
}

Engine.objects['counter']= new Counter()


class SquareBody extends Collision
{
	height = 0
	width = 0
	  constructor(){
    	let numberArr = arguments.filter(a=>typeof(a)=="number")
			
			if(numberArr.length>=2)
			{
				super(...(arguments.slice(2)))
				this.width = numberArr[0]
				this.height	= numberArr[1]
			}
			else super(...arguments)

  	}

    Collision(){
    	let squares = Engine.objects.filter(o=>o instanceof SquareBody && o.id != this.id)

    	squares = squares.filter(o=>
    			{
    				let xc = 
    								(
    								this.x >= o.x 
    								&&
    								this.x <= o.x+o.width
    								)
    								||
    								(
    								this.x+this.width >= o.x 
    								&&
    								this.x+this.width <= o.x+o.width
    								)

						let yc = 
    								(
    								this.y >= o.y 
    								&&
    								this.y <= o.y+o.height
    								)
    								||
    								(
    								this.y+this.height >= o.y 
    								&&
    								this.y+this.height <= o.y + o.height
    								)
    				return xc && yc
    			}
    		)

    	if(squares.length >0)
    		this.OnCollision(...squares)
    }
    get center(){
    	return new Vector(
    		this.x+(this.width/2),
    		this.y+(this.height/2)
    		)
    }
    OnCollision(){
    	
    }
}

class Square extends SquareBody{
	constructor(){
		let index=Infinity
		let c = arguments.find((a,i)=>a instanceof Color)

		let a = [...arguments]		
		if(c instanceof Color){
			a.splice(index,1)
		}
		super(...a)
		
		this.color=c?.value??new Color().value

	}

	Draw(ctx,x,y){
		ctx.fillStyle=this.color
		ctx.fillRect(x,y,this.width,this.height)

		if(this.collinding){
			this.color=this.oldcolor
			this.collinding=false
		}
	}

	OnCollision(){
		this.oldcolor=this.color
		this.color=this.color=='red'?'blue':'red'
		this.collinding=true
	}
}

toNote=(n)=>{
	switch(n)
	{
		case 'A':
			return 440
			break;
		case 'A#':
		case 'Bb':
			return 466.16
			break;
		case 'B':
			return 493.88
			break;
		case 'C':
			return 523.25
			break;
		case 'C#':
		case 'Db':
			return 554.37
			break;
		case 'D':
			return 587.33
			break;
		case 'D#':
		case 'Eb':
			return 622.25
			break;
		case 'E':
			return 659.25
			break;
		case 'F':
			return 698.46
			break;
		case 'F#':
		case 'Gb':
			return 739.99
			break;
		case 'G':
			return 830.61
			break;
		case 'G#':
		case 'Ab':
			return 783.99
			break;
		case 'A2':
			return 880.00
			break;
		default:
			throw 'Invalid Note'

	}
}
function note(n){
let context = new AudioContext();
let oscillator = context.createOscillator();
oscillator.type = "sine";
oscillator.frequency.value = toNote(n);
oscillator.connect(context.destination);
oscillator.start(); 
// Beep for 500 milliseconds
setTimeout(function () {
    oscillator.stop();
    setTimeout(()=>{context.close()},150)
}, 350);                
}