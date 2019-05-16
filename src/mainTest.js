let canvas = null
let ctx = null
let canvasWidth = 0
let canvasHeight = 0

let gravity = null
let player = null
let polygon = null

let mouseDown = false
let mousePos = null


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
	player = { position: new Vec2(0, 0), radius: 15 }
	polygon =
	{
		vertices: [
			new Vec2(-100, 100),
			new Vec2(100, -50),
			new Vec2(150, 150),
		]
	}
	
	mousePos = new Vec2(0, 0)
	draw()
	
	window.onkeydown = (ev) => onKey(ev, true)
	window.onkeyup = (ev) => onKey(ev, false)
	window.onresize = (ev) => onResize()
	window.onmousedown = (ev) => onMouseDown(ev)
	window.onmouseup = (ev) => onMouseUp(ev)
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
	
	
function onMouseDown(ev)
{
	mouseDown = true
	onMouseMove(ev)
}
	
	
function onMouseUp(ev)
{
	mouseDown = false
}
	
	
function onMouseMove(ev)
{
	mousePos = getMousePosFromEvent(ev, canvas)
	
	if (mouseDown)
	{
		if (mousePos.sub(player.position).magn() > 1)
			gravity = mousePos.sub(player.position).norm()
	}
	else
		player.position = mousePos
}


function step()
{
	draw()
	window.requestAnimationFrame(step)
}


let timer = 0
let mode = 0
function draw()
{
	ctx.save()
	
	ctx.fillStyle = "#fff"
	ctx.fillRect(0, 0, canvasWidth, canvasHeight)
	
	ctx.translate(canvasWidth / 2, canvasHeight / 2)
	
	//timer += 1
	
	if (input.toggle)
	{
		input.toggle = false
		mode = (mode + 1) % 2
	}
	
	let testV1 = player.position.sub(gravity.clockwisePerpendicular().scale(350))
	let testV2 = player.position.add(gravity.clockwisePerpendicular().scale(350))
	for (let i = 0; i <= 15; i++)
	{
		let ballPos = testV1.add(testV2.sub(testV1).scale((i + (timer * 0.0025) % 1) / 15))
		
		let resolutionVector = new Vec2(0, 0)
		let collisionNormal = new Vec2(0, 0)
		
		if (mode == 0)
		{
			let collision = Geometry.circleConvexPolygonCollision2d(ballPos, player.radius, polygon)
			if (collision.collided)
			{
				resolutionVector = collision.nearestResolutionVector
				collisionNormal = collision.nearestResolutionVector.norm()
			}
		}
		else
		{
			let collision = Geometry.circleConvexPolygonNoSlideCollision2d(ballPos, gravity, player.radius, polygon)
			if (collision != null)
			{
				resolutionVector = collision.point.sub(ballPos)
				collisionNormal = collision.normal
			}
		}
		
		const resolvedPos = ballPos.add(resolutionVector)
		
		ctx.strokeStyle = "#ccc"
		ctx.beginPath()
		ctx.arc(ballPos.x, ballPos.y, player.radius, 0, Math.PI * 2)
		ctx.moveTo(ballPos.x, ballPos.y)
		ctx.lineTo(resolvedPos.x, resolvedPos.y)
		ctx.stroke()
		
		ctx.strokeStyle = (mode == 0 ? "#00f" : "#f00")
		ctx.beginPath()
		ctx.arc(resolvedPos.x, resolvedPos.y, player.radius, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.strokeStyle = "#fa0"
		ctx.beginPath()
		ctx.moveTo(resolvedPos.x - collisionNormal.x * 15, resolvedPos.y - collisionNormal.y * 15)
		ctx.lineTo(resolvedPos.x + collisionNormal.x * 15, resolvedPos.y + collisionNormal.y * 15)
		ctx.stroke()
	}
	
	ctx.strokeStyle = "#000"
	ctx.beginPath()
	for (let i = 0; i < polygon.vertices.length; i++)
	{
		let v1 = polygon.vertices[i]
		let v2 = polygon.vertices[(i + 1) % polygon.vertices.length]
		
		ctx.moveTo(v1.x, v1.y)
		ctx.lineTo(v2.x, v2.y)
	}
	ctx.stroke()
	
	ctx.restore()
}