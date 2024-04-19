
class Snake extends GameObject
{
	constructor(snake){
		if(typeof(snake)=='number')
		{	
			super()
			this.id = snake
		}else
		super(snake)

	}
	id=-1
	body = [{x:0,y:0}]
	
	DrawSnake(ctx,x,y,color)
	{

		let tongue={x:x+5,y:y+5}
		switch(this.lastd)
		{
			case 'l':
				tongue.x-=2
				break
			case 'r':
				tongue.x+=2
				break
			case 'u':
				tongue.y-=2
				break
			case 'd':
				tongue.y+=2
		}

	    for(let b of this.body)
	    {
			ctx.fillStyle=color
			ctx.fillRect(b.x,b.y,10,10)
	    	if(this.body.filter(b2=>b.x==b2.x&&b.y==b2.y).length>1)
	    		Engine.Stop()
	    }

	}
	
	color='green'
	Draw(ctx,x,y){
		this.DrawSnake(ctx,x,y,this.color)
	}


	xd = 0
	yd = 0
	x = 1
	y = 1


	lastd = 'r'

	Control()
	{
		let xd = 0
		let yd = 0
		if(Engine.keymap['ArrowUp'])
			yd -= 1
		if(Engine.keymap['ArrowDown'])
			yd += 1
		if(Engine.keymap['ArrowLeft'])
			xd -= 1
		if(Engine.keymap['ArrowRight'])
			xd += 1
		this.xd = xd
		this.yd = yd

		let YtoD=(d)=>{switch(d){case 1:return 'd';break;case -1:return 'u';}}
		let XtoD=(d)=>{switch(d){case 1:return 'r';break;case -1:return 'l';}}
		switch (this.lastd)
		{
			case 'r':
			case 'l':
				this.lastd = YtoD(this.yd)??this.lastd
				break;
			case 'd':
			case 'u':
				this.lastd = XtoD(this.xd)??this.lastd
		}

	}
	step = 11
	size = 5


	Update(ctx)
	{
		this.Control()
		
		
		switch (this.lastd)
		{
		case 'r':
			this.oldx=this.x
			this.x+=this.step
			break;
		case 'l':
			this.oldx=this.x
			this.x-=this.step
			break;
		case 'd':
			this.oldy=this.y
			this.y+=this.step
			break;
		case 'u':
			this.oldy=this.y
			this.y-=this.step
		}

			
		switch(true)
		{
		case this.x+this.step>ctx.canvas.width:
			this.x=1
			break
		case this.x<0:
			this.x=ctx.canvas.width-this.step+1-(ctx.canvas.width%this.step)
			break
		case this.y+this.step>ctx.canvas.height:
			this.y=1
			break
		case this.y<0:
			this.y=ctx.canvas.height-this.step+1-(ctx.canvas.height%this.step)
			break
		}
		this.body.unshift({x:this.x,y:this.y})
		if(this.body.length>this.size)
			this.body.pop()

		let winner = Engine.objects.find(o=>this.id!=o.id&&o instanceof Snake)

		if(winner?.body
		?.find(b=>
			b.x==this.x&&b.y==this.y
		)){
			Engine.Stop()
			ctx.fillStyle=winner.color
			ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
		}

	}
}


class Fruit extends GameObject
{

	Draw(ctx,x,y){
			ctx.fillStyle='red'
			ctx.fillRect(x+2.5,y+2.5,5,5)
		}

			
	x = -12
	y = -12
	first = true
	Update(ctx)
	{
		if(this.first){

			let s = Engine.objects[0].step

			let gx = ctx.canvas.width/s
			this.x=1+ (Math.floor(Math.random()*gx)*s)

			let gy = ctx.canvas.height/s
			this.y= 1+(Math.floor(Math.random()*gy)*s)
			this.first=false
		}

		let got = Engine.objects.filter(o=>o.x==this.x&&this.y==o.y&&!(o instanceof Fruit))
		if(got[0]!=null)
		{
			got = got[0]
			got.size+=3
			Engine.fps+=0.5

			let s = got.step

			let gx = ctx.canvas.width/s
			this.x=1+ (Math.floor(Math.random()*gx)*s)

			let gy = ctx.canvas.height/s
			this.y= 1+(Math.floor(Math.random()*gy)*s)
		}
	}
}
