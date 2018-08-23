class Solver
{
	constructor()
	{
		this.segments = []
		this.polygons = []
	}
	
	
	isInside(position, radius)
	{
		for (let polygon of this.polygons)
		{
			let collision = Geometry.circleConvexPolygonCollision2d(position, radius, polygon)
			if (collision.collided)
				return true
		}
		
		return false
	}
	
	
	raycast(position, direction, radius)
	{
		let nearestIntersect = null
		let nearestIntersectDistanceSqr = null
		
		for (let polygon of this.polygons)
		{
			let raycast = Geometry.sweptCircleConvexPolygonRaycast2d(position, position.add(direction), radius, polygon)
			if (raycast.intersect == null)
				continue
			
			let distanceSqr = position.sub(raycast.intersect.point).magnSqr()
			if (nearestIntersectDistanceSqr == null || distanceSqr < nearestIntersectDistanceSqr)
			{
				nearestIntersect = raycast.intersect
				nearestIntersectDistanceSqr = distanceSqr
			}
		}
		
		return nearestIntersect
	}
	
	
	raycastByCollision(position, step, radius)
	{
		for (let i = 0; i < 500; i += 1)
		{
			if (solver.isInside(position, radius))
				break
			
			position = position.add(step)
		}
		
		return { point: position, normal: new Vec2(0, -1) }
	}
	
	
	solveCircle(position, speed, radius)
	{
		position = position.add(speed)
		
		let collided = false
		
		for (let i = 0; i < 10; i++)
		{
			let resolutionVector = new Vec2(0, 0)
			for (let polygon of this.polygons)
			{
				let collision = Geometry.circleConvexPolygonCollision2d(position, radius, polygon)
				if (!collision.collided)
					continue
				
				collided = true
				resolutionVector = resolutionVector.add(collision.nearestResolutionVector)
			}
			
			position = position.add(resolutionVector)
			
			if (resolutionVector.magn() == 0)
				break
		}
		
		return { position, collided }
	}
	
	
	solveCircleIntersect(position, speed, radius)
	{
		if (speed.magn() == 0)
			return { position }
		
		let lastIntersect = null
		
		//console.log("--")
		//console.log("position", position)
		//console.log("speed", speed)
		for (let i = 0; i < 2; i++)
		{
			const result = this.intersectCircle(position, speed, radius)
			
			const lastPosition = position
			position = result.position
			
			if (result.intersect == null)
				break
			
			lastIntersect = result.intersect
			
			const distanceMoved = position.sub(lastPosition).magn()
			const distanceLeft = speed.magn() - distanceMoved
			
			if (distanceLeft <= 0)
				break
			
			speed = speed.norm().scale(distanceLeft).projectAlongLine(result.intersect.normal)
			//console.log(i + " position", position)
			//console.log(i + " speed", speed)
			//console.log(i + " normal", result.intersect.normal)
		}
		
		return { position, intersect: lastIntersect }
	}
	
	
	intersectCircle(position, speed, radius)
	{
		if (speed.magn() == 0)
			return { position }
		
		let nearestIntersect = null
		let nearestDistanceToIntersect = null
		
		for (let segment of this.segments)
		{
			const intersect = Geometry.sweptCircleSegmentIntersection2d(position, position.add(speed), radius, segment.v1, segment.v2)
			if (intersect == null)
				continue
			
			const distanceToIntersect = intersect.point.sub(position).magn()
			//if (distanceToIntersect > speed.magn() + radius)
			//	continue
			
			if (nearestIntersect == null ||
				distanceToIntersect < nearestDistanceToIntersect)
			{
				nearestIntersect = intersect
				nearestDistanceToIntersect = distanceToIntersect
			}
		}
		
		if (nearestIntersect == null)
			return { position: position.add(speed), intersect: nearestIntersect }
		
		let distanceToMove = Math.max(0, Math.min(speed.magn(), nearestDistanceToIntersect - 0.001))
		
		return { position: position.add(speed.norm().scale(distanceToMove)), intersect: nearestIntersect }
	}
}


class SolverSegment
{
	constructor(v1, v2)
	{
		this.v1 = v1
		this.v2 = v2
	}
}


class SolverPolygon
{
	constructor(vertices)
	{
		this.vertices = vertices
	}
	
	
	static rectangle(x, y, w, h)
	{
		return new SolverPolygon([
			new Vec2(x,     y),
			new Vec2(x + w, y),
			new Vec2(x + w, y + h),
			new Vec2(x,     y + h)])
	}
	
	
	static regularPolygon(x, y, w, h, edgeNum = 4, rotation = 0)
	{
		let vertices = []
		for (let i = 0; i < edgeNum; i++)
		{
			let angle = rotation + Math.PI + (i * Math.PI * 2 / edgeNum)
			vertices.push(new Vec2(
				x + Math.cos(angle) * w,
				y + Math.sin(angle) * h))
		}
		
		return new SolverPolygon(vertices)
	}
}