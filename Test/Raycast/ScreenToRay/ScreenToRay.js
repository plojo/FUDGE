var ScreenToRay;
(function (ScreenToRay) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let uiMaps = {};
    let uiClient;
    let menu;
    let canvas;
    let viewport = new ƒ.Viewport();
    let cmpCamera;
    let uiCamera;
    let mouse = new ƒ.Vector2();
    let mouseButton;
    let viewportRay = new ƒ.Viewport();
    let cameraRay;
    let canvasRay;
    let cursor = new ƒAid.NodeArrow("Cursor", ƒ.Color.CSS("white"));
    function init() {
        // create asset
        let root = new ƒ.Node("Root");
        let cosys = new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(100)));
        cosys.getChildrenByName("ArrowBlue")[0].mtxLocal.rotateZ(45, true);
        cosys.getChildrenByName("ArrowBlue")[0].getChildrenByName("ArrowBlueShaft")[0].getComponent(ƒ.ComponentMaterial).clrPrimary.a = 0.5; // = ƒ.Color.CSS("white", 0.9);
        let object = new ƒAid.Node("Object", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), new ƒ.Material("Object", ƒ.ShaderLitTextured, new ƒ.CoatTextured(ƒ.Color.CSS("white"))), 
        // new ƒ.Material("Object", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("red"))),
        // new ƒ.MeshPolygon("Object")
        new ƒ.MeshTorus("Object")
        // new ƒ.MeshSphere("Object", 15, 15)
        );
        root.appendChild(object);
        root.appendChild(cursor);
        console.log(object.getComponent(ƒ.ComponentMesh).mesh.boundingBox);
        console.log(object.getComponent(ƒ.ComponentMesh).mesh.radius);
        // initialize viewports
        canvas = document.querySelector("canvas#viewport");
        cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL, 2, 5);
        cmpCamera.mtxPivot.translation = new ƒ.Vector3(1, 2, 3);
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        viewport.initialize(canvas.id, root, cmpCamera, canvas);
        canvas.addEventListener("mousemove", setCursorPosition);
        canvasRay = document.querySelector("canvas#ray");
        cameraRay = new ƒ.ComponentCamera();
        cameraRay.mtxPivot.translation = new ƒ.Vector3(1, 2, 3);
        // cameraRay.projectCentral(1, 10);
        viewportRay.initialize("ray", root, cameraRay, canvasRay);
        viewportRay.adjustingFrames = true;
        menu = document.getElementById("menu");
        menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and framings";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);
        appendUIScale(menu, "DestinationToSource", viewport.frameDestinationToSource);
        appendUIComplex(menu, "CanvasToDestination", viewport.frameCanvasToDestination);
        appendUIScale(menu, "ClientToCanvas", viewport.frameClientToCanvas);
        uiClient = new UI.Rectangle("ClientRectangle");
        uiClient.addEventListener("input", hndChangeOnClient);
        menu.appendChild(uiClient);
        menu.appendChild(new UI.Point("Client"));
        menu.appendChild(new UI.Point("Canvas"));
        menu.appendChild(new UI.Point("Destination"));
        menu.appendChild(new UI.Point("Source"));
        menu.appendChild(new UI.Point("Render"));
        menu.appendChild(new UI.Point("Projection"));
        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewport.adjustingFrames = true;
        logMutatorInfo("Camera", cmpCamera);
        for (let name in uiMaps) {
            logMutatorInfo(name, uiMaps[name].framing);
        }
        document.addEventListener("keydown", hndKeydown);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, animate);
        ƒ.Loop.start();
        function animate(_event) {
            update();
            viewport.draw();
            adjustRayCamera();
            pick();
        }
    }
    function pick() {
        cursor.activate(false);
        let picks = ƒ.Picker.pickViewport(viewport, mouse);
        cursor.activate(true);
        picks.sort((a, b) => a.zBuffer < b.zBuffer ? -1 : 1);
        let output = document.querySelector("output");
        output.innerHTML = "";
        for (let pick of picks) {
            output.innerHTML += "Name: " + pick.node.name + ", z: " + pick.zBuffer.toFixed(2) + "<br/>";
            // output.innerHTML += "luminance: " + pick.luminance.toFixed(2) + ", alpha: " + pick.alpha.toFixed(2) + "<br/>";
            output.innerHTML += "color: " + pick.color.toString() + "<br/>";
            output.innerHTML += "posWorld: " + pick.posWorld.toString() + "<br/>";
            output.innerHTML += "posMesh: " + pick.posMesh.toString() + "<br/>";
            output.innerHTML += "textureUV: " + pick.textureUV.toString() + "<br/>";
            output.innerHTML += "normal: " + pick.normal.toString() + "<br/>";
        }
        if (!picks.length)
            return;
        let pick = picks[0];
        cursor.mtxLocal.translation = pick.posWorld;
        cursor.color = pick.color;
        cursor.mtxLocal.lookAt(ƒ.Vector3.SUM(pick.posWorld, pick.normal), ƒ.Vector3.SUM(ƒ.Vector3.ONE(), pick.normal));
        if (!mouseButton)
            return;
        let material = pick.node.getComponent(ƒ.ComponentMaterial).material;
        let coat = material.coat;
        //@ts-ignore
        let img = coat.texture.texImageSource;
        //@ts-ignore
        let canvas;
        //@ts-ignore
        if (img instanceof OffscreenCanvas)
            //@ts-ignore
            canvas = img;
        else
            //@ts-ignore
            canvas = new OffscreenCanvas(img.width, img.height);
        //@ts-ignore
        let crc2 = canvas.getContext("2d");
        //@ts-ignore
        if (!(img instanceof OffscreenCanvas))
            crc2.drawImage(img, 0, 0);
        crc2.fillStyle = "red";
        let width = pick.textureUV.x;
        width = width < 0 ? 1 + (width + Math.trunc(width)) : width -= Math.trunc(width);
        let height = pick.textureUV.y;
        height = height < 0 ? 1 + (height + Math.trunc(height)) : height -= Math.trunc(height);
        crc2.fillRect(Math.round(width * img.width), Math.round(height * img.height), 1, 5);
        let txtCanvas = new ƒ.TextureCanvas("Test", crc2);
        material.coat = new ƒ.CoatTextured(ƒ.Color.CSS("white"), txtCanvas);
    }
    function adjustRayCamera() {
        let ray = computeRay();
        ray.direction.transform(cmpCamera.mtxPivot);
        cameraRay.mtxPivot.lookAt(ray.direction);
        cameraRay.projectCentral(1, 5);
        viewportRay.draw();
        let crcRay = canvasRay.getContext("2d");
        crcRay.translate(crcRay.canvas.width / 2, crcRay.canvas.height / 2);
        crcRay.strokeStyle = "white";
        crcRay.strokeRect(-10, -10, 20, 20);
    }
    function computeRay() {
        let posMouse = mouse.clone;
        setUiPoint("Client", posMouse);
        let posRender = viewport.pointClientToRender(posMouse);
        setUiPoint("Render", posRender);
        let rect = viewport.getClientRectangle();
        let result;
        result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
        setUiPoint("Canvas", result);
        rect = viewport.getCanvasRectangle();
        result = viewport.frameCanvasToDestination.getPoint(result, rect);
        setUiPoint("Destination", result);
        result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
        setUiPoint("Source", result);
        //TODO: when Source, Render and RenderViewport deviate, continue transformation 
        let posProjection = viewport.pointClientToProjection(posMouse);
        let rectProjection = cmpCamera.getProjectionRectangle();
        setUiPoint("Projection", posProjection);
        let ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));
        return ray;
    }
    function setCursorPosition(_event) {
        mouse = new ƒ.Vector2(_event.offsetX, _event.offsetY);
        mouseButton = _event.buttons;
    }
    function hndKeydown(_event) {
        let object = viewport.getBranch().getChildrenByName("Object")[0];
        object.mtxLocal.rotateY(5 * (_event.code == ƒ.KEYBOARD_CODE.A ? -1 : _event.code == ƒ.KEYBOARD_CODE.D ? 1 : 0));
        object.mtxLocal.rotateX(5 * (_event.code == ƒ.KEYBOARD_CODE.W ? -1 : _event.code == ƒ.KEYBOARD_CODE.S ? 1 : 0));
    }
    function setUiPoint(_name, _point) {
        let uiPoint;
        uiPoint = menu.querySelector("fieldset[name=" + _name + "]");
        uiPoint.set(_point.getMutator());
    }
    function logMutatorInfo(_title, _mutable) {
        let mutator = _mutable.getMutator();
        let types = _mutable.getMutatorAttributeTypes(mutator);
        console.group(_title);
        console.log("Types: ", types);
        console.log("Mutator: ", mutator);
        console.groupEnd();
    }
    function appendUIComplex(_parent, _name, _framing) {
        let uiMap = new UI.FramingComplex(_name);
        uiMap.addEventListener("input", hndChangeOnComplex);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, framing: _framing };
    }
    function appendUIScale(_parent, _name, _framing) {
        let uiMap = new UI.FramingScaled(_name);
        uiMap.addEventListener("input", hndChangeOnScale);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, framing: _framing };
    }
    function hndChangeOnComplex(_event) {
        let target = _event.currentTarget;
        setRectComplex(target);
    }
    function hndChangeOnScale(_event) {
        let target = _event.currentTarget;
        setRectScale(target);
    }
    function hndChangeOnCamera(_event) {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }
    function hndChangeOnClient(_event) {
        let target = _event.currentTarget;
        setClient(target);
    }
    function setRectComplex(_uiMap) {
        let value = _uiMap.get();
        let framing = uiMaps[_uiMap.name].framing;
        for (let key in value) {
            switch (key) {
                case "Margin":
                    framing.margin = value[key];
                    break;
                case "Padding":
                    framing.padding = value[key];
                    break;
                case "Result":
                    break;
                default:
                    throw (new Error("Invalid name: " + key));
            }
        }
    }
    function setRectScale(_uiMap) {
        let value = _uiMap.get();
        let framing = uiMaps[_uiMap.name].framing;
        framing.setScale(value.normWidth, value.normHeight);
    }
    function setCamera() {
        let params = uiCamera.get();
        cmpCamera.projectCentral(params.aspect, params.fieldOfView, ƒ.FIELD_OF_VIEW.DIAGONAL, params.near, params.far); //);
    }
    function setClient(_uiRectangle) {
        let rect = _uiRectangle.get();
        canvas.style.left = rect.x + "px";
        canvas.style.top = rect.y + "px";
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
    }
    function update() {
        for (let name in uiMaps) {
            // uiMap.ui.set({ Margin: uiMap.map.margin, Padding: uiMap.map.padding });
            switch (name) {
                case "ClientToCanvas": {
                    let uiMap = uiMaps[name];
                    uiMap.ui.set(uiMap.framing);
                    uiMap.ui.set({ Result: viewport.getCanvasRectangle() });
                    break;
                }
                case "CanvasToDestination": {
                    let uiMap = uiMaps[name];
                    uiMap.ui.set({ Margin: uiMap.framing.margin, Padding: uiMap.framing.padding });
                    uiMap.ui.set({ Result: viewport.rectDestination });
                    break;
                }
                case "DestinationToSource": {
                    let uiMap = uiMaps[name];
                    uiMap.ui.set(uiMap.framing);
                    uiMap.ui.set({ Result: viewport.rectSource });
                    break;
                }
            }
        }
        let parentRect = canvas.parentElement.getBoundingClientRect();
        let canvasRect = canvas.getBoundingClientRect();
        let relativeRect = new DOMRect(canvasRect.left - parentRect.left, canvasRect.top - parentRect.top, canvasRect.width, canvasRect.height);
        uiClient.set(ƒ.Rectangle.GET(relativeRect.left, relativeRect.top, relativeRect.width, relativeRect.height));
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView(), near: cmpCamera.getNear(), far: cmpCamera.getFar() });
    }
})(ScreenToRay || (ScreenToRay = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuVG9SYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTY3JlZW5Ub1JheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLFdBQVcsQ0FnVnBCO0FBaFZELFdBQVUsV0FBVztJQUNuQixJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDckIsSUFBTyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBRXZCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFdEMsSUFBSSxNQUFNLEdBQWdFLEVBQUUsQ0FBQztJQUM3RSxJQUFJLFFBQXNCLENBQUM7SUFDM0IsSUFBSSxJQUFvQixDQUFDO0lBRXpCLElBQUksTUFBeUIsQ0FBQztJQUM5QixJQUFJLFFBQVEsR0FBZSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QyxJQUFJLFNBQTRCLENBQUM7SUFDakMsSUFBSSxRQUFtQixDQUFDO0lBRXhCLElBQUksS0FBSyxHQUFjLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3ZDLElBQUksV0FBbUIsQ0FBQztJQUN4QixJQUFJLFdBQVcsR0FBZSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQyxJQUFJLFNBQTRCLENBQUM7SUFDakMsSUFBSSxTQUE0QixDQUFDO0lBRWpDLElBQUksTUFBTSxHQUFtQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFFaEYsU0FBUyxJQUFJO1FBQ1gsZUFBZTtRQUNmLElBQUksSUFBSSxHQUFXLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxJQUFJLEtBQUssR0FBYyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMs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