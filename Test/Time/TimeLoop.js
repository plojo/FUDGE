var TimeLoop;
(function (TimeLoop) {
    var ƒ = FudgeCore;
    window.addEventListener("load", handleLoad);
    function handleLoad(_event) {
        console.log("Start");
        document.forms[0].addEventListener("change", handleChangeTime);
        document.forms[1].addEventListener("change", handleChangeLoop);
        document.querySelector("[name=start]").addEventListener("click", handleButtonClick);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, handleFrame);
        loop();
        handleChangeLoop(null);
    }
    function handleChangeLoop(_event) {
        let formData = new FormData(document.forms[1]);
        let mode = String(formData.get("mode"));
        let fps = Number(formData.get("fps"));
        ƒ.Loop.start(ƒ.LOOP_MODE[mode], fps, true);
        let fpsInput = document.querySelector("input[name=fps]");
        fpsInput.readOnly = (mode == "FRAME_REQUEST");
        console.log(mode, fps);
    }
    function handleChangeTime(_event) {
        let formData = new FormData(_event.currentTarget);
        let scale = Number(formData.get("scale"));
        ƒ.Time.game.setScale(scale); //ToDo: find out how scaling works -> in game time mode the second scaling is not calculated as expected
        console.log("Scale set to: " + scale);
    }
    function handleButtonClick(_event) {
        let lapse = Number(document.querySelector("input[name=lapse]").value);
        console.log("Timeout set to: " + lapse);
        ƒ.Time.game.setTimer(lapse, 1, handleTimeout);
    }
    function handleTimeout() {
        let meter = document.querySelector("[name=event]");
        meter.value = 1 + meter.value % 10;
        handleButtonClick(null);
    }
    function handleFrame(_event) {
        let meter = document.querySelector("[name=frame]");
        meter.value = 1 + meter.value % 10;
        let avg = document.querySelector("[name=avg]");
        avg.value = ƒ.Loop.fpsRealAverage.toFixed(0);
    }
    function loop() {
        let time = document.querySelector("[name=time]");
        let date = new Date(ƒ.Time.game.get());
        // time.value = ƒ.Time.game.get().toPrecision();
        time.value =
            String(date.getMinutes()).padStart(2, "0") + ":" +
                String(date.getSeconds()).padStart(2, "0") + ":" +
                String(date.getMilliseconds()).padStart(3, "0");
        window.requestAnimationFrame(loop);
    }
})(TimeLoop || (TimeLoop = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZUxvb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUaW1lTG9vcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLFFBQVEsQ0E4RGpCO0FBOURELFdBQVUsUUFBUTtJQUNoQixJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDckIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUU1QyxTQUFTLFVBQVUsQ0FBQyxNQUFhO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckIsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDcEYsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsdUNBQXFCLFdBQVcsQ0FBQyxDQUFDO1FBQ3pELElBQUksRUFBRSxDQUFDO1FBQ1AsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsTUFBYTtRQUNyQyxJQUFJLFFBQVEsR0FBYSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsSUFBSSxJQUFJLEdBQVcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFJLEdBQUcsR0FBVyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRTlDLENB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