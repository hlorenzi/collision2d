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
	
	
	static sweptCircleSegmentRaycast2d(circleSweepV1, circleSweepV2, circleRadius, segmentV1, segmentV2)
	{
		let intersect = Geometry.sweptCircleLineIntersection2d(circleSweepV1, circleSweepV2, circleRadius, segmentV1, segmentV2)
		let tRadius = circleRadius / segmentV2.sub(segmentV1).magn()
		
		if (intersect == null ||
			intersect.at < 0 ||
			intersect.bt < -tRadius || intersect.bt > 1 + tRadius)
			return null
			
		let edgeT = 0
		if (intersect.bt < 0) edgeT = -intersect.bt
		if (intersect.bt > 1) edgeT = intersect.bt - 1
		
		edgeT /= tRadius
		edgeT = Math.max(0, Math.min(1, edgeT))
		
		let sweepDir = circleSweepV2.sub(circleSweepV1).norm()
		
		intersect.point = intersect.point.add(sweepDir.scale(circleRadius * (1 - Math.sqrt(1 - edgeT * edgeT))))
		
		return intersect
	}
	
	
	static sweptCircleConvexPolygonIntersection2d(circleSweepV1, circleSweepV2, circleRadius, polygon)
	{
		let nearestIntersect = null
		let nearestIntersectDistanceSqr = null
		
		for (let i = 0; i < polygon.vertices.length; i++)
		{
			let v1 = polygon.vertices[i]
			let v2 = polygon.vertices[(i + 1) % polygon.vertices.length]
			
			let intersect = Geometry.sweptCircleSegmentIntersection2d(circleSweepV1, circleSweepV2, circleRadius, v1, v2)
			if (intersect == null)
				continue
			
			let distanceSqr = circleSweepV1.sub(intersect.point).magnSqr()
			if (nearestIntersectDistanceSqr == null || distanceSqr < nearestIntersectDistanceSqr)
			{
				nearestIntersect = intersect
				nearestIntersectDistanceSqr = distanceSqr
			}
		}
		
		return { intersect: nearestIntersect }
	}
	
	
	static sweptCircleConvexPolygonRaycast2d(circleSweepV1, circleSweepV2, circleRadius, polygon)
	{
		let nearestIntersect = null
		let nearestIntersectDistanceSqr = null
		
		for (let i = 0; i < polygon.vertices.length; i++)
		{
			let v1 = polygon.vertices[i]
			let v2 = polygon.vertices[(i + 1) % polygon.vertices.length]
			
			let intersect = Geometry.sweptCircleSegmentRaycast2d(circleSweepV1, circleSweepV2, circleRadius, v1, v2)
			if (intersect == null)
				continue
			
			let distanceSqr = circleSweepV1.sub(intersect.point).magnSqr()
			if (nearestIntersectDistanceSqr == null || distanceSqr < nearestIntersectDistanceSqr)
			{
				nearestIntersect = intersect
				nearestIntersectDistanceSqr = distanceSqr
			}
		}
		
		return { intersect: nearestIntersect }
	}
	
	
	static circleConvexPolygonCollision2d(circlePosition, circleRadius, polygon)
	{
		let collided = true
		let nearestResolutionVector = null
		let nearestResolutionDistanceSqr = null
		
		let testEdge = (v1, v2) =>
		{
			let edge = v2.sub(v1)
			let edgeOutsideNormal = edge.clockwisePerpendicular().norm()
			
			let nearestRelativePointInCircle = circlePosition.sub(edgeOutsideNormal.scale(circleRadius)).sub(v1)
			let isNearestPointInside = nearestRelativePointInCircle.dot(edgeOutsideNormal) < 0
			let resolutionVector = nearestRelativePointInCircle.project(edge).sub(nearestRelativePointInCircle)
			
			collided &= isNearestPointInside
			
			if (isNearestPointInside && (nearestResolutionDistanceSqr == null || resolutionVector.magnSqr() < nearestResolutionDistanceSqr))
			{
				nearestResolutionDistanceSqr = resolutionVector.magnSqr()
				nearestResolutionVector = resolutionVector
			}
		}
		
		for (let i = 0; i < polygon.vertices.length; i++)
		{
			let v1 = polygon.vertices[i]
			let v2 = polygon.vertices[(i + 1) % polygon.vertices.length]
			let v3 = polygon.vertices[(i + 2) % polygon.vertices.length]
			
			let edge12 = v2.sub(v1)
			let edge23 = v3.sub(v2)
			
			let normal12 = edge12.clockwisePerpendicular().norm()
			let normal23 = edge23.clockwisePerpendicular().norm()
			
			let normalAvg = normal12.add(normal23).norm()
			
			testEdge(v1, v2)
			testEdge(v2.sub(normalAvg.scale(0)), v2.sub(normalAvg.scale(0)).sub(normalAvg.clockwisePerpendicular()))
		}
		
		return { collided, nearestResolutionVector }
	}
	
	
	static circleSegmentNoSlideCollision2d(circlePosition, circleDirection, circleRadius, segmentV1, segmentV2)
	{
		let segmentLength = segmentV2.sub(segmentV1)
		let segmentNormal = segmentLength.clockwisePerpendicular().norm()
		
		if (circleDirection.dot(segmentNormal) >= 0)
			return null
		
		let nearestCirclePoint = circlePosition.sub(segmentNormal.scale(circleRadius))
		
		let nearestCirclePointRelative = nearestCirclePoint.sub(segmentV1)
		if (nearestCirclePointRelative.dot(segmentNormal) >= 0)
			return null
		
		let lineLineIntersect = Geometry.lineLineIntersection2d(nearestCirclePoint, nearestCirclePoint.add(circleDirection), segmentV1, segmentV2)
		if (lineLineIntersect == null)
			return null
		
		if (lineLineIntersect.bt >= 0 && lineLineIntersect.bt <= 1)
		{
			let resolutionPoint = lineLineIntersect.point.add(segmentNormal.scale(circleRadius))
			
			return { point: resolutionPoint, normal: segmentNormal }
		}
		
		let nearestVertex = (lineLineIntersect.bt > 0.5 ? segmentV2 : segmentV1)
		let nearestVertexRelative = nearestVertex.sub(circlePosition)
		
		let nearestVertexProjected = nearestVertexRelative.project(circleDirection)
		
		let nearestVertexProjectedDistanceSqr = nearestVertexProjected.sub(nearestVertexRelative).magnSqr()
		if (nearestVertexProjectedDistanceSqr > circleRadius * circleRadius)
			return null
		
		let resolutionPointDistance = Math.sqrt(circleRadius * circleRadius - nearestVertexProjectedDistanceSqr)
		if (resolutionPointDistance > circleRadius)
			return null
		
		let resolutionPoint = circlePosition.add(nearestVertexProjected).sub(circleDirection.scale(resolutionPointDistance))
		let resolutionNormal = resolutionPoint.sub(nearestVertex).norm()
		
		if (resolutionPoint.sub(circlePosition).dot(circleDirection) > 0)
			return null
		
		return { point: resolutionPoint, normal: resolutionNormal }
	}
	
	
	static circleConvexPolygonNoSlideCollision2d(circlePosition, circleDirection, circleRadius, polygon)
	{
		let collided = true
		let furthestResolutionPoint = null
		let furthestResolutionNormal = null
		let furthestResolutionPointDistanceSqr = null
		
		for (let i = 0; i < polygon.vertices.length; i++)
		{
			let v1 = polygon.vertices[i]
			let v2 = polygon.vertices[(i + 1) % polygon.vertices.length]
			
			let collision = Geometry.circleSegmentNoSlideCollision2d(circlePosition, circleDirection, circleRadius, v1, v2)
			if (collision == null)
				continue
			
			let resolutionPointDistanceSqr = collision.point.sub(circlePosition).magnSqr()
			if (furthestResolutionPointDistanceSqr == null || resolutionPointDistanceSqr > furthestResolutionPointDistanceSqr)
			{
				furthestResolutionPointDistanceSqr = resolutionPointDistanceSqr
				furthestResolutionPoint = collision.point
				furthestResolutionNormal = collision.normal
			}
		}
		
		if (furthestResolutionPoint == null)
			return null
		
		return { point: furthestResolutionPoint, normal: furthestResolutionNormal }
	}
}