let canvas = null
let ctx = null
let canvasWidth = 0
let canvasHeight = 0


let solver = null
let circle = null
let polygonData = null


let input =
{
	reset: false,
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
	
	solver = new Solver()
	/*for (let i = 0; i < 10; i++)
	{
		solver.segments.push(new SolverSegment(
			new Vec2(Math.random() * canvasWidth, Math.random() * canvasHeight),
			new Vec2(Math.random() * canvasWidth, Math.random() * canvasHeight)))
	}*/
	
	polygonData = []
	for (let i = 0; i < 10; i++)
		polygonData.push(
		{
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			w: Math.random() * 200,
			h: Math.random() * 200,
			edgeNum: 3 + Math.floor(Math.random() * 9),
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() * 2 - 1) * 0.05
		})
	
	circle =
	{
		position: new Vec2(canvasWidth / 2, canvasHeight / 2),
		radius: 15,
		
		jumping: false,
		speedGravity: new Vec2(0, 0),
		speedMovement: new Vec2(0, 0)
	}
	
	draw()
	
	window.onkeydown = (ev) => onKey(ev, true)
	window.onkeyup = (ev) => onKey(ev, false)
	window.requestAnimationFrame(step)
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
		
		default:
			return
	}
	
	ev.preventDefault()
}


function step()
{
	solver.polygons = []
	for (let polygon of polygonData)
	{
		polygon.rotation += polygon.rotationSpeed
		
		solver.polygons.push(SolverPolygon.regularPolygon(
			polygon.x, polygon.y,
			polygon.w, polygon.h,
			polygon.edgeNum,
			polygon.rotation))
	}
	
	{
		let moveSpeed = new Vec2(input.left ? -1 : input.right ? 1 : 0, 0)
			
		if (moveSpeed.magn() > 0)
			moveSpeed = moveSpeed.norm().scale(5)
		
		let solverResult = solver.solveCircle(circle.position, moveSpeed, circle.radius)
		circle.position = solverResult.position
	}
	
	{
		circle.speedGravity = circle.speedGravity.add(new Vec2(0, 0.5))
		if (circle.speedGravity.magn() > 20)
			circle.speedGravity = circle.speedGravity.norm().scale(20)
		
		if (circle.jumping && !input.up)
		{
			circle.speedGravity.y *= 0.25
			circle.jumping = false
		}
		
		let solverResult = solver.solveCircle(circle.position, circle.speedGravity, circle.radius)
		circle.position = solverResult.position
		
		if (solverResult.collided)
		{
			if (input.up && circle.speedGravity.y >= 0)
			{
				circle.speedGravity = new Vec2(0, -12)
				circle.jumping = true
			}
			else
			{
				circle.speedGravity = new Vec2(0, 0)
				circle.jumping = false
			}
		}
		
		if (circle.speedGravity.y >= 0)
			circle.jumping = false
		
		while (circle.position.y > canvasHeight)
			circle.position.y -= canvasHeight
	}
	
	draw()
	window.requestAnimationFrame(step)
}


function draw()
{
	ctx.fillStyle = "#fff"
	ctx.fillRect(0, 0, canvasWidth, canvasHeight)
	
	ctx.strokeStyle = "#000"
	ctx.fillStyle = "#000"
	for (let segment of solver.segments)
	{
		ctx.beginPath()
		ctx.moveTo(segment.v1.x, segment.v1.y)
		ctx.lineTo(segment.v2.x, segment.v2.y)
		ctx.stroke()
		
		/*ctx.beginPath()
		ctx.arc(segment.v1.x, segment.v1.y, 4, 0, Math.PI * 2)
		ctx.fill()*/
	}
	
	for (let polygon of solver.polygons)
	{
		ctx.beginPath()
		ctx.moveTo(polygon.vertices[0].x, polygon.vertices[0].y)
		
		for (let i = 1; i < polygon.vertices.length; i++)
			ctx.lineTo(polygon.vertices[i].x, polygon.vertices[i].y)
		
		ctx.lineTo(polygon.vertices[0].x, polygon.vertices[0].y)
		ctx.stroke()
		
		/*ctx.beginPath()
		ctx.arc(polygon.vertices[0].x, polygon.vertices[0].y, 4, 0, Math.PI * 2)
		ctx.arc(polygon.vertices[1].x, polygon.vertices[1].y, 4, 0, Math.PI * 2)
		ctx.fill()*/
	}
	
	/*for (let segment1 of solver.segments)
	{
		for (let segment2 of solver.segments)
		{
			if (segment1 == segment2)
				continue
			
			let intersection = Geometry.segmentSegmentIntersection2d(
				segment1.v1, segment1.v2,
				segment2.v1, segment2.v2)
				
			if (intersection != null)
			{
				ctx.strokeStyle = "#f00"
				ctx.beginPath()
				ctx.arc(intersection.point.x, intersection.point.y, 4, 0, Math.PI * 2)
				ctx.stroke()
			}
		}
	}*/
	
	ctx.strokeStyle = "#00f"
	ctx.beginPath()
	ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, Math.PI * 2)
	ctx.stroke()
}