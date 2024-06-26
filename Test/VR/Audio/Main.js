var AudioSceneVR;
(function (AudioSceneVR) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let xrViewport = new f.XRViewport();
    let graph = null;
    let cmpVRDevice = null;
    let audioLeft = null;
    let audioRight = null;
    window.addEventListener("load", init);
    async function init() {
        await FudgeCore.Project.loadResources("Internal.json");
        graph = f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        let canvas = document.querySelector("canvas");
        cmpVRDevice = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentVRDevice);
        cmpVRDevice.clrBackground = f.Color.CSS("lightsteelblue", 0.25);
        xrViewport.initialize("Viewport", graph, cmpVRDevice, canvas);
        setupAudio();
        f.Loop.addEventListener("loopFrame" /* f.EVENT.LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
        checkForVRSupport();
    }
    // check device/browser capabilities for XR Session 
    function checkForVRSupport() {
        navigator.xr.isSessionSupported(f.XR_SESSION_MODE.IMMERSIVE_VR).then((_supported) => {
            if (_supported)
                setupVR();
            else
                console.log("Session not supported");
        });
    }
    //main function to start XR Session
    function setupVR() {
        //create XR Button -> Browser 
        let enterXRButton = document.createElement("button");
        enterXRButton.id = "xrButton";
        enterXRButton.innerHTML = "Enter VR";
        document.body.appendChild(enterXRButton);
        enterXRButton.addEventListener("click", async function () {
            audioLeft.play(true);
            audioRight.play(true);
            //initalizes xr session 
            if (!xrViewport.session) {
                await xrViewport.initializeVR(f.XR_SESSION_MODE.IMMERSIVE_VR, f.XR_REFERENCE_SPACE.LOCAL, true);
                xrViewport.session.addEventListener("select", onSelect);
                xrViewport.session.addEventListener("squeeze", onSqueeze);
                xrViewport.session.addEventListener("end", onEndSession);
            }
            //stop normal loop of winodws.animationFrame
            f.Loop.stop();
            //starts xr-session.animationFrame instead of window.animationFrame, your xr-session is ready to go!
            f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
        });
    }
    function setupAudio() {
        f.AudioManager.default.listenTo(graph);
        f.AudioManager.default.listenWith(cmpVRDevice.node.getComponent(f.ComponentAudioListener));
        audioLeft = graph.getChildrenByName("AudioL")[0].getComponent(f.ComponentAudio);
        audioRight = graph.getChildrenByName("AudioR")[0].getComponent(f.ComponentAudio);
    }
    function onSelect(_event) {
        let cmpAudio = _event.inputSource.handedness == "right" ? audioRight : _event.inputSource.handedness == "left" ? audioLeft : null;
        let color = _event.inputSource.handedness == "right" ? f.Color.CSS("lime") : _event.inputSource.handedness == "left" ? f.Color.CSS("red") : null;
        console.log(_event.inputSource.handedness + " " + !cmpAudio?.isPlaying);
        if (cmpAudio)
            cmpAudio.play(!cmpAudio.isPlaying);
        if (color)
            cmpAudio.node.getComponent(f.ComponentMaterial).clrPrimary = cmpAudio.isPlaying ? color : f.Color.CSS("white");
    }
    function onSqueeze(_event) {
        console.log(_event.inputSource.handedness);
        let translator = (_event.inputSource.handedness == "right" ? audioRight.node : _event.inputSource.handedness == "left" ? audioLeft.node : null)?.getComponent(AudioSceneVR.Translator);
        if (translator)
            translator.isTranslating = !translator.isTranslating;
    }
    function update(_event) {
        xrViewport.draw();
        f.AudioManager.default.update();
    }
    function onEndSession() {
        f.Loop.stop();
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
    }
})(AudioSceneVR || (AudioSceneVR = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxZQUFZLENBbUdyQjtBQW5HRCxXQUFVLFlBQVk7SUFDcEIsSUFBTyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFFL0MsSUFBSSxVQUFVLEdBQWlCLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ2xELElBQUksS0FBSyxHQUFZLElBQUksQ0FBQztJQUMxQixJQUFJLFdBQVcsR0FBd0IsSUFBSSxDQUFDO0lBQzVDLElBQUksU0FBUyxHQUFxQixJQUFJLENBQUM7SUFDdkMsSUFBSSxVQUFVLEdBQXFCLElBQUksQ0FBQztJQUV4QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXRDLEtBQUssVUFBVSxJQUFJO1FBQ2pCLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdkQsS0FBSyxHQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDN0csU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLEtBQUssQ0FBQywwRkFBMEYsQ0FBQyxDQUFDO1lBQ2xHLE9BQU87UUFDVCxDQUFDO1FBQ0QsSUFBSSxNQUFNLEdBQXlDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEYsV0FBVyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDckYsV0FBVyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVoRSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlELFVBQVUsRUFBRSxDQUFDO1FBR2IsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsdUNBQXFCLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFeEMsaUJBQWlCLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBQ0Qsb0RBQW9EO0lBQ3BELFNBQVMsaUJBQWlCO1FBQ3hCLFNBQVMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFtQixFQUFFLEVBQUU7WUFDM0YsSUFBSSxVQUFVO2dCQUNaLE9BQU8sRUFBRSxDQUFDOztnQkFFVixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsbUNBQW1DO0lBQ25DLFNBQVMsT0FBTztRQUNkLDhCQUE4QjtRQUM5QixJQUFJLGFBQWEsR0FBc0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RSxhQUFhLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUM5QixhQUFhLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztRQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV6QyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUs7WUFDM0MsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRCLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixNQUFNLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFaEcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3hELFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMxRCxVQUFVLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0QsNENBQTRDO1lBQzVDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZCxvR0FBb0c7WUFDcEcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FDQSxDQUFDO0lBQ0osQ0FBQztJQUNELFNBQVMsVUFBVTtRQUNqQixDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7UUFDM0YsU0FBUyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hGLFVBQVUsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBQ0QsU0FBUyxRQUFRLENBQUMsTUFBMEI7UUFDMUMsSUFBSSxRQUFRLEdBQTZCLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzVKLElBQUksS0FBSyxHQUFZLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxSixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN4RSxJQUFJLFFBQVE7WUFDVixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksS0FBSztZQUNQLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRW5ILENBQUM7SUFDRCxTQUFTLFNBQVMsQ0FBQyxNQUEwQjtRQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0MsSUFBSSxVQUFVLEdBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxDQUFDLGFBQUEsVUFBVSxDQUFDLENBQUM7UUFDdEwsSUFBSSxVQUFVO1lBQ1osVUFBVSxDQUFDLGFBQWEsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDekQsQ0FBQztJQUNELFNBQVMsTUFBTSxDQUFDLE1BQWE7UUFDM0IsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFDRCxTQUFTLFlBQVk7UUFDbkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUMsQ0FBQztBQUNILENBQUMsRUFuR1MsWUFBWSxLQUFaLFlBQVksUUFtR3JCIn0=