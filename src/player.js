class Player
{
	constructor(position = null)
	{
		this.position = position != null ? position : new Vec2(0, 0)
		this.radius = 15
		
		this.onGround = false
		this.onGroundLast = false
		this.jumping = false
		
		this.speedGravity = new Vec2(0, 0)
		this.speedMovement = new Vec2(0, 0)
	}
	
	
	step(input, solver)
	{
		this.processHorizontalMovement(input, solver)
		this.processVerticalMovement(input, solver)
		
		while (this.position.y > canvasHeight)
			this.position.y -= canvasHeight
	}
	
	
	processHorizontalMovement(input, solver)
	{
		let accel = new Vec2(input.left ? -1 : input.right ? 1 : 0, 0)
		this.speedMovement = this.speedMovement.add(accel)
		
		if (this.speedMovement.magn() > 5)
			this.speedMovement = this.speedMovement.norm().scale(5)
		
		if (!input.left && !input.right && this.speedMovement.magn() > 0)
			this.speedMovement = this.speedMovement.norm().scale(Math.max(this.speedMovement.magn() - 1, 0))
		
		let solverResult = solver.solveCircle(this.position, this.speedMovement, this.radius)
		this.position = solverResult.position
	}
	
	
	processVerticalMovement(input, solver)
	{
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
		
		let raycastYOffset = 1
		let raycastDownwards = solver.raycast(this.position.add(new Vec2(0, -raycastYOffset)), new Vec2(0, 1), this.radius)
		let isInside = solver.isInside(this.position, this.radius)
		
		let groundDistance = (raycastDownwards == null ? Infinity : raycastDownwards.point.sub(this.position).magn() - raycastYOffset)
		let groundNormal = (raycastDownwards == null ? new Vec2(0, -1) : raycastDownwards.normal)
		let groundIsSteep = (groundNormal.dot(new Vec2(0, -1)) < 0.3)
		
		this.onGroundLast = this.onGround
		this.onGround = (this.speedGravity.y >= 0 && groundDistance < 2)
		
		if (this.speedGravity.y >= 0 && !isInside && this.onGroundLast && groundDistance < 20 && raycastDownwards != null)
		{
			this.position = raycastDownwards.point
			this.onGround = true
		}
		
		if (this.speedGravity.y < 0 || groundIsSteep)
		{
			let solverResult = solver.solveCircle(this.position, this.speedGravity, this.radius)
			let movedDistance = solverResult.position.sub(this.position).magn()
			
			this.position = solverResult.position
			
			if (this.speedGravity.y < 0)
				this.speedGravity = this.speedGravity.norm().scale(Math.min(this.speedGravity.magn(), movedDistance * 2))
		}
		else if (this.speedGravity.y > 0)
		{
			this.position = this.position.add(this.speedGravity.norm().scale(Math.min(this.speedGravity.magn(), groundDistance)))
		}
		
		if (this.onGround && !groundIsSteep)
		{
			this.speedGravity = new Vec2(0, 0)
			
			if (input.up)
			{
				this.speedGravity = new Vec2(0, -12)
				this.jumping = true
			}
		}
	}
}