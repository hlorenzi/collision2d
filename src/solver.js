class Solver
{
	constructor()
	{
		this.segments = []
	}
	
	
	solveCircle(position, speed, radius)
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