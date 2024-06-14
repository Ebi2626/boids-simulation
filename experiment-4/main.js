import BoidsController from '../common/BoidsController.js'
import SimpleRenderer from '../common/SimpleRenderer.js'
import ControlHelper from '../common/ControlHelper.js'

const EXPERIMENT_TIME = 2 * 60 * 1000; // 2 min

class Application {
    constructor() {
        this.flockEntityCount = 400;
        this.obstacleEntityCount = 50;
        this.simpleRenderer = undefined;
        this.boidsController = undefined;
        this.controlHelper = undefined;
        this.timer = document.querySelector('#time');

        this.isRunning = true;
        
        this.timeoutId = setTimeout(() => {
            this.isRunning = false;
            clearInterval(this.intervalId);
        }, EXPERIMENT_TIME);

        this.elapsedTime = 1;
        this.intervalId = setInterval(() => {
            this.elapsedTime += 1;
            this.timer.innerText = this.elapsedTime;
        }, 1000);
    }

    init() {
        // create a boids controller with the given boundary [2000, 600, 2000]
        this.boidsController = new BoidsController(2000, 600, 2000);

        // set experimental environment
        this.boidsController.setMaxSpeed(10);
        this.boidsController.setAligmentWeight(0);
        this.boidsController.setCohesionWeight(0);
        this.boidsController.setSeparationWeight(5);

        // create renderer and pass boidsController to render entities
        this.simpleRenderer = new SimpleRenderer({boidsController: this.boidsController});
        this.simpleRenderer.init();

        // create control helper for example controls
        this.controlHelper = new ControlHelper(this.boidsController, this.simpleRenderer);
        this.controlHelper.init();

        // add initial entities for an interesting view
        this.controlHelper.addBoids(this.flockEntityCount);
        this.controlHelper.addObstacles(this.obstacleEntityCount);
        
        // request the first animation frame
        window.requestAnimationFrame(this.render.bind(this));
    }

    render() {
        if(this.isRunning) {
            window.requestAnimationFrame(this.render.bind(this));
    
            // call statBegin() to measure time that is spend in BoidsController
            this.controlHelper.statBegin();
            
            // calculate boids entities
            this.boidsController.iterate();
    
            // update screen by rendering
            this.simpleRenderer.render();
            
            // call statEnd() to finalize measuring time
            this.controlHelper.statEnd();
        } else {
            clearTimeout(this.timeoutId);
        }

    }

}

// create the application when the document is ready
document.addEventListener('DOMContentLoaded', (new Application()).init());
