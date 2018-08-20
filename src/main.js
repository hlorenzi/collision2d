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
			x: Math.random() * (canvasWidth - 200),
			y: Math.random() * (canvasHeight - 200),
			w: Math.random() * 200,
			h: Math.random() * 200,
			edgeNum: 3 + Math.floor(Math.random() * 9),
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() * 2 - 1) * 0.05
		})
	
	circle = { position: new Vec2(canvasWidth / 2, canvasHeight / 2), radius: 15 }
	
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
	
	let circleSpeed = new Vec2(
		input.left ? -1 : input.right ? 1 : 0,
		input.up ? -1 : input.down ? 1 : 0)
		
	if (circleSpeed.magn() > 0)
		circleSpeed = circleSpeed.norm().scale(5)
		
	let solverResult = solver.solveCircle(circle.position, circleSpeed, circle.radius)
	circle.position = solverResult.position
	
	draw()
	
	/*ctx.strokeStyle = "#ddd"
	ctx.beginPath()
	ctx.moveTo(circle.position.x, circle.position.y)
	ctx.lineTo(circle.position.x + circleSpeed.x * 10000, circle.position.y + circleSpeed.y * 10000)
	ctx.stroke()
	
	if (solverResult.intersect != null)
	{
		ctx.strokeStyle = "#f0f"
		ctx.beginPath()
		ctx.arc(solverResult.intersect.point.x, solverResult.intersect.point.y, 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.strokeStyle = "#f80"
		ctx.beginPath()
		ctx.moveTo(solverResult.intersect.point.x, solverResult.intersect.point.y)
		ctx.lineTo(solverResult.intersect.point.x + solverResult.intersect.normal.x * 15, solverResult.intersect.point.y + solverResult.intersect.normal.y * 15)
		ctx.stroke()
	}*/
	
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