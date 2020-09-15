import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js'

export default class SimpleRenderer {
    constructor(boidsController) {
        this.boidsController = boidsController;
        this.entityMeshes = {};
        this.obstacleMeshes = {};

        this.isDragging = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.degX = 45;
        this.degY = 60;
        const b = this.boidsController.getBoundary();
        this.cameraMax = Math.max(b[0], b[1], b[2]);
        this.cameraRadius = this.cameraMax;

        this.stats = undefined;
    }

    init() {
        this.initStats();

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100000 );
        this.camera.position.z = 0;
     
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
     
        this.entityGeometry = new THREE.BoxGeometry( 5, 5, 15 );
        this.obstacleGeometry = new THREE.SphereGeometry( 50, 15, 15 );
        this.entityMaterial = new THREE.MeshNormalMaterial();
        this.obstacleMaterial = new THREE.MeshNormalMaterial();

        // create boundary wireframe
        const b = this.boidsController.getBoundary();
        var geometry = new THREE.BoxGeometry(b[0], b[1], b[2]);
        var wireframe = new THREE.EdgesGeometry(geometry);
        var line = new THREE.LineSegments(wireframe);
        line.material.depthTest = false;
        line.material.color = new THREE.Color( 0x000000 );
        line.material.transparent = false;
        line.position.x = b[0]/2;
        line.position.y = b[1]/2;
        line.position.z = b[2]/2;
        this.scene.add(line);
     
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));

        this.updateCamera();
        this.drawAnimationFrame();
    }

    initStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
    }

    onMouseMove(e) {
        if(!this.isDragging) {
            return;
        }
    
        const dx = e.offsetX - this.mouseX;
        const dy = e.offsetY - this.mouseY;

        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
    
        this.degX += dx;
        if(this.degX > 360) this.degX = 0;
        if(this.degX < 0) this.degX = 360;

        this.degY += dy/3;
        this.degY = Math.max(0.1, this.degY);
        this.degY = Math.min(179.9, this.degY);
        
        this.updateCamera();
    }

    onMouseUp(e) {
        this.isDragging = false;
    }

    onMouseWheel(e) {
        e.preventDefault();
        this.cameraRadius += e.deltaY * -1;
        this.cameraRadius = Math.max(1, this.cameraRadius);
        this.cameraRadius = Math.min(this.cameraMax, this.cameraRadius);
        this.updateCamera();
    }

    updateCamera() {
        const b = this.boidsController.getBoundary();
        const midX = b[0]/2;
        const midY = b[1]/2;
        const midZ = b[2]/2;

        const degXPI = this.degX*Math.PI/180;
        const degYPI = this.degY*Math.PI/180;
        this.camera.position.x = midX + Math.sin(degXPI)*Math.sin(degYPI)*this.cameraRadius;
        this.camera.position.z = midZ + Math.cos(degXPI)*Math.sin(degYPI)*this.cameraRadius;
        this.camera.position.y = midY + Math.cos(degYPI)*this.cameraRadius;

        this.camera.lookAt(midX, midY, midZ);
    }

    drawAnimationFrame() {
        window.requestAnimationFrame(this.drawAnimationFrame.bind(this));

        this.stats.begin();

        const entities = this.boidsController.getFlockEntities();
        entities.forEach(entity => {
            const x = entity.x;
            const y = entity.y;
            const z = entity.z;
            const vx = entity.vx;
            const vy = entity.vy;
            const vz = entity.vz;
            if(!this.entityMeshes[entity.id]) {
                const m = new THREE.Mesh(this.entityGeometry, this.entityMaterial);
                this.scene.add(m);
                this.entityMeshes[entity.id] = m;
            }

            const mesh = this.entityMeshes[entity.id];
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = z;
            mesh.lookAt(x + vx, y + vy, z + vz);
        });

        const obstacles = this.boidsController.getObstacleEntities();
        obstacles.forEach(entity => {
            const x = entity.x;
            const y = entity.y;
            const z = entity.z;
            if(!this.obstacleMeshes[entity.id]) {
                const m = new THREE.Mesh(this.obstacleGeometry, this.obstacleMaterial);
                this.scene.add(m);
                this.obstacleMeshes[entity.id] = m;
            }

            const mesh = this.obstacleMeshes[entity.id];
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = z;
        })
        
        // iterate
        this.boidsController.iterate();

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
    }
}