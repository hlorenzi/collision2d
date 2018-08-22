class Player
{
	constructor(position = null)
	{
		this.position = position != null ? position : new Vec2(0, 0)
		this.radius = 15
		
		this.onGround = false
		this.jumping = false
		
		this.speedGravity = new Vec2(0, 0)
		this.speedMovement = new Vec2(0, 0)
	}
	
	
	step(input, solver)
	{
		this.processHorizontalMovement(input, solver)
		this.processVerticalMovement(input, solver)
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
		
		if (this.jumping && !input.up)
		{
			this.speedGravity.y *= 0.25
			this.jumping = false
		}
		
		let raycastDownwards = solver.raycast(this.position.add(new Vec2(0, -1)), new Vec2(0, 1), this.radius)
		//if (raycastDownwards != null)
		//	console.log(raycastDownwards.point.sub(this.position).magn().toFixed(8))
		
		let solverResult = solver.solveCircle(this.position, this.speedGravity, this.radius)
		this.position = solverResult.position
		
		if (solverResult.collided)
		{
			if (input.up && this.speedGravity.y >= 0)
			{
				this.speedGravity = new Vec2(0, -12)
				this.jumping = true
			}
			else
			{
				this.speedGravity = new Vec2(0, 0)
				this.jumping = false
			}
		}
		
		if (this.speedGravity.y >= 0)
			this.jumping = false
		
		while (this.position.y > canvasHeight)
			this.position.y -= canvasHeight
	}
}