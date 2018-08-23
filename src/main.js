let canvas = null
let ctx = null
let canvasWidth = 0
let canvasHeight = 0


let solver = null
let player = null
let movingPlatforms = null


let input =
{
	reset: false,
	toggle: false,
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
	solver.polygons.push(new SolverPolygon([
		new Vec2(0, 300),
		new Vec2(300, 300),
		new Vec2(300, 600),
		new Vec2(0, 600)]))
	solver.polygons.push(new SolverPolygon([
		new Vec2(300, 300),
		new Vec2(600, 200),
		new Vec2(600, 600),
		new Vec2(300, 600)]))
	solver.polygons.push(new SolverPolygon([
		new Vec2(600, 200),
		new Vec2(750, 300),
		new Vec2(750, 600),
		new Vec2(600, 600)]))
	solver.polygons.push(new SolverPolygon([
		new Vec2(750, 300),
		new Vec2(900, 550),
		new Vec2(900, 600),
		new Vec2(750, 600)]))
	solver.polygons.push(new SolverPolygon([
		new Vec2(900, 550),
		new Vec2(930, 550),
		new Vec2(930, 600),
		new Vec2(900, 600)]))
	
	solver.polygons.push(new SolverPolygon([
		new Vec2(150, 200),
		new Vec2(300, 200),
		new Vec2(300, 210),
		new Vec2(150, 210)]))
	solver.polygons.push(new SolverPolygon([
		new Vec2(450, 150),
		new Vec2(600, 100),
		new Vec2(600, 110),
		new Vec2(450, 160)]))
		
	solver.polygons.push(new SolverPolygon([
		new Vec2(850, 250),
		new Vec2(900, 0),
		new Vec2(910, 450),
		new Vec2(900, 450)]))
		
	movingPlatforms = []
	movingPlatforms.push(
	{
		x: 1100,
		y: 600,
		w: 100,
		h: 100,
		edgeNum: 16,
		rotation: 0,
		rotationSpeed: 0.01,
		polygons: [ new SolverPolygon([]), new SolverPolygon([]), new SolverPolygon([]), new SolverPolygon([]), new SolverPolygon([]) ]
	})
	
	for (let m of movingPlatforms)
		for (let p of m.polygons)
			solver.polygons.push(p)
	
	/*for (let i = 0; i < 10; i++)
		polygonData.push(
		{
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			w: Math.random() * 200,
			h: Math.random() * 200,
			edgeNum: 3 + Math.floor(Math.random() * 9),
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() * 2 - 1) * 0.05
		})*/
		
	player = new Player(new Vec2(canvasWidth / 2, 100))
	
	draw()
	
	window.onkeydown = (ev) => onKey(ev, true)
	window.onkeyup = (ev) => onKey(ev, false)
	window.onresize = (ev) => onResize()
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
		
		default:
			return
	}
	
	ev.preventDefault()
}


function step()
{
	/*solver.polygons = []
	for (let polygon of polygonData)
	{
		polygon.rotation += polygon.rotationSpeed
		
		solver.polygons.push(SolverPolygon.regularPolygon(
			polygon.x, polygon.y,
			polygon.w, polygon.h,
			polygon.edgeNum,
			polygon.rotation))
	}*/
	
	for (let movingPlatform of movingPlatforms)
	{
		movingPlatform.rotation += movingPlatform.rotationSpeed
		
		movingPlatform.polygons[0].vertices = SolverPolygon.regularPolygon(
			movingPlatform.x, movingPlatform.y,
			movingPlatform.w, movingPlatform.h,
			movingPlatform.edgeNum, movingPlatform.rotation).vertices
			
		for (let i = 0; i < 4; i++)
		{
			let angle = i * Math.PI * 2 / 4 + movingPlatform.rotation
			
			movingPlatform.polygons[i + 1].vertices = SolverPolygon.regularPolygon(
				movingPlatform.x + Math.cos(angle) * movingPlatform.w,
				movingPlatform.y + Math.sin(angle) * movingPlatform.w,
				movingPlatform.w * 0.5, movingPlatform.w * 0.5,
				4, angle + Math.PI / 4).vertices
		}
	}
	
	player.step(input, solver)
	
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
		if (polygon.vertices.length == 0)
			continue
		
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
	
	/*let raycast = solver.raycast(player.position.add(new Vec2(0, -player.radius - 10)), new Vec2(0, 1), player.radius - 0.1)
	if (raycast != null)
	{
		ctx.strokeStyle = "#ccc"
		ctx.beginPath()
		ctx.moveTo(player.position.x, player.position.y)
		ctx.lineTo(raycast.point.x, raycast.point.y)
		ctx.stroke()
		
		ctx.strokeStyle = "#888"
		ctx.beginPath()
		ctx.arc(raycast.point.x, raycast.point.y, player.radius, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.strokeStyle = "#ccc"
		ctx.beginPath()
		ctx.arc(raycast.point.x, raycast.point.y, 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.strokeStyle = "#f80"
		ctx.beginPath()
		ctx.moveTo(raycast.point.x, raycast.point.y)
		ctx.lineTo(raycast.point.x + raycast.normal.x * 15, raycast.point.y + raycast.normal.y * 15)
		ctx.stroke()
	}*/
	
	ctx.strokeStyle = "#00f"
	ctx.beginPath()
	ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2)
	ctx.stroke()
}