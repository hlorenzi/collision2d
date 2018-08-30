let canvas = null
let ctx = null
let canvasWidth = 0
let canvasHeight = 0

let gravity = null
let player = null
let segment = null


let input =
{
	reset: false,
	toggle: false,
	debug: false,
	up: false,
	down: false,
	left: false,
	right: false
}


function main()
{
	canvas = document.getElementById("canvasGame")
	canvasWidth = canvas.width
	canvasHeight = canvas.height
	ctx = canvas.getContext("2d")
	
	gravity = new Vec2(0, 1)
	player = { position: new Vec2(0, -100), radius: 15 }
	segment = { v1: new Vec2(-100, 100), v2: new Vec2(100, -50) }
	
	draw()
	
	window.onkeydown = (ev) => onKey(ev, true)
	window.onkeyup = (ev) => onKey(ev, false)
	window.onresize = (ev) => onResize()
	window.onmousemove = (ev) => onMouseMove(ev)
	window.requestAnimationFrame(step)
	
	onResize()
}


function onResize()
{
	//canvasWidth = canvas.width = window.innerWidth
	//canvasHeight = canvas.height = window.innerHeight
}


function onKey(ev, down)
{
	switch (ev.key.toLowerCase())
	{
		case "arrowup":
		case "w":
			input.up = down
			break
			
		case "arrowdown":
		case "s":
			input.down = down
			break
			
		case "arrowleft":
		case "a":
			input.left = down
			break
			
		case "arrowright":
		case "d":
			input.right = down
			break
			
		case "r":
			input.reset = down
			break
			
		case "t":
			input.toggle = down
			break
			
		case "h":
			input.debug = down
			break
		
		default:
			return
	}
	
	ev.preventDefault()
}


function getMousePosFromEvent(ev, elem)
{
	let rect = elem.getBoundingClientRect()
	
	return new Vec2(ev.clientX - rect.left - canvasWidth / 2, ev.clientY - rect.top - canvasHeight / 2)
}
	
	
function onMouseMove(ev)
{
	let pos = getMousePosFromEvent(ev, canvas)
	
	gravity = pos.norm()
}


function step()
{
	draw()
	window.requestAnimationFrame(step)
}


let timer = 0
function draw()
{
	ctx.save()
	
	ctx.fillStyle = "#fff"
	ctx.fillRect(0, 0, canvasWidth, canvasHeight)
	
	ctx.translate(canvasWidth / 2, canvasHeight / 2)
	
	timer += 1
	
	let testV1 = new Vec2(-350, 200)
	let testV2 = new Vec2( 350, 200)
	for (let i = 0; i <= 15; i++)
	{
		let ballPos = testV1.add(testV2.sub(testV1).scale((i + (timer * 0.0025) % 1) / 15))
		
		let collision = Geometry.circleSegmentNoSlideCollision2d(ballPos, gravity, player.radius, segment.v1, segment.v2)
		if (collision == null)
			collision = { point: ballPos, normal: new Vec2(0, 0) }
		
		ctx.strokeStyle = "#ccc"
		ctx.beginPath()
		ctx.arc(ballPos.x, ballPos.y, player.radius, 0, Math.PI * 2)
		ctx.moveTo(ballPos.x, ballPos.y)
		ctx.lineTo(collision.point.x, collision.point.y)
		ctx.stroke()
		
		ctx.strokeStyle = "#00f"
		ctx.beginPath()
		ctx.arc(collision.point.x, collision.point.y, player.radius, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.strokeStyle = "#fa0"
		ctx.beginPath()
		ctx.moveTo(collision.point.x - collision.normal.x * 15, collision.point.y - collision.normal.y * 15)
		ctx.lineTo(collision.point.x + collision.normal.x * 15, collision.point.y + collision.normal.y * 15)
		ctx.stroke()
	}
	
	ctx.strokeStyle = "#000"
	ctx.beginPath()
	ctx.moveTo(segment.v1.x, segment.v1.y)
	ctx.lineTo(segment.v2.x, segment.v2.y)
	ctx.stroke()
	
	ctx.restore()
}