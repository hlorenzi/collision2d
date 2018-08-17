class Geometry
{
	static lineLineIntersection2d(a1, a2, b1, b2)
	{
		const al = a2.sub(a1)
		const bl = b2.sub(b1)
		
		const alCrossBl = al.cross(bl)
		
		if (alCrossBl == 0)
			return null
		
		const at = b1.sub(a1).cross(bl.scale(1 / alCrossBl))
		const bt = b1.sub(a1).cross(al.scale(1 / alCrossBl))
		
		const point = a1.add(al.scale(at))
		
		return { point, at, bt }
	}
	
	
	static segmentSegmentIntersection2d(a1, a2, b1, b2)
	{
		const intersect = Geometry.lineLineIntersection2d(a1, a2, b1, b2)
		
		if (intersect == null ||
			intersect.at < 0 || intersect.at > 1 ||
			intersect.bt < 0 || intersect.bt > 1)
			return null
			
		return intersect
	}
	
	
	static raySegmentIntersection2d(rayV1, rayV2, segmentV1, segmentV2)
	{
		const intersect = Geometry.lineLineIntersection2d(rayV1, rayV2, segmentV1, segmentV2)
		
		if (intersect == null ||
			intersect.at < 0 ||
			intersect.bt < 0 || intersect.bt > 1)
			return null
			
		return intersect
	}
	
	
	static sweptCircleLineIntersection2d(circleSweepV1, circleSweepV2, circleRadius, lineV1, lineV2)
	{
		let segmentNormal = lineV2.sub(lineV1).clockwisePerpendicular().norm()
		if (circleSweepV2.sub(circleSweepV1).dot(segmentNormal) > 0)
			segmentNormal = segmentNormal.neg()
		
		const segmentNormalScaled = segmentNormal.scale(circleRadius)
		const intersect = Geometry.lineLineIntersection2d(circleSweepV1.sub(segmentNormalScaled), circleSweepV2.sub(segmentNormalScaled), lineV1, lineV2)
		
		if (intersect == null ||
			intersect.at < 0)
			return null
			
		intersect.point = intersect.point.add(segmentNormalScaled)
		intersect.normal = segmentNormal
		
		return intersect
	}
	
	
	static sweptCircleSegmentIntersection2d(circleSweepV1, circleSweepV2, circleRadius, segmentV1, segmentV2)
	{
		let intersect = Geometry.sweptCircleLineIntersection2d(circleSweepV1, circleSweepV2, circleRadius, segmentV1, segmentV2)
		
		if (intersect == null ||
			intersect.at < 0 ||
			intersect.bt < 0 || intersect.bt > 1)
			intersect = null
			
		let minDistanceToIntersect = (intersect == null ? Infinity : intersect.point.sub(circleSweepV1).magn())
			
		const circleDistanceToSegmentV1 = segmentV1.sub(circleSweepV1).magn()
		const circleDistanceToSegmentV2 = segmentV2.sub(circleSweepV1).magn()
		
		const segmentDirection = segmentV2.sub(segmentV1)
		
		if (circleDistanceToSegmentV1 < minDistanceToIntersect)
		{
			const normal = circleSweepV1.sub(segmentV1).norm()
			if (normal.dot(circleSweepV2.sub(circleSweepV1)) < 0 && normal.dot(segmentDirection) < 0)
			{
				intersect = { point: segmentV1.add(normal.scale(circleRadius - 0.001)), normal }
				minDistanceToIntersect = circleDistanceToSegmentV1
			}
		}
		
		if (circleDistanceToSegmentV2 < minDistanceToIntersect)
		{
			let normal = circleSweepV1.sub(segmentV2).norm()
			if (normal.dot(circleSweepV2.sub(circleSweepV1)) < 0 && normal.dot(segmentDirection) > 0)
			{
				intersect = { point: segmentV2.add(normal.scale(circleRadius - 0.001)), normal }
				minDistanceToIntersect = circleDistanceToSegmentV2
			}
		}
		
		return intersect
	}
}