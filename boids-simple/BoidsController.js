export default class BoidsController {
    constructor(boundaryX = 500, boundaryY = 500, boundaryZ = 500) {
        this.flockEntities = [];
        this.obstacleEntities = [];

        this.boundaryX = boundaryX;
        this.boundaryY = boundaryY;
        this.boundaryZ = boundaryZ;

        this.aligmentWeight = 2.0;
        this.cohesionWeight = 1.5;
        this.separationWeight = 0.3;

        this.maxEntitySpeed = 5;

        this.aligmentRadius = 100;
        this.cohesionRadius = 100;
        this.separationRadius = 100;
        this.obstacleRadius = 100;
    }

    addFlockEntity(entity) {
        this.flockEntities.push(entity);
    }

    getFlockEntities() {
        return this.flockEntities;
    }

    addObstacleEntity(entity) {
        this.obstacleEntities.push(entity);
    }

    getObstacleEntities() {
        return this.obstacleEntities;
    }

    getBoundary() {
        return [this.boundaryX, this.boundaryY, this.boundaryZ];
    }

    setMaxSpeed(s) {
        this.maxEntitySpeed = s;
    }

    setAligmentWeight(w) {
        this.aligmentWeight = w;
    }

    setCohesionWeight(w) {
        this.cohesionWeight = w;
    }

    setSeparationWeight(w) {
        this.separationWeight = w;
    }

    setBoundary(x, y, z) {
        this.boundaryX = x;
        this.boundaryY = y;
        this.boundaryZ = z;
    }

    iterate() {
        this.flockEntities.forEach(entity => {
            const aligmentVel = this.computeAlignment(entity);
            const cohVel = this.computeCohesion(entity);
            const sepVel = this.computeSeparation(entity);
            const obsVel = this.computeObstacles(entity);

            // add components
            const vx = this.aligmentWeight*aligmentVel[0] + this.cohesionWeight*cohVel[0] +
                        50*this.separationWeight*sepVel[0] + 50*obsVel[0];
            const vy = this.aligmentWeight*aligmentVel[1] + this.cohesionWeight*cohVel[1] +
                        50*this.separationWeight*sepVel[1] + 50*obsVel[1];
            const vz = this.aligmentWeight*aligmentVel[2] + this.cohesionWeight*cohVel[2] +
                        50*this.separationWeight*sepVel[2] + 50*obsVel[2];

            entity.addVelocity(vx, vy, vz);
            entity.move(this.maxEntitySpeed, this.boundaryX, this.boundaryY, this.boundaryZ);
        })
    }

    computeAlignment(entity) {
        let aligmentX = 0;
        let aligmentY = 0;
        let aligmentZ = 0;
        let neighborCount = 0;

        this.flockEntities.forEach(currentEntity => {
            if(currentEntity != entity &&
                Math.abs(entity.x-currentEntity.x) < this.aligmentRadius &&
                Math.abs(entity.y-currentEntity.y) < this.aligmentRadius &&
                Math.abs(entity.z-currentEntity.z) < this.aligmentRadius &&
                entity.getDistance(currentEntity) < this.aligmentRadius) {
                neighborCount++;
                aligmentX += currentEntity.vx;
                aligmentY += currentEntity.vy;
                aligmentZ += currentEntity.vz;
            }
        });


        if(neighborCount > 0)
        {
            aligmentX /= neighborCount;
            aligmentY /= neighborCount;
            aligmentZ /= neighborCount;
            const aligmentMag = Math.sqrt((aligmentX*aligmentX)+(aligmentY*aligmentY)+(aligmentZ*aligmentZ));
            aligmentX /= aligmentMag;
            aligmentY /= aligmentMag;
            aligmentZ /= aligmentMag;
        }

        return [aligmentX, aligmentY, aligmentZ];
    }

    computeCohesion(entity) {
        let cohX = 0;
        let cohY = 0;
        let cohZ = 0;
        let neighborCount = 0;

        this.flockEntities.forEach(currentEntity => {
            if(currentEntity != entity &&
                Math.abs(entity.x-currentEntity.x) < this.cohesionRadius &&
                Math.abs(entity.y-currentEntity.y) < this.cohesionRadius &&
                Math.abs(entity.z-currentEntity.z) < this.cohesionRadius &&
                entity.getDistance(currentEntity) < this.cohesionRadius) {
                neighborCount++;
                cohX += currentEntity.x;
                cohY += currentEntity.y;
                cohZ += currentEntity.z;
            }
        });

        if(neighborCount > 0)
        {
            cohX /= neighborCount;
            cohY /= neighborCount;
            cohZ /= neighborCount;

            cohX = cohX - entity.x;
            cohY = cohY - entity.y;
            cohZ = cohZ - entity.z;

            var cohMag = Math.sqrt((cohX*cohX)+(cohY*cohY)+(cohZ*cohZ));
            cohX /= cohMag;
            cohY /= cohMag;
            cohZ /= cohMag;
        }

        return [cohX, cohY, cohZ];
    }

    computeSeparation(entity) {
        let sepX = 0;
        let sepY = 0;
        let sepZ = 0;
        let neighborCount = 0;

        this.flockEntities.forEach(currentEntity => {
            if(Math.abs(entity.x-currentEntity.x) > this.separationRadius ||
            Math.abs(entity.y-currentEntity.y) > this.separationRadius ||
            Math.abs(entity.z-currentEntity.z) > this.separationRadius)
            {
                return;
            }

            const distance = entity.getDistance(currentEntity);
            if(currentEntity != entity && distance < this.separationRadius) {
                neighborCount++;
                const sx = entity.x - currentEntity.x;
                const sy = entity.y - currentEntity.y;
                const sz = entity.z - currentEntity.z;
                sepX += (sx/distance)/distance;
                sepY += (sy/distance)/distance;
                sepZ += (sz/distance)/distance;
            }
        });

        return [sepX, sepY, sepZ];
    }

    computeObstacles(entity) {
        let avoidX = 0;
        let avoidY = 0;
        let avoidZ = 0;

        this.obstacleEntities.forEach(currentObstacle => {
            if(Math.abs(entity.x-currentObstacle.x) > this.obstacleRadius ||
            Math.abs(entity.y-currentObstacle.y) > this.obstacleRadius ||
            Math.abs(entity.z-currentObstacle.z) > this.obstacleRadius)
            {
                return;
            }

            const distance = entity.getDistance(currentObstacle);
            if(distance > 0 && distance < this.obstacleRadius) {
                const ox = entity.x - currentObstacle.x;
                const oy = entity.y - currentObstacle.y;
                const oz = entity.z - currentObstacle.z;
                avoidX += (ox/distance)/distance;
                avoidY += (oy/distance)/distance;
                avoidZ += (oz/distance)/distance;
            }
        });

        return [avoidX, avoidY, avoidZ];
    }
}