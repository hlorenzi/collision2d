class Player
{
	constructor(position = null)
	{
		this.position = position != null ? position : new Vec2(0, 0)
		this.radius = 15
		
		this.useGravity = true
		
		this.onGround = false
		this.onGroundLast = false
		this.jumping = false
		
		this.speedGravity = new Vec2(0, 0)
		this.speedMovement = new Vec2(0, 0)
	}
	
	
	step(input, solver)
	{
		if (input.toggle)
		{
			this.useGravity = !this.useGravity
			input.toggle = false
		}
		
		this.processHorizontalMovement(input, solver)
		this.processVerticalMovement(input, solver)
		
		while (this.position.y > canvasHeight)
			this.position.y -= canvasHeight
	}
	
	
	processHorizontalMovement(input, solver)
	{
		let accel = new Vec2(input.left ? -1 : input.right ? 1 : 0, 0)
		if (!this.useGravity)
			accel = accel.add(new Vec2(0, input.up ? -1 : input.down ? 1 : 0))
		
		this.speedMovement = this.speedMovement.add(accel)
		
		if (this.speedMovement.magn() > 5)
			this.speedMovement = this.speedMovement.norm().scale(5)
		
		let noInput = !input.left && !input.right
		if (!this.useGravity)
			noInput &= !input.up && !input.down
		
		if (noInput && this.speedMovement.magn() > 0)
			this.speedMovement = this.speedMovement.norm().scale(Math.max(this.speedMovement.magn() - 1, 0))
		
		let solverResult = solver.solveCircle(this.position, this.speedMovement, this.radius)
		this.position = solverResult.position
	}
	
	
	processVerticalMovement(input, solver)
	{
		if (!this.useGravity)
			return
		
		this.speedGravity = this.speedGravity.add(new Vec2(0, 0.5))
		if (this.speedGravity.magn() > 20)
			this.speedGravity = this.speedGravity.norm().scale(20)
		
		if (this.speedGravity.y >= 0)
			this.jumping = false
		
		if (this.jumping && !input.up)
		{
			this.speedGravity.y *= 0.25
			this.jumping = false
		}
		
		const prevPosition = this.position
		
		const solverOffset = new Vec2(0, 1)
		const solverResultNoSlide = solver.solveCircleNoSlide(this.position.add(this.speedGravity), new Vec2(0, 1), this.radius)
		
		const groundRaycastOffset = 1
		const groundRaycast = solver.raycast(this.position.add(new Vec2(0, -groundRaycastOffset)), new Vec2(0, 1), this.radius)
		const groundDistance = (groundRaycast == null ? Infinity : groundRaycast.point.sub(this.position).magn() - groundRaycastOffset)
		const groundNormal = (groundRaycast == null ? new Vec2(0, -1) : groundRaycast.normal)
		const groundSteepness = groundNormal.dot(new Vec2(0, -1))
		const groundIsSteep = (groundSteepness < 0.3 || solverResultNoSlide.normal.dot(new Vec2(0, -1)) < groundSteepness * 0.95)
		const isInside = solver.isInside(this.position, this.radius)
		
		console.log(groundNormal.dot(new Vec2(0, -1)), solverResultNoSlide.normal.dot(new Vec2(0, -1)))
		this.onGroundLast = this.onGround
		this.onGround = solverResultNoSlide.collided && this.speedGravity.y >= 0 && groundDistance < 2
		
		if (this.speedGravity.y >= 0 && !isInside && !groundIsSteep && this.onGroundLast && groundDistance < 20 && groundRaycast != null)
		{
			this.position = groundRaycast.point
			this.onGround = true
		}
		else if (this.speedGravity.y < 0 || groundIsSteep)
		{
			let solverResult = solver.solveCircle(this.position, this.speedGravity, this.radius)
			let movedDistance = solverResult.position.sub(this.position).magn()
			
			this.position = solverResult.position
			
			if (this.speedGravity.y < 0)
				this.speedGravity = this.speedGravity.norm().scale(Math.min(this.speedGravity.magn(), movedDistance * 2))
		}
		else if (this.speedGravity.y > 0)
		{
			this.position = solverResultNoSlide.position// this.position.add(this.speedGravity.norm().scale(Math.min(this.speedGravity.magn(), groundDistance)))
		}
		
		this.speedGravity = new Vec2(0, this.position.y - prevPosition.y)
		
		if (this.onGround && !groundIsSteep)
		{
			this.speedGravity = new Vec2(0, 0)
			
			if (input.up)
			{
				console.log("jumped")
				this.speedGravity = new Vec2(0, -12)
				this.jumping = true
			}
		}
	}
}