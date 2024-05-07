var ScreenToRayToScreen;
(function (ScreenToRayToScreen) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Render.initialize(true);
    window.addEventListener("load", init);
    ScreenToRayToScreen.root = new ƒ.Node("Root");
    let viewport;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    let labelDOM;
    let crc2;
    ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL - ƒ.DEBUG_FILTER.CLEAR);
    ƒ.Debug.setFilter(ƒ.DebugTextArea, ƒ.DEBUG_FILTER.ALL);
    function init() {
        ScreenToRayToScreen.args = new URLSearchParams(location.search);
        const canvas = document.querySelector("canvas");
        ƒ.Debug.log("Canvas", canvas);
        crc2 = canvas.getContext("2d");
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("click", canvas.requestPointerLock);
        labelDOM = document.createElement("span");
        labelDOM.appendChild(ƒ.DebugTextArea.textArea);
        document.body.appendChild(labelDOM);
        createScene();
        // setup viewport
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", ScreenToRayToScreen.root, ScreenToRayToScreen.camera.cmpCamera, canvas);
        ƒ.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.canvas.addEventListener("pointermove", hndPointerMove);
        viewport.canvas.addEventListener("wheel", hndWheelMove);
        // window.addEventListener("keydown", hndKeyDown);
        updateDisplay();
        ƒ.Debug.log("Game", ScreenToRayToScreen.root);
    }
    function hndPointerMove(_event) {
        if (document.pointerLockElement) {
            ScreenToRayToScreen.camera.rotateY(_event.movementX * speedCameraRotation);
            ScreenToRayToScreen.camera.rotateX(_event.movementY * speedCameraRotation);
            updateDisplay();
            return;
        }
        let posProjection = viewport.pointClientToProjection(new ƒ.Vector2(_event.offsetX, _event.offsetY));
        ƒ.Debug.clear();
        let ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));
        console.group("original");
        ƒ.Debug.log("origin", ray.origin.toString());
        ƒ.Debug.log("direction", ray.direction.toString());
        console.groupEnd();
        ray.direction.scale(ScreenToRayToScreen.camera.distance);
        ray.origin.transform(ScreenToRayToScreen.camera.cmpCamera.mtxPivot);
        ray.origin.transform(ScreenToRayToScreen.camera.cmpCamera.node.mtxWorld);
        ray.direction.transform(ScreenToRayToScreen.camera.cmpCamera.mtxPivot, false);
        ray.direction.transform(ScreenToRayToScreen.camera.cmpCamera.node.mtxWorld, false);
        console.group("transformed");
        ƒ.Debug.log("origin", ray.origin.toString());
        ƒ.Debug.log("direction", ray.direction.toString());
        console.groupEnd();
        let rayEnd = ƒ.Vector3.SUM(ray.origin, ray.direction);
        let posClip = ScreenToRayToScreen.camera.cmpCamera.pointWorldToClip(rayEnd);
        // let screen: ƒ.Vector2 = ƒ.Render.rectClip.pointToRect(projection.toVector2(), viewport.getCanvasRectangle());
        let screen = viewport.pointClipToClient(posClip.toVector2());
        console.group("end");
        ƒ.Debug.log("End", rayEnd.toString());
        ƒ.Debug.log("Projected", posClip.toString());
        ƒ.Debug.log("Screen", screen.toString());
        console.groupEnd();
        let mtxCube = ScreenToRayToScreen.root.getChildrenByName("Cube")[0].mtxLocal;
        mtxCube.translation = rayEnd;
        updateDisplay();
    }
    function hndWheelMove(_event) {
        ScreenToRayToScreen.camera.distance += _event.deltaY * speedCameraTranslation;
        updateDisplay();
    }
    function createScene() {
        ScreenToRayToScreen.root.addChild(new ƒAid.NodeCoordinateSystem());
        // set lights
        let cmpLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new ƒ.Vector3(-1, -3, -2));
        ScreenToRayToScreen.root.addComponent(cmpLight);
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(ƒ.Color.CSS("grey")));
        ScreenToRayToScreen.root.addComponent(cmpLightAmbient);
        // setup orbiting camera
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.clrBackground = ƒ.Color.CSS("white");
        ScreenToRayToScreen.camera = new ƒAid.CameraOrbit(cmpCamera, 5, 75, 3, 20);
        ScreenToRayToScreen.root.addChild(ScreenToRayToScreen.camera);
        // camera.node.addComponent(cmpLight);
        let cube = new ƒ.Node("Cube");
        let cmpMesh = new ƒ.ComponentMesh(new ƒ.MeshCube());
        cube.addComponent(cmpMesh);
        let cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material("Red", ƒ.ShaderFlat, new ƒ.CoatRemissive(ƒ.Color.CSS("RED"))));
        cube.addComponent(cmpMaterial);
        let cmpTransform = new ƒ.ComponentTransform();
        cube.addComponent(cmpTransform);
        ScreenToRayToScreen.root.addChild(cube);
    }
    function updateDisplay() {
        viewport.draw();
        drawLabels();
    }
    ScreenToRayToScreen.updateDisplay = updateDisplay;
    function drawLabels() {
        let mtxCube = ScreenToRayToScreen.root.getChildrenByName("Cube")[0].mtxWorld;
        let posClip = ScreenToRayToScreen.camera.cmpCamera.pointWorldToClip(mtxCube.translation);
        let posCanvas = viewport.pointClipToCanvas(posClip.toVector2());
        let posClient = viewport.pointClipToClient(posClip.toVector2());
        let posScreen = viewport.pointClientToScreen(posClient);
        ƒ.Debug.group("Cube");
        ƒ.Debug.clear();
        ƒ.Debug.info("End", mtxCube.translation.toString());
        ƒ.Debug.log("Projected", posClip.toString());
        ƒ.Debug.warn("Canvas", posCanvas.toString());
        ƒ.Debug.error("Client", posClient.toString());
        ƒ.Debug.log("Screen", posScreen.toString());
        ƒ.Debug.groupEnd();
        labelDOM.style.left = posScreen.x + 30 + "px";
        labelDOM.style.top = posScreen.y + 30 + "px";
        crc2.beginPath();
        crc2.arc(posCanvas.x, posCanvas.y, 2, 0, 2 * Math.PI);
        crc2.moveTo(posCanvas.x, posCanvas.y);
        posCanvas.subtract(ƒ.Vector2.ONE(50));
        crc2.lineTo(posCanvas.x, posCanvas.y);
        crc2.rect(posCanvas.x, posCanvas.y, -220, -100);
        let text = ƒ.DebugTextArea.textArea.textContent.split("\n");
        let posLineY = 0;
        for (let line of text)
            crc2.fillText(line, posCanvas.x - 210, posCanvas.y - 96 + (posLineY += 16), 200);
        crc2.stroke();
    }
})(ScreenToRayToScreen || (ScreenToRayToScreen = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxtQkFBbUIsQ0EwSzVCO0FBMUtELFdBQVUsbUJBQW1CO0lBQzNCLElBQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNyQixJQUFPLElBQUksR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFMUIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUUzQix3QkFBSSxHQUFXLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUc3QyxJQUFJLFFBQW9CLENBQUM7SUFDekIsSUFBSSxtQkFBbUIsR0FBVyxHQUFHLENBQUM7SUFDdEMsSUFBSSxzQkFBc0IsR0FBVyxJQUFJLENBQUM7SUFDMUMsSUFBSSxRQUF5QixDQUFDO0lBQzlCLElBQUksSUFBOEIsQ0FBQztJQUVuQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXZELFNBQVMsSUFBSTtRQUNYLG9CQUFBLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsTUFBTSxNQUFNLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlC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